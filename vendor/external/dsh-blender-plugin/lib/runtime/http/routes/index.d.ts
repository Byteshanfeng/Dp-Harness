import type { RouteDef } from '../router.js';
import type { HttpRouteDeps } from './deps.js';
/** 对外路由契约（稳定集合，顺序与拆分前 onListening 日志一致）。 */
export declare const CONTRACT_ROUTES: string[];
export declare function createRoutes(E: HttpRouteDeps): RouteDef[];
