export declare const RECOVER_VERSION = "2.6.1";
export interface MapPair {
    winToWsl: (p: string) => string;
    wslToWin: (p: string) => string;
}
export interface LogEvidence {
    path: string | null;
    exists: boolean;
    bytes: number;
    mtime: number | null;
    lastStage: string | null;
    sawDone: boolean;
    sawScriptEnd: boolean;
    sawHeadless: boolean;
    sawTraceback: boolean;
    lastProgress: Record<string, unknown> | null;
    tail: string | null;
    error?: string;
}
/**
 * 读日志尾部并抽"终态证据"。只读尾部，避免大日志把进程拖死。
 * 返回 { exists, bytes, mtime, lastStage, sawDone, sawScriptEnd, sawHeadless, sawTraceback,
 *        lastProgress, path, tail, error? }
 */
export declare function logEvidence(pathWsl: string, maxBytes?: number): LogEvidence;
export interface RecoverOut {
    found: boolean;
    source: string | null;
    status: string | null;
    exitCode: unknown;
    finishedAt: number | null;
    artifacts: unknown[];
    evidence: Record<string, unknown> | null;
    stdoutLog: string | null;
    stderrLog: string | null;
    lastProgress: Record<string, unknown> | null;
}
/**
 * 在磁盘上找"这条 run/job 已经跑完"的证据。
 * rec 可含：dir / jobDir / outdir / resultPath / stdoutLog / stdoutLogWsl / logs
 * map = {winToWsl, wslToWin}
 */
export declare function recoverFromDisk(rec: Record<string, unknown> | null | undefined, map?: MapPair): RecoverOut;
/**
 * 把一条 status=running 的磁盘台账记录收敛成终态。
 *  - pid 还活着 → 原样返回（不抢）
 *  - pid 没了但磁盘有终态证据 → status=done/failed + recovered:true
 *  - 否则 → status=stale（保留旧语义），但附 evidence 让调用方少一次破案
 */
export declare function reconcileLedger(rec: Record<string, unknown> | null, map?: MapPair, isAlive?: (pid: unknown) => boolean): Record<string, unknown> | null;
/**
 * v0.9.3：run（blender_rt_headless 的同步执行）与 job 同一份结构化回执形状 ——
 * collect/status 收 run-… 与 job-… 都是同一套字段，调用方不必分辨两者。
 */
declare function runSnapshot(r: Record<string, unknown>): Record<string, unknown>;
/**
 * 磁盘台账记录（后端重启后的历史）：running 但 pid 已不存在时的收敛。
 *
 * v2.6（本轮反馈 #1）：旧版一律判 stale —— 但实测两次「子进程其实已经跑完、产物/日志都在」，
 * 调用方要自己 Get-Process + ls 破案，每次至少赔一轮往返。现在先做磁盘对账：
 *   summary.json / resultPath / stdout 终态（DSH_STAGE done、HEADLESS、Traceback）
 * 对得上 ⇒ status=done|failed + recovered=true（证据在 recoveredFrom/recoveredEvidence）；
 * 对不上才判 stale，并把 evidence（日志大小/lastStage）附回去。
 * 纯逻辑在同文件的 recoverFromDisk/reconcileLedger，可脱离 Blender 单测
 * （tests/unit/js/ledger-recover.test.ts）。
 */
declare function reconcileLedgerRecord(rec: Record<string, unknown> | null): Record<string, unknown> | null;
export declare function createLedgerRecover(): {
    runSnapshot: typeof runSnapshot;
    reconcileLedger: typeof reconcileLedgerRecord;
};
export {};
