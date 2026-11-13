import { createHash } from 'node:crypto'
import { mkdir, realpath, stat } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import z from '@deepseek-ai/schemastery'
import { mcpClient } from './host-modules.mjs'
import { registerProjectTools } from './project.mjs'

/** Local plugin that aligns Blender's backend work directory with the Architecture preset. */
export const name = 'dsh-architecture-bundle'
export const inject = ['agents', 'tools']
export const Config = z.object({
  root: z.string().required(),
  toolSet: z.union(['core', 'review', 'all']).default('review'),
  maxInputBytes: z.number().min(1).default(1_073_741_824),
  maxDxfHeaderBytes: z.number().min(1024).default(1_048_576),
  startupTimeoutMs: z.number().min(1).default(60_000),
})

const cli = fileURLToPath(new URL('./ifclite-cli.mjs', import.meta.url))
const READ_ONLY_IFC_TOOLS = new Set([
  'model_list', 'model_info', 'units', 'spatial_hierarchy', 'query_entities',
  'count_entities', 'get_entity', 'properties_unique', 'query_rooms',
  'geometry_bbox', 'geometry_area', 'geometry_volume', 'clash_check',
  'model_audit', 'clash_matrix', 'ids_validate', 'ids_explain', 'ids_audit', 'ids_lint', 'model_diff',
  'quantity_diff', 'mutation_diff',
])
const IFC_FILE_OUTPUTS = new Set(['model_save', 'export_ifc', 'export_glb', 'export_obj', 'export_ifcx', 'export_usd', 'export_csv', 'export_json', 'export_pdf_report', 'bcf_export'])
const CAD_READ_ONLY_TOOLS = new Set(['cad_info', 'cad_view', 'cad_volume', 'cad_sketch_list', 'cad_assembly_info', 'cad_docs'])

function within(root, path) {
  const part = relative(root, path)
  return part !== '..' && !part.startsWith(`..${sep}`) && !isAbsolute(part)
}

let leases = 0
let activeRoot
let previousWorkdir

/** Set the shared work directory until the final Architecture instance unloads. */
export function apply(ctx, config) {
  const root = config?.root
  if (typeof root !== 'string' || !isAbsolute(root) || resolve(root) !== root) {
    throw new Error('Architecture workspace must be an absolute normalized path')
  }
  if (leases > 0 && activeRoot !== root) {
    throw new Error('Architecture sessions in one Host must use the same workspace')
  }
  if (leases === 0) {
    previousWorkdir = process.env.DSH_BLENDER_WORKDIR
    activeRoot = root
    process.env.DSH_BLENDER_WORKDIR = root
  }
  leases += 1
  const active = new Set()
  ctx.on('agent/created', async ({ agent }) => {
    let project
    let mcpFiber
    let releasePolicy
    let finished = false
    const cleanup = async () => {
      finished = true
      active.delete(cleanup)
      const failures = []
      const policy = releasePolicy
      releasePolicy = undefined
      try { policy?.() } catch (error) { failures.push(error) }
      const registeredProject = project
      project = undefined
      try { registeredProject?.dispose() } catch (error) { failures.push(error) }
      const fiber = mcpFiber
      mcpFiber = undefined
      try { await fiber?.dispose() } catch (error) { failures.push(error) }
      if (failures.length > 0) throw new AggregateError(failures, 'Architecture Session cleanup failed')
    }
    active.add(cleanup)
    agent.ctx.effect(() => cleanup, 'architecture.agent')
    try {
      const sessionDirectory = join(root, 'sessions', createHash('sha256').update(agent.id).digest('hex'))
      await mkdir(sessionDirectory, { recursive: true })
      const allowedRoot = await realpath(root)
      const actualSessionDirectory = await realpath(sessionDirectory)
      if (!within(allowedRoot, actualSessionDirectory)) throw new Error('Architecture Session directory escaped the configured workspace')
      project = await registerProjectTools(agent.ctx, { ...config, root, allowedRoot, sessionDirectory: actualSessionDirectory })
      if (finished) { await cleanup(); return }
      const outputRoot = await realpath(project.outputs)
      releasePolicy = agent.ctx.on('tools/pre-execute', async (execution, next) => {
        const decision = await next()
        if (decision.kind !== 'allow' && decision.kind !== 'ask') return decision
        if (execution.name === 'architecture_project_brief' || execution.name === 'architecture_generate_scheme' || execution.name === 'architecture_record_version') {
          return decision.kind === 'ask' ? decision : { kind: 'ask', reason: 'Architectural deliverable requires designer approval.',
            displayReason: { en: 'Generate or record these architectural deliverables?', zh: '确认生成或记录这些建筑设计成果吗？' } }
        }
        if (execution.name === 'cad_export' || execution.name === 'cad_freecad') {
          const field = execution.name === 'cad_export' ? 'path' : 'exportPath'
          const args = execution.arguments
          const raw = args !== null && typeof args === 'object' ? args[field] : undefined
          if (execution.name === 'cad_export' || raw !== undefined) {
            if (typeof raw !== 'string') return { kind: 'deny', reason: `CAD output needs a ${field} in this Session's outputs directory.` }
            const target = resolve(raw)
            const parent = await realpath(dirname(target))
            if (!within(outputRoot, target) || !within(outputRoot, parent) || target === outputRoot) {
              return { kind: 'deny', reason: `CAD output must be in ${outputRoot}.` }
            }
            try {
              await stat(target)
              return { kind: 'deny', reason: `CAD output ${target} already exists; choose a new version path.` }
            } catch (error) {
              if (error?.code !== 'ENOENT') throw error
            }
          }
        }
        if (execution.name.startsWith('cad_') && !CAD_READ_ONLY_TOOLS.has(execution.name)
          || execution.name.startsWith('blender_') && !['blender_rt_see', 'blender_rt_commands', 'blender_rt_perf'].includes(execution.name)) {
          return decision.kind === 'ask' ? decision : { kind: 'ask', reason: `Architectural operation ${execution.name} requires designer approval.`,
            displayReason: { en: `Allow architectural operation ${execution.name}? Check the target and output path.`,
              zh: `允许执行建筑设计操作 ${execution.name} 吗？请核对目标和输出路径。` } }
        }
        if (!execution.name.startsWith('mcp__ifclite__')) return decision
        const tool = execution.name.slice('mcp__ifclite__'.length)
        const args = execution.arguments
        if (IFC_FILE_OUTPUTS.has(tool)) {
          if (args === null || typeof args !== 'object' || !('file_path' in args) || typeof args.file_path !== 'string') {
            return { kind: 'deny', reason: 'IFC output needs a file path in this Session\'s outputs directory.' }
          }
          const path = resolve(args.file_path)
          const parent = await realpath(dirname(path))
          if (!within(outputRoot, path) || !within(outputRoot, parent) || path === outputRoot) {
            return { kind: 'deny', reason: `IFC output must be in ${outputRoot}.` }
          }
          try {
            await stat(path)
            return { kind: 'deny', reason: `IFC output ${path} already exists; choose a new version path.` }
          } catch (error) {
            if (error?.code !== 'ENOENT') throw error
          }
        }
        if (decision.kind === 'ask') return decision
        if (tool === 'model_load' || READ_ONLY_IFC_TOOLS.has(tool)) return decision
        return { kind: 'ask', reason: `Architectural IFC operation ${tool} requires the designer's approval.`,
          displayReason: { en: `Allow IFC operation ${tool}? Check the selected model, elements and output path first.`,
            zh: `允许执行 IFC 操作 ${tool} 吗？请先核对模型、构件和输出路径。` } }
      })
      if (finished) { await cleanup(); return }

      const fiber = await agent.ctx.plugin(mcpClient, {
        serverName: 'ifclite', transport: 'stdio', command: process.execPath,
        args: [cli, '--allow', actualSessionDirectory],
        env: { DSH_ARCH_IFCLITE_TOOL_SET: config.toolSet },
        startupTimeoutMs: config.startupTimeoutMs, failOnStartupError: true,
      })
      mcpFiber = fiber
      if (finished) await cleanup()
    } catch (error) {
      await cleanup()
      throw error
    }
  })
  ctx.effect(() => async () => {
    const settled = await Promise.allSettled([...active].map(cleanup => cleanup()))
    leases -= 1
    if (leases === 0) {
      if (process.env.DSH_BLENDER_WORKDIR === root) {
        if (previousWorkdir === undefined) delete process.env.DSH_BLENDER_WORKDIR
        else process.env.DSH_BLENDER_WORKDIR = previousWorkdir
      }
      activeRoot = undefined
      previousWorkdir = undefined
    }
    const failures = settled.filter(item => item.status === 'rejected').map(item => item.reason)
    if (failures.length > 0) throw new AggregateError(failures, 'Architecture preset cleanup failed')
  })
}
