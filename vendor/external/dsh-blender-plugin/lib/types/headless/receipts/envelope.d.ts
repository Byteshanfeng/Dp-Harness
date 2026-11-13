import { type ReceiptContext } from './human-text.js';
/**
 * v0.9.3：客户端单次等待上限。超过它就**不干等**，转作业层并回 jobId（对齐 bash 的 promoted 语义）。
 * 默认 100 s：外层 run_code 的默认 deadline 是 120 s，留 20 s 余量给回执与状态查询。
 */
export declare const HEADLESS_WAIT_MS: number;
/** run id 由**客户端**生成：窗口到点时立刻就能报出一个可用句柄（服务端会用它登记台账） */
export declare function newRunId(): string;
/** 后台化 + 可选等待：POST /headless asJob:true 拿 jobId，再 op=wait 等一小会儿 */
export declare function startJobThenMaybeWait(port: number, body: unknown, waitS: number | null): Promise<Record<string, unknown>>;
/** shots 回执归一化：sync 路径给 {rows:[…]}，job 快照给 qc_render 原样的 {views:[…]} */
export declare function normalizeShots(s: unknown): Record<string, unknown> | null;
/** 结构化信封（block 0）：稳定字段 + 有界大小（大结果只给 resultPath） */
export declare function receiptEnvelope(res: unknown, ctx: ReceiptContext): Record<string, unknown>;
export interface ToolReceipt {
    text: string;
    envelope: Record<string, unknown>;
    images?: unknown[];
    [key: string]: unknown;
}
/** 无头回执（sync / 作业层完成）：{text, envelope} —— 两个 text block 的来源 */
export declare function headlessReceipt(res: unknown, ctx: ReceiptContext): ToolReceipt;
/**
 * v0.9.3：**promoted 回执** —— 任务还在跑（或已结束但我们没等到），句柄已经有效。
 */
export declare function promotedReceipt(job: unknown, jobId: string, why: string): ToolReceipt;
/**
 * v0.9.3：客户端等待窗口到点 / 宿主取消时的兜底 —— 先问一句服务端状态：
 *   已结束 → 直接 collect 把结果拿回来；还在跑 → 回 promoted 回执（runId 客户端生成，句柄一定有效）。
 */
export declare function promotedFromTimeout(port: number, runId: string, err: unknown): Promise<Record<string, unknown>>;
/** 取某个 id（run-… / job-…）的状态快照（拿不到就返回 null，绝不抛） */
export declare function fetchJobStatus(port: number, id: string): Promise<unknown>;
