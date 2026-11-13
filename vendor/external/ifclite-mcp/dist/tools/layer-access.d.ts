import type { DraftLayer, LayerReview, LayerWorkspace } from './layer-store.js';
export declare function visibleDraftIds(ws: LayerWorkspace, caller?: string): string[];
export declare function visibleReviewIds(ws: LayerWorkspace, caller?: string): string[];
/** Existence check only — read paths; `caller` just filters error details. */
export declare function requireDraft(ws: LayerWorkspace, id: string, caller?: string): DraftLayer;
/** Ownership-gated lookup for mutating draft tools. */
export declare function requireOwnedDraft(ws: LayerWorkspace, id: string, caller?: string): DraftLayer;
/**
 * Visibility-gated lookup for review reads: reviews span principals
 * (process-shared), so even reads admit only the owner and listed
 * reviewers. Denial is identical to the unknown-id error.
 */
export declare function requireReview(ws: LayerWorkspace, id: string, caller?: string): LayerReview;
/** Ownership-gated lookup for mutating review tools. */
export declare function requireOwnedReview(ws: LayerWorkspace, id: string, caller?: string, opts?: {
    allowReviewers?: boolean;
}): LayerReview;
//# sourceMappingURL=layer-access.d.ts.map