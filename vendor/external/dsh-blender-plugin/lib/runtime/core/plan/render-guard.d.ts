import type { AddonClient } from '../../transport/probes.js';
export interface RenderGuardDeps {
    RENDER_FLAG_WSL: string;
    RENDER_STALE_MS: number;
    addon: AddonClient;
    clearRenderFlag: () => boolean;
    ensureRenderGuard: () => Promise<unknown>;
    readRenderFlag: () => {
        present: boolean;
        stale: boolean;
        ageMs: number | null;
        info: Record<string, unknown> | null;
    };
}
/** Local render-guard ops (read/wait/reset flags; install/selftest take one Blender round-trip). */
export declare function createRenderGuardOp(E: RenderGuardDeps): (op: string, payload?: unknown) => Promise<unknown>;
