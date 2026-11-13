/** blender_rt_do 执行层：GUI /act 与持久无头会话两条路径（行为与 v2.6.2 一致）。 */
import type { HostContext } from '../../host/context.js';
export declare function executeDo(args: Record<string, unknown>, ctx: HostContext, port: number): Promise<unknown>;
/** 交互式无头一步：exec 代码 + 可选 see（持久 worker；不是 job / 不是异步回合）。 */
export declare function doViaSession(ctx: HostContext, port: number, opts: Record<string, unknown>): Promise<unknown>;
