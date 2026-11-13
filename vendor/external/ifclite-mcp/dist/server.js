/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
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
import { JsonRpcErrorCode, PROTOCOL_VERSION, SUPPORTED_PROTOCOL_VERSIONS, } from './protocol/index.js';
import { errorResponse, isJsonRpcNotification, isJsonRpcRequest, notification, successResponse, } from './protocol/jsonrpc.js';
import { fullScope, modelAllowed, scopeAllows, } from './auth/scope.js';
import { DEFAULT_CONFIG, InMemoryModelRegistry, SILENT_LOGGER, } from './context.js';
import { ToolExecutionError, ToolErrorCode, toolError } from './errors.js';
import { disposeSessionResources } from './session-cleanup.js';
import { withScanHint } from './tools/util.js';
import { advertisedInputSchema, validateInput } from './validate.js';
import { ViewerManager } from './viewer-manager.js';
export const SERVER_NAME = 'ifc-lite-mcp';
export class MCPServer {
    name;
    version;
    registry;
    tools;
    resources;
    prompts;
    config;
    viewer;
    sessionId;
    scope;
    logger;
    capabilities;
    initialized = false;
    sink = null;
    /** Active tool calls keyed by JSON-RPC id, used for cancellation. */
    active = new Map();
    /** Currently subscribed resource URIs (for `notifications/resources/updated`). */
    subscriptions = new Set();
    constructor(opts) {
        this.name = opts.name ?? SERVER_NAME;
        this.version = opts.version;
        this.sessionId = opts.sessionId;
        this.registry = opts.registry ?? new InMemoryModelRegistry();
        this.scope = opts.scope ?? fullScope();
        this.config = { ...DEFAULT_CONFIG, ...opts.config };
        this.tools = opts.tools;
        this.resources = opts.resources;
        this.prompts = opts.prompts;
        this.logger = opts.logger ?? SILENT_LOGGER;
        this.capabilities = opts.capabilities ?? {
            tools: { listChanged: true },
            resources: { subscribe: true, listChanged: true },
            prompts: { listChanged: false },
            logging: {},
        };
        this.viewer = opts.viewer ?? new ViewerManager((id) => (id ? this.registry.get(id) : null));
        // Selection changes ripple out as resource updates so subscribed agents
        // see live picks without polling.
        this.viewer.onSelection((_sel, model) => {
            const uri = model
                ? `ifc-lite://model/${model.id}/viewer/selection`
                : 'ifc-lite://viewer/selection';
            this.notifyResourceUpdated(uri);
            this.notifyResourceUpdated('ifc-lite://viewer/selection');
        });
    }
    /** Attach an outgoing-message sink. Required before handling messages. */
    attach(sink) {
        this.sink = sink;
    }
    detach() {
        this.sink = null;
        this.active.forEach((c) => c.abort());
        this.active.clear();
        // Close the viewer sockets, layer Y.Docs and native Room plates even if
        // an earlier resource fails. SSE reconnects do not call detach.
        disposeSessionResources(this.viewer, this.registry, this.sessionId, this.logger);
    }
    /** Update the auth scope mid-session (e.g. token refresh). */
    setScope(scope) {
        this.scope = scope;
    }
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
    async maybeAutoOpenViewer(overrides) {
        const autoOpen = overrides?.autoOpen ?? this.config.autoOpenViewer ?? false;
        if (!autoOpen)
            return null;
        const model = this.registry.list()[0];
        if (!model)
            return null;
        const port = overrides?.port ?? this.config.viewerPort ?? 0;
        const state = await this.viewer.open(model, port);
        const adapters = this.viewer.adapters();
        if (adapters)
            model.backend.attachStreamingAdapters(adapters.viewer, adapters.visibility);
        return state;
    }
    isInitialized() {
        return this.initialized;
    }
    /**
     * Process a single inbound JSON-RPC message. Returns the response (if any)
     * or null for notifications. Side-effect notifications (progress, log) flow
     * through the attached sink, not the return value.
     */
    async handleMessage(message) {
        if (isJsonRpcRequest(message)) {
            return this.handleRequest(message);
        }
        if (isJsonRpcNotification(message)) {
            await this.handleNotification(message);
            return null;
        }
        // Responses to server-initiated requests would land here; v0.1 has no
        // server-initiated requests so we just drop them.
        return null;
    }
    // ────────────────────────────────────────────────────────────────────────
    // Request dispatch
    // ────────────────────────────────────────────────────────────────────────
    async handleRequest(req) {
        try {
            // initialize/ping always allowed regardless of init state.
            if (req.method === 'initialize') {
                return successResponse(req.id, this.handleInitialize(req.params));
            }
            if (req.method === 'ping') {
                return successResponse(req.id, {});
            }
            if (!this.initialized) {
                return errorResponse(req.id, JsonRpcErrorCode.ServerNotInitialized, 'Server not initialized — send `initialize` first');
            }
            switch (req.method) {
                case 'tools/list':
                    return successResponse(req.id, this.handleListTools());
                case 'tools/call':
                    return successResponse(req.id, await this.handleCallTool(req));
                case 'resources/list':
                    return successResponse(req.id, await this.handleListResources());
                case 'resources/read':
                    return successResponse(req.id, await this.handleReadResource(req.params));
                case 'resources/subscribe':
                    this.subscriptions.add(req.params.uri);
                    return successResponse(req.id, {});
                case 'resources/unsubscribe':
                    this.subscriptions.delete(req.params.uri);
                    return successResponse(req.id, {});
                case 'prompts/list':
                    return successResponse(req.id, this.handleListPrompts());
                case 'prompts/get':
                    return successResponse(req.id, await this.handleGetPrompt(req.params));
                default:
                    return errorResponse(req.id, JsonRpcErrorCode.MethodNotFound, `Unknown method: ${req.method}`);
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.log('error', `Request ${req.method} failed`, { error: message });
            return errorResponse(req.id, JsonRpcErrorCode.InternalError, message);
        }
    }
    async handleNotification(note) {
        switch (note.method) {
            case 'notifications/initialized':
                // Some clients send this AFTER `initialize`. Already initialized in the
                // success path; this notification is just a confirmation.
                this.initialized = true;
                return;
            case 'notifications/cancelled': {
                const params = note.params;
                if (params?.requestId !== undefined) {
                    const ctl = this.active.get(params.requestId);
                    if (ctl) {
                        ctl.abort();
                        this.active.delete(params.requestId);
                        this.logger.log('info', `Cancelled request ${params.requestId}`, { reason: params.reason });
                    }
                }
                return;
            }
            default:
                this.logger.log('debug', `Ignored notification ${note.method}`);
        }
    }
    // ────────────────────────────────────────────────────────────────────────
    // initialize
    // ────────────────────────────────────────────────────────────────────────
    handleInitialize(params) {
        this.initialized = true;
        // Per MCP spec: when the client requests a protocol version we support,
        // echo it back; otherwise reply with our preferred version. Newer
        // clients (e.g. Claude Desktop ≥ 0.x asking for 2025-11-25) hard-close
        // the transport on a version mismatch, so silently downgrading them
        // would brick the integration. Our wire surface is the stable subset
        // (initialize, tools/{list,call}, resources/*, prompts/*, notifications/*,
        // logging) that's been compatible across these revisions, so accepting
        // them is safe.
        const negotiated = SUPPORTED_PROTOCOL_VERSIONS.has(params.protocolVersion)
            ? params.protocolVersion
            : PROTOCOL_VERSION;
        this.logger.log('info', 'initialize', {
            client: params.clientInfo,
            protocol: params.protocolVersion,
            negotiated,
        });
        return {
            protocolVersion: negotiated,
            capabilities: this.capabilities,
            serverInfo: { name: this.name, version: this.version },
            instructions: SERVER_INSTRUCTIONS,
        };
    }
    // ────────────────────────────────────────────────────────────────────────
    // tools/*
    // ────────────────────────────────────────────────────────────────────────
    handleListTools() {
        const visible = this.tools.list().filter((t) => scopeAllows(this.scope, t.scope));
        if (this.config.readOnly) {
            // belt-and-suspenders: even if a token claims `mutate`, hide mutation
            // tools when the server was started --read-only.
            const tools = visible
                .filter((t) => t.scope !== 'mutate')
                .map(toToolDefinition);
            return { tools };
        }
        const tools = visible.map(toToolDefinition);
        return { tools };
    }
    async handleCallTool(req) {
        const params = req.params;
        const tool = this.tools.get(params.name);
        if (!tool) {
            return toolError({
                code: ToolErrorCode.UNSUPPORTED_OPERATION,
                message: `Unknown tool: ${params.name}`,
                hint: 'Use `tools/list` to discover available tools.',
            });
        }
        if (!scopeAllows(this.scope, tool.scope)) {
            return toolError({
                code: ToolErrorCode.PERMISSION_DENIED,
                message: `Tool '${params.name}' requires scope '${tool.scope}'`,
                details: { required: tool.scope, granted: this.scope.scopes },
            });
        }
        if (this.config.readOnly && tool.scope === 'mutate') {
            return toolError({
                code: ToolErrorCode.READ_ONLY,
                message: `Server started in read-only mode; '${params.name}' rejected.`,
            });
        }
        const validation = validateInput(tool.inputSchema, params.arguments ?? {});
        if (!validation.valid) {
            return toolError({
                code: ToolErrorCode.INVALID_INPUT,
                message: `Input validation failed for ${params.name}`,
                details: { errors: validation.errors },
                hint: 'Inspect `details.errors` for the offending field paths.',
            });
        }
        const ctl = new AbortController();
        this.active.set(req.id, ctl);
        const progressToken = params._meta?.progressToken;
        const progress = this.makeProgress(progressToken);
        const ctx = {
            registry: this.registry,
            scope: this.scope,
            currentScope: () => this.scope,
            progress,
            log: this.logger,
            signal: ctl.signal,
            config: this.config,
            // Read at call time — `setScope` may refresh the principal mid-session.
            session: { id: this.sessionId, principal: this.scope.user },
            viewer: this.viewer,
        };
        const startedAt = Date.now();
        try {
            const result = await tool.handler(validation.value, ctx);
            this.logger.log('info', `tools/call ${params.name}`, {
                latencyMs: Date.now() - startedAt,
                isError: result.isError === true,
            });
            return result;
        }
        catch (err) {
            this.logger.log('error', `tools/call ${params.name} threw`, {
                error: err instanceof Error ? err.message : String(err),
            });
            if (err instanceof ToolExecutionError)
                return withScanHint(err, ctx, validation.value.model_id).toToolResult();
            return toolError({
                code: ToolErrorCode.INTERNAL_ERROR,
                message: err instanceof Error ? err.message : String(err),
            });
        }
        finally {
            this.active.delete(req.id);
        }
    }
    // ────────────────────────────────────────────────────────────────────────
    // resources/*
    // ────────────────────────────────────────────────────────────────────────
    async handleListResources() {
        const ctx = this.makeResourceContext();
        const resources = await this.resources.list(ctx);
        return { resources };
    }
    async handleReadResource(params) {
        const provider = this.resources.matchProvider(params.uri);
        if (!provider) {
            throw new ToolExecutionError({
                code: ToolErrorCode.UNSUPPORTED_OPERATION,
                message: `No resource provider matches URI: ${params.uri}`,
            });
        }
        const ctx = this.makeResourceContext();
        const contents = await provider.read(params.uri, ctx);
        return { contents };
    }
    // ────────────────────────────────────────────────────────────────────────
    // prompts/*
    // ────────────────────────────────────────────────────────────────────────
    handleListPrompts() {
        return { prompts: this.prompts.list() };
    }
    async handleGetPrompt(params) {
        const prompt = this.prompts.get(params.name);
        if (!prompt) {
            throw new ToolExecutionError({
                code: ToolErrorCode.UNSUPPORTED_OPERATION,
                message: `Unknown prompt: ${params.name}`,
            });
        }
        const ctx = this.makeResourceContext();
        return prompt.render(params.arguments ?? {}, ctx);
    }
    // ────────────────────────────────────────────────────────────────────────
    // helpers
    // ────────────────────────────────────────────────────────────────────────
    makeResourceContext() {
        return {
            registry: this.registry,
            scope: this.scope,
            currentScope: () => this.scope,
            progress: { report() { } },
            log: this.logger,
            signal: new AbortController().signal,
            config: this.config,
            session: { id: this.sessionId, principal: this.scope.user },
            viewer: this.viewer,
        };
    }
    makeProgress(token) {
        if (token === undefined || !this.sink) {
            return { report() { } };
        }
        const sink = this.sink;
        return {
            report: (progress, message, total) => {
                const note = { progressToken: token, progress };
                if (total !== undefined)
                    note.total = total;
                if (message !== undefined)
                    note.message = message;
                void sink.send(notification('notifications/progress', note));
            },
        };
    }
    /** Broadcast a `notifications/resources/updated` to subscribers. */
    notifyResourceUpdated(uri) {
        if (!this.sink)
            return;
        if (!this.subscriptions.has(uri))
            return;
        void this.sink.send(notification('notifications/resources/updated', { uri }));
    }
    /** Notify clients that the tool list has changed (e.g., after model load). */
    notifyToolsChanged() {
        if (!this.sink)
            return;
        void this.sink.send(notification('notifications/tools/list_changed', {}));
    }
    /** Read-only access to the auth scope for transports that need to gate access. */
    hasModelAccess(modelId) {
        return modelAllowed(this.scope, modelId);
    }
}
function toToolDefinition(tool) {
    return {
        name: tool.name,
        description: tool.description,
        inputSchema: advertisedInputSchema(tool.inputSchema),
        scope: tool.scope,
    };
}
const SERVER_INSTRUCTIONS = `
ifc-lite-mcp exposes a federated set of IFC/BIM models as MCP tools.

Conventions:
  • All tools accept an optional model_id; when only one model is loaded it can be omitted.
  • Errors surface as tool results with isError=true and structuredContent.code (e.g. ENTITY_NOT_FOUND).
  • Long operations stream progress via notifications/progress when a progressToken is supplied.
  • Mutations are queued; call export_ifc or model_save to persist.

See the resource ifc-lite://server/manifest for the full tool catalog.
`.trim();
//# sourceMappingURL=server.js.map