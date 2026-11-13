import type { AxisSpec } from './axes.js';
export declare const SHAPE_SEARCH_SKELETON: string;
export interface ShapeSearchLimits {
    iterationsReq: number;
    budgetMs: number;
    topK: number;
    patience: number;
    minimize: boolean;
    interval: number;
    measureEvery: number;
}
export interface ShapeSearchStrategy {
    axes: Array<{
        k: string;
        spec: AxisSpec;
        vals: unknown[];
    }>;
    combos: number;
    strategy: string;
    iterations: number;
}
export interface ShapeSearchTargets {
    renderObjective: boolean;
    views: unknown[];
    ref: string;
    refBox: unknown;
    bins: number;
    target: string;
    targetSize: unknown[] | null;
    applyBody: string;
    warnings: string[];
}
export type ShapeSearchError = {
    ok: false;
    [k: string]: unknown;
};
export type ShapeSearchParse = ShapeSearchError | {
    ok: true;
    input: {
        p: Record<string, unknown>;
        objective: string;
        norm: Record<string, AxisSpec>;
        limits: ShapeSearchLimits;
        strategy: ShapeSearchStrategy;
        targets: ShapeSearchTargets;
    };
};
export declare function parseShapeSearchPayload(payload: unknown): ShapeSearchParse;
