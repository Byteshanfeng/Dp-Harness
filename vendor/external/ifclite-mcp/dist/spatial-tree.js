/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { iterateEffectiveEntityIds } from '@ifc-lite/mutations';
/**
 * The `IfcProject` this tree hangs from, or null.
 *
 * A session can delete the file's project, and can create one — so the answer is
 * "the first live persisted `IfcProject`, else the first queued one". The
 * resource used to consider only the persisted list and return null where the
 * tool succeeded, which is two answers to one question.
 */
export function spatialRootId(model) {
    for (const { expressId } of iterateEffectiveEntityIds(model.store, model.backend.getMutationView(), ['IFCPROJECT'])) {
        return expressId;
    }
    return null;
}
/** The whole tree from {@link spatialRootId}, or null when there is no project. */
export function buildSpatialTree(model, options = {}) {
    const root = spatialRootId(model);
    if (root === null)
        return null;
    return buildNode(model, root, options.includeElements === true, new Set());
}
/**
 * One node and its descendants.
 *
 * **Children come from aggregation only.** `IfcRelContainedInSpatialStructure`
 * names the *elements* a spatial node holds — walls, doors — and those are not
 * spatial nodes; recursing into them put every wall in the file into the tree
 * twice, once as a child and once in `elements`. The spatial chain
 * (project → site → building → storey → space) is aggregation, which is what
 * this follows.
 *
 * **`visited` is threaded, not re-created.** A file whose aggregation contains a
 * cycle — or merely a diamond, where one entity is aggregated under two parents
 * — otherwise recurses forever. An entity already placed is not placed again, so
 * it appears under the first parent reached and the walk is finite. Acyclic
 * input is unaffected: nothing is ever reached twice.
 */
function buildNode(model, expressId, includeElements, visited) {
    visited.add(expressId);
    const ref = { modelId: model.id, expressId };
    const data = model.bim.entity(ref);
    const children = [];
    for (const child of model.bim.decomposes(ref)) {
        if (visited.has(child.ref.expressId))
            continue;
        children.push(buildNode(model, child.ref.expressId, includeElements, visited));
    }
    const node = {
        expressId,
        globalId: data?.globalId ?? '',
        type: data?.type ?? 'Unknown',
        name: data?.name ?? '',
        children,
    };
    if (includeElements) {
        node.elements = model.bim.contains(ref).map((e) => e.ref.expressId);
    }
    return node;
}
//# sourceMappingURL=spatial-tree.js.map