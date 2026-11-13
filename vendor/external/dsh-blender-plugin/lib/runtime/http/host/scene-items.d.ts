import type { HostRoutesDeps } from './index.js';
/**
 * v2.6.1：GET /host/state 的响应体（纯内存，零 Blender 往返；任何一块取不到都给保守默认值，不抛）。
 * 「AI 已暂停」只能在 addon 拒掉一条命令之后才知道（后端不为它轮询 Blender），成功一次就清空。
 */
export declare function hostStateView(E: HostRoutesDeps): Record<string, unknown>;
/** 契约 §1.6 @ 提及数据源（GET /host/scene-items） */
export declare function handleSceneItems(E: HostRoutesDeps, url: URL, res: import('node:http').ServerResponse, origin: unknown): Promise<void>;
