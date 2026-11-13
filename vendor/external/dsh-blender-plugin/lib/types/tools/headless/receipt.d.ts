/** blender_rt_headless 回执层：作业化/同步回执/缺字段诊断/shots 附图（行为与 v2.6.2 一致）。 */
import type { HostContext } from '../../host/context.js';
import { type ToolReceipt } from '../../headless/receipts/index.js';
export declare function runAsJob(port: number, body: Record<string, unknown>, waitS: number | null, asJob: boolean, serverBudget: number, autoJobMs: number): Promise<unknown>;
export declare function missingResultText(res: Record<string, unknown>, body: Record<string, unknown>): {
    text: string;
};
export declare function syncReceipt(bodyRes: Record<string, unknown>, res: Record<string, unknown>): ToolReceipt;
export declare function attachShots(ctx: HostContext, out: ToolReceipt, args: Record<string, unknown>): Promise<unknown[]>;
