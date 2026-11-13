/**
 * The model's spatial tree, in one place.
 *
 * `spatial_hierarchy` and the `ifc-lite://model/{id}/spatial-tree` resource
 * answer the same question and used to answer it with two walks that disagreed:
 * the tool recursed through containment as well as aggregation, the resource did
 * not; the tool fell back to a queued `IfcProject` when the file's was deleted,
 * the resource returned null; and neither carried a visited set, so a cyclic
 * aggregation edge recursed until the stack gave out. A malformed IFC could hang
 * the server rather than be reported.
 *
 * One walk, used by both. Reads go through `m.bim`, so the tree reflects the
 * session's queued and deleted relationships like the rest of the read surface
 * (#2014).
 */
import type { LoadedModel } from './context.js';
/** One node of the spatial tree. `elements` is present only when asked for. */
export interface SpatialNode {
    expressId: number;
    globalId: string;
    type: string;
    name: string;
    /** Express ids contained in this spatial node (`IfcRelContainedInSpatialStructure`). */
    elements?: number[];
    children: SpatialNode[];
}
/**
 * The `IfcProject` this tree hangs from, or null.
 *
 * A session can delete the file's project, and can create one — so the answer is
 * "the first live persisted `IfcProject`, else the first queued one". The
 * resource used to consider only the persisted list and return null where the
 * tool succeeded, which is two answers to one question.
 */
export declare function spatialRootId(model: LoadedModel): number | null;
/** The whole tree from {@link spatialRootId}, or null when there is no project. */
export declare function buildSpatialTree(model: LoadedModel, options?: {
    includeElements?: boolean;
}): SpatialNode | null;
//# sourceMappingURL=spatial-tree.d.ts.map