import type { ShapeSearchDeps } from './index.js';
import type { SearchPoll } from './search.js';
export interface SearchApplied {
    best: Record<string, unknown> | null;
    applied: Record<string, unknown> | null;
}
/** 按 restore 口径把 best 参数落回场景 */
export declare function applyBestParams(E: ShapeSearchDeps, p: Record<string, unknown>, setupSrc: string, applyBody: string, poll: SearchPoll, board: Record<string, unknown> | null): Promise<SearchApplied>;
export declare function buildNextSteps(p: Record<string, unknown>, objective: string, best: Record<string, unknown> | null, timedOut: boolean): string[];
export interface SearchResultArgs {
    preview: Record<string, unknown>;
    st: Record<string, unknown> | null;
    timedOut: boolean;
    best: Record<string, unknown> | null;
    board: Record<string, unknown> | null;
    pollError: string | null;
    applied: Record<string, unknown> | null;
    exported: Record<string, unknown> | null;
    warnings: string[];
    nextSteps: string[];
}
export declare function buildSearchResult(a: SearchResultArgs): Record<string, unknown>;
