/** blender_rt_headless 执行层：参数校验/body 组装/同步或作业路由（行为与 v2.6.2 一致）。 */
import type { HostContext } from '../../host/context.js';
export declare function executeHeadless(args: Record<string, unknown>, ctx: HostContext, port: number): Promise<unknown>;
