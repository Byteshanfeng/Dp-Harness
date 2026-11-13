export interface LaunchOpts {
    addonPort?: unknown;
    waitMs?: unknown;
    exe?: unknown;
    file?: unknown;
    force?: unknown;
    interop?: unknown;
    addonFile?: unknown;
    addonModule?: unknown;
    dryRun?: unknown;
    [k: string]: unknown;
}
export declare function tryLaunchAgent(opts: LaunchOpts, addonPort: number, steps: string[], base: Record<string, unknown>): Promise<Record<string, unknown> | null>;
/**
 * addon 自动探测的**名字提示**：只认本仓 `DSH Blender Bridge`（模块 `dsh_blender_bridge`、前缀 `dshbb_*`）。
 * v2.3 起不再扫描/兼容旧 `MCP for Blender`（模块 `blender_mcp`）。
 * LAUNCH_BOOT_PY 里由 JSON.stringify 内联成**同一个**列表，`addonNameHit()` 是它的 JS 同口径镜像（测试用）。
 */
export declare const ADDON_NAME_HINTS: string[];
/** 与 LAUNCH_BOOT_PY 里 `_name_hit()` 同口径的 JS 判定（小写子串命中）——测试用 */
export declare function addonNameHit(name: unknown): boolean;
/** 注进 Blender 的启动脚本源码（导出供自检断言"落盘的那份 Python 真的双名命中"） */
export declare const LAUNCH_BOOT_PY: string;
