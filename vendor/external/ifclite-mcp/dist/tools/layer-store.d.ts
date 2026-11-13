import * as Y from 'yjs';
import type { ScopeClaim } from '@ifc-lite/extensions';
import type { IfcxFile, ProvenanceBase } from '@ifc-lite/ifcx';
export interface DraftLayer {
    id: string;
    doc: Y.Doc;
    /** `Y.encodeStateAsUpdate(doc)` at creation — what `publishLayer` diffs against. */
    baseline: Uint8Array;
    base: ProvenanceBase | null;
    /** Resolved base stack (weakest first) for merge previews; may be []. */
    baseFiles: IfcxFile[];
    intent: string;
    claims: ScopeClaim[];
    rawClaims: string[];
    session: string;
    /** Creating principal; undefined = unauthenticated/local → accessible to anyone in the workspace. */
    owner?: string;
    createdAt: string;
}
export interface ReviewDecision {
    entity: string;
    componentKey?: string;
    decision: 'accept' | 'reject';
    comment?: string;
}
export type ReviewStatus = 'open' | 'changes-requested' | 'approved';
/**
 * A review comment as a BCF-shaped topic bound to (review, entity,
 * componentKey?) per 08-review.md §8.6 — same shape the registry stores,
 * so agents read one structure in both places.
 */
export interface ReviewTopic {
    guid: string;
    title: string;
    description?: string;
    entity: string;
    componentKey?: string;
    author?: string;
    createdAt: string;
}
export interface LayerReview {
    id: string;
    layerId: string;
    into: string;
    reviewers: string[];
    status: ReviewStatus;
    feedback: ReviewDecision[];
    /** BCF-shaped review comments (8.6); empty until someone comments. */
    topics: ReviewTopic[];
    /** Follow-up draft ids opened via `respond_to_review`. */
    responses: string[];
    /** Requesting principal; undefined = unauthenticated/local → accessible to anyone in the workspace. */
    owner?: string;
}
export interface LayerWorkspace {
    drafts: Map<string, DraftLayer>;
    layers: Map<string, IfcxFile>;
    refs: Map<string, string[]>;
    reviews: Map<string, LayerReview>;
}
export declare function createLayerWorkspace(): LayerWorkspace;
export declare function getLayerWorkspace(sessionId?: string): LayerWorkspace;
/** Unpublished drafts a transport session holds; unlike `getLayerWorkspace`, never creates a draft space. */
export declare function draftCount(sessionId: string): number;
/**
 * Drop a session's draft space when the transport session ends. Layers,
 * refs, and reviews deliberately survive — they are the published shared
 * record other sessions keep building on.
 */
export declare function disposeLayerWorkspace(sessionId: string): void;
/** Test hook: drop all draft spaces and shared state; return a fresh local workspace. */
export declare function resetLayerWorkspace(): LayerWorkspace;
/** Files for a ref, erroring on dangling layer ids (corrupt workspace). */
export declare function refLayerFiles(ws: LayerWorkspace, name: string): IfcxFile[];
export interface ResolvedBase {
    base: ProvenanceBase | null;
    files: IfcxFile[];
}
/** Resolve a base spec (ref name or layer id; absent → no base). */
export declare function resolveBase(ws: LayerWorkspace, ref?: string): ResolvedBase;
/**
 * Resolve a manifest base against a ref's layer ids: a stack base matches
 * a prefix stack hash, a layer base matches a prefix end (or a stored
 * stray layer). Best effort — unknown bases resolve to [].
 */
export declare function resolveAncestorFiles(ws: LayerWorkspace, base: ProvenanceBase | null, refIds: readonly string[]): IfcxFile[];
/**
 * Resolve a manifest base by searching every ref's layer list — used when
 * a tool gets a published layer without an explicit `into` ref, where an
 * empty ref list could never reconstruct a stack-hash base.
 */
export declare function resolveAncestorFilesAnyRef(ws: LayerWorkspace, base: ProvenanceBase | null): IfcxFile[];
/** Read the IfcClass code off the well-known class attribute, if present. */
export declare function ifcClassOfAttributes(attributes: Record<string, unknown> | undefined): string | undefined;
/**
 * Fold an ordered layer stack (weakest first) into a draft Y.Doc.
 *
 * Unlike `seedFromIfcx` (whose `createEntity` is a no-op on existing
 * paths), this applies later layers' opinions on top: nulls remove,
 * tombstones delete, values overwrite.
 */
export declare function seedDraftDoc(doc: Y.Doc, files: readonly IfcxFile[]): void;
export interface CreateDraftInit {
    base: ProvenanceBase | null;
    baseFiles: IfcxFile[];
    intent: string;
    claims: ScopeClaim[];
    rawClaims: string[];
    session?: string;
    owner?: string;
}
/** Build, seed, baseline, and register a new draft. */
export declare function createDraft(ws: LayerWorkspace, init: CreateDraftInit): DraftLayer;
//# sourceMappingURL=layer-store.d.ts.map