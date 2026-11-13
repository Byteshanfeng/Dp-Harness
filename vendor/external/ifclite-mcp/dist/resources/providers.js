/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/**
 * Resource providers for the `ifc-lite://` URI scheme (spec §8).
 *
 * The set lines up with the resource patterns in the spec table. Each
 * provider knows both how to enumerate static resources (so they appear in
 * `resources/list`) and how to resolve dynamic ones via URI matching.
 */
import { extractGeoreferencingOnDemand } from '@ifc-lite/parser';
import { foldedEntityCount, pendingMutationsField, pendingOverlay } from '@ifc-lite/sdk/headless';
import { buildSpatialTree } from '../spatial-tree.js';
import { findByGlobalId } from '../tools/util.js';
import { materialFallbackName } from '../material-naming.js';
import { modelAllowed } from '../auth/scope.js';
const URI_PREFIX = 'ifc-lite://';
/** Models the caller's scope permits — used to filter per-model resource listings. */
function allowedModels(ctx) {
    return ctx.registry.list().filter((m) => modelAllowed(ctx.scope, m.id));
}
/** Resolve a model by id, returning null when missing OR not permitted by scope. */
function getAllowedModel(ctx, id) {
    const m = ctx.registry.get(id);
    if (!m || !modelAllowed(ctx.scope, m.id))
        return null;
    return m;
}
function jsonContents(uri, value) {
    return {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(value, null, 2),
    };
}
class ManifestProvider {
    name = 'manifest';
    list(ctx) {
        return allowedModels(ctx).map((m) => ({
            uri: `${URI_PREFIX}model/${m.id}/manifest`,
            name: `${m.name} — manifest`,
            description: `Schema, entity counts, georef, units for model '${m.id}'.`,
            mimeType: 'application/json',
        }));
    }
    match(uri) {
        return /^ifc-lite:\/\/model\/[^/]+\/manifest$/.test(uri);
    }
    read(uri, ctx) {
        const id = uri.replace(/^ifc-lite:\/\/model\//, '').replace(/\/manifest$/, '');
        const m = getAllowedModel(ctx, id);
        if (!m)
            return [];
        const georef = extractGeoreferencingOnDemand(m.store);
        // Resources are a read surface too, and answer with the same numbers the
        // tools do (#2014) — a manifest that disagrees with `model_info` about how
        // many entities the model has is the defect, whichever number is right.
        const overlay = pendingOverlay(m);
        return [jsonContents(uri, {
                id: m.id,
                name: m.name,
                schema: m.store.schemaVersion,
                entityCount: foldedEntityCount(m.store, overlay),
                fileSize: m.store.fileSize,
                georeferencing: georef ?? null,
                ...pendingMutationsField(overlay),
            })];
    }
}
class EntityProvider {
    name = 'entity';
    list() {
        // Entities are dynamic; expose the URL pattern as a hint via a single
        // template entry the client can show in UI but won't try to fetch.
        return [{
                uri: `${URI_PREFIX}model/{model_id}/entity/{global_id}`,
                name: 'Entity (template)',
                description: 'Read full entity data by GlobalId. Substitute {model_id} and {global_id}.',
                mimeType: 'application/json',
            }];
    }
    match(uri) {
        return /^ifc-lite:\/\/model\/[^/]+\/entity\/[^/]+$/.test(uri);
    }
    read(uri, ctx) {
        const m = uri.match(/^ifc-lite:\/\/model\/([^/]+)\/entity\/(.+)$/);
        if (!m)
            return [];
        const model = getAllowedModel(ctx, m[1]);
        if (!model)
            return [];
        let gid;
        try {
            gid = decodeURIComponent(m[2]);
        }
        catch {
            // A malformed percent-escape cannot name any GlobalId: the same "no such
            // entity" answer as an unknown id, not a thrown URIError (which the
            // server would report as an internal error).
            return [];
        }
        // `findByGlobalId` + `bim.entity`, so the header agrees with the body: this
        // used to scan the parsed store for the header fields and then fill the rest
        // from `bim.*`, which folds — one payload reporting a stale name beside
        // freshly-written properties (#2014).
        const expressId = findByGlobalId(model, gid);
        if (expressId !== null) {
            const ref = { modelId: model.id, expressId };
            const data = model.bim.entity(ref);
            if (data) {
                return [jsonContents(uri, {
                        ref,
                        globalId: data.globalId,
                        name: data.name,
                        type: data.type,
                        description: data.description,
                        objectType: data.objectType,
                        attributes: model.bim.attributes(ref),
                        properties: model.bim.properties(ref),
                        quantities: model.bim.quantities(ref),
                        classifications: model.bim.classifications(ref),
                        materials: model.bim.materials(ref),
                        ...pendingMutationsField(pendingOverlay(model)),
                    })];
            }
        }
        return [];
    }
}
class SpatialTreeProvider {
    name = 'spatial-tree';
    list(ctx) {
        return allowedModels(ctx).map((m) => ({
            uri: `${URI_PREFIX}model/${m.id}/spatial-tree`,
            name: `${m.name} — spatial tree`,
            mimeType: 'application/json',
        }));
    }
    match(uri) {
        return /^ifc-lite:\/\/model\/[^/]+\/spatial-tree$/.test(uri);
    }
    read(uri, ctx) {
        const id = uri.replace(/^ifc-lite:\/\/model\//, '').replace(/\/spatial-tree$/, '');
        const m = getAllowedModel(ctx, id);
        if (!m)
            return [];
        // The same walk `spatial_hierarchy` uses, so the resource and the tool
        // cannot disagree about the shape of the tree or about which IfcProject it
        // hangs from. `elements` stays off: this resource has never carried it.
        return [jsonContents(uri, buildSpatialTree(m))];
    }
}
class MaterialsProvider {
    name = 'materials';
    list(ctx) {
        return allowedModels(ctx).map((m) => ({
            uri: `${URI_PREFIX}model/${m.id}/materials`,
            name: `${m.name} — materials`,
            mimeType: 'application/json',
        }));
    }
    match(uri) {
        return /^ifc-lite:\/\/model\/[^/]+\/materials$/.test(uri);
    }
    read(uri, ctx) {
        const id = uri.replace(/^ifc-lite:\/\/model\//, '').replace(/\/materials$/, '');
        const m = getAllowedModel(ctx, id);
        if (!m)
            return [];
        const counts = new Map();
        for (const e of m.bim.query().toArray()) {
            const mat = m.bim.materials(e.ref);
            if (!mat)
                continue;
            const key = materialFallbackName(mat) ?? '(unnamed)';
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return [jsonContents(uri, {
                materials: Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
            })];
    }
}
class PropertySetsProvider {
    name = 'property-sets';
    list(ctx) {
        return allowedModels(ctx).map((m) => ({
            uri: `${URI_PREFIX}model/${m.id}/property-sets`,
            name: `${m.name} — property sets`,
            mimeType: 'application/json',
        }));
    }
    match(uri) {
        return /^ifc-lite:\/\/model\/[^/]+\/property-sets$/.test(uri);
    }
    read(uri, ctx) {
        const id = uri.replace(/^ifc-lite:\/\/model\//, '').replace(/\/property-sets$/, '');
        const m = getAllowedModel(ctx, id);
        if (!m)
            return [];
        const seen = new Set();
        const psets = [];
        for (const e of m.bim.query().toArray()) {
            for (const pset of m.bim.properties(e.ref)) {
                if (seen.has(pset.name))
                    continue;
                seen.add(pset.name);
                psets.push({ name: pset.name, properties: pset.properties.map((p) => p.name) });
            }
        }
        return [jsonContents(uri, { propertySets: psets })];
    }
}
class ServerManifestProvider {
    name = 'server-manifest';
    list() {
        return [{
                uri: `${URI_PREFIX}server/manifest`,
                name: 'ifc-lite-mcp manifest',
                description: 'Server-wide capabilities, version, and tool catalog summary.',
                mimeType: 'application/json',
            }];
    }
    match(uri) {
        return uri === `${URI_PREFIX}server/manifest`;
    }
    read(uri, ctx) {
        return [jsonContents(uri, {
                readOnly: ctx.config.readOnly,
                samplingEnabled: ctx.config.samplingEnabled,
                bsddEndpoint: ctx.config.bsddEndpoint ?? 'https://api.bsdd.buildingsmart.org',
                viewerOpen: ctx.viewer?.isOpen() ?? false,
                modelsLoaded: allowedModels(ctx).map((m) => ({ id: m.id, name: m.name, schema: m.store.schemaVersion })),
            })];
    }
}
class ViewerSelectionProvider {
    name = 'viewer-selection';
    list() {
        return [{
                uri: `${URI_PREFIX}viewer/selection`,
                name: 'Viewer selection (live)',
                description: 'Entity the user has clicked in the 3D viewer. Subscribe to receive `notifications/resources/updated` on every pick.',
                mimeType: 'application/json',
            }];
    }
    match(uri) {
        return uri === `${URI_PREFIX}viewer/selection` || /^ifc-lite:\/\/model\/[^/]+\/viewer\/selection$/.test(uri);
    }
    read(uri, ctx) {
        const state = ctx.viewer?.state();
        if (!state) {
            return [jsonContents(uri, { open: false, selection: [] })];
        }
        // A token scoped to specific modelIds must not observe selections from a
        // model it cannot access (the viewer state is global, not per-token).
        if (state.modelId && !modelAllowed(ctx.scope, state.modelId)) {
            return [jsonContents(uri, { open: true, selection: [] })];
        }
        return [jsonContents(uri, {
                open: true,
                modelId: state.modelId,
                url: state.url,
                port: state.port,
                selection: state.selection,
            })];
    }
}
class ViewerStatusProvider {
    name = 'viewer-status';
    list() {
        return [{
                uri: `${URI_PREFIX}viewer/status`,
                name: 'Viewer status',
                description: 'Whether the viewer is open, on what port, and how many browser clients are connected.',
                mimeType: 'application/json',
            }];
    }
    match(uri) {
        return uri === `${URI_PREFIX}viewer/status`;
    }
    read(uri, ctx) {
        const state = ctx.viewer?.state();
        if (!state)
            return [jsonContents(uri, { open: false })];
        // Status (port/url/clients) is not model-specific, but redact the
        // model-bound fields when the caller's scope excludes the loaded model.
        if (state.modelId && !modelAllowed(ctx.scope, state.modelId)) {
            return [jsonContents(uri, { ...state, modelId: null, selection: [] })];
        }
        return [jsonContents(uri, state)];
    }
}
export function defaultResourceProviders() {
    return [
        new ServerManifestProvider(),
        new ManifestProvider(),
        new EntityProvider(),
        new SpatialTreeProvider(),
        new MaterialsProvider(),
        new PropertySetsProvider(),
        new ViewerSelectionProvider(),
        new ViewerStatusProvider(),
    ];
}
//# sourceMappingURL=providers.js.map