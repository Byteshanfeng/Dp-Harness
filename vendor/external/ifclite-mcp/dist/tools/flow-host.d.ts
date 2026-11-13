/**
 * The `FlowHost` `run_flow` hands the graph. A `HeadlessLikeBackend` answers
 * for one model, so `openModel` (`model.openFromSource`) loads the bytes
 * through the same loader `load_model` uses, registers the result in the
 * session's model registry (later tool calls can address it by id), and
 * makes it the model `bim`, `defaultModelId` and `tables()` answer for for
 * the rest of the run.
 */
import type { Capability } from '@ifc-lite/extensions';
import type { FlowHost } from '@ifc-lite/flow-nodes';
import { createNativeBcfWriteGateway } from '@ifc-lite/flow-nodes/bcf-publication-node';
import type { LoadedModel, ModelRegistry, ToolContext } from '../context.js';
export declare function createMcpFlowHost(initial: LoadedModel, registry: ModelRegistry, networkGrants: readonly Capability[], services?: Pick<FlowHost, 'ai' | 'grants'>, context?: ToolContext, publication?: Parameters<typeof createNativeBcfWriteGateway>[0]): FlowHost;
//# sourceMappingURL=flow-host.d.ts.map