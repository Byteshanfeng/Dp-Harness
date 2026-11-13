import type { AddonClient as AddonClientType } from '../../transport/probes.js';
import { createTrajectory } from '../../execution/trajectory/index.js';
import type { EngineMetrics, EngineOptions, EngineSurface } from './index.js';
export interface EngineContext {
    addon: AddonClientType;
    E: Record<string, unknown>;
    metrics: EngineMetrics;
    readRenderFlag: () => unknown;
}
export declare function createEngineContext(opts?: EngineOptions): EngineContext;
export declare function assembleEngine(ctx: EngineContext): {
    surface: EngineSurface;
    trajectory: ReturnType<typeof createTrajectory>;
};
