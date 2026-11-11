import { lookup } from 'node:dns'
import { get as httpGet } from 'node:http'
import { get as httpsGet } from 'node:https'
import { BlockList, isIP } from 'node:net'

const blockedIPv4 = new BlockList()
for (const [network, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24],
  ['192.0.2.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15],
  ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]) blockedIPv4.addSubnet(network, prefix)

const publicIPv6 = new BlockList()
publicIPv6.addSubnet('2000::', 3, 'ipv6')
const blockedIPv6 = new BlockList()
for (const [network, prefix] of [['2001:db8::', 32], ['2001:10::', 28], ['2001:2::', 48]]) {
  blockedIPv6.addSubnet(network, prefix, 'ipv6')
}

const IMAGE_TYPES = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
])

export function buildEndpoint(baseURL, endpoint = '/images/generations') {
  const base = String(baseURL ?? '').trim()
  if (!base) throw new Error('baseURL must be a non-empty URL')
  const url = new URL(base.endsWith('/') ? base : `${base}/`)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('baseURL must use http or https')
  const suffix = String(endpoint ?? '').trim().replace(/^\/+/, '')
  if (!suffix) throw new Error('endpoint must be non-empty')
  return new URL(suffix, url).toString()
}

export function buildRequestBody(args, config) {
  const prompt = String(args.prompt ?? '').trim()
  if (!prompt) throw new Error('prompt must be a non-empty string')
  const n = args.n ?? 1
  if (!Number.isInteger(n) || n < 1 || n > 4) throw new Error('n must be an integer from 1 to 4')
  const body = {
    model: String(args.model ?? config.defaultModel).trim(),
    prompt,
    n,
    size: String(args.size ?? config.defaultSize).trim(),
  }
  if (!body.model) throw new Error('model must be non-empty')
  if (!body.size) throw new Error('size must be non-empty')
  for (const key of ['quality', 'background', 'output_format']) {
    if (args[key] !== undefined && String(args[key]).trim()) body[key] = String(args[key]).trim()
  }
  if (config.responseMode && config.responseMode !== 'auto') body.response_format = config.responseMode === 'base64' ? 'b64_json' : 'url'
  return body
}

export function buildWanRequestBody(args, config) {
  const prompt = String(args.prompt ?? '').trim()
  if (!prompt || prompt.length > 5000) throw new Error('Wan prompt must contain 1 to 5000 characters')
  const n = args.n ?? 1
  if (!Number.isInteger(n) || n < 1 || n > 4) throw new Error('n must be an integer from 1 to 4')
  for (const field of ['quality', 'background', 'output_format']) {
    if (args[field] !== undefined) throw new Error(`${field} is not supported by the Wan image API`)
  }
  const size = String(args.size ?? config.wanDefaultSize).trim()
  if (!size) throw new Error('size must be non-empty')
  return {
    model: 'wan2.7-image-pro',
    input: { messages: [{ role: 'user', content: [{ text: prompt }] }] },
    parameters: { size, n },
  }
}

export function extractWanImageCandidates(payload) {
  if (payload?.code) throw new Error(`Wan image API failed: ${payload.code}: ${payload.message ?? 'unknown provider error'}${payload.request_id ? ` (request-id: ${payload.request_id})` : ''}`)
  const choices = payload?.output?.choices
  if (!Array.isArray(choices)) throw new Error('Wan image API response contains no choices')
  const images = choices.flatMap(choice => choice?.message?.content ?? [])
    .filter(item => item?.type === 'image')
  if (images.length === 0) throw new Error('Wan image API response contains no images')
  return images.map((item, index) => {
    if (typeof item.image !== 'string' || !item.image.trim()) throw new Error(`Wan image result ${index + 1} has no URL`)
    return { kind: 'url', value: item.image }
  })
}

export function decodeBase64Payload(value, maxBytes) {
  const text = String(value ?? '').trim()
  if (!text) throw new Error('empty base64 image payload')
  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(text)
  const declared = match?.[1]?.toLowerCase()
  const encoded = (match?.[2] ?? text).replace(/\s+/g, '')
  if (!encoded || encoded.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) {
    throw new Error('invalid base64 image payload')
  }
  const decodedBytes = Math.floor(encoded.length * 3 / 4) - (encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0)
  if (decodedBytes > maxBytes) throw new Error(`image exceeds ${maxBytes} byte limit`)
  const data = Buffer.from(encoded, 'base64')
  if (data.byteLength === 0) throw new Error('empty decoded image payload')
  return { data: new Uint8Array(data), declaredMediaType: declared }
}

function starts(data, bytes) {
  return data.byteLength >= bytes.length && bytes.every((byte, index) => data[index] === byte)
}

function ascii(data, offset, value) {
  if (data.byteLength < offset + value.length) return false
  for (let index = 0; index < value.length; index += 1) {
    if (data[offset + index] !== value.charCodeAt(index)) return false
  }
  return true
}

export function sniffImageMediaType(data) {
  if (starts(data, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'
  if (starts(data, [0xff, 0xd8, 0xff])) return 'image/jpeg'
  if (ascii(data, 0, 'GIF87a') || ascii(data, 0, 'GIF89a')) return 'image/gif'
  if (ascii(data, 0, 'RIFF') && ascii(data, 8, 'WEBP')) return 'image/webp'
  return undefined
}

export function extensionFor(mediaType) {
  const extension = IMAGE_TYPES.get(mediaType)
  if (!extension) throw new Error(`unsupported image media type: ${mediaType}`)
  return extension
}

export function normalizedMediaType(data, declared) {
  const sniffed = sniffImageMediaType(data)
  if (!sniffed) throw new Error('response bytes are not a supported PNG/JPEG/WebP/GIF image')
  if (declared && IMAGE_TYPES.has(declared) && declared !== sniffed) {
    throw new Error(`image media type mismatch: declared ${declared}, detected ${sniffed}`)
  }
  return sniffed
}

export function extractImageCandidates(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('image API returned a non-object response')
  if (!Array.isArray(payload.data) || payload.data.length === 0) throw new Error('image API response contains no images')
  return payload.data.map((item, index) => {
    if (!item || typeof item !== 'object') throw new Error(`image result ${index + 1} is not an object`)
    if (typeof item.b64_json === 'string' && item.b64_json.trim()) {
      return { kind: 'base64', value: item.b64_json, revisedPrompt: typeof item.revised_prompt === 'string' ? item.revised_prompt : undefined }
    }
    if (typeof item.url === 'string' && item.url.trim()) {
      if (item.url.startsWith('data:')) return { kind: 'base64', value: item.url, revisedPrompt: typeof item.revised_prompt === 'string' ? item.revised_prompt : undefined }
      return { kind: 'url', value: item.url, revisedPrompt: typeof item.revised_prompt === 'string' ? item.revised_prompt : undefined }
    }
    throw new Error(`image result ${index + 1} has neither b64_json nor url`)
  })
}

export function isPrivateHostname(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.localhost')) return true
  const version = isIP(host)
  if (version === 4) return blockedIPv4.check(host)
  if (version === 6) return !publicIPv6.check(host, 'ipv6') || blockedIPv6.check(host, 'ipv6')
  return false
}

export function safeLookup(hostname, options, callback, resolve = lookup) {
  resolve(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) { callback(error); return }
    if (addresses.length === 0 || addresses.some(({ address }) => isPrivateHostname(address))) {
      callback(new Error('image URL resolves to a local or private address'))
      return
    }
    callback(null, options.all ? addresses : addresses[0].address, options.all ? undefined : addresses[0].family)
  })
}

function imageResponse(url, signal) {
  return new Promise((resolve, reject) => {
    const get = url.protocol === 'https:' ? httpsGet : httpGet
    const request = get(url, { signal, lookup: safeLookup, headers: { Accept: 'image/*' } }, resolve)
    request.once('error', reject)
  })
}

/** Read a response incrementally and stop before its configured byte limit is exceeded. */
export async function readLimitedResponse(response, maxBytes) {
  const length = Number(response.headers.get('content-length'))
  if (Number.isFinite(length) && length > maxBytes) {
    await response.body?.cancel()
    throw new Error(`response exceeds ${maxBytes} byte limit`)
  }
  if (response.body === null) return Buffer.alloc(0)
  const chunks = []
  let size = 0
  for await (const chunk of response.body) {
    size += chunk.byteLength
    if (size > maxBytes) {
      throw new Error(`response exceeds ${maxBytes} byte limit`)
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks, size)
}

/** Download a provider image through checked DNS and at most five checked redirects. */
export async function downloadImage(urlValue, { signal, maxBytes, requestImage = imageResponse }) {
  let url = new URL(urlValue)
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('image URL must use http or https')
    if (url.username || url.password) throw new Error('image URL must not contain credentials')
    if (isPrivateHostname(url.hostname)) throw new Error('image URL points to a local or private address')
    const response = await requestImage(url, signal)
    const status = response.statusCode ?? 0
    if ([301, 302, 303, 307, 308].includes(status)) {
      const location = response.headers.location
      response.destroy()
      if (!location) throw new Error('image redirect has no location')
      url = new URL(location, url)
      continue
    }
    if (status < 200 || status >= 300) {
      response.destroy()
      throw new Error(`image download failed with HTTP ${status}`)
    }
    const length = Number(response.headers['content-length'])
    if (Number.isFinite(length) && length > maxBytes) {
      response.destroy()
      throw new Error(`image exceeds ${maxBytes} byte limit`)
    }
    const mime = response.headers['content-type']?.split(';', 1)[0]?.trim().toLowerCase()
    if (mime && !mime.startsWith('image/')) {
      response.destroy()
      throw new Error(`image URL returned non-image content type ${mime}`)
    }
    const chunks = []
    let size = 0
    for await (const chunk of response) {
      size += chunk.byteLength
      if (size > maxBytes) {
        response.destroy()
        throw new Error(`image exceeds ${maxBytes} byte limit`)
      }
      chunks.push(chunk)
    }
    return { data: new Uint8Array(Buffer.concat(chunks, size)), declaredMediaType: mime }
  }
  throw new Error('image URL exceeded five redirects')
}

export function apiErrorMessage(status, payload, requestId) {
  const message = payload?.error?.message ?? payload?.error ?? payload?.message ?? payload?.detail
  const rendered = typeof message === 'string' ? message : message ? JSON.stringify(message) : 'unknown provider error'
  return `image API failed with HTTP ${status}: ${rendered}${requestId ? ` (request-id: ${requestId})` : ''}`
}

export function imageValue(ref, revisedPrompt) {
  return {
    attachmentId: String(ref.attachmentId),
    mediaType: ref.mediaType,
    bytes: ref.bytes,
    width: ref.width,
    height: ref.height,
    ...(ref.name === undefined ? {} : { name: ref.name }),
    ...(ref.originalDimensions === undefined ? {} : { originalDimensions: { ...ref.originalDimensions } }),
    ...(revisedPrompt === undefined ? {} : { revisedPrompt }),
  }
}
