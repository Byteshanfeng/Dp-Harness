/**
 * Model Context Protocol (MCP) wire types.
 *
 * Implements the subset of MCP 2025-11 we need. JSON-RPC 2.0 envelopes,
 * tool/resource/prompt shapes, progress notifications, and the cancellation
 * helpers. We deliberately avoid `any` and keep the types narrow so the
 * tool implementations get strong type-checking out of the box.
 */
export declare const PROTOCOL_VERSION = "2025-11-05";
/**
 * Protocol versions we are willing to negotiate. The server's wire surface
 * (initialize, tools/{list,call}, resources/*, prompts/*, notifications/*,
 * logging) has been backwards-compatible across these spec revisions, so we
 * accept any of them and echo the requested version back during initialize.
 * Unrecognized versions get downgraded to PROTOCOL_VERSION instead.
 */
export declare const SUPPORTED_PROTOCOL_VERSIONS: ReadonlySet<string>;
export declare const JSONRPC_VERSION: "2.0";
export type JsonRpcId = string | number;
export interface JsonRpcRequest<P = unknown> {
    jsonrpc: typeof JSONRPC_VERSION;
    id: JsonRpcId;
    method: string;
    params?: P;
}
export interface JsonRpcNotification<P = unknown> {
    jsonrpc: typeof JSONRPC_VERSION;
    method: string;
    params?: P;
}
export interface JsonRpcSuccessResponse<R = unknown> {
    jsonrpc: typeof JSONRPC_VERSION;
    id: JsonRpcId;
    result: R;
}
export interface JsonRpcErrorResponse {
    jsonrpc: typeof JSONRPC_VERSION;
    id: JsonRpcId | null;
    error: JsonRpcErrorObject;
}
export interface JsonRpcErrorObject {
    code: number;
    message: string;
    data?: unknown;
}
export type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;
export type JsonRpcMessage = JsonRpcRequest | JsonRpcNotification | JsonRpcResponse;
export declare const JsonRpcErrorCode: {
    readonly ParseError: -32700;
    readonly InvalidRequest: -32600;
    readonly MethodNotFound: -32601;
    readonly InvalidParams: -32602;
    readonly InternalError: -32603;
    readonly ServerNotInitialized: -32002;
    readonly RequestCancelled: -32800;
};
export interface ServerCapabilities {
    tools?: {
        listChanged?: boolean;
    };
    resources?: {
        subscribe?: boolean;
        listChanged?: boolean;
    };
    prompts?: {
        listChanged?: boolean;
    };
    logging?: Record<string, never>;
    experimental?: Record<string, unknown>;
}
export interface ClientCapabilities {
    roots?: {
        listChanged?: boolean;
    };
    sampling?: Record<string, never>;
    experimental?: Record<string, unknown>;
}
export interface InitializeParams {
    protocolVersion: string;
    capabilities: ClientCapabilities;
    clientInfo: {
        name: string;
        version: string;
    };
}
export interface InitializeResult {
    protocolVersion: string;
    capabilities: ServerCapabilities;
    serverInfo: {
        name: string;
        version: string;
    };
    instructions?: string;
}
export type ContentBlock = TextContent | ImageContent | ResourceLink | EmbeddedResource;
export interface TextContent {
    type: 'text';
    text: string;
}
export interface ImageContent {
    type: 'image';
    data: string;
    mimeType: string;
}
export interface ResourceLink {
    type: 'resource';
    resource: {
        uri: string;
        mimeType?: string;
        text?: string;
    };
}
export interface EmbeddedResource {
    type: 'resource';
    resource: ResourceContents;
}
export interface ResourceContents {
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: string;
}
export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: JsonSchema;
    /** Optional metadata: which scope a token needs to call this tool. */
    scope?: ToolScope;
}
export interface ListToolsResult {
    tools: ToolDefinition[];
    nextCursor?: string;
}
export interface CallToolParams {
    name: string;
    arguments?: Record<string, unknown>;
    _meta?: {
        progressToken?: string | number;
    };
}
export interface CallToolResult {
    content: ContentBlock[];
    structuredContent?: Record<string, unknown>;
    isError?: boolean;
}
export type ToolScope = 'read' | 'validate' | 'mutate' | 'export' | 'admin';
export interface ResourceDefinition {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
}
export interface ListResourcesResult {
    resources: ResourceDefinition[];
    nextCursor?: string;
}
export interface ReadResourceParams {
    uri: string;
}
export interface ReadResourceResult {
    contents: ResourceContents[];
}
export interface SubscribeParams {
    uri: string;
}
export interface PromptArgument {
    name: string;
    description?: string;
    required?: boolean;
}
export interface PromptDefinition {
    name: string;
    description: string;
    arguments?: PromptArgument[];
}
export interface ListPromptsResult {
    prompts: PromptDefinition[];
}
export interface GetPromptParams {
    name: string;
    arguments?: Record<string, string>;
}
export interface PromptMessage {
    role: 'user' | 'assistant' | 'system';
    content: ContentBlock;
}
export interface GetPromptResult {
    description?: string;
    messages: PromptMessage[];
}
export interface ProgressNotification {
    progressToken: string | number;
    progress: number;
    total?: number;
    message?: string;
}
export interface ResourceUpdatedNotification {
    uri: string;
}
export interface LogNotification {
    level: 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical';
    logger?: string;
    data: unknown;
}
export interface JsonSchema {
    type?: string | string[];
    description?: string;
    properties?: Record<string, JsonSchema>;
    required?: string[];
    items?: JsonSchema;
    enum?: readonly unknown[];
    default?: unknown;
    minimum?: number;
    exclusiveMinimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    minItems?: number;
    maxItems?: number;
    format?: string;
    anyOf?: JsonSchema[];
    additionalProperties?: boolean | JsonSchema;
    [key: string]: unknown;
}
//# sourceMappingURL=types.d.ts.map