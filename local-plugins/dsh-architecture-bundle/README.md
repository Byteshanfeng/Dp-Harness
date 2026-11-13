---
description: "Install a separate architecture preset with IFClite, CAD, and Blender tools scoped to that preset."
kind: "package-bundle"
---

# Architecture preset

English | [中文](README.zh.md)

## Summary

This bundle adds an Architecture preset to the Web profile while keeping Standard as the default. IFClite MCP, CAD, and Blender tools register only in Architecture; the CAD and Blender browser modules still come from their selected bundles. Existing sessions retain their preset. Select Architecture when creating a new session.

## Install

From the repository root, install the pinned plugin sources into the Web profile:

```sh
node vendor/external/install-web.mjs --check
node vendor/external/install-web.mjs
```

The first command checks Node.js 24.9 or newer, package entries, patches, and the Architecture runtime modules without changing the profile. The installer selects the checked-in IFClite MCP, CAD, Blender, image, and other Web plugins. Run it on the server from its own checkout: it writes that machine's package paths into the profile, and package dependencies still come from the npm registry. See the [external source manifest](../../vendor/external/README.md) for versions and upstream commits.

For a remote Web deployment, set the model provider and image tool `baseURL` values in `$DSH_HOME/profiles/web/cordis.patch.yml` to services reachable from the server. A `127.0.0.1` URL names the server itself. Set the matching credential environment variables on the server and keep their values out of the patch. Preserve the Harness home when moving existing sessions and architecture versions; the source checkout alone does not contain them. Verify the composed profile with `dsh --profile web --dump-config`, then start Web with the documented [public deployment options](../../docs/user/guide/public-deployments.md).

On a server without a desktop, Blender's headless tools require a locally installed Blender executable; set `DSH_BLENDER_EXE` when it is not discoverable. FreeCAD operations require a local FreeCAD installation and may need `FREECAD_BIN`. Fusion 360's local bridge does not support Linux. The Blender browser module defaults to the browser's `127.0.0.1:9877`, so its GUI selection integration requires a trusted tunnel to the server-side backend or a same-machine browser; do not publish that backend as an unauthenticated public endpoint. The headless Blender tools run on the server without that browser integration.

The bundle resolves the MCP client and tool definition helper from the running `dsh` application entry, so its per-agent registrations use the same Host services and scope identity. Launch through the supported `dsh` profile command.

When using a custom `DSH_HOME`, create `architecture-design` under that Harness home. You can instead set `DSH_ARCH_WORKSPACE` to an absolute normalized path before starting the Web profile. Each Architecture session gets a separate IFClite process and input, output, brief, and version directories below `architecture-design/sessions`. CAD and Blender still use the shared workspace. The Architecture preset restores the previous Blender work directory setting when its last instance unloads. The default `review` tool set exposes 40 IFC tools, including IDS audit, lint and validation, model and quantity comparison, BCF issue export, and tabular export. Set `DSH_ARCH_IFCLITE_TOOL_SET=core` for the original 24 tools or `all` for the complete IFClite tool set before starting the profile. The bundle limits staged input size with `maxInputBytes` and DXF header inspection with `maxDxfHeaderBytes` in its configuration.

## Local source changes

The [CAD patch](patches/dsh-cad-local.patch) records the differences from the pinned upstream source. Those changes and their build output are already in `vendor/external/dsh-cad`. The [Blender patch](patches/dsh-blender-plugin-lazy.patch) is likewise already present in `vendor/external/dsh-blender-plugin`; with `autoStart: false`, its idle watchdog stays off and backend use starts it on demand.

## Use and verify

Start `dsh --profile web`, create a new session, select Architecture, and place IFC, IDS or DXF files in the architecture workspace. Use `architecture_stage_file` to copy each input into that session before review. The CAD tab is offered only while an Architecture session is selected. `dsh --profile web --dump-config` shows the preset row; the Web preset list should show Architecture without a load error and Standard as the default. The deployment separately configures models and their credentials.

### Review an IFC model

Ask the Architecture agent to load the staged IFC with a unique model ID and inspect its units, storeys, element counts, and load warnings. It can run model audit and clash checks; supply an IDS file when information requirements must be validated. Audit and lint the IDS before validation. Findings can be identified by GlobalId and exported as BCF topics with selected elements. Ask for a Chinese Markdown report containing the checked rules, findings, source file, and any checks that could not run.

For a proposed change, the agent lists affected elements and waits for the designer's confirmation. The tool approval service also asks before IFC, CAD and Blender edits; without an approval service these operations are denied. IFClite outputs and `cad_export` destinations must use a new path in that session's `outputs` directory. After an IFC edit, the agent exports and reloads the new IFC under another model ID, reruns clash checks on the reloaded geometry, and compares models and quantities. Clash checks on a model with pending edits are refused because its mesh is stale. Call `architecture_record_version` without `brief_id` to preserve reviewed IFC and BCF outputs with file hashes. The IFClite PDF report tool is not implemented, so the agent writes the report as Markdown.

### Develop a rectangular concept scheme

Confirm the site area and its source, building width and depth in metres, storey count, storey height, and coordinate system if known. For an input DXF, stage it, use `architecture_inspect_dxf_units` to read its declared units, and use `cad_info` to inspect layers, bounds and entity count. An unknown unit or coordinate system needs designer confirmation. `architecture_project_brief` records the confirmed inputs and optional staged source file hash, then computes footprint, gross floor area, height, site coverage and floor area ratio from identical full floor plates. These geometric indicators do not check local planning rules. `architecture_generate_scheme` writes a DXF footprint with millimetre dimensions and an OBJ mass in metres. Use `cad_info` or `cad_view` to review them, then call `architecture_record_version` to copy them and the brief into a new version directory with hashes. Pass the previous version ID when revising, and use `architecture_compare_versions` to review changed inputs and indicators. The agent uses `present` to deliver the selected version's files and manifest. Brief, generation and version calls request approval.

Blender GUI operations require a running Blender instance with the bundled addon connected. A server without a GUI can use the plugin's headless worker. CAD and Blender state remain shared within one profile, so customer deployments needing isolation for those tools require separate profile processes and workspaces.

IFClite starts its MCP subprocess when an Architecture session starts. The smaller tool set reduces tool declarations sent to the model.
