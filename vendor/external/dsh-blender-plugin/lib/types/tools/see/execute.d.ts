/** blender_rt_see 执行层：GUI 帧 / 自定义视角 / 无头 worker 三条通道（行为与 v2.6.2 一致）。 */
import type { HostContext } from '../../host/context.js';
export declare function executeSee(args: Record<string, unknown>, ctx: HostContext, port: number): Promise<unknown>;
