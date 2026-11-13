import { type RootBudget } from '@ifc-lite/ai';
import type { FlowDocument, RunResult } from '@ifc-lite/flow';
import { type createStandardRegistry } from '@ifc-lite/flow-nodes';
import type { ToolContext, LoadedModel } from '../context.js';
type Registry = ReturnType<typeof createStandardRegistry>;
/** Availability must be reported before attempting model resolution, including on resume. */
export declare function restoredMcpNodes(input: Record<string, unknown>, ctx: ToolContext, resuming: boolean): Promise<Set<string>>;
export declare function prepareMcpFlowReview(input: Record<string, unknown>, ctx: ToolContext, model: LoadedModel, doc: FlowDocument, registry: Registry, player: Record<string, unknown>, resuming: boolean, readOnly?: boolean): Promise<{
    restored: Set<string>;
    budget: RootBudget;
    receipts: unknown[];
    ai: import("@ifc-lite/flow-nodes/ai").FlowAiService | undefined;
    claim(): Promise<Map<string, Map<string, import("@ifc-lite/flow").FlowData>> | undefined>;
    settle(result: RunResult, redaction: ReadonlyMap<string, string>, activeModelId?: string): Promise<{
        model_id: string;
        checkpoint_path: string | undefined;
        id: string;
        state: import("@ifc-lite/flow/checkpoint").CheckpointState;
        proposal_digest: string;
        artifacts: {
            [k: string]: Readonly<Record<string, import("@ifc-lite/flow/checkpoint").PortableFlowData>>;
        };
        budget: unknown;
    } | undefined>;
    fail(): Promise<void>;
}>;
export {};
//# sourceMappingURL=flow-review-host.d.ts.map