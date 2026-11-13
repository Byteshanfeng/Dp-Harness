export declare const IS_WIN: boolean;
/**
 * v0.8.10（版本自证）：工具描述统一带版本前缀。
 * description 由**已加载的那份 lib** 生成 → 会话里一眼能看出自己跑的是哪一代，
 * 不会再出现「读的是新源码、跑的是旧 lib」那种排查事故（外部反馈 j20-build 的元教训）。
 */
export declare const PLUGIN_VERSION = "3.0.6";
export declare const HERE: string;
/**
 * Runtime 源码是 TypeScript，运行时入口是构建产物 lib/runtime/server.js。
 * - 生产/打包布局：HERE = <pkg>/lib → <pkg>/lib/runtime/server.js
 * - 开发/测试布局：HERE = <pkg>/src → <pkg>/lib/runtime/server.js（先 build）
 * DSH_BLENDER_SERVER 覆盖仍然最高优先级（排障/自定义安装位置用）。
 */
export declare function resolveServerPath(here?: string, env?: NodeJS.ProcessEnv, exists?: (p: string) => boolean): string;
export declare const SERVER_PATH: string;
export declare const HOSTNAME = "127.0.0.1";
/** 后端未就绪时的统一提示（不假设任何本机路径） */
export declare const BACKEND_HINT: string;
/**
 * v0.9.2（R3）：给宿主的**静态**截止时间 —— defineTool 只收常量，不能按参数动态给。
 * 取值原则：一律 = 该工具内部最长超时 + 余量 → 内部超时永远先触发，模型拿到的是本插件
 * 的可读错误；宿主的 TOOL_TIMEOUT 只兜"连内部超时都没兜住"的最后一道。
 * 背景：宿主 0.1.6 起装配 @deepseek-ai/dsh-tool-call-timeout-policy，但**只在工具自己
 * 声明 timeoutMs 时才设截止**；不声明 = 上游一旦给默认值，Blender 还在跑而工具已被判超时。
 */
export declare const T: {
    see: number;
    act: number;
    watch: number;
    cmd: number;
    commands: number;
    loop: number;
    perf: number;
    opt: number;
    headless: number;
    plan: number;
    worker: number;
    txn: number;
    preset: number;
    job: number;
    viewport: number;
};
/**
 * （status/doctor 说真话）：host 侧有界探测预算。
 * 外层的超时必须**大于** backend 内部预算，否则模型先拿到 host 的 aborted，看不到 addonError 诊断；
 * 同时要明显小于 T.viewport（60s），保证工具自身仍有界。
 */
/**
 * op=start：/health 通后再探 /status，判定 addon/bpy 是否可用。
 * 修复后 backend 侧 /status 的 addon 预算 5s；transport 超时后 lifecycle 还会串一次 diagnose()（~2.5s），
 * 半开 addon 稳态 ≈7.5s；启动探测不再占串行队列，首调只多一次冷启动开销。预算取 12s 覆盖首调，
 * 仍远小于 T.viewport 60s。
 */
export declare const VIEWPORT_START_STATUS_TIMEOUT_MS = 12000;
/** op=doctor catch：先探 /health 区分「后端在」与「后端没起」。 */
export declare const VIEWPORT_DOCTOR_HEALTH_TIMEOUT_MS = 800;
export declare const HOST_API: string;
/** 宿主取消（exec.signal abort）时的统一措辞：只说"等待被取消"，不谎称任务失败 */
export declare const ABORT_HINT: string;
/** 本会话在写通道上的身份（租约 holder）；跨会话共用同一个后端时用它区分 */
export declare const HOLDER: string;
