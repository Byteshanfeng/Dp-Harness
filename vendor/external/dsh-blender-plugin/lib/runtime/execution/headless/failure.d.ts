import type { SpawnResult } from './types.js';
export interface FailureContext {
    traceback: string | null;
    lastException: string | null;
    hint: string | null;
}
export declare function extractFailureContext(stderr: string, script: string): FailureContext;
export type FailureClass = 'blender_exe_missing' | 'timeout' | 'gpu_required_missing' | 'blender_error' | 'script_error' | 'finished';
export declare function classifyFailure(res: SpawnResult, gpuFailed: boolean, lastException: string | null): FailureClass;
export declare function failureHint(failureClass: FailureClass): string | null;
