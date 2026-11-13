import type { HeadlessDeps, HeadlessOpts } from './types.js';
export declare function createHeadlessRun(E: HeadlessDeps): {
    headless(opts?: HeadlessOpts): Promise<Record<string, unknown>>;
};
