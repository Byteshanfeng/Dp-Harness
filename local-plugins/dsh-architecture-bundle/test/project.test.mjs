import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { registerProjectTools, schemeMetrics } from '../project.mjs'

const inputs = { project_name: 'Office', site_area_m2: 2000, site_area_source: 'Confirmed survey',
  building_width_m: 20, building_depth_m: 30, storeys: 3, storey_height_m: 4 }

test('scheme metrics require sourced, finite dimensions and preserve explicit units', () => {
  assert.deepEqual(schemeMetrics(inputs).grossFloorAreaM2, 1800)
  assert.equal(schemeMetrics(inputs).floorAreaRatio, 0.9)
  assert.throws(() => schemeMetrics({ ...inputs, site_area_source: '' }), /site_area_source/)
  assert.throws(() => schemeMetrics({ ...inputs, site_area_m2: Number.MIN_VALUE }), /overflowed/)
  assert.throws(() => schemeMetrics({ ...inputs, storeys: 1.5 }), /positive integer/)
})

test('session tools stage inputs, generate new DXF and OBJ, and preserve version copies', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-architecture-project-'))
  const tools = new Map()
  const ctx = { tools: { register(tool) { tools.set(tool.name, tool); return () => tools.delete(tool.name) } } }
  const signal = new AbortController().signal
  try {
    const sessionDirectory = join(root, 'sessions', 'one')
    const secondDirectory = join(root, 'sessions', 'two')
    await mkdir(sessionDirectory, { recursive: true })
    await mkdir(secondDirectory, { recursive: true })
    const project = await registerProjectTools(ctx, { root, allowedRoot: await realpath(root),
      sessionDirectory: await realpath(sessionDirectory), maxInputBytes: 1024, maxDxfHeaderBytes: 1024 })
    const run = (name, args) => tools.get(name).execute(args, { signal })
    const source = join(root, 'example.ifc')
    await writeFile(source, 'IFC sample')
    const staged = await run('architecture_stage_file', { file_path: source })
    assert.equal(await readFile(staged.filePath, 'utf8'), 'IFC sample')
    await assert.rejects(run('architecture_stage_file', { file_path: staged.filePath }), /outside other Sessions/)
    const drawing = join(root, 'drawing.dxf')
    await writeFile(drawing, '0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n0\nEOF\n')
    const stagedDrawing = await run('architecture_stage_file', { file_path: drawing })
    assert.equal((await run('architecture_inspect_dxf_units', { file_path: stagedDrawing.filePath })).units, 'millimetres')
    assert.equal((await run('architecture_inspect_dxf_units', { file_path: stagedDrawing.filePath })).crs, 'unknown')
    await assert.rejects(run('architecture_inspect_dxf_units', { file_path: drawing }), /staged drawing/)
    const unknownDrawing = join(root, 'unknown.dxf')
    await writeFile(unknownDrawing, '0\nSECTION\n2\nENTITIES\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n0\nEOF\n')
    const stagedUnknown = await run('architecture_stage_file', { file_path: unknownDrawing })
    assert.equal((await run('architecture_inspect_dxf_units', { file_path: stagedUnknown.filePath })).requiresUnitConfirmation, true)
    const brief = await run('architecture_project_brief', { ...inputs, source_file_path: stagedDrawing.filePath })
    assert.equal(brief.cadDimensionsMm.width, 20000)
    const briefRecord = JSON.parse(await readFile(brief.path, 'utf8'))
    assert.equal(briefRecord.sourceFile, stagedDrawing.filePath)
    assert.match(briefRecord.sourceSha256, /^[0-9a-f]{64}$/)
    const generated = await run('architecture_generate_scheme', { brief_id: brief.briefId })
    assert.match(await readFile(generated.dxfPath, 'utf8'), /\$INSUNITS\n70\n4/)
    assert.match(await readFile(generated.objPath, 'utf8'), /v 20 30 12/)
    const version = await run('architecture_record_version', {
      brief_id: brief.briefId, file_paths: [generated.dxfPath, generated.objPath],
    })
    const manifest = JSON.parse(await readFile(version.manifestPath, 'utf8'))
    assert.equal(manifest.files.length, 2)
    assert.equal(manifest.formatVersion, 1)
    assert.match(manifest.briefSha256, /^[0-9a-f]{64}$/)
    const preserved = await readFile(manifest.files[0].path, 'utf8')
    await writeFile(generated.dxfPath, 'changed')
    assert.equal(await readFile(manifest.files[0].path, 'utf8'), preserved)
    const revisedBrief = await run('architecture_project_brief', { ...inputs, storeys: 4 })
    const revisedFiles = await run('architecture_generate_scheme', { brief_id: revisedBrief.briefId })
    const revisedVersion = await run('architecture_record_version', { brief_id: revisedBrief.briefId,
      file_paths: [revisedFiles.dxfPath, revisedFiles.objPath], parent_version: version.versionId })
    const compared = await run('architecture_compare_versions', {
      before_version: version.versionId, after_version: revisedVersion.versionId,
    })
    assert.deepEqual(compared.changedInputs.storeys, { before: 3, after: 4 })
    assert.deepEqual(compared.changedMetrics.totalHeightM, { before: 12, after: 16 })
    const reviewPath = join(project.outputs, 'review.ifc')
    await writeFile(reviewPath, 'reviewed IFC')
    const reviewVersion = await run('architecture_record_version', { file_paths: [reviewPath] })
    const reviewManifest = JSON.parse(await readFile(reviewVersion.manifestPath, 'utf8'))
    assert.equal(reviewManifest.briefId, null)
    await assert.rejects(run('architecture_compare_versions', {
      before_version: version.versionId, after_version: reviewVersion.versionId,
    }), /requires a project brief/)
    await writeFile(manifest.files[0].path, 'tampered')
    await assert.rejects(run('architecture_compare_versions', {
      before_version: version.versionId, after_version: revisedVersion.versionId,
    }), /no longer matches its version hash/)
    await assert.rejects(run('architecture_record_version', {
      brief_id: brief.briefId, file_paths: [join(secondDirectory, 'other.dxf')],
    }), /ENOENT|outputs directory/)
    project.dispose()
    assert.equal(tools.size, 0)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('session tool registration rejects an output directory linked to another Session', async () => {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'dsh-architecture-link-')))
  try {
    const first = join(root, 'sessions', 'first')
    const second = join(root, 'sessions', 'second')
    await Promise.all([mkdir(first, { recursive: true }), mkdir(second, { recursive: true })])
    await symlink(second, join(first, 'outputs'))
    await assert.rejects(registerProjectTools({ tools: { register() { throw new Error('should not register') } } },
      { root, allowedRoot: root, sessionDirectory: first, maxInputBytes: 1024, maxDxfHeaderBytes: 1024 }), /links outside its own workspace/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
