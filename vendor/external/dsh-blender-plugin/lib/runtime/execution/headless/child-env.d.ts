import type { HeadlessOpts, PreparedHeadless } from './types.js';
/** Build the child environment, including explicit env, WSL bridging and optional user Blender config. */
export declare function buildChildEnv(p: PreparedHeadless, opts: HeadlessOpts, sessionName: string): Record<string, string | undefined>;
