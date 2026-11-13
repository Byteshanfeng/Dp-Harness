import type { EngineApiDeps } from './index.js';
export declare function metricsView(E: EngineApiDeps): Record<string, unknown>;
export declare function createMetricsApi(E: EngineApiDeps): {
    metrics(): {
        lastCmdAgeMs: number | null;
        lastCmdAt: number | null;
        views: number;
    };
};
