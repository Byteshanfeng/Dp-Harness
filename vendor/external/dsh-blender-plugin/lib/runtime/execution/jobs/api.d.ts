import type { JobsDeps, JobRecord } from './types.js';
import type { LedgerApi } from '../ledger/index.js';
export interface JobsCtx {
    E: JobsDeps;
    jobs: Map<string, JobRecord>;
    ledger: LedgerApi;
}
export declare function jobStart(ctx: JobsCtx, opts?: Record<string, unknown>): Record<string, unknown>;
export declare function jobStatus(ctx: JobsCtx, id: unknown): Record<string, unknown>;
export declare function jobCollect(ctx: JobsCtx, id: unknown, tail?: number): Record<string, unknown>;
export declare function jobWait(ctx: JobsCtx, id: unknown, timeoutMs?: number): Promise<Record<string, unknown>>;
export declare function jobList(ctx: JobsCtx): Array<Record<string, unknown>>;
