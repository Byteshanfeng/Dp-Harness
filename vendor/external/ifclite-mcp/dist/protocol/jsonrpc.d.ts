/**
 * JSON-RPC 2.0 helpers used by every MCP transport.
 */
import { JsonRpcId, JsonRpcErrorResponse, JsonRpcMessage, JsonRpcNotification, JsonRpcRequest, JsonRpcResponse, JsonRpcSuccessResponse } from './types.js';
export declare function isJsonRpcRequest(msg: unknown): msg is JsonRpcRequest;
export declare function isJsonRpcNotification(msg: unknown): msg is JsonRpcNotification;
export declare function isJsonRpcResponse(msg: unknown): msg is JsonRpcResponse;
export declare function successResponse<R>(id: JsonRpcId, result: R): JsonRpcSuccessResponse<R>;
export declare function errorResponse(id: JsonRpcId | null, code: number, message: string, data?: unknown): JsonRpcErrorResponse;
export declare function notification<P>(method: string, params?: P): JsonRpcNotification<P>;
export declare function parseMessage(text: string): JsonRpcMessage | null;
//# sourceMappingURL=jsonrpc.d.ts.map