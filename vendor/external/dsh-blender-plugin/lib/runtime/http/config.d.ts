export declare const PORT: number;
export declare const HOST = "127.0.0.1";
export interface HttpStats {
    [k: string]: unknown;
    frames: number;
    acts: number;
    cmds: number;
    loops: number;
    views: number;
    headless: number;
    plan: number;
    worker: number;
    txn: number;
    preset: number;
    job: number;
    selections: number;
    lastSelectionMs: number | null;
    lastPlanMs: number | null;
    lastViewMs: number | null;
    lastHeadlessMs: number | null;
    lastFrameMs: number | null;
    lastActMs: number | null;
    lastError: string | null;
    startedAt: number;
    launches?: number;
    lastLaunchMs?: number | null;
    perf?: number;
    opt?: number;
    staleLeasesReclaimed?: number;
    lastLeaseNote?: string | null;
}
export declare const stats: HttpStats;
export declare const RTT: Record<string, number[]>;
export declare function pushRtt(kind: string, ms: unknown): void;
export declare function rttView(): Record<string, unknown>;
/** 每路由请求计数（诊断用：判断是否还有旧标签页在轮询已删除的接口） */
export declare const reqCounts: Map<string, number>;
export declare function bump(p: string): void;
