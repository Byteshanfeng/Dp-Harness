import type { HeadlessDeps, HeadlessOpts, ScriptFileInfo } from '../types.js';
export interface HeadlessPaths {
    outdirArg: string | null;
    outdirWsl: string | null;
    outdirWin: string;
    scriptFileInfo: ScriptFileInfo | null;
    fileOpt: string | undefined;
    fileLooksPython: boolean;
    inputFileInfo: unknown;
    script: string;
}
export declare function resolveHeadlessPaths(opts: HeadlessOpts, deps: HeadlessDeps): HeadlessPaths;
