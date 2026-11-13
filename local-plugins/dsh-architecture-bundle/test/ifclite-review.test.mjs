import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const cli = new URL('../ifclite-cli.mjs', import.meta.url).pathname
const guid = name => (name + '0'.repeat(22)).slice(0, 22)
const model = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION((''),'2;1');
FILE_NAME('review','2026',(''),(''),'','','');
FILE_SCHEMA(('IFC4'));
ENDSEC;
DATA;
#20= IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-5,#21,$);
#21= IFCAXIS2PLACEMENT3D(#22,$,$);
#22= IFCCARTESIANPOINT((0.,0.,0.));
#30= IFCUNITASSIGNMENT((#31));
#31= IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);
#40= IFCLOCALPLACEMENT($,#21);
#1= IFCPROJECT('${guid('PROJ')}',$,'Project',$,$,$,$,(#20),#30);
#2= IFCSITE('${guid('SITE')}',$,'Site',$,$,#40,$,$,.ELEMENT.,$,$,$,$,$);
#3= IFCBUILDING('${guid('BLDG')}',$,'Building',$,$,#40,$,$,.ELEMENT.,$,$,$);
#4= IFCBUILDINGSTOREY('${guid('STOR')}',$,'Level 1',$,$,#40,$,$,.ELEMENT.,0.);
#72= IFCWALL('${guid('WALL')}',$,'Wall A',$,$,#40,$,'tagA',$);
ENDSEC;
END-ISO-10303-21;
`
const ids = `<?xml version="1.0" encoding="utf-8"?>
<ids xmlns="http://standards.buildingsmart.org/IDS" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <info><title>Wall names</title></info>
  <specifications>
    <specification name="Walls must be named" ifcVersion="IFC4">
      <applicability><entity><name><simpleValue>IFCWALL</simpleValue></name></entity></applicability>
      <requirements><attribute><name><simpleValue>Name</simpleValue></name></attribute></requirements>
    </specification>
  </specifications>
</ids>`

test('installed architecture MCP reviews an IFC and exports a BCF issue', async () => {
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'dsh-ifc-review-')))
  const source = join(directory, 'source.ifc')
  const issueFile = join(directory, 'issues.bcfzip')
  await writeFile(source, model)
  const child = spawn(process.execPath, [cli, '--allow', directory], {
    env: { ...process.env, DSH_ARCH_IFCLITE_TOOL_SET: 'review' },
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  let output = ''
  let errors = ''
  child.stdout.setEncoding('utf8').on('data', chunk => { output += chunk })
  child.stderr.setEncoding('utf8').on('data', chunk => { errors += chunk })
  let nextId = 0
  async function call(method, params, expectError = false) {
    const id = ++nextId
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`)
    const deadline = Date.now() + 30000
    while (Date.now() < deadline) {
      const response = output.split('\n').filter(Boolean).map(line => JSON.parse(line)).find(item => item.id === id)
      if (response) {
        assert.equal(response.error, undefined, JSON.stringify(response.error))
        assert.equal(response.result?.isError === true, expectError, JSON.stringify(response.result))
        return response.result
      }
      await new Promise(resolve => setTimeout(resolve, 25))
    }
    throw new Error(`MCP call ${method} timed out: ${errors.slice(-500)}`)
  }
  const tool = (name, args, expectError = false) => call('tools/call', { name, arguments: args }, expectError)
  try {
    await call('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'review-test', version: '1' } })
    const names = new Set((await call('tools/list')).tools.map(item => item.name))
    assert.equal(names.size, 40)
    for (const name of ['ids_audit', 'ids_lint', 'ids_validate', 'model_diff', 'quantity_diff', 'bcf_topic_create', 'bcf_export']) {
      assert(names.has(name), `missing ${name}`)
    }
    assert(!names.has('export_pdf_report'))
    const loaded = await tool('model_load', { file_path: source, model_id: 'base' })
    assert.equal(loaded.structuredContent.id, 'base')
    assert.match((await tool('model_load', { file_path: source, model_id: 'base' }, true)).structuredContent.message, /already loaded/)
    const audit = await tool('model_audit', { model_id: 'base' })
    assert.equal(typeof audit.structuredContent.overall, 'number')
    const validation = await tool('ids_validate', { model_id: 'base', ids_xml: ids })
    assert.equal(validation.structuredContent.summary.passedSpecifications, 1)
    const topic = await tool('bcf_topic_create', { title: 'Review wall', description: 'Designer to verify wall placement.' })
    await tool('bcf_viewpoint_create', { guid: topic.structuredContent.guid, selection_global_ids: [guid('WALL')] })
    await tool('bcf_export', { file_path: issueFile })
    const originalIssue = await readFile(issueFile)
    assert(originalIssue.length > 0)
    assert.match((await tool('bcf_export', { file_path: issueFile }, true)).structuredContent.message, /already exists/)
    assert.deepEqual(await readFile(issueFile), originalIssue)
    await tool('entity_set_property', { model_id: 'base', express_id: 72, pset: 'Pset_WallCommon', name: 'Reference', value: 'changed' })
    assert.match((await tool('clash_check', { model_id: 'base' }, true)).structuredContent.message, /pending mutations/)
    await tool('model_load', { file_path: source, model_id: 'head' })
    const diff = await tool('model_diff', { a: 'base', b: 'head' })
    assert.equal(diff.structuredContent.typeDiffs.length, 0)
    assert.equal(diff.structuredContent.entityDiff.added.length, 0)
    const quantities = await tool('quantity_diff', { a: 'base', b: 'head', type: 'IfcWall' })
    assert.equal(quantities.structuredContent.rows.length, 1)
  } finally {
    child.stdin.end()
    child.kill()
    await rm(directory, { recursive: true, force: true })
  }
})
