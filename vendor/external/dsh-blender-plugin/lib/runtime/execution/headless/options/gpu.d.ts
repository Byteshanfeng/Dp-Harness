import type { HeadlessDeps, HeadlessOpts } from '../types.js';
export interface HeadlessPreload {
    mods: unknown[];
    pre: string;
    shotsSpec: Record<string, unknown> | null;
    shotsWanted: boolean;
}
export declare function buildHeadlessPreload(opts: HeadlessOpts, deps: HeadlessDeps): HeadlessPreload;
export interface HeadlessEngine {
    engineMode: string;
    gpuOff: boolean;
    gpuManual: boolean;
    gpuPre: string;
}
export declare function buildEnginePrelude(opts: HeadlessOpts): HeadlessEngine;
