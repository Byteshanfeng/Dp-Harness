import type { JobsDeps } from '../types.js';
interface ScriptFileInfo {
    given: string;
    resolved: string;
    bytes: number;
    auto_from_file: boolean;
}
export interface JobBuildArgs {
    id: string;
    outdirWin: string;
    outdirWsl: string;
    dir: string;
    outPath: string;
    errPath: string;
    engineMode: string;
    runId: string;
    scriptFileInfo: ScriptFileInfo | null;
    inputFileInfo: unknown;
    fileOpt: string | undefined;
    fileLooksPython: boolean;
    script: string;
    args: string[];
    envPairs: Record<string, string | null>;
}
export declare function prepareJobArgs(E: JobsDeps, opts?: Record<string, unknown>): JobBuildArgs;
export {};
