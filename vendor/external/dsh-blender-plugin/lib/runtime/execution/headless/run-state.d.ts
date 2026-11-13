import type { BuiltHeadlessScript } from './script.js';
import type { HeadlessDeps, HeadlessRunRec, PreparedHeadless } from './types.js';
export interface RunState {
    runRec: HeadlessRunRec;
    stopRunHb: () => void;
}
/** Create and register the in-memory run record, then append the running ledger row. */
export declare function createRunState(input: {
    p: PreparedHeadless;
    built: BuiltHeadlessScript;
    t0: number;
    logDirWsl: string;
    logs: HeadlessRunRec['logs'];
    runs: HeadlessDeps['runs'];
    ledgerAppend: HeadlessDeps['ledgerAppend'];
}): RunState;
