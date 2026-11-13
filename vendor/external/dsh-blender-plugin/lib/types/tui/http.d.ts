export type Json = Record<string, unknown>;
export declare function base(port: number): string;
export declare function withTimeout(ms: number, outer?: AbortSignal): AbortSignal;
export declare function getJson(port: number, path: string, signal?: AbortSignal, timeoutMs?: number): Promise<Json | null>;
export declare function postJson(port: number, path: string, body: unknown): Promise<Json | null>;
