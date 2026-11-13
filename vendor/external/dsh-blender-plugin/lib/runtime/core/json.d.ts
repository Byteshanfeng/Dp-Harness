/**
 * 边界解析 —— JSON / 环境变量 / 子进程输出在类型上都是 unknown。
 *
 * 规矩：只在边界把 unknown 收窄成具体类型，业务代码不得用 `as SomeType` 把边界数据吞掉；
 * 也不得用显式 any。需要新字段时先在这里加守卫/读取函数，再在模块里声明接口。
 */
/** JSON 对象（排除 null 与数组）。 */
export type JsonRecord = Record<string, unknown>;
export declare function isRecord(v: unknown): v is JsonRecord;
export declare function isArray(v: unknown): v is unknown[];
export declare function isString(v: unknown): v is string;
export declare function isNumber(v: unknown): v is number;
export declare function isBoolean(v: unknown): v is boolean;
/** 任意值 → string；null/undefined 返回 undefined（不编造空串）。 */
export declare function readString(v: unknown): string | undefined;
/** 任意值 → 有限数字；无法转换或非正数时返回 fallback（配置项语义）。 */
export declare function readPositiveNumber(v: unknown, fallback: number): number;
/** 任意值 → 有限数字；无法转换返回 fallback。 */
export declare function readNumber(v: unknown, fallback: number): number;
/** 错误对象/字符串 → 可读消息（等价于旧代码的 String((e && e.message) || e)）。 */
export declare function errorMessage(e: unknown): string;
/** 错误对象/字符串 → 错误码（Node 系统错误带 code）。 */
export declare function errorCode(e: unknown): string | undefined;
/** 错误对象上的自定义扩展字段（老代码的 e.diagnosis / e.hint / e.code 等动态边界）。 */
export declare function errorField(e: unknown, key: string): unknown;
/** 错误对象/字符串 → 详情（有 stack 用 stack，否则消息；/router 的 500 回执语义）。 */
export declare function errorDetail(e: unknown): string;
/** 任意值 → 普通记录（非对象时给空对象，用于可选配置片段）。 */
export declare function readRecord(v: unknown): JsonRecord;
