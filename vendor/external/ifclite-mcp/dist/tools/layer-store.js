/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/**
 * In-memory draft / layer / review workspace backing the agent draft-layer
 * tool family (docs/architecture/layer-prs/06-agents.md).
 *
 * Drafts are keyed by transport session id (#1030) and disposed with the
 * session; published layers, refs, and reviews are process-shared so
 * other principals' sessions can build on and review them. Tests call
 * `resetLayerWorkspace()` for isolation. A draft is a CRDT session (Y.Doc
 * seeded with the resolved base stack) plus the baseline snapshot
 * `publishLayer` diffs against.
 */
import { randomUUID } from 'node:crypto';
import * as Y from 'yjs';
import { createCollabDoc, createEntity, deleteAttribute, deleteEntity, hasEntity, removeChild, removeInherit, setAttribute, setChild, setInherit, } from '@ifc-lite/collab';
import { IFCLITE_ATTR, ATTR, computeStackHash } from '@ifc-lite/ifcx';
import { ToolErrorCode, ToolExecutionError } from '../errors.js';
export function createLayerWorkspace() {
    return {
        drafts: new Map(),
        layers: new Map(),
        refs: new Map([['main', []]]),
        reviews: new Map(),
    };
}
// Storage model (#1030). Drafts are private CRDT sessions, so they are
// the per-transport-session state: keyed by session id, disposed with the
// session. Published layers, refs, and reviews are the collaboration
// surface — content-addressed immutable layers, shared branch heads, and
// reviews that *other* principals must be able to act on from their own
// HTTP sessions (each principal necessarily holds a different session,
// since the transport rejects scope mismatches) — so they live in one
// process-wide store, gated by the visibility checks below. stdio /
// in-process transports carry no session id and use the local draft
// space — registry-less local mode (10-registry.md); durable,
// registry-backed persistence stays future work.
const shared = {
    layers: new Map(),
    refs: new Map([['main', []]]),
    reviews: new Map(),
};
const draftSpaces = new Map();
/** Draft-space key for transports without a session id (stdio, in-process, tests). */
const LOCAL_WORKSPACE_KEY = 'local';
export function getLayerWorkspace(sessionId) {
    const key = sessionId ?? LOCAL_WORKSPACE_KEY;
    let drafts = draftSpaces.get(key);
    if (!drafts) {
        drafts = new Map();
        draftSpaces.set(key, drafts);
    }
    return { drafts, layers: shared.layers, refs: shared.refs, reviews: shared.reviews };
}
/** Unpublished drafts a transport session holds; unlike `getLayerWorkspace`, never creates a draft space. */
export function draftCount(sessionId) {
    return draftSpaces.get(sessionId)?.size ?? 0;
}
/** Drafts hold live Y.Docs — destroy them or the CRDT state lingers. */
function destroyDrafts(drafts) {
    for (const draft of drafts.values())
        draft.doc.destroy();
}
/**
 * Drop a session's draft space when the transport session ends. Layers,
 * refs, and reviews deliberately survive — they are the published shared
 * record other sessions keep building on.
 */
export function disposeLayerWorkspace(sessionId) {
    const drafts = draftSpaces.get(sessionId);
    if (!drafts)
        return;
    destroyDrafts(drafts);
    draftSpaces.delete(sessionId);
}
/** Test hook: drop all draft spaces and shared state; return a fresh local workspace. */
export function resetLayerWorkspace() {
    for (const drafts of draftSpaces.values())
        destroyDrafts(drafts);
    draftSpaces.clear();
    shared.layers.clear();
    shared.reviews.clear();
    shared.refs.clear();
    shared.refs.set('main', []);
    return getLayerWorkspace();
}
/** Files for a ref, erroring on dangling layer ids (corrupt workspace). */
export function refLayerFiles(ws, name) {
    const ids = ws.refs.get(name);
    if (!ids) {
        throw new ToolExecutionError({
            code: ToolErrorCode.ENTITY_NOT_FOUND,
            message: `Unknown ref '${name}'.`,
            details: { refs: Array.from(ws.refs.keys()) },
        });
    }
    return ids.map((id) => {
        const file = ws.layers.get(id);
        if (!file) {
            throw new ToolExecutionError({
                code: ToolErrorCode.INTERNAL_ERROR,
                message: `Ref '${name}' points at unknown layer ${id}.`,
            });
        }
        return file;
    });
}
/** Resolve a base spec (ref name or layer id; absent → no base). */
export function resolveBase(ws, ref) {
    if (ref === undefined)
        return { base: null, files: [] };
    if (ws.refs.has(ref)) {
        const ids = ws.refs.get(ref) ?? [];
        const files = refLayerFiles(ws, ref);
        return {
            base: ids.length > 0 ? { kind: 'stack', id: computeStackHash(ids) } : null,
            files,
        };
    }
    const layer = ws.layers.get(ref);
    if (layer) {
        // Seed from the full ancestor stack when the layer sits inside a ref
        // history — a lone delta would lose all earlier state and put drafts
        // on the wrong baseline for previews and merge planning.
        const base = { kind: 'layer', id: ref };
        const files = resolveAncestorFilesAnyRef(ws, base);
        return { base, files: files.length > 0 ? files : [layer] };
    }
    throw new ToolExecutionError({
        code: ToolErrorCode.ENTITY_NOT_FOUND,
        message: `Unknown base '${ref}' — not a ref name or published layer id.`,
        details: { refs: Array.from(ws.refs.keys()) },
    });
}
/**
 * Resolve a manifest base against a ref's layer ids: a stack base matches
 * a prefix stack hash, a layer base matches a prefix end (or a stored
 * stray layer). Best effort — unknown bases resolve to [].
 */
export function resolveAncestorFiles(ws, base, refIds) {
    if (!base)
        return [];
    if (base.kind === 'stack') {
        for (let i = 0; i <= refIds.length; i += 1) {
            if (computeStackHash(refIds.slice(0, i)) === base.id) {
                return refIds.slice(0, i).map((id) => ws.layers.get(id)).filter((f) => f !== undefined);
            }
        }
        return [];
    }
    const idx = refIds.indexOf(base.id);
    if (idx !== -1) {
        return refIds.slice(0, idx + 1).map((id) => ws.layers.get(id)).filter((f) => f !== undefined);
    }
    const single = ws.layers.get(base.id);
    return single ? [single] : [];
}
/**
 * Resolve a manifest base by searching every ref's layer list — used when
 * a tool gets a published layer without an explicit `into` ref, where an
 * empty ref list could never reconstruct a stack-hash base.
 */
export function resolveAncestorFilesAnyRef(ws, base) {
    if (!base)
        return [];
    for (const refIds of ws.refs.values()) {
        const files = resolveAncestorFiles(ws, base, refIds);
        if (files.length > 0)
            return files;
    }
    // Fall back to the lone-layer case resolveAncestorFiles also covers.
    return resolveAncestorFiles(ws, base, []);
}
/** Read the IfcClass code off the well-known class attribute, if present. */
export function ifcClassOfAttributes(attributes) {
    const cls = attributes?.[ATTR.CLASS];
    if (cls && typeof cls === 'object' && 'code' in cls) {
        const code = cls.code;
        if (typeof code === 'string')
            return code;
    }
    return undefined;
}
/**
 * Fold an ordered layer stack (weakest first) into a draft Y.Doc.
 *
 * Unlike `seedFromIfcx` (whose `createEntity` is a no-op on existing
 * paths), this applies later layers' opinions on top: nulls remove,
 * tombstones delete, values overwrite.
 */
export function seedDraftDoc(doc, files) {
    doc.transact(() => {
        // Composition resolves `ifclite::deleted` like any other attribute —
        // the strongest (latest) opinion wins after ALL layers merge — so
        // deletion cannot run per-layer: base → delete → resurrect must seed
        // the entity with its base state, exactly as composition reveals it.
        const tombstoned = new Map();
        for (const file of files) {
            for (const node of file.data) {
                const opinion = node.attributes?.[IFCLITE_ATTR.DELETED];
                if (typeof opinion === 'boolean')
                    tombstoned.set(node.path, opinion);
                applyNode(doc, node);
            }
        }
        for (const [path, deleted] of tombstoned) {
            if (deleted)
                deleteEntity(doc, path);
        }
    });
}
function applyNode(doc, node) {
    if (!hasEntity(doc, node.path)) {
        const ifcClass = ifcClassOfAttributes(node.attributes);
        const inherits = {};
        for (const [role, target] of Object.entries(node.inherits ?? {})) {
            if (typeof target === 'string')
                inherits[role] = target;
        }
        createEntity(doc, node.path, {
            ifcClass,
            inherits,
            // Imported layers may be snapshots: their header identifies the file's
            // writer, not each entity's creator (#8041, #3092). Keep unknown origin
            // unknown, including the default wall clock. Explicit ifclite::meta
            // travels unchanged with the node's attributes below.
            stampCreatedAt: false,
            meta: { ifcClass },
        });
    }
    for (const [key, value] of Object.entries(node.attributes ?? {})) {
        if (key === IFCLITE_ATTR.DELETED)
            continue;
        if (value === null)
            deleteAttribute(doc, node.path, key);
        else
            setAttribute(doc, node.path, key, value);
    }
    for (const [role, child] of Object.entries(node.children ?? {})) {
        if (child === null)
            removeChild(doc, node.path, role);
        else
            setChild(doc, node.path, role, child);
    }
    // Inherits deltas must replay on existing entities too — `createEntity`
    // only applies them on first creation, but later base layers may add,
    // retarget, or null out inheritance opinions.
    for (const [role, target] of Object.entries(node.inherits ?? {})) {
        if (target === null)
            removeInherit(doc, node.path, role);
        else if (typeof target === 'string')
            setInherit(doc, node.path, role, target);
    }
}
/** Build, seed, baseline, and register a new draft. */
export function createDraft(ws, init) {
    const doc = createCollabDoc({ gc: false });
    seedDraftDoc(doc, init.baseFiles);
    const draft = {
        id: randomUUID(),
        doc,
        baseline: Y.encodeStateAsUpdate(doc),
        base: init.base,
        baseFiles: init.baseFiles,
        intent: init.intent,
        claims: init.claims,
        rawClaims: init.rawClaims,
        session: init.session ?? randomUUID(),
        owner: init.owner,
        createdAt: new Date().toISOString(),
    };
    ws.drafts.set(draft.id, draft);
    return draft;
}
//# sourceMappingURL=layer-store.js.map