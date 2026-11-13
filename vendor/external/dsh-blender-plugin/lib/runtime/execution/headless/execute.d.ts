import type { HeadlessLogStreams } from './process.js';
import type { BuiltHeadlessScript } from './script.js';
import type { HeadlessRunRec, PreparedHeadless, SpawnResult } from './types.js';
/** End both log streams and wait until their handles are released, so callers can delete the run directory safely. */
export declare function closeHeadlessLogStreams(streams: HeadlessLogStreams): Promise<void>;
export interface ExecutionOutcome {
    res: SpawnResult;
    stdout: string;
    stderr: string;
    ms: number;
    /** Resolves once both log streams have flushed and released their handles. */
    logsClosed: Promise<void>;
}
/** Spawn Blender, close the log streams, and turn a spawn-level failure into the public error. */
export declare function executeHeadless(input: {
    p: PreparedHeadless;
    built: BuiltHeadlessScript;
    childEnv: Record<string, string | undefined>;
    runRec: HeadlessRunRec;
    logStreams: HeadlessLogStreams;
    t0: number;
}): Promise<ExecutionOutcome>;
