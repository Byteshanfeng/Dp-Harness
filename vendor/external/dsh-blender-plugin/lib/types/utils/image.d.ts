/** 宿主 attachments 服务的最小结构（只覆盖本插件用到的字段）。 */
export interface AttachmentRef {
    attachmentId: string;
    mediaType: string;
    bytes: number;
    width: number;
    height: number;
    name?: string;
}
/** PNG → durable attachment（v0.9.2 起失败**不再静默**：返回 {ref} 或 {why}，由调用方写进工具文本） */
export declare function toAttachment(ctx: unknown, data: Uint8Array, name: string): Promise<{
    ref?: AttachmentRef;
    why?: string;
}>;
/** Windows / UNC 路径 → WSL 路径（本机 DSH 在 WSL 里跑；Windows 宿主则原样返回）。 */
export declare function toWslPath(p: unknown): string;
/** 读本地 PNG（失败返回 null；调用方负责把 why 写进文本，不静默） */
export declare function readLocalPng(p: unknown): Uint8Array | null;
/** 批量附图：≤max 张；返回已附的 attachment 与失败清单（路径/原因） */
export declare function attachPaths(ctx: unknown, paths: readonly unknown[], tag: string, max?: number): Promise<{
    images: AttachmentRef[];
    used: string[];
    failed: string[];
}>;
/** 从 plan 回执里收集可附图路径（≤2 张；只认常见产物字段） */
export declare function planImagePaths(res: unknown): string[];
