import type { AddonClient } from '../../../transport/probes.js';
export interface ShapeSearchDeps {
    addon: AddonClient;
    ensureQc: () => Promise<unknown>;
    ensureRunner: () => Promise<unknown>;
    ensureView: () => Promise<unknown>;
    loopBoard: (top: number, withVariants: boolean) => Promise<unknown>;
    loopExport: (spec: Record<string, unknown>) => Promise<unknown>;
    loopStart: (spec: Record<string, unknown>) => Promise<unknown>;
    loopStatus: (limit: number) => Promise<Record<string, unknown> | null>;
    loopStop: () => Promise<unknown>;
}
/** Declarative search: validate a spec locally, then orchestrate the Blender-side loop. */
export declare function createShapeSearch(E: ShapeSearchDeps): (payload?: unknown) => Promise<Record<string, unknown>>;
