import type { JobsDeps } from './types.js';
import { jobDir, jobArtifacts, jobSnapshot, tailFile } from './snapshot.js';
export type { JobsDeps, JobRecord } from './types.js';
export declare function createJobsApi(E: JobsDeps): {
    jobs: Map<string, import("./types.js").JobRecord>;
    jobStart: (opts?: Record<string, unknown>) => Record<string, unknown>;
    jobSnapshot: typeof jobSnapshot;
    jobStatus: (id: unknown) => Record<string, unknown>;
    jobCollect: (id: unknown, tail?: number) => Record<string, unknown>;
    jobWait: (id: unknown, timeoutMs?: number) => Promise<Record<string, unknown>>;
    jobKill: (id: unknown) => Record<string, unknown>;
    jobList: () => Record<string, unknown>[];
    jobDir: typeof jobDir;
    jobArtifacts: typeof jobArtifacts;
    tailFile: typeof tailFile;
    ledger: import("../ledger/state.js").LedgerApi;
};
