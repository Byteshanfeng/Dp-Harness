export declare function headlessScriptName(): string;
export interface StagingInfo {
    requested: string;
    requestedShared: boolean | null;
    requestedWhy: string;
    used: string;
    usedWin: string;
    usedShared: boolean | null;
    usedWhy: string;
    label: string;
    substituted: boolean;
    note: string;
    degraded?: boolean;
}
export declare function writeHeadlessScript(code: string): {
    wsl: string;
    win: string;
    staging: StagingInfo;
};
