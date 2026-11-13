export interface AxisSpec {
    kind: 'enum' | 'range';
    values?: unknown[];
    min?: number;
    max?: number;
    step?: number;
    integer?: boolean;
}
/** Python 字面量（JSON 的 true/false/null 在 Python 里不是这个写法 —— 直接 JSON.stringify 会 NameError） */
export declare function pyLit(v: unknown): string;
export declare const pyIndent: (src: unknown, pad: string) => string;
/** 一个轴（参数维度）的候选值：enum 直接取 values；range 按 step 切（没给 step 就等分 10 档） */
export declare function searchAxisValues(spec0: AxisSpec, cap: number): unknown[];
