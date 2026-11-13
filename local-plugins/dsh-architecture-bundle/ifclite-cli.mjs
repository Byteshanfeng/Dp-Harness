import { open, realpath, rm } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import {
  StdioTransport, ToolRegistry, buildDefaultToolRegistry,
  createMCPServer, fullScope, routeConsoleToStderr,
} from '@ifc-lite/mcp'

const CORE_TOOLS = [
  'model_load', 'model_list', 'model_info', 'units', 'spatial_hierarchy',
  'query_entities', 'count_entities', 'get_entity', 'properties_unique',
  'query_rooms', 'geometry_bbox', 'geometry_area', 'geometry_volume',
  'clash_check', 'model_audit', 'place_door', 'place_window',
  'edit_element_geometry', 'entity_set_property', 'mutation_undo',
  'model_save', 'export_ifc', 'export_glb', 'viewer_open',
]

const REVIEW_TOOLS = [
  'clash_matrix', 'ids_audit', 'ids_lint', 'ids_validate', 'ids_explain',
  'model_diff', 'quantity_diff', 'mutation_diff',
  'bcf_topic_list', 'bcf_topic_create', 'bcf_topic_update',
  'bcf_topic_close', 'bcf_viewpoint_create', 'bcf_export',
  'export_csv', 'export_json',
]
const FILE_OUTPUT_TOOLS = new Set(['model_save', 'export_ifc', 'export_glb', 'export_obj', 'export_ifcx', 'export_usd', 'export_csv', 'export_json', 'export_pdf_report', 'bcf_export'])

const [flag, directory] = process.argv.slice(2)
if (flag !== '--allow' || !directory || process.argv.length !== 4) {
  throw new Error('Usage: ifclite-cli.mjs --allow <absolute architecture workspace>')
}
if (resolve(directory) !== directory) throw new Error('Architecture workspace must be an absolute normalized path')
const allowedPath = await realpath(directory)

const toolSet = process.env.DSH_ARCH_IFCLITE_TOOL_SET ?? 'review'
if (toolSet !== 'core' && toolSet !== 'review' && toolSet !== 'all') {
  throw new Error('DSH_ARCH_IFCLITE_TOOL_SET must be core, review or all')
}

const available = buildDefaultToolRegistry()
const tools = new ToolRegistry()
let previousExport = Promise.resolve()
let previousLoad = Promise.resolve()
function within(root, path) {
  const part = relative(root, path)
  return part !== '..' && !part.startsWith(`..${sep}`) && !isAbsolute(part)
}
for (const name of toolSet === 'all' ? available.list().map(tool => tool.name)
  : toolSet === 'review' ? [...CORE_TOOLS, ...REVIEW_TOOLS] : CORE_TOOLS) {
  const tool = available.get(name)
  if (tool === null) throw new Error(`IFClite tool missing: ${name}`)
  if (name === 'model_load') {
    tools.register({ ...tool, async handler(input, ctx) {
      const release = Promise.withResolvers()
      const previous = previousLoad
      previousLoad = release.promise
      await previous
      try {
        if (typeof input.model_id !== 'string' || input.model_id.trim() === '') {
          throw new Error('model_load requires an explicit model_id in Architecture mode')
        }
        if (ctx.registry.get(input.model_id) !== null) {
          throw new Error(`Model ${input.model_id} is already loaded; choose a new model_id to preserve the existing model`)
        }
        return await tool.handler(input, ctx)
      } finally {
        release.resolve()
      }
    } })
    continue
  }
  if (name === 'clash_check' || name === 'clash_matrix') {
    tools.register({ ...tool, handler(input, ctx) {
      const model = typeof input.model_id === 'string' ? ctx.registry.get(input.model_id) : ctx.registry.resolve()
      if (model?.backend.getMutationView()?.hasPendingChanges()) {
        throw new Error('Clash checking needs a saved and reloaded IFC model after geometry edits; pending mutations are not in the clash mesh')
      }
      return tool.handler(input, ctx)
    } })
    continue
  }
  if (FILE_OUTPUT_TOOLS.has(name)) {
    tools.register({ ...tool, async handler(input, ctx) {
      if (typeof input.file_path !== 'string') throw new Error('file_path must be a string')
      const release = Promise.withResolvers()
      const previous = previousExport
      previousExport = release.promise
      await previous
      try {
        const target = resolve(input.file_path)
        const parent = await realpath(dirname(target))
        if (!within(allowedPath, target) || !within(allowedPath, parent)) {
          throw new Error(`Output must be inside ${allowedPath}`)
        }
        const reservation = await open(target, 'wx')
        await reservation.close()
        try {
          return await tool.handler(input, ctx)
        } catch (error) {
          await rm(target, { force: true })
          throw error
        }
      } finally {
        release.resolve()
      }
    } })
    continue
  }
  tools.register(tool)
}

routeConsoleToStderr()
const server = createMCPServer({
  scope: fullScope(),
  tools,
  config: { allowedPaths: [allowedPath], samplingEnabled: false },
})
await new StdioTransport().connect(server)
