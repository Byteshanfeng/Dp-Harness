import type { PlanCallDeps } from './index.js';
import type { GuiRoute } from './routes.generated.js';
export type RouteDecision = {
    matched: true;
    result: Promise<unknown>;
} | {
    matched: false;
};
export declare const hit: (result: unknown) => RouteDecision;
export declare const miss: () => RouteDecision;
/** evidence：先注入默认 view.path 再走契约层 */
export declare function prepareEvidencePayload(E: PlanCallDeps, o: string, payload: unknown): Promise<unknown>;
/** 通用：把 op 派给 Blender 侧内核模块的 dispatch(op, json) */
export declare function dispatchViaKernelModule(E: PlanCallDeps, ensure: () => Promise<unknown>, api: string, subOp: string, payload: unknown, timeoutMs: number): Promise<unknown>;
/** 生成表共用的匹配/切片口径：exact 行按 op 全等，prefix 行按前缀命中。 */
export declare function routeMatches(route: GuiRoute, o: string): boolean;
/** 按生成行的 kind 选择调用形态；api/strip/sub/preload/timeout 一律来自 config/routing.json。 */
export declare function handleRoute(E: PlanCallDeps, route: GuiRoute, o: string, payload: unknown): Promise<unknown>;
export declare function routeMainPlanOps(E: PlanCallDeps, o: string, payload: unknown): Promise<RouteDecision>;
export declare function routeModulePlanOps(E: PlanCallDeps, o: string, payload: unknown): Promise<RouteDecision>;
