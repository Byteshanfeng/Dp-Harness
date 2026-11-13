export declare const IS_WIN: boolean;
export interface WinProcOptions {
    timeoutMs?: number;
}
/**
 * 解析 `netstat -ano -p TCP` 的 LISTENING 行，返回占着目标端口的 PID（去重、升序）。
 *
 * 真实输出（Windows 10/11，列分隔为若干空格）：
 *   TCP    0.0.0.0:9877     0.0.0.0:0      LISTENING     1234
 *   TCP    [::]:9877        [::]:0         LISTENING     5678
 *   TCP    127.0.0.1:9877   127.0.0.1:5013 ESTABLISHED   1234   ← 不是监听，忽略
 *
 * ★ 只认 LISTENING：ESTABLISHED 行同样带本地端口，拿它当"占用者"会把正常连接的服务端拉进来。
 * ★ 端口必须**精确**匹配：9877 不能命中 98770 / 19877。
 */
export declare function parseNetstatListeners(text: string | null | undefined, port: unknown): number[];
/**
 * 解析 `tasklist /FO CSV /NH` 的一行 → 映像名（形如 `"node.exe"` / `"DeepSeek Harness.exe"`）。
 * 解析不出来回 ''（调用方据此保守跳过，宁可不杀也不误杀）。
 */
export declare function parseTasklistImage(text: string | null | undefined): string;
/** 某 PID 的映像名（tasklist）。拿不到回 ''。 */
export declare function tasklistImageName(pid: unknown, timeoutMs?: number): string;
/**
 * 判据 ①：按**命令行归属**扫出"本插件的后端进程"（CIM / Win32_Process）。
 * 命令行必须同时满足：独立 argv 里出现 `server.js` / `server.mjs`、且 `--port <port>` 精确匹配。
 * 与 POSIX 侧同一条自伤教训保持一致（2026-09-29：子串匹配会把调用方自己的 shell 一起杀掉）。
 */
export declare function winServerPidsByCmdline(port: unknown, opts?: WinProcOptions): number[];
/**
 * 判据 ② + ③：占端口的监听者 ∩（映像名 == 当前进程的映像名）。
 * 只在 ① 不可用（PowerShell / CIM 被策略挡住）时兜底；不满足归属判据的 PID 一律不返回。
 */
export declare function winPortHolderPids(port: unknown, opts?: WinProcOptions): number[];
/** Windows 上"占着本端口的同族后端"：先按命令行归属，再按端口 + 同名映像兜底。 */
export declare function winSamePortHolders(port: unknown): number[];
/**
 * 用 taskkill 结束进程树。Windows 没有优雅 SIGTERM（process.kill 直接 TerminateProcess），
 * 所以这里统一 `/T /F`：残留后端可能还带着 headless 子进程，只杀父进程会留孤儿。
 * 返回**实际执行过 taskkill 的 PID 字符串**（与 POSIX 侧 killed 数组同口径）。
 */
export declare function winKillPids(pids: ReadonlyArray<unknown>, opts?: WinProcOptions): string[];
