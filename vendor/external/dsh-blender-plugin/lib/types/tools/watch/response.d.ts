/** watch 响应文本：无头 worker 结果与 GUI 采样结果两套口径（帧附件在各自入口组装）。 */
import type { HostContext } from '../../host/context.js';
/** 无头 worker 返回的 {frames,picks,code,...} → 文本 + 最多 6 张附帧。 */
export declare function workerWatchResponse(ctx: HostContext, res: Record<string, unknown>): Promise<unknown>;
/** GUI 逐帧采样 → 文本 + 均匀抽取的附帧。shots[i]={t,ms,hash,png}。 */
export declare function guiWatchResponse(ctx: HostContext, shots: Array<{
    t: number;
    ms: number;
    hash: string;
    png: Uint8Array | null;
}>, parts: string[], seconds: number, fps: number): Promise<Record<string, unknown>>;
