import { AttachmentId } from '@deepseek-ai/dsh-attachment'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { defineTool } from '@deepseek-ai/dsh-tools'
import z from '@deepseek-ai/schemastery'
import {
  apiErrorMessage,
  buildEndpoint,
  buildRequestBody,
  buildWanRequestBody,
  decodeBase64Payload,
  downloadImage,
  extensionFor,
  extractImageCandidates,
  extractWanImageCandidates,
  imageValue,
  normalizedMediaType,
  readLimitedResponse,
} from './core.mjs'

export const name = 'openai-image-tool'
export const inject = ['tools', 'attachments', 'credentials']

export const Config = z.object({
  baseURL: z.string().default('https://api.openai.com/v1'),
  endpoint: z.string().default('/images/generations'),
  apiKeyEnv: z.string().role('credential-ref').default('OPENAI_API_KEY'),
  models: z.array(z.string()).default(['gpt-image-1']).volatile(),
  defaultModel: z.string().default('gpt-image-1').volatile(),
  defaultSize: z.string().default('1024x1024'),
  timeoutMs: z.number().min(1).default(180000),
  maxImageBytes: z.number().min(1).default(25 * 1024 * 1024),
  responseMode: z.union(['auto', 'base64', 'url']).default('auto'),
  wanBaseURL: z.string().default('https://dashscope.aliyuncs.com/api/v1'),
  wanApiKeyEnv: z.string().role('credential-ref').default('DASHSCOPE_API_KEY'),
  wanDefaultSize: z.string().default('2K'),
})

const IMAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    attachmentId: { type: 'string', required: true },
    mediaType: { type: 'string', enum: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'], required: true },
    bytes: { type: 'integer', required: true },
    width: { type: 'integer', required: true },
    height: { type: 'integer', required: true },
    name: { type: 'string' },
    originalDimensions: {
      type: 'object',
      additionalProperties: false,
      properties: {
        width: { type: 'integer', required: true },
        height: { type: 'integer', required: true },
      },
    },
    revisedPrompt: { type: 'string' },
  },
}

function imageRef(image) {
  return {
    attachmentId: AttachmentId(image.attachmentId),
    mediaType: image.mediaType,
    bytes: image.bytes,
    width: image.width,
    height: image.height,
    ...(image.name === undefined ? {} : { name: image.name }),
    ...(image.originalDimensions === undefined ? {} : { originalDimensions: { ...image.originalDimensions } }),
  }
}

function resultContent(value) {
  const summary = `Generated ${value.images.length} image${value.images.length === 1 ? '' : 's'} with ${value.model}.`
  const content = [{ type: 'text', text: summary }]
  for (const image of value.images) {
    if (image.revisedPrompt) content.push({ type: 'text', text: `Revised prompt: ${image.revisedPrompt}` })
    content.push({ type: 'image', attachment: imageRef(image) })
  }
  return content
}

function normalizeConfig(config = {}) {
  const timeoutMs = Number(config.timeoutMs ?? 180000)
  const maxImageBytes = Number(config.maxImageBytes ?? 25 * 1024 * 1024)
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('timeoutMs must be positive')
  if (!Number.isFinite(maxImageBytes) || maxImageBytes <= 0) throw new Error('maxImageBytes must be positive')
  const responseMode = config.responseMode ?? 'auto'
  if (!['auto', 'base64', 'url'].includes(responseMode)) throw new Error('responseMode must be auto, base64, or url')
  return {
    baseURL: config.baseURL ?? 'https://api.openai.com/v1',
    endpoint: config.endpoint ?? '/images/generations',
    apiKeyEnv: config.apiKeyEnv ?? 'OPENAI_API_KEY',
    defaultModel: config.defaultModel ?? 'gpt-image-1',
    defaultSize: config.defaultSize ?? '1024x1024',
    timeoutMs,
    maxImageBytes,
    responseMode,
    wanBaseURL: config.wanBaseURL ?? 'https://dashscope.aliyuncs.com/api/v1',
    wanApiKeyEnv: config.wanApiKeyEnv ?? 'DASHSCOPE_API_KEY',
    wanDefaultSize: config.wanDefaultSize ?? '2K',
  }
}

export function apply(ctx, rawConfig) {
  const config = normalizeConfig({ ...rawConfig, defaultModel: rawConfig.defaultModel.get() })
  if (!rawConfig.models.get().includes(config.defaultModel)) throw new Error('defaultModel must appear in models')
  const endpoint = buildEndpoint(config.baseURL, config.endpoint)
  const wanEndpoint = buildEndpoint(config.wanBaseURL, '/services/aigc/multimodal-generation/generation')
  const apiKeyRef = credentialRef(config.apiKeyEnv)
  const wanApiKeyRef = credentialRef(config.wanApiKeyEnv)

  ctx.tools.register(defineTool({
    name: 'image_generate',
    description: 'Generate one or more images with the selected image model. Use this when the user asks to create, draw, render, or generate an image. The generated images are returned as durable Harness attachments.',
    parameters: {
      prompt: { type: 'string', required: true, description: 'Detailed image-generation prompt.' },
      size: { type: 'string', description: `Requested image size. Defaults to ${config.defaultSize} for OpenAI-compatible models and ${config.wanDefaultSize} for Wan.` },
      n: { type: 'integer', description: 'Number of images, from 1 to 4. Defaults to 1.' },
      quality: { type: 'string', description: 'Optional provider-specific quality value.' },
      background: { type: 'string', description: 'Optional provider-specific background value.' },
      output_format: { type: 'string', enum: ['png', 'jpeg', 'webp'], description: 'Optional output file format.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          model: { type: 'string', required: true },
          created: { type: 'integer' },
          images: { type: 'array', required: true, items: IMAGE_SCHEMA },
          usage: { type: 'json' },
        },
      },
      render: (_args, value) => resultContent(value),
    },
    timeoutMs: config.timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      exec.signal.throwIfAborted()
      const selectedModel = rawConfig.defaultModel.get()
      if (!rawConfig.models.get().includes(selectedModel)) throw new Error('selected image model is not configured')
      const isWan = selectedModel === 'dashscope/wan2.7-image-pro'
      if (!isWan && selectedModel.startsWith('dashscope/')) throw new Error(`unsupported DashScope image model: ${selectedModel}`)
      const credentialName = isWan ? config.wanApiKeyEnv : config.apiKeyEnv
      const credential = await ctx.credentials.resolve(isWan ? wanApiKeyRef : apiKeyRef)
      if (!credential?.value) throw new Error(`credential ${credentialName} is not configured`)
      const body = isWan
        ? buildWanRequestBody(args, config)
        : buildRequestBody({ ...args, model: selectedModel }, config)
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(new Error(`image generation timed out after ${config.timeoutMs}ms`)), config.timeoutMs)
      const abort = () => controller.abort(exec.signal.reason)
      exec.signal.addEventListener('abort', abort, { once: true })
      let response
      try {
        response = await fetch(isWan ? wanEndpoint : endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${credential.value}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        })
        const requestId = response.headers.get('x-request-id') ?? response.headers.get('request-id')
        const maxResponseBytes = Math.ceil(config.maxImageBytes * 4 / 3) * (isWan ? body.parameters.n : body.n)
          + Math.min(config.maxImageBytes, 1024 * 1024)
        const text = (await readLimitedResponse(response, maxResponseBytes)).toString('utf8')
        let payload
        try {
          payload = text ? JSON.parse(text) : {}
        } catch {
          throw new Error(`image API returned non-JSON content with HTTP ${response.status}`)
        }
        if (!response.ok) throw new Error(apiErrorMessage(response.status, payload, requestId))

        const candidates = isWan ? extractWanImageCandidates(payload) : extractImageCandidates(payload)
        const images = []
        for (let index = 0; index < candidates.length; index += 1) {
          controller.signal.throwIfAborted()
          const candidate = candidates[index]
          const acquired = candidate.kind === 'base64'
            ? decodeBase64Payload(candidate.value, config.maxImageBytes)
            : await downloadImage(candidate.value, { signal: controller.signal, maxBytes: config.maxImageBytes })
          if (acquired.data.byteLength > config.maxImageBytes) throw new Error(`image ${index + 1} exceeds ${config.maxImageBytes} byte limit`)
          const mediaType = normalizedMediaType(acquired.data, acquired.declaredMediaType)
          const extension = extensionFor(mediaType)
          const ref = await ctx.attachments.saveImage({
            data: acquired.data,
            mediaType,
            name: `generated-${Date.now()}-${index + 1}.${extension}`,
          })
          images.push(imageValue(ref, candidate.revisedPrompt))
        }
        controller.signal.throwIfAborted()
        const value = {
          model: selectedModel,
          ...(Number.isInteger(payload.created) ? { created: payload.created } : {}),
          images,
          ...(payload.usage === undefined ? {} : { usage: payload.usage }),
        }
        // A normal user-context image is rendered by the existing conversation image UI,
        // even when the generic custom-tool card has no dedicated image gallery.
        exec.deferContext(createUserMessage({ content: resultContent(value), source: { kind: 'user' } }))
        return value
      } finally {
        clearTimeout(timer)
        exec.signal.removeEventListener('abort', abort)
      }
    },
    presentCall: args => ({
      card: 'generic',
      title: `Generate image: ${args.prompt.slice(0, 60)}${args.prompt.length > 60 ? '…' : ''}`,
      kind: 'execute',
      rawInput: args,
    }),
  }))
}
