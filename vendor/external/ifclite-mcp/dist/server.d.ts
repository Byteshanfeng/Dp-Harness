/**
 * MCPServer — the central JSON-RPC router.
 *
 * Responsibilities:
 *   - track initialization handshake
 *   - dispatch `tools/list`, `tools/call`, `resources/list`, `resources/read`,
 *     `prompts/list`, `prompts/get`, `ping`, `notifications/initialized`,
 *     `notifications/cancelled`
 *   - filter tool advertisement by auth scope
 *   - validate tool input against the tool's JSON schema
 *   - turn thrown ToolExecutionError into structured tool results (NOT JSON-RPC errors)
 *
 * Transport-agnostic: `connect(transport)` is the only I/O hook. The transport
 * pushes incoming JSON-RPC messages via `handleMessage` and gets back zero or
 * one outgoing messages plus any progress/log notifications routed through
 * the `OutgoingMessageSink` contract.
 */
import { JsonRpcMessage, JsonRpcResponse, ServerCapabilities } from './protocol/index.js';
import { AuthScope } from './auth/scope.js';
import { Logger, ModelRegistry, ServerConfig } from './context.js';
import { PromptRegistry } from './prompts/types.js';
import { ResourceRegistry } from './resources/types.js';
import { ToolRegistry } from './tools/types.js';
import { ViewerManager } from './viewer-manager.js';
import type { ViewerState } from './viewer-manager.js';
export declare const SERVER_NAME = "ifc-lite-mcp";
export interface OutgoingMessageSink {
    send(message: JsonRpcMessage): Promise<void> | void;
}
export interface MCPServerOptions {
    name?: string;
    version: string;
    registry?: ModelRegistry;
    scope?: AuthScope;
    config?: Partial<ServerConfig>;
    tools: ToolRegistry;
    resources: ResourceRegistry;
    prompts: PromptRegistry;
    logger?: Logger;
    /** Override which capabilities are advertised. */
    capabilities?: ServerCapabilities;
    /** Optional pre-built viewer manager. Default: a fresh one bound to the registry. */
    viewer?: ViewerManager;
    /**
     * Transport session id for multi-client transports (one MCPServer per
     * HTTP session). Keys per-session state like the layer workspace (#1030);
     * omit for stdio/in-process where the process is the session.
     */
    sessionId?: string;
}
export declare class MCPServer {
    readonly name: string;
    readonly version: string;
    readonly registry: ModelRegistry;
    readonly tools: ToolRegistry;
    readonly resources: ResourceRegistry;
    readonly prompts: PromptRegistry;
    readonly config: ServerConfig;
    readonly viewer: ViewerManager;
    readonly sessionId?: string;
    private scope;
    private logger;
    private capabilities;
    private initialized;
    private sink;
    /** Active tool calls keyed by JSON-RPC id, used for cancellation. */
    private active;
    /** Currently subscribed resource URIs (for `notifications/resources/updated`). */
    private subscriptions;
    constructor(opts: MCPServerOptions);
    /** Attach an outgoing-message sink. Required before handling messages. */
    attach(sink: OutgoingMessageSink): void;
    detach(): void;
    /** Update the auth scope mid-session (e.g. token refresh). */
    setScope(scope: AuthScope): void;
    /**
     * Open the in-process viewer for the first loaded model if configured to
     * do so, otherwise a no-op. Makes `ServerConfig.autoOpenViewer` /
     * `.viewerPort` (issue #2731 finding 4) actually take effect for any
     * caller that constructs `MCPServer` with `config`, not just the CLI.
     *
     * Precedence: `overrides` (an explicit, per-call instruction — this is
     * what a CLI flag like `--viewer` represents) beats `this.config` (set at
     * construction, e.g. by an embedder) beats the built-in default of "do
     * not auto-open, port 0". A field left `undefined` at one level falls
     * through to the next.
     *
     * No-ops (returns `null`) when auto-open resolves to `false`/`undefined`,
     * or when no model is loaded yet. Errors from `ViewerManager.open()`
     * propagate — callers that already have their own logging/fallback (the
     * CLI does) can catch and report; callers that don't want that risk can
     * check `registry.count()` first.
     */
    maybeAutoOpenViewer(overrides?: {
        autoOpen?: boolean;
        port?: number;
    }): Promise<ViewerState | null>;
    isInitialized(): boolean;
    /**
     * Process a single inbound JSON-RPC message. Returns the response (if any)
     * or null for notifications. Side-effect notifications (progress, log) flow
     * through the attached sink, not the return value.
     */
    handleMessage(message: JsonRpcMessage): Promise<JsonRpcResponse | null>;
    private handleRequest;
    private handleNotification;
    private handleInitialize;
    private handleListTools;
    private handleCallTool;
    private handleListResources;
    private handleReadResource;
    private handleListPrompts;
    private handleGetPrompt;
    private makeResourceContext;
    private makeProgress;
    /** Broadcast a `notifications/resources/updated` to subscribers. */
    notifyResourceUpdated(uri: string): void;
    /** Notify clients that the tool list has changed (e.g., after model load). */
    notifyToolsChanged(): void;
    /** Read-only access to the auth scope for transports that need to gate access. */
    hasModelAccess(modelId: string): boolean;
}
//# sourceMappingURL=server.d.ts.map