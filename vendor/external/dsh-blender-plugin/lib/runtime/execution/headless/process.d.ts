import fs from 'node:fs';
import type { HeadlessRunRec, SpawnResult } from './types.js';
export interface HeadlessLogStreams {
    logs: HeadlessRunRec['logs'];
    soStream: fs.WriteStream | null;
    seStream: fs.WriteStream | null;
    stamp: string;
}
/**
 * Open the per-run stdout/stderr logs. Returning null streams is intentional: a read-only
 * outdir must not fail the run, it only loses live logging (the caller has a fallback).
 */
export declare function createHeadlessLogStreams(logDirWsl: string, t0: number, runId: string): HeadlessLogStreams;
/**
 * Spawn Blender and capture its streams until close. The function never rejects for a
 * spawn error: it returns spawnErr so the caller can classify it into a receipt.
 */
export declare function spawnHeadless(args: string[], childEnv: NodeJS.ProcessEnv, timeoutMs: number, runRec: HeadlessRunRec, streams: HeadlessLogStreams): Promise<SpawnResult>;
