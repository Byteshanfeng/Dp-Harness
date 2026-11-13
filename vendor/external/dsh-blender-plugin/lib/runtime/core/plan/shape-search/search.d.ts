import type { AxisSpec } from './axes.js';
import type { ShapeSearchDeps } from './index.js';
import type { ShapeSearchLimits, ShapeSearchTargets } from './parse.js';
type AxisEntry = {
    k: string;
    spec: AxisSpec;
    vals: unknown[];
};
export declare function buildSetupSrc(p: Record<string, unknown>, applyBody: string): string;
export declare function buildStepSrc(strategy: string, axes: AxisEntry[], combos: number): string;
export declare function buildMeasureSrc(applyBody: string, measure: unknown, objective: string, target: string, targetSize: unknown, views: unknown[], ref: string, refBox: unknown, bins: number): string;
export declare function buildSpec(setupSrc: string, stepSrc: string, measureSrc: string, iterations: number, limits: ShapeSearchLimits): Record<string, unknown>;
export declare function buildSpecEcho(objective: string, strategy: string, combos: number, iterations: number, limits: ShapeSearchLimits, norm: Record<string, AxisSpec>, targets: ShapeSearchTargets, p: Record<string, unknown>): Record<string, unknown>;
export declare function preloadForSearch(E: ShapeSearchDeps, renderObjective: boolean): Promise<Record<string, unknown> | null>;
export declare function startSearchLoop(E: ShapeSearchDeps, spec: Record<string, unknown>, specEcho: Record<string, unknown>): Promise<Record<string, unknown> | null>;
export interface SearchPoll {
    st: Record<string, unknown> | null;
    timedOut: boolean;
    pollError: string | null;
}
export declare function pollSearchLoop(E: ShapeSearchDeps, waitCap: number): Promise<SearchPoll>;
export interface SearchBoard {
    board: Record<string, unknown> | null;
    exported: Record<string, unknown> | null;
}
export declare function fetchBoardAndExport(E: ShapeSearchDeps, p: Record<string, unknown>, topK: number, objective: string): Promise<SearchBoard>;
export {};
