import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, readdir, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { createScope, scopeTarget } from '@deepseek-ai/dsh-scope'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import * as NativeToolExecutor from '@deepseek-ai/dsh-tool-executor-native'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import * as Architecture from '../index.js'

const model = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION((''),'2;1');
FILE_NAME('scope','2026',(''),(''),'','','');
FILE_SCHEMA(('IFC4'));
ENDSEC;
DATA;
#20= IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-5,#21,$);
#21= IFCAXIS2PLACEMENT3D(#22,$,$);
#22= IFCCARTESIANPOINT((0.,0.,0.));
#30= IFCUNITASSIGNMENT((#31));
#31= IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);
#1= IFCPROJECT('PROJ000000000000000000',$,'Project',$,$,$,$,(#20),#30);
ENDSEC;
END-ISO-10303-21;
`

test('real Cordis scopes give two architecture agents independent IFC tools and cleanup', async () => {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'dsh-architecture-scope-')))
  const ctx = new Context()
  const scopes = []
  const agents = []
  let architecture
  try {
    const source = join(root, 'sample.ifc')
    await writeFile(source, model)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(NativeToolExecutor)
    await ctx.plugin(SessionProjectionRegistry)
    await ctx.plugin(AgentRegistry)
    architecture = await ctx.plugin(Architecture, { root, toolSet: 'core', maxInputBytes: 1024,
      maxDxfHeaderBytes: 1024, startupTimeoutMs: 30000 })
    for (const id of ['first', 'second']) {
      const agent = { id }
      const scope = createScope(architecture.ctx, agent)
      agent.ctx = scope.ctx
      agents.push(agent)
      scopes.push(scope)
      await ctx.serial(scopeTarget(agent, agent), 'agent/created', { agent, source: 'user' })
      const names = new Set(ctx.tools.schemas(agent).map(tool => tool.name))
      assert(names.has('mcp__ifclite__model_load'), [...names].join(', '))
      assert(names.has('architecture_project_brief'))
      const decision = await ctx.waterfall(scopeTarget(ctx.tools, agent), 'tools/pre-execute',
        { name: 'mcp__ifclite__entity_set_property', arguments: {} }, async () => ({ kind: 'allow' }))
      assert.equal(decision.kind, 'ask')
      const cadDecision = await ctx.waterfall(scopeTarget(ctx.tools, agent), 'tools/pre-execute',
        { name: 'cad_create_prim', arguments: {} }, async () => ({ kind: 'allow' }))
      assert.equal(cadDecision.kind, 'ask')
      const blenderDecision = await ctx.waterfall(scopeTarget(ctx.tools, agent), 'tools/pre-execute',
        { name: 'blender_rt_do', arguments: {} }, async () => ({ kind: 'allow' }))
      assert.equal(blenderDecision.kind, 'ask')
      const cadExportDecision = await ctx.waterfall(scopeTarget(ctx.tools, agent), 'tools/pre-execute',
        { name: 'cad_export', arguments: { path: join(root, 'unsafe.dxf') } }, async () => ({ kind: 'allow' }))
      assert.equal(cadExportDecision.kind, 'deny')
    }
    for (const agent of agents) {
      const definitions = ctx.tools.definitions(agent)
      const stage = definitions.find(tool => tool.name === 'architecture_stage_file')
      const load = definitions.find(tool => tool.name === 'mcp__ifclite__model_load')
      const staged = await stage.execute({ file_path: source }, { signal: new AbortController().signal })
      const loaded = await load.execute({ file_path: staged.filePath, model_id: 'same-id' }, { signal: new AbortController().signal })
      assert.equal(loaded.structuredContent.id, 'same-id')
    }
    const briefTool = ctx.tools.definitions(agents[0]).find(tool => tool.name === 'architecture_project_brief')
    const brief = await briefTool.execute({ project_name: 'Office', site_area_m2: 2000, site_area_source: 'Survey',
      building_width_m: 20, building_depth_m: 30, storeys: 3, storey_height_m: 4 }, { signal: new AbortController().signal })
    const denied = await ctx.tools.execute({ agent: agents[0], signal: new AbortController().signal,
      calls: [{ type: 'tool-call', id: 'approval-check', name: 'architecture_generate_scheme',
        arguments: JSON.stringify({ brief_id: brief.briefId }) }] })
    assert.equal(denied.results[0].result.isError, true)
    assert.match(JSON.stringify(denied.results[0].result), /requires designer approval/)
    assert.deepEqual(await readdir(brief.outputsDirectory), [])
    await scopes[0].dispose()
    assert(!ctx.tools.schemas(agents[0]).some(tool => tool.name === 'mcp__ifclite__model_load'))
    assert(ctx.tools.schemas(agents[1]).some(tool => tool.name === 'mcp__ifclite__model_load'))
  } finally {
    await Promise.all(scopes.map(scope => scope.dispose()))
    await architecture?.dispose()
    await ctx.fiber.dispose()
    await rm(root, { recursive: true, force: true })
  }
})
