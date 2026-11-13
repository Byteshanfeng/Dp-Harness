import type { JobBuildArgs } from './args.js';
import type { writeHeadlessScript } from '../../../staging.js';
import type { JobsDeps } from '../types.js';
export type { JobBuildArgs } from './args.js';
export interface PreparedJob extends JobBuildArgs {
    sp: ReturnType<typeof writeHeadlessScript>;
    timeoutMs: number;
}
export declare function buildJobScript(E: JobsDeps, opts?: Record<string, unknown>): PreparedJob;
