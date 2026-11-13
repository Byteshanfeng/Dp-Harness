import type { ChildProcess } from 'node:child_process';
import { writeHeadlessScript } from '../staging.js';
import type { LaunchOpts } from './resolve.js';
export interface LaunchPlan {
    sp: ReturnType<typeof writeHeadlessScript>;
    args: string[];
    childEnv: Record<string, string | undefined>;
}
/** 写启动脚本、拼参数与子进程环境（dryRun 也要先拿到这些） */
export declare function buildLaunchPlan(opts: LaunchOpts, statusWsl: string): LaunchPlan;
/** detached spawn；spawn 不存在的可执行文件不会抛，而是异步 emit 'error'（不挂 handler 会打挂后端） */
export declare function spawnDetachedBlender(exe: string, args: string[], childEnv: Record<string, string | undefined>): {
    child: ChildProcess | null;
    spawnErrRef: {
        value: unknown;
    };
};
