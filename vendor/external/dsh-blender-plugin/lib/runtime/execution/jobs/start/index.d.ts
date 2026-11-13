import type { JobRecord } from '../types.js';
import type { JobsDeps } from '../types.js';
export interface JobStartDeps {
    E: JobsDeps;
    jobs: Map<string, JobRecord>;
    ledgerAppend: (rec: Record<string, unknown>) => void;
}
export declare function startJob(d: JobStartDeps, opts?: Record<string, unknown>): Record<string, unknown>;
