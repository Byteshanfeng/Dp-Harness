import type { WorkersCtx } from './api.js';
export { assertBlenderExe } from '../exe-guard.js';
export interface WorkerInfo {
    timedOut?: boolean;
    ok?: Record<string, unknown>;
    exited?: boolean;
    code?: number | null;
    signal?: NodeJS.Signals | null;
    spawnErr?: Error;
}
export declare function workerStart(ctx: WorkersCtx, opts?: Record<string, unknown>, nameArg?: unknown): Promise<Record<string, unknown>>;
