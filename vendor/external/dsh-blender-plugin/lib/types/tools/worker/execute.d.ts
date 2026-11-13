/** blender_rt_worker 执行层：会话命令转发 + 回执（行为与 v2.6.2 一致）。 */
import type { HostContext } from '../../host/context.js';
export declare function executeWorker(args: Record<string, unknown>, ctx: HostContext, port: number): Promise<unknown>;
