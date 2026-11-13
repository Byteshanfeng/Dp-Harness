export { extractTag, extractLoop, jsonFromStdout, clipMiddle, slipFixPath } from './parse.js';
export { catalogPayload } from './render.js';
export interface DumpResult {
    path: string | null;
    bytes: number;
    error?: string;
}
export declare function createDumpResult(E: {
    RESULTS_DIR: string;
}): {
    dumpResult: (obj: unknown, runId2?: string) => DumpResult;
};
