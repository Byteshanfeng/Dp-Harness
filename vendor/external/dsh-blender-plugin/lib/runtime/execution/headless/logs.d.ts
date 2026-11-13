import type { HeadlessRunRec } from './types.js';
/** Fallback when live log streams could not be opened: write the captured output once at the end. */
export declare function writeFallbackLogs(logDirWsl: string, stamp: string, runId: string, stdout: string, stderr: string): HeadlessRunRec['logs'];
