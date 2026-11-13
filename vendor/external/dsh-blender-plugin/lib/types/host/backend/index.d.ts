export { childAlive, getChild, killChildHandle, spawnChild } from './spawn.js';
export { killBackendByCmd } from './process-scan.js';
/**
 * 端口解析（与 runtime/config.ts 同一套来源，避免两处配置漂移）：
 *   插件配置 port → DSH_BLENDER_HTTP_PORT → $DSH_BLENDER_CONFIG → <包根>/dsh-blender.config.json
 *   → ~/.dsh/dsh-blender.config.json → 9877
 */
export declare function resolveHttpPort(): number;
export declare function base(port: number): string;
export declare const sleep: (ms: number) => Promise<unknown>;
export declare function probe(port: number, timeoutMs?: number): Promise<boolean>;
export declare function ensureBackend(port: number): Promise<boolean>;
/**
 * 修复：**探端口优先**，不再信陈旧句柄/pidfile。
 * 现场 bug：句柄还在（childAlive）但端口根本没监听时，旧实现回 'already-spawned'，
 * 用户拿到一个打不通的后端；反过来，真起来了却因为等待窗口太短回 '启动失败'。
 * 现在：端口能服务 ⇒ already-running；端口不通但句柄在 ⇒ 判为陈旧句柄，SIGTERM 后重拉。
 */
export declare function startBackend(port: number): Promise<string>;
/**
 * v0.9.2：合并「本插件内部超时」与「宿主 exec.signal」。
 * 两条都只影响**等待**：服务端已开始的 Blender 侧任务照旧跑完（headless/job 既有语义
 * = 客户端断连 ≠ 任务失败，按 runId 回收）。
 */
export declare function withTimeout(path: string, init: RequestInit | undefined, timeoutMs: number): Promise<Response>;
/** 用户用 op=stop 显式停过 → 看护不再自动拉起（op=start 解除）。跨模块经访问器读写，保持 live 状态只有一份。 */
export declare function isPaused(): boolean;
export declare function setPaused(v: boolean): void;
