/**
 * Agent draft-layer lifecycle tools (spec 06-agents.md §6.2/§6.3):
 *
 *   create_draft_layer → n × draft_apply_ops → publish_layer
 *
 * Every mutation lands in a draft (a CRDT session bound to a base);
 * publishing freezes it into an immutable, content-addressed,
 * provenance-stamped layer. Scope claims are enforced twice: per op at
 * write time (before the Y.Doc is touched) and re-verified against the
 * frozen layer at publish time (`scope_verified` + `mismatches`).
 */
import { publishLayer } from '@ifc-lite/collab';
import type { Tool } from './types.js';
import type { ToolContext } from '../context.js';
import type { DraftLayer } from './layer-store.js';
/** Freeze a draft via `publishLayer` without registering the result (previews). */
export declare function publishDraftFile(draft: DraftLayer, ctx: ToolContext): ReturnType<typeof publishLayer>;
export declare const draftLayerTools: Tool[];
//# sourceMappingURL=layer.d.ts.map