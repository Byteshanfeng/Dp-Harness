/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { createNativeBcfWriteGateway } from '@ifc-lite/flow-nodes/bcf-publication-node';
import { deriveModelId, loadIfcModelFromBytes } from '../loader.js';
import { buildIdsAccessor } from './ids-accessor.js';
import { readNativeReview, readPortableReview } from '@ifc-lite/sdk/review';
import { nativeReviewModel, reviewCaptures, reviewAccess } from './review-captures.js';
/** `base`, or `base_2`, `base_3`, … — the first id the registry does not hold yet. */
function freeModelId(registry, base) {
    let id = base;
    for (let n = 2; registry.get(id) !== null; n += 1)
        id = `${base}_${n}`;
    return id;
}
export function createMcpFlowHost(initial, registry, networkGrants, services = {}, context, publication = {}) {
    let active = initial;
    return {
        ...services,
        bcfWrites: createNativeBcfWriteGateway(publication),
        ...(context ? {
            review: { snapshot: request => {
                    const access = reviewAccess(context, 'read');
                    const read = request.savedAnalysisRuns !== undefined || request.savedValidationReports !== undefined
                        ? readPortableReview : readNativeReview;
                    return read(reviewCaptures(context), access.models, request, access.allowed);
                } },
            validationCapture: {
                begin: (definition, signal) => reviewCaptures(context).begin('ids', definition, [nativeReviewModel(active)], reviewAccess(context, 'validate').models, reviewAccess(context, 'validate').allowed, signal),
                finish: (token, report) => reviewCaptures(context).finish(token, report),
                abandon: (token, reason) => reviewCaptures(context).abandon(token, reason),
            },
        } : {}),
        get bim() { return active.bim; },
        networkGrants,
        get defaultModelId() { return active.id; },
        // `tables()` gives `table.joinByKey`'s tag/property strategies the entity
        // table, as the CLI and viewer hosts do — without it those strategies fail
        // at run time over MCP only. The mutation view is the one `bim.mutate`
        // writes through, so a join sees what an earlier node in the run wrote.
        // It honours `modelId`, as the CLI's does: once `model.openFromSource`
        // switches the active model mid-run, a join aimed at the earlier model
        // must get that model's table, not the new one's (#5935 review).
        tables: (modelId) => {
            const model = modelId === undefined || modelId === active.id ? active : registry.get(modelId);
            if (!model)
                return undefined;
            return {
                entities: model.store.entities,
                mutationView: model.backend.getOrCreateMutationView(),
                strings: model.store.strings ?? null,
            };
        },
        // `ids.validate` reads the session's effective model, like `ids_validate`.
        idsAccessor: () => buildIdsAccessor(active.store, active.backend.getMutationView()),
        async openModel(bytes, name) {
            const loaded = await loadIfcModelFromBytes(bytes, name, freeModelId(registry, deriveModelId(name)));
            registry.add(loaded);
            active = loaded;
            return { modelId: loaded.id };
        },
    };
}
//# sourceMappingURL=flow-host.js.map