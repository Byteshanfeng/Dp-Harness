import type { EngineMetrics } from './index.js';
import type { AddonClient as AddonClientType } from '../../transport/probes.js';
export interface RenderFlagView {
    present: boolean;
    stale: boolean;
    ageMs: number | null;
    info: Record<string, unknown> | null;
}
export declare const MAIN_THREAD_CMDS: Set<string>;
export declare function createEngineMetrics(): EngineMetrics;
export declare function installAddonSend(addon: AddonClientType, metrics: EngineMetrics, readRenderFlag: () => RenderFlagView): void;
