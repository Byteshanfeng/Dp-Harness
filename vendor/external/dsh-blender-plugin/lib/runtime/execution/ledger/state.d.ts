export interface WorkdirProbe {
    wsl: string;
    win: string;
    writable: boolean;
    error: string | null;
    [k: string]: unknown;
}
export interface LedgerWarn {
    path: string;
    error: string;
    hint: string;
}
export interface LedgerApi {
    runs: Map<string, unknown>;
    LEDGER: string;
    ledgerAppend: (rec: Record<string, unknown>) => void;
    ledgerState: () => Record<string, unknown>;
    ledgerList: (limit?: number) => Array<Record<string, unknown>>;
    runSnapshot: (r: Record<string, unknown>) => Record<string, unknown>;
    reconcileLedger: (rec: Record<string, unknown> | null) => Record<string, unknown> | null;
}
export declare function createLedgerStore(): {
    runs: Map<string, unknown>;
    LEDGER: string;
    ledgerAppend: (rec: Record<string, unknown>) => void;
    ledgerState: () => Record<string, unknown>;
    ledgerList: (limit?: number) => Array<Record<string, unknown>>;
};
