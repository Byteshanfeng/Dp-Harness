import type { EngineApiDeps } from './index.js';
export declare function createViewApi(E: EngineApiDeps): {
    view(spec?: Record<string, unknown>): Promise<{
        png: NonSharedBuffer;
        meta: Record<string, unknown>;
    }>;
};
