import type { StagingInfo } from '../../staging.js';
import type { HeadlessDeps, HeadlessOpts } from './types.js';
/** GPU 回执里的 engine 字段（Python 侧 JSON，形状动态） */
export declare function gpuAfterEngine(gpu: Record<string, unknown> | null): unknown;
export interface ParsedHeadlessStdout {
    parsed: unknown;
    parseError: {
        message: string;
        line: string;
    } | null;
    shotsRes: Record<string, unknown> | null;
    gpu: Record<string, unknown> | null;
}
export declare function parseHeadlessStdout(stdout: string): ParsedHeadlessStdout;
export interface ExpectEval {
    spec: Record<string, unknown>;
    observed: Record<string, unknown> | null;
    ok: boolean;
    warnings: string[];
}
export declare function evaluateExpect(exp: Record<string, unknown> | null, stdout: string): ExpectEval | null;
export { collectArtifacts } from './artifacts.js';
export type { ArtifactCollection, ArtifactInfo } from './artifacts.js';
export { classifyFailure, extractFailureContext, failureHint } from './failure.js';
export type { FailureClass, FailureContext } from './failure.js';
export interface ShotsSummary {
    ok: boolean;
    count: number;
    rows: Array<Record<string, unknown>>;
    coverage_min: number | null;
    outdir: unknown;
    jsonl: unknown;
    total_ms: unknown;
    render_ms: unknown;
    engine: unknown;
    samples: unknown;
    device_line: unknown;
    unknown_views: unknown;
    scope_warnings: unknown;
    error: unknown;
}
export declare function summarizeShots(shotsRes: Record<string, unknown>): ShotsSummary;
/** Shots-only runs have no HEADLESS result; synthesize the same shape as a full result. */
export declare function applyShotsResult(parsed: unknown, shots: ShotsSummary | null): unknown;
/** Merge path audit, scene hygiene and the no-input warning into the run record order. */
export declare function finishRunWarnings(pathWarnings: unknown[], hygieneWarnings: unknown[], fileOpt: unknown, fileLooksPython: boolean): unknown[];
/** Append the workDir-not-shared warning once, preserving pathAudit's original ordering. */
export declare function withWorkdirWarning(pathWarnings: unknown[], staging: StagingInfo | null | undefined): unknown[];
export interface OutJsonInfo {
    path: string | null;
    bytes: number;
    wsl: string | null;
}
export declare function writeResultJson(parsed: unknown, opts: HeadlessOpts, d: Pick<HeadlessDeps, 'dumpResult' | 'readScriptPath'>, runId: string): OutJsonInfo;
