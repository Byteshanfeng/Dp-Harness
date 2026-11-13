import type { HostContext } from '../host/context.js';
import { PLAN_HEADLESS_ALIAS, PLAN_HEADLESS_MAP } from './routes.generated.js';
import type { HeadlessTarget } from './routes.generated.js';
export { PLAN_HEADLESS_ALIAS, PLAN_HEADLESS_MAP };
export type { HeadlessTarget };
export declare function planHeadlessTarget(op: string): HeadlessTarget | null;
/** 用持久 worker 执行一个 plan op（不依赖 GUI addon；模块由 preload 注入 K） */
export declare function planViaWorker(ctx: HostContext, port: number, op: string, payload: unknown, session?: string): Promise<Record<string, unknown>>;
/** plan 回执统一收尾：信封 + 附图（GUI/无头共用） */
export declare function finishPlanResponse(ctx: HostContext, op: string, res: unknown, argsIn: unknown): Promise<Record<string, unknown>>;
/** 弱模型契约 v2：verdict-first 信封（单行、≤2k）——plan 与 headless 共用口径 */
export declare function planEnvelope(op: string, res: unknown): Record<string, unknown>;
