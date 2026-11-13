interface JobCtx {
    mode: 'job';
    jobId: string | null;
    runId: string | null;
    notes: string[];
    hint: string | null;
}
export declare function renderJobList(r: Record<string, unknown>): {
    text: string;
};
export declare function buildJobStart(j: Record<string, unknown>, ctx: JobCtx): unknown;
export declare function buildJobKill(j: Record<string, unknown>): unknown;
export declare function buildRecoveredJob(j: Record<string, unknown>, op: string): unknown;
export declare function buildLedgerJob(j: Record<string, unknown>, op: string): unknown;
export declare function buildCollectRunning(j: Record<string, unknown>, ctx: JobCtx): unknown;
export declare function buildWaitTimeout(j: Record<string, unknown>): unknown;
export declare function buildFinalJob(j: Record<string, unknown>, ctx: JobCtx, notes: string[]): unknown;
export {};
