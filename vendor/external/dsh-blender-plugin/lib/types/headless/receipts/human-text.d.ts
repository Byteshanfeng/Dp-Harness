/** 回执上下文：envelope（构造信封）与本文件（人读叙述）共用的唯一声明。 */
export interface ReceiptContext {
    mode?: 'sync' | 'job' | 'promoted';
    runId?: string | null;
    jobId?: string | null;
    notes?: string[];
    hint?: string | null;
}
export declare function headlessHumanText(res: unknown, ctx: ReceiptContext): string;
