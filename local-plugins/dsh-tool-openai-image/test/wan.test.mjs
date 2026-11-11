import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildWanRequestBody, extractWanImageCandidates } from '../core.mjs'
import { Config, apply } from '../index.js'

test('Wan text to image request follows the DashScope format', () => {
  assert.deepEqual(buildWanRequestBody({ prompt: ' 一只橘猫 ', n: 2 }, { defaultSize: '1024x1024', wanDefaultSize: '2K' }), {
    model: 'wan2.7-image-pro',
    input: { messages: [{ role: 'user', content: [{ text: '一只橘猫' }] }] },
    parameters: { size: '2K', n: 2 },
  })
  assert.throws(() => buildWanRequestBody({ prompt: 'cat', output_format: 'webp' }, { wanDefaultSize: '2K' }), /not supported/)
  assert.throws(() => buildWanRequestBody({ prompt: 'cat', n: 5 }, { wanDefaultSize: '2K' }), /from 1 to 4/)
})

test('Wan response extracts durable image download candidates', () => {
  const result = { output: { choices: [{ message: { content: [{ type: 'image', image: 'https://example.com/generated.png' }] } }] } }
  assert.deepEqual(extractWanImageCandidates(result), [{ kind: 'url', value: 'https://example.com/generated.png' }])
  assert.throws(() => extractWanImageCandidates({ code: 'InvalidApiKey', message: 'Invalid key', request_id: 'request-1' }), /InvalidApiKey.*request-1/)
  assert.throws(() => extractWanImageCandidates({ output: { choices: [] } }), /contains no images/)
})

test('image tool stores a base64 result and publishes it after saving', async () => {
  const previousFetch = globalThis.fetch
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==', 'base64')
  const requests = []
  let tool
  let saved = false
  let deferred = false
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), options })
    return new Response(JSON.stringify({ data: [{ b64_json: png.toString('base64') }] }), { headers: { 'content-type': 'application/json' } })
  }
  try {
    const config = Config({ models: ['codex/gpt-image-2'], defaultModel: 'codex/gpt-image-2' })
    apply({
      tools: { register(definition) { tool = definition; return () => {} } },
      credentials: { async resolve() { return { value: 'test-key' } } },
      attachments: { async saveImage({ data, mediaType }) {
        assert.deepEqual(data, new Uint8Array(png))
        assert.equal(mediaType, 'image/png')
        saved = true
        return { attachmentId: 'image-1', mediaType, bytes: data.byteLength, width: 1, height: 1 }
      } },
    }, config)
    const result = await tool.execute({ prompt: 'A flower shop' }, {
      signal: new AbortController().signal,
      deferContext() { assert.equal(saved, true); deferred = true },
    })
    assert.equal(requests[0].url, 'https://api.openai.com/v1/images/generations')
    assert.equal(JSON.parse(requests[0].options.body).model, 'codex/gpt-image-2')
    assert.equal(result.model, 'codex/gpt-image-2')
    assert.equal(result.images[0].attachmentId, 'image-1')
    assert.equal(deferred, true)
  } finally {
    globalThis.fetch = previousFetch
  }
})

test('Wan tool does not publish an image when the provider fails', async () => {
  const previousFetch = globalThis.fetch
  let tool
  let deferred = false
  globalThis.fetch = async () => new Response(JSON.stringify({ code: 'InvalidApiKey', message: 'Invalid key' }), { status: 401, headers: { 'content-type': 'application/json' } })
  try {
    const config = Config({ models: ['dashscope/wan2.7-image-pro'], defaultModel: 'dashscope/wan2.7-image-pro' })
    apply({
      tools: { register(definition) { tool = definition; return () => {} } },
      credentials: { async resolve() { return { value: 'test-key' } } },
      attachments: { async saveImage() { throw new Error('must not save an image') } },
    }, config)
    await assert.rejects(tool.execute({ prompt: 'A flower shop' }, {
      signal: new AbortController().signal,
      deferContext() { deferred = true },
    }), /Invalid key/)
    assert.equal(deferred, false)
  } finally {
    globalThis.fetch = previousFetch
  }
})
