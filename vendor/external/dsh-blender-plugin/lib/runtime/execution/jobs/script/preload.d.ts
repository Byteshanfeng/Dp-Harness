import { writeHeadlessScript } from '../../../staging.js';
import type { JobsDeps } from '../types.js';
import type { JobBuildArgs } from './args.js';
export interface JobParts {
    parts: string[];
    jobShotsSpec: Record<string, unknown> | null;
    sp: ReturnType<typeof writeHeadlessScript>;
    timeoutMs: number;
}
export declare function buildJobParts(E: JobsDeps, opts: Record<string, unknown>, a: JobBuildArgs): JobParts;
/** 脚本写盘 + Blender 参数收尾 */
export declare function finalizeJobArgs(a: JobBuildArgs, built: JobParts, opts: Record<string, unknown>): void;
