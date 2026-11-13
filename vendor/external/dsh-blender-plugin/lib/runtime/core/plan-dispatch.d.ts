import type { AddonClient } from '../transport/probes.js';
export interface PlanDispatchDeps {
    RENDER_FLAG_WSL: string;
    RENDER_STALE_MS: number;
    addon: AddonClient;
    clearRenderFlag: () => boolean;
    ensurePerf: () => Promise<unknown>;
    ensureQc: () => Promise<unknown>;
    ensureRenderGuard: () => Promise<unknown>;
    ensureRunner: () => Promise<unknown>;
    ensureView: () => Promise<unknown>;
    loopBoard: (top: number, withVariants: boolean) => Promise<unknown>;
    loopExport: (spec: Record<string, unknown>) => Promise<unknown>;
    loopStart: (spec: Record<string, unknown>) => Promise<unknown>;
    loopStatus: (limit: number) => Promise<Record<string, unknown> | null>;
    loopStop: () => Promise<unknown>;
    planCallInner: (op: string, payload?: unknown) => Promise<unknown>;
    readRenderFlag: () => {
        present: boolean;
        stale: boolean;
        ageMs: number | null;
        info: Record<string, unknown> | null;
    };
}
export declare function createPlanDispatch(E: PlanDispatchDeps): {
    perfCall: (op: string, payload?: unknown) => Promise<unknown>;
    enhancePlanResult: (out: unknown, o: string) => unknown;
    planCall: (op: unknown, payload?: unknown) => Promise<unknown>;
};
