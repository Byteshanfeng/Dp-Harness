export interface RenderFlagInfo {
    present: boolean;
    stale: boolean;
    ageMs: number | null;
    info: Record<string, unknown> | null;
}
export declare function createRenderState(_E?: unknown): {
    readRenderFlag(): RenderFlagInfo;
    clearRenderFlag(): boolean;
    RENDER_FLAG_WSL: string;
    RENDER_FLAG_WIN: string;
    RENDER_STALE_MS: number;
};
