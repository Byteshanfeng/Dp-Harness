import type { EngineApiDeps } from './index.js';
export declare function createLoopApi(E: EngineApiDeps): {
    loopStart(spec: unknown): Promise<unknown>;
    loopStatus(history?: number): Promise<unknown>;
    loopStop(): Promise<unknown>;
    loopBench(iterations?: number): Promise<unknown>;
    /** 候选表：top_k / 分组（跨对象批量）结果 */
    loopBoard(limit?: number, groups?: boolean): Promise<unknown>;
    /** 导出可复用脚本（内嵌 setup 源码 + 最优参数） */
    loopExport(opts?: Record<string, unknown>): Promise<unknown>;
    /** 内环契约速查（spec 字段 + ns 预置 + 辅助函数） */
    loopHelp(): Promise<unknown>;
};
