/** TCP 真探：连上即"在监听"。比 HTTP 探活更轻，不受宿主 fetch 超时影响。 */
export declare function probeTcp(host: string, port: number, timeoutMs?: number): Promise<boolean>;
/** HTTP 探活：能拿到 2xx 才算"后端真的在服务"（端口通但后端没起来 ⇒ false）。 */
export declare function probeHttp(url: string, timeoutMs?: number): Promise<boolean>;
/**
 * 启动决策表（纯函数，便于单测）：
 *   portUp                → "already-running"（别的会话拉起的也算在跑，绝不重复拉）
 *   !portUp && childAlive → "stale-handle"（句柄陈了：端口没监听 ⇒ 必须先清再拉）
 *   !portUp && !childAlive→ "spawn"
 */
export type StartDecision = 'already-running' | 'stale-handle' | 'spawn';
export declare function decideStart({ portUp, childAlive, }: {
    portUp: boolean;
    childAlive: boolean;
}): StartDecision;
/** 轮询等到能服务为止（op=start 用它给真结论，而不是"睡固定时间再探一次"）。 */
export declare function waitHttp(url: string, timeoutMs?: number, intervalMs?: number): Promise<boolean>;
