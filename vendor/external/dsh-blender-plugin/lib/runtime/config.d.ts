/**
 * 包根 —— 源码布局和构建布局有两种，必须都能找到 package.json / dsh-blender.config.json：
 * - 源码布局：<pkg>/runtime/config.ts → HERE 的上一级就是包根
 * - 构建布局：<pkg>/lib/runtime/config.js → 向上两级才是包根（中间是 lib/）
 */
export declare const PKG_ROOT: string;
export declare const IS_WIN: boolean;
/** macOS：宿主与 Blender 同机同 OS，没有 Windows/WSL 的跨 OS 路径问题 */
export declare const IS_MAC: boolean;
/**
 * 是否真的跑在 WSL 里（而不是原生 Linux）—— issue #11。
 *
 * 为什么必须单独判：`wslToWin()` 原来只分了 Windows / macOS，**其余一律当成「Linux 宿主 ⇒ WSL +
 * Windows 上的 Blender」**，把宿主绝对路径映射成 `\\wsl.localhost\<distro>\…`。原生 Linux 上 Blender
 * 与宿主同机同 OS（跟 macOS 一样同构），这个映射会让 Blender 把该串当**相对路径**，产物落进一个字面量
 * 反斜杠目录，后端再按原路径读就 ENOENT ⇒ `blender_rt_see` 恒报 `frame http 502`。
 *
 * 判据：环境变量优先（交互式 WSL 一定有）；再退回 /proc/version —— dsh 跑在 systemd 服务里时**不继承**
 * `WSL_DISTRO_NAME`（issue #6 现场），但那台机器确实是 WSL，不能因此误判成原生 Linux。
 * 剥成纯函数是为了能在**任何平台**上对拍判据（tests/unit/js/platform-paths.test.ts [1]）。
 */
export declare function detectWsl(platform: string, env: Record<string, string | undefined> | undefined, procVersion: unknown): boolean;
export declare const IS_WSL: boolean;
/** WSL 发行版名（拼 UNC 用）；非 WSL 平台只用于诊断显示，见 linuxDistroName() */
export declare const DISTRO: string;
/** 原生 Linux 的发行版名（只喂 /doctor 的显示字段；WSL 用 DISTRO） */
export declare function linuxDistroName(): string;
export declare const CONFIG_FILES: string[];
/** Windows 路径 → WSL 路径（D:\a\b → /mnt/d/a/b；UNC → /…；Windows 上原样返回） */
export declare function winToWsl(p: unknown): string;
/**
 * 宿主路径 → Blender 进程侧的可用路径。
 *   Windows     → 反斜杠化（原样）
 *   WSL         → /mnt/x/... → X:\...；WSL 内部 → \\wsl.localhost\<distro>\...
 *   原生 Linux  → **恒等**（宿主与 Blender 同机同 OS，跟 macOS 一样不该做跨 OS 改写）—— issue #11
 *   macOS       → 恒等
 */
export declare function wslToWin(p: unknown): string;
export interface PathShare {
    shared: boolean | null;
    why: string;
    source?: string;
    fstype?: string;
    mount?: string;
}
export declare function wslPathShared(p: unknown): PathShare;
interface WorkDirFallback {
    requested: string;
    requestedFrom: string;
    why: string;
    used: string;
    usedFrom: string;
    errs: string[];
}
/** 最终配置（一次性算好，模块级常量） */
export declare const CFG: {
    addonHost: string;
    addonPort: number;
    httpPort: number;
    /**
     * Windows 侧启动代理（默认 127.0.0.1:9878）。
     * WSL 走它拉起 GUI Blender ⇒ 本次启动 0 次互操作调用，回避 microsoft/WSL#41173
     * 的中继空转泄漏（Interop 线程吃满一个核心且无法释放）。
     * 代理不在线时自动回退到旧的互操作 spawn；设为 "off" 可强制回退。
     */
    launchAgentUrl: string;
    holder: string;
    leaseTtlMs: number;
    workDirWin: string;
    workDirWsl: string;
    /** workDir 探写结果与回退留痕（null=原候选可写；非 null=已回退，见 errs） */
    workDirFallback: WorkDirFallback | null;
    workDirWritable: boolean;
    blenderExe: string | null;
    /** 用户 Blender 配置目录（GPU 偏好所在）：无头进程默认读不到 → 要继承就设它（配合 factory_startup=false） */
    blenderUserConfig: string | null;
    blenderUserScripts: string | null;
    /** 热无头 worker 的本地端口（与 addon 9876 / 后端 9877 区分开） */
    workerPort: number;
    source: {
        configFile: string | null;
        workDir: string;
        blenderExe: string;
    };
};
export declare const PATHS: {
    livePngWin: string;
    livePngWsl: string;
    viewPngWin: string;
    viewPngWsl: string;
};
/** 配置摘要（自检/排错时打印；blender_rt_headless 缺 exe 时也用它给提示）
 *  over.httpPort：后端实际监听的端口（命令行 --port 会覆盖配置值，摘要要跟着走） */
export declare function describeConfig(over?: {
    httpPort?: number | string;
}): {
    platform: NodeJS.Platform;
    distro: string | null;
    addon: string;
    http: string;
    workDir: {
        win: string;
        wsl: string;
        from: string;
        fallback: WorkDirFallback | null;
        shared: PathShare;
    };
    blenderExe: string | null;
    blenderFrom: string;
    blenderUserConfig: string | null;
    blenderUserScripts: string | null;
    workerPort: number;
    configFile: string | null;
    holder: string;
    leaseTtlMs: number;
    env: {
        DSH_BLENDER_WORKDIR: string | null;
        DSH_BLENDER_EXE: string | null;
        DSH_BLENDER_HTTP_PORT: string | null;
        DSH_BLENDER_ADDON_PROTOCOL: string | null;
        DSH_BLENDER_CONFIG: string | null;
    };
};
export {};
