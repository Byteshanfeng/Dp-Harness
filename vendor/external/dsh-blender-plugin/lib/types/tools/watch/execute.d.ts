/** watch 执行层：GUI 逐帧采样；失败/指定 session 时走无头 worker。 */
import type { HostContext } from '../../host/context.js';
export declare function executeWatch(ctx: HostContext, port: number, args: Record<string, unknown>): Promise<unknown>;
