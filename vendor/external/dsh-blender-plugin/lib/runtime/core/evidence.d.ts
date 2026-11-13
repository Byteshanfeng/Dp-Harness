import type { DiskCatalog } from '../catalog/index.js';
declare const RUNTIME_DIR: string;
export declare const PLUGIN_VERSION: string | null;
declare function sha12(buf: string | Buffer): string;
/** 门面入口：构建布局 lib/runtime/engine.js 与源码布局下包内 lib/runtime/engine.js 的候选 */
export declare const ENGINE_SOURCE_PATH: string;
export interface EngineSelf {
    sourcePath: string;
    loadedAt: number;
    loadedAtText: string;
    loadedHash: string | null;
    loadedBytes: number | null;
    error: string | null;
}
export interface PathWarning {
    code: string;
    evidence?: string;
    value?: string;
    hint?: string;
    [k: string]: unknown;
}
export interface DiskVerdict {
    ok: boolean;
    note?: string;
    matchesLoadedCatalog?: boolean;
    families?: number;
    opsCount?: number;
    catalogHash?: string;
    pluginVersion?: unknown;
}
export interface Provenance {
    sourcePath: string;
    pluginVersion: string | null;
    hashAlgo: string;
    loadedAt: string;
    loadedHash: string | null;
    loadedBytes: number | null;
    loadedReadError: string | null;
    currentHash: string | null;
    currentBytes: number | null;
    currentMtime: string | null;
    verdict: 'current' | 'stale' | 'unknown';
    stale: boolean | null;
    staleReason: string | null;
    catalogHash: string;
    families: number;
    opsCount: number;
    toolDetailKeys: number;
    commandCatalogKeys: number;
    note: string;
    diskCatalog?: DiskCatalog;
    diskVerdict?: DiskVerdict;
}
declare const ENGINE_SELF: EngineSelf;
declare function runtimeFingerprint(): Record<string, string>;
declare function pidAlive(pid: unknown): boolean;
declare function pathAudit(stdout: unknown, stderr: unknown): PathWarning[];
export declare function engineProvenance(opts?: unknown): Provenance;
/**
 * v2.6（本轮反馈 #3）：多灯卫生 —— EEVEE 阴影池溢出的**结构化告警**。
 *
 * 现场（4 小时里刷了几千行）：36 盏灯 → 控制台每一帧刷
 *   Error: Shadow buffer full, may result in missing shadows and lower performance. (3040 / 2048)
 * 而 scene.eevee.shadow_pool_size = 4096 **静默无效** —— 它是枚举，上限就是 2048（2 GB）。
 * 旧行为：告警只在 stderr 里刷屏，模型得自己看懂；新行为：进回执 warnings[]，附一条能直接粘贴的修法。
 */
export declare function sceneHygieneAudit(stdout: unknown, stderr: unknown): PathWarning[];
export { sha12, ENGINE_SELF, RUNTIME_DIR, runtimeFingerprint, pidAlive, pathAudit };
