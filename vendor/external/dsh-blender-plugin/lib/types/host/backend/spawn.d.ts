import type { ChildProcess } from 'node:child_process';
/** 子进程是否真的还活着：被信号杀掉时 exitCode 仍为 null、只有 signalCode 有值 */
export declare function childAlive(): boolean;
export declare function spawnChild(port: number): string;
/** stale-handle 分支：句柄在、端口不通 → 按平台停掉不可信的旧句柄并返回其 pid。 */
export declare function killStaleChild(): number | null;
export declare function getChild(): ChildProcess | null;
/** 杀掉并清空当前子进程句柄；返回是否原本有句柄（调用方据此写回执）。 */
export declare function killChildHandle(): boolean;
