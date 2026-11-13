export { KERNEL_BOOTSTRAP } from './bootstrap.js';
export type { KernelDeps } from './api.js';
import type { KernelDeps } from './api.js';
export declare function createKernel(E: KernelDeps): {
    sceneEpoch: () => Promise<unknown>;
    MODULE_ATTR: Record<string, string>;
    readModuleSource: typeof import("./api.js").readModuleSource;
    readScriptPath: typeof import("./api.js").readScriptPath;
    preloadChunk: typeof import("./api.js").preloadChunk;
    injectModule: (file: string, marker: string, versionExpr?: string, prelude?: string) => Promise<boolean>;
    needFile: typeof import("./api.js").needFile;
};
