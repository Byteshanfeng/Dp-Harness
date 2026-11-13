export interface ExtPaths {
    extDir: string;
    gltfRunner: string;
    open3dRunner: string;
    gltfRunnerExists: boolean;
    open3dRunnerExists: boolean;
}
/** Resolve both source and built layouts without hard-coding .mjs / lib paths. */
export declare function resolveExtPaths(): ExtPaths;
/** External validators (glTF-Validator / open3d) run locally and never take a Blender round-trip. */
export declare function extCheckOp(op: string, payload?: unknown): Promise<unknown>;
