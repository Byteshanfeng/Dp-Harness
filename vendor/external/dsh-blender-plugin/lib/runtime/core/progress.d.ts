export interface StageRecord {
    stage?: unknown;
    stageAt?: number | null;
    stageName?: string | null;
    progress?: unknown;
    progressAt?: number | null;
    progressHistory?: Array<{
        at: number;
        p: unknown;
    }>;
    lastOutputAt?: number | null;
    lines?: number;
    logs?: {
        stdoutWsl?: string;
    } | null;
    dir?: string;
    startedAt: number;
    heartbeat?: Record<string, unknown>;
}
declare const STAGE_TAG = "DSH_STAGE ";
/** v2.6（本轮反馈 #4）：进度通道 —— 脚本侧 dsh_progress(...) / K.progress(...) 打 DSH_PROGRESS {json}，
 *  op=status/collect 直接能读到最后一条（渲染逐帧 / 批处理逐件 / 下载百分比）。
 *  和 stage 的区别：stage 是"阶段跃迁"（少量），progress 是"阶段内进度"（高频、可覆盖、留最近 20 条）。 */
declare const PROGRESS_TAG = "DSH_PROGRESS ";
declare function scanProgressLine(line: string, rec: StageRecord, now: number): boolean;
declare function scanStageLine(line: string, rec: StageRecord, now: number): boolean;
/** 把一段 chunk 按行喂给 stage 扫描（跨 chunk 的半行用尾部缓冲兜住） */
declare function makeStageScanner(rec: StageRecord): (chunk: unknown) => void;
/**
 * v2.6（本轮反馈 #4）：运行心跳 —— 每 5s 更新 rec.heartbeat（并可选 append 到 <dir>/heartbeat.jsonl）。
 * 现场问题：一帧 EEVEE 渲染 2–3 分钟，op=status 只有 stage/idleMs 两个数字，看不出"到第几帧 / 写到多少字节"。
 * heartbeat 给：elapsedMs / logBytes / lines / stage / lastProgressAt —— 够判断"它在动还是在卡"。
 */
declare function startHeartbeat(rec: StageRecord, dirWsl?: string | null): () => void;
export { STAGE_TAG, PROGRESS_TAG, scanProgressLine, scanStageLine, makeStageScanner, startHeartbeat, };
