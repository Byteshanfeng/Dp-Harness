import type { ChipService, SelectionState } from './types.js';
/** v2.4 子元素选中（网格点/边/面、骨骼、曲线/晶格控制点）→ 文本。逐字对齐 lib/client.js 的 subSelectionText。 */
export declare function subSelectionText(sel: unknown): string | null;
/** selection payload → 给模型的文本（空选中回 null）。逐字对齐 lib/client.js 的 selectionMessageText。 */
export declare function selectionMessageText(payload: unknown): string | null;
/** chip 标题（一行，≤ 80 cell）：同一个 key 重发会**替换**上一条，所以标题只说「是什么、多少」 */
export declare function selectionChipTitle(sel: unknown): string;
/**
 * 一次轮询（导出给自检）：取未消费的选中 → 挂 chip → consume。
 * 与 Web 桥同一套 CAS 语义：成功才 consume(ok:true)；挂不上不消费、下一 tick 重试，第 3 次失败
 * consume(ok:false, reason)；空选中直接 consume(ok:false)（没有可重试的东西）。
 */
export declare function selectionTick(deps: {
    port: number;
    chips: ChipService;
    notify?: (text: string, color: string) => void;
    state: SelectionState;
}): Promise<void>;
