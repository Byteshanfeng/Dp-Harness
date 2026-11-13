import type { ArtifactCollection, ExpectEval, FailureClass, FailureContext, OutJsonInfo, ParsedHeadlessStdout, ShotsSummary } from './result.js';
import type { BuiltHeadlessScript } from './script.js';
import type { HeadlessLogStreams } from './process.js';
import type { HeadlessDeps, HeadlessOpts, HeadlessRunRec, PreparedHeadless, SpawnResult } from './types.js';
export interface RunSetup {
    t0: number;
    p: PreparedHeadless;
    built: BuiltHeadlessScript;
    logDirWsl: string;
    logStreams: HeadlessLogStreams;
    runRec: HeadlessRunRec;
    stopRunHb: () => void;
}
/** Prepare options/script/log streams and register the running record (metrics + ledger). */
export declare function prepareRun(opts: HeadlessOpts, deps: HeadlessDeps): RunSetup;
export interface HeadlessOutcome {
    childEnv: Record<string, string | undefined>;
    res: SpawnResult;
    stdout: string;
    stderr: string;
    ms: number;
    logsClosed: Promise<void>;
    parsedOut: ParsedHeadlessStdout;
    parsed: unknown;
    pathWarnings: unknown[];
    logs: HeadlessRunRec['logs'];
    failure: FailureContext;
    artifacts: ArtifactCollection;
    gpuFailed: boolean;
    expectEval: ExpectEval | null;
    runOk: boolean;
    failureClass: FailureClass;
    failureHint: string | null;
    shotsSummary: ShotsSummary | null;
    outJsonInfo: OutJsonInfo;
    resultTruncated: boolean;
    built: BuiltHeadlessScript;
}
export interface JobModeInput {
    opts: HeadlessOpts;
    p: PreparedHeadless;
    t0: number;
    logStreams: HeadlessLogStreams;
    runs: HeadlessDeps['runs'];
    jobStart: HeadlessDeps['jobStart'];
}
/** Long-task hand-off: delete the fake running record and return the job receipt (null when synchronous). */
export declare function headlessJobReceipt(input: JobModeInput): Promise<Record<string, unknown> | null>;
export interface CollectInput {
    p: PreparedHeadless;
    built: BuiltHeadlessScript;
    opts: HeadlessOpts;
    runRec: HeadlessRunRec;
    logStreams: HeadlessLogStreams;
    logDirWsl: string;
    t0: number;
    sessionName: string;
    metrics: HeadlessDeps['metrics'];
    dumpResult: HeadlessDeps['dumpResult'];
    readScriptPath: HeadlessDeps['readScriptPath'];
}
/** Spawn, parse, classify and collect artifacts — the synchronous body of the run. */
export declare function collectHeadlessOutcome(input: CollectInput): Promise<HeadlessOutcome>;
export interface RecordInput {
    p: PreparedHeadless;
    runRec: HeadlessRunRec;
    res: SpawnResult;
    failureClass: FailureClass;
    artifacts: ArtifactCollection;
    logs: HeadlessRunRec['logs'];
    expectEval: ExpectEval | null;
    parsed: unknown;
    parsedOut: ParsedHeadlessStdout;
    outJsonInfo: OutJsonInfo;
    resultTruncated: boolean;
    pathWarnings: unknown[];
    shotsSummary: ShotsSummary | null;
    ledgerAppend: HeadlessDeps['ledgerAppend'];
}
/** Write the terminal state on runRec and append the done ledger row (failures ignored). */
export declare function recordCompletedRun(input: RecordInput): void;
export interface FinishInput {
    runRec: HeadlessRunRec;
    stopRunHb: (() => void) | null;
    pathWarnings: unknown[];
    stdout: string;
    stderr: string;
    fileOpt: string | undefined;
    fileLooksPython: boolean;
}
/** Stop the heartbeat and merge path/hygiene/no-input warnings (same order as before). */
export declare function finishRunRecord(input: FinishInput): void;
export interface ReceiptInput {
    outcome: HeadlessOutcome;
    p: PreparedHeadless;
    opts: HeadlessOpts;
    runRec: HeadlessRunRec;
    sessionName: string;
    ledgerWin: string;
}
/** Assemble the public receipt from the collected outcome (same fields/order as before). */
export declare function buildRunReceipt(input: ReceiptInput): Record<string, unknown>;
