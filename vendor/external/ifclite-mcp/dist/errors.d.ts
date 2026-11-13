/**
 * Stable error codes for tool results.
 *
 * Critical: these are surfaced as `structuredContent.code` on tool results
 * with `isError: true` — NEVER as JSON-RPC errors. That lets the LLM read
 * and react to the failure inline rather than aborting the chain.
 */
import type { CallToolResult } from './protocol/index.js';
export declare const ToolErrorCode: {
    readonly ENTITY_NOT_FOUND: "ENTITY_NOT_FOUND";
    readonly MODEL_NOT_FOUND: "MODEL_NOT_FOUND";
    readonly MODEL_REQUIRED: "MODEL_REQUIRED";
    readonly INVALID_INPUT: "INVALID_INPUT";
    readonly CANCELLED: "CANCELLED";
    readonly STATE_CHANGED: "STATE_CHANGED";
    readonly UNSUPPORTED_OPERATION: "UNSUPPORTED_OPERATION";
    readonly PERMISSION_DENIED: "PERMISSION_DENIED";
    readonly READ_ONLY: "READ_ONLY";
    readonly PARSE_FAILED: "PARSE_FAILED";
    readonly EXTERNAL_SERVICE_FAILED: "EXTERNAL_SERVICE_FAILED";
    readonly RATE_LIMITED: "RATE_LIMITED";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
};
export type ToolErrorCodeValue = typeof ToolErrorCode[keyof typeof ToolErrorCode];
export interface ToolErrorOptions {
    code: ToolErrorCodeValue;
    message: string;
    details?: Record<string, unknown>;
    hint?: string;
}
export declare function toolError(opts: ToolErrorOptions): CallToolResult;
export declare class ToolExecutionError extends Error {
    readonly code: ToolErrorCodeValue;
    readonly details?: Record<string, unknown>;
    readonly hint?: string;
    constructor(opts: ToolErrorOptions);
    toToolResult(): CallToolResult;
}
//# sourceMappingURL=errors.d.ts.map