import type { DiskCatalog, PlanFamily } from './data.js';
export declare function planEditDistance(a: string, b: string): number;
/** 未知 op 的最近邻建议（含最小骨架）—— 把"写错了"变成"一步改对" */
export interface PlanSuggestion {
    op: string;
    distance: number;
    family: string | null;
    skeleton: string | null;
    when: string | null;
}
export declare function planOpSuggestion(opName: unknown): PlanSuggestion | null;
export declare function name0StartsWith(s: unknown, p: string): boolean;
/** rt_cmd 跨通道纠错：把 plan op 当 addon 命令发时，直接告诉它该走哪个工具（实测真实发生过） */
export declare function planOpCrossChannelHint(addonName: unknown): string | null;
/**
 * 目录自己的内容指纹 —— 只哈希"真正会回答的东西"（定序，顺序敏感）。
 * 用途：① 跨进程对拍（干净进程 import 磁盘 engine.mjs 后的 catalogHash 必须相等）
 *       ② 把"目录变没变"变成可比对的 12 位十六进制，而不是"感觉好像多了几族"。
 */
export interface CatalogFingerprint {
    catalogHash: string;
    families: number;
    opsCount: number;
    toolDetailKeys: number;
    commandCatalogKeys: number;
}
export declare function catalogFingerprint(): CatalogFingerprint;
/** 另起一个干净 node 进程 import **磁盘上的** engine.js 门面 —— 只有它才是"下一个请求会拿到什么"的裁判 */
export declare function probeDiskCatalog(timeoutMs: unknown): DiskCatalog;
/**
 * 加载版本 / 磁盘版本的内容指纹对拍。
 * 默认只读一次磁盘（~0.2 ms）；`verify:true` 才起干净进程对拍（~120 ms），按需付费。
 */
/** 单条 family 的短渲染（渐进披露：先目录，再 family，再 *_help） */
export declare function renderFamilyText(e: PlanFamily): string;
/**
 * op="catalog" 的载荷。默认**只回短文本**（≈2–3k 字符）：flash 级模型读"短枚举 + 判据 + 骨架"远比读
 * 4.7k 字散文有效；结构化明细要 args={full:true} 才给（那是给机器/复盘用的）。
 *   op="catalog"                         → 一页目录（family 一行 + ops + 骨架要点）
 *   op="catalog", args={family:"sculpt"}  → 只展开这一族
 *   op="catalog", args={full:true}        → 附带结构化 families/tools
 */
/**
 * 单一事实源：/plan 通道的只读 op 白名单（唯一声明处）（本文件是唯一声明处）。
 * server.mjs 直接消费；tests/unit/js/contract/single-source.test.ts 与冻结基线逐名对拍，防迁移丢项/多项。
 * 判据：不改场景、不动对象变换、不注册 handler。新增只读 op 只改这一处。
 */
