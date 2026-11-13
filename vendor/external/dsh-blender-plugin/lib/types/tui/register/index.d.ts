import type { TuiHostOptions } from '../types.js';
/** apply() 调这个；宿主没有对应服务的块永远不会启用。 */
export declare function registerTuiHost(ctx: unknown, opts: TuiHostOptions): void;
/** doctor 的一行：TUI 宿主半边接上了哪些接缝（非 dsh-TUI 宿主时说明为什么是空的） */
export declare function tuiHostSummary(): string;
