import type { HeadlessDeps, HeadlessOpts, PreparedHeadless } from './types.js';
/** Long tasks are handed to the job layer instead of holding the client connection. */
export declare function isJobMode(opts: HeadlessOpts, p: PreparedHeadless): boolean;
export declare function jobModeReceipt(input: {
    opts: HeadlessOpts;
    p: PreparedHeadless;
    t0: number;
    job: ReturnType<HeadlessDeps['jobStart']>;
}): Record<string, unknown>;
