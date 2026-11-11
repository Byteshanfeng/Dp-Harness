import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { test } from 'node:test'
import { decodeBase64Payload, downloadImage, isPrivateHostname, readLimitedResponse, safeLookup } from '../core.mjs'

test('private addresses and redirect targets are rejected before downloading', async () => {
  for (const address of ['127.0.0.1', '10.1.2.3', '100.64.1.1', '192.168.1.1', '::1', '::ffff:127.0.0.1', 'fc00::1']) {
    assert.equal(isPrivateHostname(address), true, address)
  }
  let requests = 0
  const requestImage = async () => {
    requests += 1
    return Object.assign(Readable.from([]), { statusCode: 302, headers: { location: 'http://127.0.0.1/private.png' } })
  }
  await assert.rejects(downloadImage('https://example.com/image.png', { maxBytes: 100, requestImage }), /local or private/)
  assert.equal(requests, 1)
  await assert.rejects(new Promise((resolve, reject) => {
    safeLookup('images.example.com', { family: 4 }, (error, address) => {
      if (error) reject(error)
      else resolve(address)
    }, (_hostname, _options, callback) => callback(null, [{ address: '10.0.0.2', family: 4 }]))
  }), /resolves to a local or private address/)
})

test('image download stops reading when the response exceeds the byte limit', async () => {
  const requestImage = async () => Object.assign(Readable.from((async function* () {
    yield Buffer.alloc(6)
    yield Buffer.alloc(6)
    yield Buffer.alloc(6)
  })()), { statusCode: 200, headers: { 'content-type': 'image/png' } })
  await assert.rejects(downloadImage('https://example.com/image.png', { maxBytes: 10, requestImage }), /exceeds 10 byte limit/)
})

test('base64 and API responses are bounded before complete decoding', async () => {
  assert.throws(() => decodeBase64Payload(Buffer.alloc(12).toString('base64'), 10), /exceeds 10 byte limit/)
  const response = new Response(Readable.toWeb(Readable.from([Buffer.alloc(6), Buffer.alloc(6)])))
  await assert.rejects(readLimitedResponse(response, 10), /exceeds 10 byte limit/)
})
