import { createHash, randomUUID } from 'node:crypto'
import { createReadStream, constants } from 'node:fs'
import { copyFile, mkdir, open, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises'
import { basename, extname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { defineTool } from './host-modules.mjs'

function isWithin(root, path) {
  const part = relative(root, path)
  return part !== '..' && !part.startsWith(`..${sep}`) && !isAbsolute(part)
}

function requireId(value, label) {
  if (typeof value !== 'string' || !/^[0-9a-f-]{36}$/i.test(value)) throw new Error(`${label} must be a version identifier`)
  return value
}

async function digestFile(path, signal) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(path, { signal })) hash.update(chunk)
  return hash.digest('hex')
}

function positive(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) throw new Error(`${label} must be positive and finite`)
  return value
}

function finite(value, label) {
  if (!Number.isFinite(value)) throw new Error(`${label} overflowed`)
  return value
}

function schemeDxf(width, depth) {
  const w = width * 1000
  const d = depth * 1000
  const lines = [[0, 0, w, 0], [w, 0, w, d], [w, d, 0, d], [0, d, 0, 0]]
  const entities = lines.map(([x1, y1, x2, y2]) =>
    `0\nLINE\n8\nFOOTPRINT\n10\n${x1}\n20\n${y1}\n30\n0\n11\n${x2}\n21\n${y2}\n31\n0\n`).join('')
  const labels = [[w / 2, -500, `${w} mm`], [w + 500, d / 2, `${d} mm`]]
    .map(([x, y, label]) => `0\nTEXT\n8\nDIMENSIONS\n10\n${x}\n20\n${y}\n30\n0\n40\n250\n1\n${label}\n`).join('')
  return `0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n${entities}${labels}0\nENDSEC\n0\nEOF\n`
}

function schemeObj(width, depth, height) {
  return `# Rectangular concept mass; coordinates in metres\no Building\nv 0 0 0\nv ${width} 0 0\nv ${width} ${depth} 0\nv 0 ${depth} 0\nv 0 0 ${height}\nv ${width} 0 ${height}\nv ${width} ${depth} ${height}\nv 0 ${depth} ${height}\nf 4 3 2 1\nf 5 6 7 8\nf 1 2 6 5\nf 2 3 7 6\nf 3 4 8 7\nf 4 1 5 8\n`
}

/** Compute explicitly geometric scheme indicators; none are regulatory findings. */
export function schemeMetrics(input) {
  const width = positive(input.building_width_m, 'building_width_m')
  const depth = positive(input.building_depth_m, 'building_depth_m')
  const floors = positive(input.storeys, 'storeys')
  const storeyHeight = positive(input.storey_height_m, 'storey_height_m')
  if (!Number.isSafeInteger(floors)) throw new Error('storeys must be a positive integer')
  const siteArea = positive(input.site_area_m2, 'site_area_m2')
  if (typeof input.site_area_source !== 'string' || input.site_area_source.trim() === '') {
    throw new Error('site_area_source is required for site-based indicators')
  }
  const footprint = width * depth
  const grossFloorArea = footprint * floors
  const totalHeight = storeyHeight * floors
  for (const [label, value] of Object.entries({ footprint, grossFloorArea, totalHeight,
    siteCoverageRatio: footprint / siteArea, floorAreaRatio: grossFloorArea / siteArea,
    cadWidthMm: width * 1000, cadDepthMm: depth * 1000, cadHeightMm: totalHeight * 1000 })) finite(value, label)
  return {
    footprintM2: footprint,
    grossFloorAreaM2: grossFloorArea,
    totalHeightM: totalHeight,
    siteCoverageRatio: footprint / siteArea,
    floorAreaRatio: grossFloorArea / siteArea,
    assumptions: 'Rectangular footprint, identical full floor plates, no deductions or local planning rules.',
  }
}

/** Register project intake and version tools in one Agent's scoped context. */
export async function registerProjectTools(ctx, { root, allowedRoot, sessionDirectory, maxInputBytes, maxDxfHeaderBytes }) {
  const inputs = join(sessionDirectory, 'inputs')
  const briefs = join(sessionDirectory, 'briefs')
  const outputs = join(sessionDirectory, 'outputs')
  const versions = join(sessionDirectory, 'versions')
  await Promise.all([inputs, briefs, outputs, versions].map(path => mkdir(path, { recursive: true })))
  for (const path of [inputs, briefs, outputs, versions]) {
    if (!isWithin(sessionDirectory, await realpath(path))) throw new Error('Architecture Session directory links outside its own workspace')
  }

  const disposers = []
  try {
    disposers.push(ctx.tools.register(defineTool({
      name: 'architecture_stage_file',
      description: 'Copy an IFC, IDS or DXF from the shared architecture workspace into this Session. Use the returned path with review or CAD tools.',
      parameters: { file_path: { type: 'string', required: true, description: 'Existing .ifc, .ids or .dxf file in the architecture workspace.' } },
      output: {
        schema: { type: 'object', additionalProperties: false, properties: {
          filePath: { type: 'string', required: true }, sourcePath: { type: 'string', required: true },
          sha256: { type: 'string', required: true }, bytes: { type: 'integer', required: true },
        } },
        render: (_args, value) => `Staged project input at ${value.filePath} (${value.bytes} bytes, SHA-256 ${value.sha256}).`,
      },
      async execute({ file_path }, execution) {
        execution.signal.throwIfAborted()
        const source = await realpath(resolve(file_path))
        if (!isWithin(allowedRoot, source) || isWithin(join(allowedRoot, 'sessions'), source)) {
          throw new Error('Project input must be in the shared architecture workspace, outside other Sessions')
        }
        const extension = extname(source).toLowerCase()
        if (extension !== '.ifc' && extension !== '.ids' && extension !== '.dxf') throw new Error('Project input must have a .ifc, .ids or .dxf extension')
        const before = await stat(source)
        if (!before.isFile() || before.size === 0 || before.size > maxInputBytes) {
          throw new Error(`Project input must be a nonempty file of at most ${maxInputBytes} bytes`)
        }
        const target = join(inputs, `${randomUUID()}${extension}`)
        try {
          await copyFile(source, target, constants.COPYFILE_EXCL)
          execution.signal.throwIfAborted()
          const sha256 = await digestFile(target, execution.signal)
          const copied = await stat(target)
          const after = await stat(source)
          if (before.size !== after.size || before.mtimeMs !== after.mtimeMs || copied.size !== before.size
            || sha256 !== await digestFile(source, execution.signal)) {
            throw new Error('Project input changed while it was being staged')
          }
          return { filePath: target, sourcePath: source, sha256, bytes: copied.size }
        } catch (error) {
          await rm(target, { force: true })
          throw error
        }
      },
    })))

    disposers.push(ctx.tools.register(defineTool({
      name: 'architecture_inspect_dxf_units',
      description: 'Read the declared DXF $INSUNITS header from a staged drawing; unknown units and CRS require designer confirmation.',
      parameters: { file_path: { type: 'string', required: true, description: 'A staged .dxf path in this Session.' } },
      output: {
        schema: { type: 'object', additionalProperties: false, properties: {
          filePath: { type: 'string', required: true }, unitCode: { type: 'integer', required: true },
          units: { type: 'string', required: true }, crs: { type: 'string', required: true },
          requiresUnitConfirmation: { type: 'boolean', required: true },
        } },
        render: (_args, value) => `DXF units: ${value.units} (INSUNITS ${value.unitCode}); coordinate reference system: ${value.crs}. ${value.requiresUnitConfirmation ? 'Confirm drawing units with the designer.' : 'Verify the drawing units against the project brief.'}`,
      },
      async execute({ file_path }, execution) {
        execution.signal.throwIfAborted()
        const filePath = await realpath(resolve(file_path))
        if (!isWithin(inputs, filePath) || extname(filePath).toLowerCase() !== '.dxf') {
          throw new Error('DXF inspection requires a staged drawing in this Session')
        }
        const info = await stat(filePath)
        if (!info.isFile() || info.size > maxInputBytes) throw new Error('Staged DXF exceeds the input size limit')
        const handle = await open(filePath, 'r')
        let content
        try {
          const buffer = Buffer.alloc(Math.min(info.size, maxDxfHeaderBytes))
          const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0)
          content = buffer.toString('utf8', 0, bytesRead)
        } finally {
          await handle.close()
        }
        execution.signal.throwIfAborted()
        if (content.startsWith('AutoCAD Binary DXF')) throw new Error('Binary DXF requires a CAD converter before header inspection')
        if (info.size > maxDxfHeaderBytes && !/\bENDSEC\b/.test(content)) {
          throw new Error(`DXF header exceeds the ${maxDxfHeaderBytes}-byte inspection limit`)
        }
        const pairs = content.split(/\r\n|\n|\r/)
        let unitCode = 0
        let inHeader = false
        for (let index = 0; index + 3 < pairs.length; index += 2) {
          const code = pairs[index]?.trim()
          const value = pairs[index + 1]?.trim()
          if (code === '0' && value === 'SECTION' && pairs[index + 2]?.trim() === '2') {
            inHeader = pairs[index + 3]?.trim() === 'HEADER'
          } else if (code === '0' && value === 'ENDSEC') {
            inHeader = false
          }
          if (inHeader && code === '9' && value === '$INSUNITS'
            && pairs[index + 2]?.trim() === '70') {
            const parsed = Number(pairs[index + 3]?.trim())
            if (Number.isSafeInteger(parsed) && parsed >= 0) unitCode = parsed
            break
          }
        }
        const units = ({ 1: 'inches', 2: 'feet', 4: 'millimetres', 5: 'centimetres', 6: 'metres' })[unitCode] ?? 'unknown'
        return { filePath, unitCode, units, crs: 'unknown', requiresUnitConfirmation: units === 'unknown' }
      },
    })))

    disposers.push(ctx.tools.register(defineTool({
      name: 'architecture_project_brief',
      description: 'Record confirmed site and rectangular building scheme inputs, then calculate preliminary geometric indicators. No code-compliance conclusion is produced.',
      parameters: {
        project_name: { type: 'string', required: true },
        source_file_path: { type: 'string', description: 'Optional staged DXF or IFC source used for the design brief.' },
        site_area_m2: { type: 'number', required: true, description: 'Confirmed site area in square metres.' },
        site_area_source: { type: 'string', required: true, description: 'Survey, document, or named person supplying the site area.' },
        crs: { type: 'string', description: 'Coordinate reference system, or unknown.' },
        building_width_m: { type: 'number', required: true },
        building_depth_m: { type: 'number', required: true },
        storeys: { type: 'integer', required: true },
        storey_height_m: { type: 'number', required: true },
      },
      output: {
        schema: { type: 'object', additionalProperties: false, properties: {
          briefId: { type: 'string', required: true }, path: { type: 'string', required: true },
          outputsDirectory: { type: 'string', required: true }, metrics: { type: 'json', required: true },
          cadDimensionsMm: { type: 'json', required: true },
        } },
        render: (_args, value) => `Saved preliminary scheme ${value.briefId} at ${value.path}. Geometric indicators: ${JSON.stringify(value.metrics)}. CAD dimensions in mm: ${JSON.stringify(value.cadDimensionsMm)}. Export drawings and massing into ${value.outputsDirectory}.`,
      },
      async execute(args, execution) {
        execution.signal.throwIfAborted()
        if (typeof args.project_name !== 'string' || args.project_name.trim() === '') throw new Error('project_name is required')
        const metrics = schemeMetrics(args)
        let sourceFile = null
        let sourceSha256 = null
        if (args.source_file_path !== undefined) {
          sourceFile = await realpath(resolve(args.source_file_path))
          if (!isWithin(inputs, sourceFile)) throw new Error('Project source must be staged in this Session')
          sourceSha256 = await digestFile(sourceFile, execution.signal)
        }
        const briefId = randomUUID()
        const path = join(briefs, `${briefId}.json`)
        const brief = { briefId, projectName: args.project_name.trim(), sourceFile, sourceSha256,
          siteAreaM2: args.site_area_m2,
          siteAreaSource: args.site_area_source.trim(), crs: args.crs?.trim() || 'unknown',
          buildingWidthM: args.building_width_m, buildingDepthM: args.building_depth_m,
          storeys: args.storeys, storeyHeightM: args.storey_height_m, metrics }
        await writeFile(path, `${JSON.stringify(brief, null, 2)}\n`, { flag: 'wx' })
        return { briefId, path, outputsDirectory: outputs, metrics,
          cadDimensionsMm: { width: args.building_width_m * 1000, depth: args.building_depth_m * 1000,
            height: metrics.totalHeightM * 1000 } }
      },
    })))

    disposers.push(ctx.tools.register(defineTool({
      name: 'architecture_generate_scheme',
      description: 'Generate a dimensioned rectangular concept footprint DXF (millimetres) and massing OBJ (metres) from a recorded project brief.',
      parameters: { brief_id: { type: 'string', required: true } },
      output: {
        schema: { type: 'object', additionalProperties: false, properties: {
          dxfPath: { type: 'string', required: true }, objPath: { type: 'string', required: true },
          briefId: { type: 'string', required: true }, metrics: { type: 'json', required: true },
        } },
        render: (_args, value) => `Concept footprint: ${value.dxfPath} (mm). Massing: ${value.objPath} (m). Indicators: ${JSON.stringify(value.metrics)}. Review both files before recording a version.`,
      },
      async execute({ brief_id }, execution) {
        execution.signal.throwIfAborted()
        const briefId = requireId(brief_id, 'brief_id')
        const brief = JSON.parse(await readFile(join(briefs, `${briefId}.json`), 'utf8'))
        const metrics = schemeMetrics({ site_area_m2: brief.siteAreaM2, site_area_source: brief.siteAreaSource,
          building_width_m: brief.buildingWidthM, building_depth_m: brief.buildingDepthM,
          storeys: brief.storeys, storey_height_m: brief.storeyHeightM })
        const id = randomUUID()
        const dxfPath = join(outputs, `${id}-plan.dxf`)
        const objPath = join(outputs, `${id}-massing.obj`)
        try {
          await writeFile(dxfPath, schemeDxf(brief.buildingWidthM, brief.buildingDepthM), { flag: 'wx' })
          execution.signal.throwIfAborted()
          await writeFile(objPath, schemeObj(brief.buildingWidthM, brief.buildingDepthM, metrics.totalHeightM), { flag: 'wx' })
          execution.signal.throwIfAborted()
          return { dxfPath, objPath, briefId, metrics }
        } catch (error) {
          await Promise.all([dxfPath, objPath].map(path => rm(path, { force: true })))
          throw error
        }
      },
    })))

    disposers.push(ctx.tools.register(defineTool({
      name: 'architecture_record_version',
      description: 'Preserve verified IFC or scheme outputs in a new version with hashes; include a project brief for scheme versions.',
      parameters: {
        brief_id: { type: 'string', description: 'Required for a scheme version; omit for an IFC review version.' },
        file_paths: { type: 'array', required: true, items: { type: 'string' }, description: 'Files exported into this Session\'s outputs directory.' },
        parent_version: { type: 'string', description: 'Previous recorded version ID, if revising a model or scheme.' },
      },
      output: {
        schema: { type: 'object', additionalProperties: false, properties: {
          versionId: { type: 'string', required: true }, manifestPath: { type: 'string', required: true },
          files: { type: 'json', required: true },
        } },
        render: (_args, value) => `Saved architecture version ${value.versionId} at ${value.manifestPath}: ${JSON.stringify(value.files)}.`,
      },
      async execute({ brief_id, file_paths, parent_version }, execution) {
        execution.signal.throwIfAborted()
        const briefId = brief_id === undefined ? null : requireId(brief_id, 'brief_id')
        const briefHash = briefId === null ? null : await digestFile(join(briefs, `${briefId}.json`), execution.signal)
        if (parent_version !== undefined) {
          const parent = requireId(parent_version, 'parent_version')
          await readFile(join(versions, parent, 'manifest.json'))
        }
        if (!Array.isArray(file_paths) || file_paths.length === 0) throw new Error('file_paths must contain at least one file')
        const versionId = randomUUID()
        const directory = join(versions, versionId)
        await mkdir(directory)
        try {
          if (briefId !== null) {
            const briefPath = join(directory, 'brief.json')
            await copyFile(join(briefs, `${briefId}.json`), briefPath, constants.COPYFILE_EXCL)
            if (briefHash !== await digestFile(briefPath, execution.signal)) throw new Error('Project brief changed during version capture')
          }
          const files = []
          for (const [index, raw] of file_paths.entries()) {
            execution.signal.throwIfAborted()
            const source = await realpath(resolve(raw))
            if (!isWithin(outputs, source)) throw new Error('Version files must be in this Session\'s outputs directory')
            const before = await stat(source)
            if (!before.isFile() || before.size === 0) throw new Error(`Output file is empty or not a file: ${source}`)
            const target = join(directory, `${index + 1}-${basename(source)}`)
            await copyFile(source, target, constants.COPYFILE_EXCL)
            const sha256 = await digestFile(target, execution.signal)
            const after = await stat(source)
            if (before.size !== after.size || before.mtimeMs !== after.mtimeMs
              || sha256 !== await digestFile(source, execution.signal)) throw new Error(`Output changed during version capture: ${source}`)
            files.push({ path: target, sourcePath: source, sha256, bytes: before.size })
          }
          const manifestPath = join(directory, 'manifest.json')
          const manifest = { formatVersion: 1, versionId, createdAt: new Date().toISOString(),
            generator: 'dsh-architecture-bundle@0.1.4', briefId, briefSha256: briefHash,
            parentVersion: parent_version ?? null, files }
          await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' })
          return { versionId, manifestPath, files }
        } catch (error) {
          await rm(directory, { recursive: true, force: true })
          throw error
        }
      },
    })))

    disposers.push(ctx.tools.register(defineTool({
      name: 'architecture_compare_versions',
      description: 'Compare two recorded scheme versions by confirmed inputs, geometric indicators and output file hashes.',
      parameters: { before_version: { type: 'string', required: true }, after_version: { type: 'string', required: true } },
      output: {
        schema: { type: 'object', additionalProperties: false, properties: {
          beforeVersion: { type: 'string', required: true }, afterVersion: { type: 'string', required: true },
          changedInputs: { type: 'json', required: true }, changedMetrics: { type: 'json', required: true },
          beforeFiles: { type: 'json', required: true }, afterFiles: { type: 'json', required: true },
        } },
        render: (_args, value) => `Scheme version comparison ${value.beforeVersion} → ${value.afterVersion}. Changed inputs: ${JSON.stringify(value.changedInputs)}. Changed indicators: ${JSON.stringify(value.changedMetrics)}. Output files: ${JSON.stringify(value.beforeFiles)} → ${JSON.stringify(value.afterFiles)}.`,
      },
      async execute({ before_version, after_version }, execution) {
        execution.signal.throwIfAborted()
        const beforeVersion = requireId(before_version, 'before_version')
        const afterVersion = requireId(after_version, 'after_version')
        const beforeDirectory = join(versions, beforeVersion)
        const afterDirectory = join(versions, afterVersion)
        const before = JSON.parse(await readFile(join(beforeDirectory, 'manifest.json'), 'utf8'))
        const after = JSON.parse(await readFile(join(afterDirectory, 'manifest.json'), 'utf8'))
        for (const [directory, manifest] of [[beforeDirectory, before], [afterDirectory, after]]) {
          if (!Array.isArray(manifest.files) || manifest.files.length === 0) throw new Error('Recorded version has no output files')
          for (const file of manifest.files) {
            execution.signal.throwIfAborted()
            const path = await realpath(file.path)
            if (!isWithin(directory, path) || file.sha256 !== await digestFile(path, execution.signal)) {
              throw new Error('Recorded output no longer matches its version hash')
            }
          }
        }
        if (before.briefId === null || after.briefId === null) throw new Error('Scheme comparison requires a project brief in both versions')
        const beforeBriefPath = join(beforeDirectory, 'brief.json')
        const afterBriefPath = join(afterDirectory, 'brief.json')
        if (before.briefSha256 !== await digestFile(beforeBriefPath, execution.signal)
          || after.briefSha256 !== await digestFile(afterBriefPath, execution.signal)) throw new Error('Recorded project brief no longer matches its version hash')
        const beforeBrief = JSON.parse(await readFile(beforeBriefPath, 'utf8'))
        const afterBrief = JSON.parse(await readFile(afterBriefPath, 'utf8'))
        const changed = (left, right) => Object.fromEntries(Object.keys(left).filter(key =>
          key in right && JSON.stringify(left[key]) !== JSON.stringify(right[key])).map(key =>
          [key, { before: left[key], after: right[key] }]))
        const { metrics: beforeMetrics, briefId: _beforeId, ...beforeInputs } = beforeBrief
        const { metrics: afterMetrics, briefId: _afterId, ...afterInputs } = afterBrief
        return { beforeVersion, afterVersion, changedInputs: changed(beforeInputs, afterInputs),
          changedMetrics: changed(beforeMetrics, afterMetrics),
          beforeFiles: before.files.map(file => ({ sha256: file.sha256, bytes: file.bytes })),
          afterFiles: after.files.map(file => ({ sha256: file.sha256, bytes: file.bytes })) }
      },
    })))

    return { root, sessionDirectory, inputs, briefs, outputs, versions,
      dispose: () => { for (const dispose of disposers.reverse()) dispose() } }
  } catch (error) {
    for (const dispose of disposers.reverse()) dispose()
    throw error
  }
}
