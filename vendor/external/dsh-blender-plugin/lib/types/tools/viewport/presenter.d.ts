export declare function renderViewportOutput(_args: unknown, value: unknown): Array<{
    type: 'text';
    text: string;
}>;
export declare function formatWho(raw: unknown): string;
export declare function formatLeaseResult(op: string, r: unknown): string;
export declare function formatLeaseError(op: string, e: unknown): string;
export declare function formatLaunch(r: unknown): string;
export declare function formatDoctor(raw: unknown): string;
export declare function formatStatus(port: number, raw: unknown): string;
/** 超时/被 abort ≠ 连接被拒 —— 判定两套 verdict 的共用判据。 */
export declare function isTimeoutError(e: unknown): boolean;
export declare function formatStatusError(port: number, e: unknown): string;
