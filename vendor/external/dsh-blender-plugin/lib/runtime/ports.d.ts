export interface ProcRow {
    pid: number;
    toks: string[];
}
/** Parse an explicit CLI port flag (argv token, not a substring).
 * Keeps the pre-F1.3 semantics exactly: when the flag is present, the next
 * token is passed through Number() even if it is NaN/0/negative/fractional;
 * only a missing flag returns null (and lets the caller fall back to env/CFG). */
export declare function parsePortArg(argv: readonly string[], flag?: string): number | null;
/** Pure argv-token matcher for the /proc rows (also used by unit tests). */
export declare function serverPidsFromProcRows(rows: readonly ProcRow[], port: unknown, selfPid?: number): number[];
/** Read /proc/pid/cmdline rows; [] on platforms without /proc. */
export declare function readProcRows(): ProcRow[];
/** PIDs occupying the port in this plugin's process family. */
export declare function samePortHolders(port: unknown): number[];
/** Kill the holders; Windows goes through taskkill /T /F, POSIX uses a signal. */
export declare function killHolders(port: unknown, signal: NodeJS.Signals | number): number[];
/** True when the holder still answers /health (busy, not stale). */
export declare function holderResponsive(port: unknown, ms?: number): Promise<boolean>;
