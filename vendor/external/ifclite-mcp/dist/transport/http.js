/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
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
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { errorResponse, parseMessage } from '../protocol/jsonrpc.js';
import { JsonRpcErrorCode } from '../protocol/index.js';
import { draftCount } from '../tools/layer-store.js';
import { assertSessionLimits, parseHostHeader, pickReclaimable, readBody, sameScope, sendSessionCapacity, sendUnknownSession, writeSse, setCors, DEFAULT_MAX_SESSIONS, DEFAULT_SESSION_IDLE_MS } from './http-helpers.js';
export class HttpTransport {
    server;
    sessions = new Map();
    /** Sessions whose factory call is in flight: not yet in `sessions`, but already spoken for. */
    building = 0;
    opts;
    /** Browser Origins permitted to read responses (empty = none). */
    allowedOrigins;
    /** Host header values accepted, to defeat DNS rebinding. */
    allowedHosts;
    /**
     * Whether to enforce the Host allowlist. DNS-rebinding is a loopback-bind
     * concern; a deliberate public bind (`--host 0.0.0.0`/`::`, gated by
     * `--token`/`--insecure`) is reached via arbitrary hostnames/IPs we cannot
     * enumerate, so enforcing the allowlist there would 421 every real client.
     */
    enforceHostCheck;
    constructor(opts) {
        assertSessionLimits(opts);
        this.opts = opts;
        this.allowedOrigins = new Set(opts.allowedOrigins ?? []);
        // A wildcard bind has no single hostname to allowlist — real clients send
        // the machine IP / DNS name, never `0.0.0.0`/`::`.
        const isWildcardBind = opts.host === '0.0.0.0' || opts.host === '::' || opts.host === '';
        this.enforceHostCheck = !isWildcardBind;
        // Accept the configured bind host plus the loopback aliases that resolve
        // to it. A DNS-rebinding attacker controls a name pointing at 127.0.0.1,
        // so requests arrive with an unexpected Host header and are rejected.
        this.allowedHosts = new Set(['127.0.0.1', 'localhost', '::1', isWildcardBind ? undefined : opts.host].filter((h) => Boolean(h)));
        this.server = createServer((req, res) => {
            // Surface unhandled rejections via console.error rather than crashing
            // the process — one bad request must not take down the worker.
            this.handle(req, res).catch((err) => {
                // eslint-disable-next-line no-console
                console.error('[ifc-lite-mcp http] unhandled', err);
                if (!res.writableEnded) {
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            });
        });
    }
    listen() {
        return new Promise((resolve, reject) => {
            this.server.once('error', reject);
            this.server.listen(this.opts.port, this.opts.host ?? '0.0.0.0', () => resolve());
        });
    }
    /** Actual bound port — differs from `opts.port` when listening on 0. */
    port() {
        const addr = this.server.address();
        return typeof addr === 'object' && addr !== null ? addr.port : undefined;
    }
    close() {
        return new Promise((resolve) => {
            for (const session of this.sessions.values()) {
                for (const sseClient of session.sseClients)
                    sseClient.end();
                session.server.detach();
            }
            this.sessions.clear();
            this.server.close(() => resolve());
        });
    }
    async handle(req, res) {
        // DNS-rebinding defense: a malicious page can point a hostname it controls
        // at our loopback IP, but the browser still sends that hostname in Host.
        // Reject any Host that isn't the expected bind host / loopback alias.
        const host = parseHostHeader(req.headers.host);
        if (this.enforceHostCheck && host && !this.allowedHosts.has(host)) {
            res.statusCode = 421; // Misdirected Request
            res.end('Misdirected Request');
            return;
        }
        // Reflect CORS only for an explicitly allowlisted Origin — never `*` — so a
        // visited web page cannot read JSON-RPC responses or invoke tools by default.
        const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
        setCors(res, origin, this.allowedOrigins);
        if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
        }
        const scope = await this.opts.authenticator.authenticate(req);
        if (!scope) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'unauthorized' }));
            return;
        }
        const sessionId = req.headers['mcp-session-id']?.trim();
        if (req.method === 'GET') {
            // Open an SSE channel for an existing session. Same identity rule as
            // POST: a leaked Mcp-Session-Id must not let a differently-scoped
            // token attach to the victim's event stream.
            if (!sessionId) {
                res.statusCode = 400;
                res.end('Mcp-Session-Id required');
                return;
            }
            const session = this.sessions.get(sessionId);
            if (!session)
                return sendUnknownSession(res);
            if (!sameScope(session.scope, scope)) {
                res.statusCode = 403;
                res.end('session scope mismatch');
                return;
            }
            session.lastSeen = Date.now();
            this.openSse(session, res);
            return;
        }
        if (req.method === 'DELETE') {
            // Ending a session disposes its layer drafts — destructive, so the
            // caller must present the same scope identity the session was bound
            // to; a leaked session id alone must not destroy another principal's
            // unpublished work.
            if (sessionId) {
                const session = this.sessions.get(sessionId);
                if (session && !sameScope(session.scope, scope)) {
                    res.statusCode = 403;
                    res.end('session scope mismatch');
                    return;
                }
                this.endSession(sessionId);
            }
            res.statusCode = 204;
            res.end();
            return;
        }
        if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
        }
        // A POST still uploading its body counts as in flight for the session it
        // names (same scope only), so an `initialize` at the cap cannot reclaim it
        // between the headers and the last byte.
        const named = sessionId ? this.sessions.get(sessionId) : undefined;
        const body = await readBody(req, this.opts.maxBodyBytes ?? 32 * 1024 * 1024, named && sameScope(named.scope, scope) ? named : undefined);
        const message = parseMessage(body);
        if (!message) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(errorResponse(null, JsonRpcErrorCode.ParseError, 'Failed to parse JSON-RPC')));
            return;
        }
        let session;
        if (sessionId && this.sessions.has(sessionId)) {
            session = this.sessions.get(sessionId);
            // The session was bound to a specific scope/principal at initialize.
            // A leaked Mcp-Session-Id must NOT be reusable by a caller whose
            // current token has different (narrower OR wider) access — accepting
            // a wider token would silently downgrade and accepting a narrower
            // one would leak the original privileges. Require an exact scope
            // identity match and reject otherwise.
            if (!sameScope(session.scope, scope)) {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'session scope mismatch' }));
                return;
            }
            // After the identity check: a refused caller must not keep another
            // principal's session from ever looking idle.
            session.lastSeen = Date.now();
        }
        else {
            // A session id we do not hold (DELETEd, reclaimed at the cap, never issued)
            // is the spec's 404 for `initialize` too: re-initialize WITHOUT an id.
            if (sessionId)
                return sendUnknownSession(res);
            // Per spec, `initialize` is the only request allowed without a session;
            // the response carries the new Mcp-Session-Id.
            if (message.method !== 'initialize') {
                res.statusCode = 400;
                res.end('Mcp-Session-Id required');
                return;
            }
            if (!this.makeRoomForSession())
                return sendSessionCapacity(res);
            const newId = randomUUID();
            // The factory may await, so concurrent initializes would each pass the
            // capacity check above; count the ones still building.
            this.building++;
            let server;
            try {
                server = await this.opts.sessionFactory.build(scope, newId);
            }
            finally {
                this.building--;
            }
            // A factory that drops the session id would put every HTTP session
            // on the shared local layer workspace (cross-session reads/writes,
            // no disposal) — refuse the deployment bug instead of running unsafe.
            if (server.sessionId !== newId) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    error: 'sessionFactory must construct the MCPServer with the provided sessionId (createMCPServer({ sessionId }))',
                }));
                return;
            }
            session = { id: newId, server, scope, sseClients: new Set(), lastSeen: Date.now(), inFlight: 0 };
            session.server.attach(this.makeSinkFor(session));
            this.sessions.set(newId, session);
            res.setHeader('Mcp-Session-Id', newId);
        }
        const accept = (req.headers.accept ?? '').toLowerCase();
        if (accept.includes('text/event-stream')) {
            // SSE upgrade — used for long-running ops that need progress streaming.
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('Connection', 'keep-alive');
            // Keep the connection open until client closes; progress notifications
            // arrive via the session's sink. Tracked before the dispatch so a client
            // that leaves mid-call is still removed.
            this.trackSse(session, res);
            const response = await this.dispatch(session, message);
            if (response && !res.writableEnded)
                writeSse(res, response);
            return;
        }
        // Plain JSON response (the common case).
        const response = await this.dispatch(session, message);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(response ? JSON.stringify(response) : '{}');
    }
    /** Run one message; the session counts as busy until it settles, and active when it does. */
    async dispatch(session, message) {
        session.inFlight++;
        try {
            return await session.server.handleMessage(message);
        }
        finally {
            session.inFlight--;
            session.lastSeen = Date.now();
        }
    }
    openSse(session, res) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.write(': connected\n\n');
        this.trackSse(session, res);
        const ka = setInterval(() => res.write(': keepalive\n\n'), 15_000);
        res.on('close', () => clearInterval(ka));
    }
    /** An open stream keeps its session from being reclaimed; idle time starts when it closes. */
    trackSse(session, res) {
        session.sseClients.add(res);
        res.on('close', () => {
            session.sseClients.delete(res);
            session.lastSeen = Date.now();
        });
    }
    /**
     * Whether a new session fits. Live sessions and pending builds both count.
     * At the cap, only a session that is safe to end (see `pickReclaimable`)
     * makes room; with none, the answer is no and nothing is ended.
     */
    makeRoomForSession() {
        const max = this.opts.maxSessions ?? DEFAULT_MAX_SESSIONS;
        const need = this.sessions.size + this.building - max + 1;
        if (need <= 0)
            return true;
        const idleMs = this.opts.sessionIdleMs ?? DEFAULT_SESSION_IDLE_MS;
        for (const id of pickReclaimable(this.sessions, idleMs, need, draftCount))
            this.endSession(id);
        return this.sessions.size + this.building < max;
    }
    endSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        for (const sse of session.sseClients)
            sse.end();
        session.server.detach();
        this.sessions.delete(sessionId);
    }
    makeSinkFor(session) {
        return {
            send: (message) => {
                // Fan out notifications + responses to every active SSE client.
                for (const sse of session.sseClients) {
                    try {
                        writeSse(sse, message);
                    }
                    catch (err) {
                        console.error('[ifc-lite-mcp http] event stream write failed', err);
                    }
                }
            },
        };
    }
}
// ── Built-in authenticators ──────────────────────────────────────────────
export class BearerTokenAuth {
    tokens;
    constructor(tokens) {
        this.tokens = tokens;
    }
    authenticate(req) {
        const header = req.headers.authorization ?? '';
        const match = header.match(/^Bearer\s+(.+)$/i);
        if (!match)
            return null;
        return this.tokens.get(match[1]) ?? null;
    }
}
/** Permissive authenticator for local dev — ALL requests get full scope. */
export class AllowAllAuth {
    scope;
    constructor(scope) {
        this.scope = scope;
    }
    authenticate() { return this.scope; }
}
//# sourceMappingURL=http.js.map