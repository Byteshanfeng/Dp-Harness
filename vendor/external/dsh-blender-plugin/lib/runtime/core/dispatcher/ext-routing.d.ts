import type { PlanCallDeps } from './index.js';
import type { RouteDecision } from './plan-call.js';
/** EXT 表按 config/routing.json 的顺序匹配：21 个模块前缀 → gui_ → render_ → contract 兜底。 */
export declare function routeExtRouting(E: PlanCallDeps, o: string, payload: unknown): Promise<RouteDecision>;
