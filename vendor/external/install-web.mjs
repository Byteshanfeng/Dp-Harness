import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const checkOnly = process.argv.length === 3 && process.argv[2] === '--check'
if (process.argv.length > (checkOnly ? 3 : 2)) {
  throw new Error('Usage: node vendor/external/install-web.mjs [--check]')
}
const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number)
if (nodeMajor < 24 || (nodeMajor === 24 && nodeMinor < 9)) {
  throw new Error(`Node.js >=24.9.0 is required; found ${process.versions.node}`)
}
const packages = [
  join(repositoryRoot, 'vendor/external/ifclite-mcp'),
  join(repositoryRoot, 'local-plugins/dsh-tool-openai-image'),
  join(repositoryRoot, 'vendor/external/dsh-cad'),
  join(repositoryRoot, 'vendor/external/dsh-blender-plugin'),
  join(repositoryRoot, 'local-plugins/dsh-architecture-bundle'),
  join(repositoryRoot, 'vendor/external/dsh-media-desk'),
  join(repositoryRoot, 'vendor/external/billion-context'),
  join(repositoryRoot, 'vendor/external/dsh-cost-meter'),
  join(repositoryRoot, 'vendor/external/dsh-vision-router'),
]

function isPacked(manifest, file) {
  const target = file.replace(/^\.\//, '')
  return manifest.files?.some(pattern => {
    const included = pattern.replace(/\/$/, '')
    return target === included || target.startsWith(`${included}/`)
  }) === true
}

const checked = packages.map(directory => {
  const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'))
  const exported = typeof manifest.exports === 'string' ? manifest.exports
    : manifest.exports?.['.']
  const entries = [manifest.main, typeof exported === 'string' ? exported : exported?.default ?? exported?.import]
    .filter(entry => typeof entry === 'string')
  if (entries.length === 0) throw new Error(`${manifest.name}: missing entry`)
  for (const entry of entries) {
    if (!isPacked(manifest, entry)) throw new Error(`${manifest.name}: entry ${entry} is missing from package files`)
    readFileSync(join(directory, entry))
  }
  const patch = manifest.dsh?.bundle?.patch
  if (typeof patch === 'string') {
    if (!isPacked(manifest, patch)) throw new Error(`${manifest.name}: patch ${patch} is missing from package files`)
    readFileSync(join(directory, patch))
  }
  if (manifest.name === 'dsh-architecture-bundle') {
    for (const required of ['host-modules.mjs', 'project.mjs', 'ifclite-cli.mjs']) {
      if (!isPacked(manifest, required)) throw new Error(`${manifest.name}: ${required} is missing from package files`)
      readFileSync(join(directory, required))
    }
  }
  return { directory, manifest }
})

for (const { directory, manifest } of checked) {
  if (checkOnly) {
    process.stdout.write(`Ready ${manifest.name}@${manifest.version}\n`)
    continue
  }
  process.stdout.write(`Installing ${manifest.name}@${manifest.version} from the repository\n`)
  const result = spawnSync(process.execPath, [
    '--import', 'tsx/esm', 'apps/cli/src/bin.ts',
    'plugin', '--profile', 'web', 'add', `file:${directory}`, '--force',
  ], {
    cwd: repositoryRoot,
    env: { ...process.env, npm_config_registry: process.env.npm_config_registry ?? 'https://registry.npmjs.org' },
    stdio: 'inherit',
  })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
