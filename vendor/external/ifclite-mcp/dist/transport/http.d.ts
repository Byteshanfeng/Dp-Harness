/**
 * Streamable HTTP transport (MCP 2025-11).
 *
 * Single endpoint behaviour:
 *   - POST  /          → submit a JSON-RPC request, return a JSON response
 *                        OR upgrade to SSE for long-running ops with progress.
 *   - GET   /          → open an SSE channel for server-initiated events.
 *   - DELETE /         → end the session.
 *
 * Stateless workers identify the session with the `Mcp-Session-Id` header,
 * assigned on first `initialize`. We keep a per-session `MCPServer` instance
 * here in v0.1 (process-local), with hooks to swap in a Redis-backed cache
 * for horizontally scaled deployments.
 *
 * Auth is intentionally pluggable via the `authenticator` option — the spec
 * says callers must support both bearer tokens and OAuth 2.1; this layer
 * just hands the request to whatever the deployer registers.
 */
import { IncomingMessage } from 'node:http';
import { MCPServer } from '../server.js';
import { AuthScope } from '../auth/scope.js';
import { type SessionCapacityOptions } from './http-helpers.js';
export interface HttpAuthenticator {
    /**
     * Called for every inbound request. Returns the auth scope for the caller,
     * or null/undefined if the request must be rejected with 401.
     */
    authenticate(req: IncomingMessage): Promise<AuthScope | null> | AuthScope | null;
}
export interface SessionFactory {
    /**
     * Build a fresh MCPServer for this session. Called on `initialize`.
     *
     * The server MUST be constructed with `sessionId` (i.e.
     * `createMCPServer({ ..., sessionId })`): it keys per-session state —
     * the layer workspace in particular (#1030) — and its disposal on
     * session end. The transport rejects servers built without it rather
     * than letting every HTTP session silently share the local workspace.
     */
    build(scope: AuthScope, sessionId: string): Promise<MCPServer> | MCPServer;
}
export interface HttpTransportOptions extends SessionCapacityOptions {
    port: number;
    host?: string;
    authenticator: HttpAuthenticator;
    sessionFactory: SessionFactory;
    /** Maximum request body bytes. */
    maxBodyBytes?: number;
    /**
     * Browser Origins allowed to read JSON-RPC responses cross-origin. Empty /
     * undefined (the default) means NO browser cross-origin access — a page the
     * user visits cannot read responses or invoke tools. Operators who genuinely
     * need browser access opt in explicitly (CLI `--allow-origin`).
     */
    allowedOrigins?: string[];
}
export declare class HttpTransport {
    private server;
    private sessions;
    /** Sessions whose factory call is in flight: not yet in `sessions`, but already spoken for. */
    private building;
    private opts;
    /** Browser Origins permitted to read responses (empty = none). */
    private allowedOrigins;
    /** Host header values accepted, to defeat DNS rebinding. */
    private allowedHosts;
    /**
     * Whether to enforce the Host allowlist. DNS-rebinding is a loopback-bind
     * concern; a deliberate public bind (`--host 0.0.0.0`/`::`, gated by
     * `--token`/`--insecure`) is reached via arbitrary hostnames/IPs we cannot
     * enumerate, so enforcing the allowlist there would 421 every real client.
     */
    private enforceHostCheck;
    constructor(opts: HttpTransportOptions);
    listen(): Promise<void>;
    /** Actual bound port — differs from `opts.port` when listening on 0. */
    port(): number | undefined;
    close(): Promise<void>;
    private handle;
    /** Run one message; the session counts as busy until it settles, and active when it does. */
    private dispatch;
    private openSse;
    /** An open stream keeps its session from being reclaimed; idle time starts when it closes. */
    private trackSse;
    /**
     * Whether a new session fits. Live sessions and pending builds both count.
     * At the cap, only a session that is safe to end (see `pickReclaimable`)
     * makes room; with none, the answer is no and nothing is ended.
     */
    private makeRoomForSession;
    private endSession;
    private makeSinkFor;
}
export declare class BearerTokenAuth implements HttpAuthenticator {
    private tokens;
    constructor(tokens: Map<string, AuthScope>);
    authenticate(req: IncomingMessage): AuthScope | null;
}
/** Permissive authenticator for local dev — ALL requests get full scope. */
export declare class AllowAllAuth implements HttpAuthenticator {
    private scope;
    constructor(scope: AuthScope);
    authenticate(): AuthScope;
}
//# sourceMappingURL=http.d.ts.map