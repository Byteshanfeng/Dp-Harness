import type { AddonClient } from '../../transport/probes.js';
export interface KernelDeps {
    RENDER_FLAG_WIN: string;
    addon: AddonClient;
    injected: Set<string>;
}
export interface KernelIoDeps {
    addon: AddonClient;
    injected: Set<string>;
}
/** 读 runtime 下的 python 模块源码（preload / 作业脚本拼接用） */
export declare function readModuleSource(name: string): string;
/**
 * v0.9.1（93-B3）：脚本路径解析。headless 的 `file=` 语义是 **.blend**（老成员误传 .py 会拿到
 * `File format is not supported`），现在：显式 `scriptFile=` 收 .py；`file=` 传 .py 时自动改当脚本并给提示。
 * Windows 路径（D:\ 或 \\wsl.localhost\）与 WSL 路径（/home/...）都能收。
 */
export declare function readScriptPath(p: unknown): {
    win: string;
    wsl: string;
};
/**
 * v0.9.0：preload 多个模块必须各占一个命名空间。
 * 旧实现把多个模块源码**拼进同一个 globals**，而每个 runtime 模块都定义 _j/_kernel/_store/_now →
 * 后一个模块把前一个的 helper 顶掉。实测 `preload="txn,deliver"` 直接把 txn 打崩（KeyError: 'marks'）。
 * 做法：每个模块 exec 到自己的 dict；私有名（_ 开头）不外泄，公开名与常用 import 照旧拷回 globals
 * （向后兼容：以前直接调 `dsh_loop_start` / `audit_mesh` 这类公开函数的写法仍然可用）。
 * 模块尾部 `K.dsh_x_api = {...}` 走的是真实的 dsh_rt_kernel 模块对象 → API 照旧落在 K 上。
 */
export declare function preloadChunk(name: unknown): string;
export declare function injectModule(deps: KernelIoDeps, file: string, marker: string, versionExpr?: string, prelude?: string): Promise<boolean>;
export declare function needFile(f: string, what: string): string;
export declare function sceneEpoch(deps: KernelIoDeps): Promise<unknown>;
export declare function createKernelInternals(E: KernelDeps): {
    sceneEpoch: () => Promise<unknown>;
    MODULE_ATTR: Record<string, string>;
    readModuleSource: typeof readModuleSource;
    readScriptPath: typeof readScriptPath;
    preloadChunk: typeof preloadChunk;
    injectModule: (file: string, marker: string, versionExpr?: string, prelude?: string) => Promise<boolean>;
    needFile: typeof needFile;
};
