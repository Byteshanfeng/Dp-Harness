export declare function formatHeadlessSeeText(res: Record<string, unknown>): string;
interface ViewLike {
    png: Uint8Array;
    ms: unknown;
    hash: string;
    meta: Record<string, unknown> | null;
}
export declare function formatCustomViewText(spec: Record<string, unknown>, fv: ViewLike): string;
export declare function appendEmptyFrameWarning(t: string, raw: unknown): string;
export declare function formatPlainFrameText(size: number, full: boolean, f: {
    png: Uint8Array;
    ms: unknown;
    hash: string;
}): string;
export {};
