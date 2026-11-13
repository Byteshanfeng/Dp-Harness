import assert from 'node:assert/strict'
import { test } from 'node:test'
import { apply } from '../index.js'

test('Blender workdir follows the architecture preset lifetime', async () => {
  const original = process.env.DSH_BLENDER_WORKDIR
  const root = '/tmp/dsh-architecture-workspace-test'
  const effects = []
  const ctx = { on() { return () => {} }, effect(fn) { effects.push(fn()) } }
  try {
    apply(ctx, { root })
    apply(ctx, { root })
    assert.equal(process.env.DSH_BLENDER_WORKDIR, root)
    await effects.shift()()
    assert.equal(process.env.DSH_BLENDER_WORKDIR, root)
    await effects.shift()()
    assert.equal(process.env.DSH_BLENDER_WORKDIR, original)
    assert.throws(() => apply(ctx, { root: 'relative/path' }), /absolute normalized path/)
  } finally {
    for (const dispose of effects) dispose()
    if (original === undefined) delete process.env.DSH_BLENDER_WORKDIR
    else process.env.DSH_BLENDER_WORKDIR = original
  }
})
