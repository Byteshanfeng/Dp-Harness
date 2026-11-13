import type { EngineApiDeps } from './index.js';
export declare function createFrameApi(E: EngineApiDeps): {
    frameArea(areaIndex?: number): Promise<{
        png: NonSharedBuffer;
        meta: {
            method: string;
            info: string;
        };
    }>;
    /** 取一帧视口 PNG（覆盖写固定文件） */
    frame(maxSize?: number): Promise<{
        png: NonSharedBuffer;
        meta: unknown;
    }>;
};
