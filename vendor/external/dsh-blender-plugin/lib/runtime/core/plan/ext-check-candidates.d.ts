/** Windows drive path -> WSL /mnt path; anything else is passed through. */
export declare function toWslPath(winPath: string): string;
export interface ExtCandidateInput {
    op: string;
    extDir: string;
    runner: string;
    winPath: string;
    wslPath: string;
    isWin: boolean;
}
/**
 * Candidate command chains. The backend may run in WSL while node runs on Windows
 * (or the other way round), so the native path comes first and the alternate
 * representation is the fallback; WSL always gets the WSL path.
 */
export declare function extCandidates(input: ExtCandidateInput): string[][];
export interface ExtCandidateRun {
    raw: string | null;
    used: string | null;
    tried: Array<Record<string, unknown>>;
}
/** Run candidates until one prints a RAW/EXT line; no candidate => raw=null. */
export declare function runExtCandidates(cp: {
    spawnSync: typeof import('node:child_process').spawnSync;
}, cands: string[][]): ExtCandidateRun;
/**
 * Actionable local-install hint. It must stay a directly pasteable absolute path:
 * a relative 'runtime/ext/venv' hint re-nests when the user happens to run it in
 * runtime/ext (field report).
 */
export declare function extInstallHint(input: {
    op: string;
    extDir: string;
    winPath: string;
    isWin: boolean;
    tried: Array<Record<string, unknown>>;
}): Record<string, unknown>;
