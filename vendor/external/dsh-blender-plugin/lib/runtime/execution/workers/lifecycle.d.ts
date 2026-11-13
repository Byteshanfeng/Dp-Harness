import type { WorkersCtx } from './api.js';
export declare function workerStop(ctx: WorkersCtx, nameArg?: unknown): Promise<Record<string, unknown>>;
/** 重启：换一个干净会话（复用 = 放弃进程隔离，脚本脏了就用它） */
export declare function workerRestart(ctx: WorkersCtx, nameArg?: unknown, opts?: Record<string, unknown>): Promise<Record<string, unknown>>;
export declare function createWorkerReaper(ctx: WorkersCtx): {
    clearWorkerReaper: () => void;
    killWorkers: () => void;
};
