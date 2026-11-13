/**
 * 按 /proc 扫出"本插件历史代次拉起的后端"，按 signal 停掉（默认 SIGTERM）。
 * 热重载会丢掉 child 句柄（上一代 fiber 持有），只靠句柄停不掉残留进程 —— 这是兜底。
 * v1.0.1：新增 signal 参数（事件循环被同步操作占死的进程只认 SIGKILL）。
 */
export declare function killBackendByCmd(port: number, signal?: NodeJS.Signals): string[];
