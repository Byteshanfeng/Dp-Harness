/** #7070: host opt-in and one persistable pool shared by every node and resume. */
import { type RootBudget } from '@ifc-lite/ai';
import { type FlowAiService } from '@ifc-lite/flow-nodes/ai';
export declare function mcpFlowFeatures(): {
    backend: Set<string>;
    network: boolean;
    secrets: ReadonlySet<string>;
};
export declare function mcpFlowAi(budget: RootBudget, receipts: unknown[], onStart: () => void): FlowAiService | undefined;
//# sourceMappingURL=flow-ai.d.ts.map