/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { okResult, resolveModel } from './util.js';
const modelProperty = { model_id: { type: 'string', description: 'Loaded model id; required when multiple models are loaded.' } };
const structuralData = {
    name: 'structural_data',
    description: 'Read the structural analysis model — analysis models, members, connections, actions/reactions and load/result groups — from the loaded model.',
    scope: 'read',
    inputSchema: { type: 'object', properties: modelProperty, additionalProperties: false },
    handler(input, ctx) {
        const model = resolveModel(ctx, input.model_id);
        const data = model.bim.structural.data(model.id);
        if (!data.hasStructural) {
            return okResult(`Model '${model.id}' has no structural analysis entities.`, { data });
        }
        return okResult(`Read ${data.analysisModels.length} analysis model(s), ${data.members.length} member(s), ` +
            `${data.connections.length} connection(s) and ${data.activities.length} action/reaction(s) ` +
            `from model '${model.id}'${data.loadsTruncated ? ' (some applied loads were truncated by a depth or node-budget bound)' : ''}.`, { data });
    },
};
export const structuralTools = [structuralData];
//# sourceMappingURL=structural.js.map