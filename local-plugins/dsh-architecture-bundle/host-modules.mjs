import { createRequire } from 'node:module'
import { isAbsolute } from 'node:path'
import { pathToFileURL } from 'node:url'

const entry = process.argv[1]
if (typeof entry !== 'string' || !isAbsolute(entry)) {
  throw new Error('Architecture bundle requires a Node application entry to resolve its Host plugins')
}

const hostRequire = createRequire(entry)
const fromHost = specifier => import(pathToFileURL(hostRequire.resolve(specifier)).href)

export const mcpClient = await fromHost('@deepseek-ai/dsh-mcp-client')
export const { defineTool } = await fromHost('@deepseek-ai/dsh-tools')
