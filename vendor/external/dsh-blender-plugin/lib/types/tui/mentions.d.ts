import type { MentionItem } from './types.js';
/** '/host/scene-items' 响应 → 提及条目。插进草稿的是与 Web codec 同一份模型文本（'<blender-object>名字</blender-object>'）。 */
export declare function mentionItems(body: unknown, limit?: number): MentionItem[];
/** 本地过滤：label 含 query（不分大小写）；空 query 给前 50 条。宿主会再按自己的模糊打分排序。 */
export declare function filterMentionItems(items: MentionItem[], query: string): MentionItem[];
/**
 * '@' 提及的数据源：第一次查询拉一份全量（≤ 1000 条）缓存起来，之后在本地过滤、立即返回；
 * 缓存超过 5 s 就在后台刷新一次（不等它）。冷启动那一次可能超过宿主的单次时限、被丢弃，
 * 但缓存会填上，下一次按键就有结果。只在用户真的打 '@' 时才碰 Blender，不轮询。
 */
export declare function createSceneMentionSource(port: number): (query: string, signal: AbortSignal) => Promise<MentionItem[]>;
