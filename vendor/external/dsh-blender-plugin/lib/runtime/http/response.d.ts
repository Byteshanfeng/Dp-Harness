import type { ServerResponse, IncomingMessage } from 'node:http';
declare function json(res: ServerResponse, code: number, obj: unknown): void;
/**
 * 流式响应（ndjson）—— 长任务必需：客户端 fetch 的响应头超时默认 300 s（实测 UND_ERR_HEADERS_TIMEOUT），
 * 而服务端要等子进程跑完才回包 → 长任务必然踩超时。这里立刻发响应头 + 周期心跳，最后一行才是结果。
 */
declare function streamJson(res: ServerResponse, producer: () => Promise<unknown>, hbMs?: number): Promise<unknown>;
declare function readBody(req: IncomingMessage, limit?: number): Promise<string>;
declare function hostCorsHeaders(origin: unknown): Record<string, string>;
declare function hostJson(res: ServerResponse, code: number, obj: unknown, origin?: unknown): void;
declare function hostErrText(e: unknown): string;
/** `@` 提及的 limit：夹到 [1,1000]，默认 200（旧 viewstore 口径，路由还在用）。 */
declare function clampItemsLimit(v: unknown, dflt?: number): number;
declare function hostNormEmpty(v: unknown): unknown;
export { json, streamJson, readBody, hostCorsHeaders, hostJson, hostErrText, clampItemsLimit, hostNormEmpty, };
