/**
 * v0.9.3（外部反馈 2026-09-24）：子进程基础环境 —— 三处 spawn 统一走它。
 *
 * 旧版只注入 PYTHONIOENCODING。Blender 的 Python stdout 被重定向（pipe）时是**块缓冲**，
 * 于是 job 的 stdout.log / stderr.log 在任务运行期间**全程 0 字节**，只有进程退出才落盘
 * （Lead 实测：20 分钟渲染期间两个日志一直 0 字节；engine：「399 s 那次中间没有任何阶段信息，6 分钟纯黑盒」）。
 * PYTHONUNBUFFERED=1 让 print 立即写出 → stage 心跳与增量日志才有意义。
 */
declare function baseChildEnv(extra?: Record<string, string | null | undefined>): Record<string, string | undefined>;
/** WSLENV 声明（v0.9.1 实测坑：WSL 侧 spawn Windows 进程时 env 不会自动跨界）—— headless 与 job 共用
 *  macOS / Windows 上父子进程同 OS，env 天然继承，不需要这一步。 */
declare function withWslEnv(childEnv: Record<string, string | undefined>, extraEnv?: Record<string, unknown>): Record<string, string | undefined>;
/** 把"workDir 不共享、脚本改落别处"变成一条**追加在末尾**的 pathWarning（形状与 pathAudit 一致：带 hint）。
 *  为什么追加而不是插到最前：pathAudit 的既有断言（如 acceptance_v093）看的是 pathWarnings[0]，别抢它的位置。 */
declare function workdirStagingWarning(staging?: StagingSummary | null): PathWarning | null;
interface StagingSummary {
    substituted?: boolean;
    requestedWhy?: string;
    note?: string;
    requested?: string;
}
export interface PathWarning {
    code: string;
    value: string;
    evidence: string;
    hint: string;
    [k: string]: unknown;
}
/** 读 JSON，坏文件返回 null（engine 与 launch 共用） */
declare function readJsonSafe(p: string): unknown;
export { baseChildEnv, withWslEnv, readJsonSafe, workdirStagingWarning };
