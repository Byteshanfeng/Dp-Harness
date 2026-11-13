/** Request-level helpers for the Streamable HTTP transport (`http.ts`). */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AuthScope } from '../auth/scope.js';
/**
 * Strict scope identity check used when reusing an HTTP session — both the
 * permission set and any narrowing (model_ids, user, session) must match
 * what the session was created with. We sort the scopes set so callers
 * that pass them in different orders still compare equal.
 */
export declare function sameScope(a: AuthScope, b: AuthScope): boolean;
/**
 * Reflect CORS headers ONLY when the request carries an Origin we explicitly
 * allow. We never emit a wildcard `Access-Control-Allow-Origin` — that would
 * let any web page read JSON-RPC responses cross-origin. When `origin` is not
 * allowlisted we emit no CORS headers, so the browser blocks the response.
 */
export declare function setCors(res: ServerResponse, origin: string | undefined, allowed: Set<string>): void;
/**
 * Extract the host name from a `Host` header, stripping the port. Handles the
 * bracketed IPv6 literal form (`[::1]:8765` -> `::1`).
 */
export declare function parseHostHeader(raw: string | undefined): string | undefined;
export interface SessionCapacityOptions {
    /**
     * Most concurrent sessions, counting sessions whose `sessionFactory.build`
     * is still pending. `initialize` is the only request that creates one and
     * nothing but a `DELETE` removed it, so a client that never ends its
     * sessions (or a loop of `initialize` calls) grew the map, and the
     * per-session `MCPServer` and layer workspace behind it, without limit. At
     * the cap one reclaimable session (see `sessionIdleMs`) is ended to make
     * room; if there is none the new `initialize` is refused with 503
     * `session-capacity`. Default 1000, the session allowance the cloud and
     * Autodesk services in this repo already use.
     */
    maxSessions?: number;
    /**
     * How long a session must have been inactive before it may be reclaimed to
     * make room at `maxSessions`. Reclaiming happens only under that pressure,
     * never on a timer, and only for a session that also holds no unpublished
     * layer drafts, has no request in flight and has no open SSE stream. The
     * clock restarts when a request settles and when a stream closes. A session
     * holding drafts is never ended for another client, however long it has
     * been inactive: only its owner's `DELETE` (or `close()`) disposes drafts.
     * Default 30 minutes, the idle window those same services use.
     */
    sessionIdleMs?: number;
}
/**
 * Refuse limits that would silently disable the policy: with `NaN` every
 * comparison is false, so `maxSessions: NaN` never caps and `sessionIdleMs: NaN`
 * lets a session be reclaimed at once.
 */
export declare function assertSessionLimits(opts: SessionCapacityOptions): void;
export declare const DEFAULT_MAX_SESSIONS = 1000;
export declare const DEFAULT_SESSION_IDLE_MS: number;
/**
 * The structural slice of `http.ts`'s `Session` the reclaim policy reads.
 */
export interface ReclaimableSession {
    sseClients: {
        size: number;
    };
    /** Requests currently being handled. */
    inFlight: number;
    lastSeen: number;
}
/**
 * Pick up to `need` sessions that are safe to end, oldest `lastSeen` first.
 * Safe means all four hold: no open SSE stream, no request in flight, inactive
 * for at least `idleMs`, and no unpublished layer drafts. Ending a session
 * destroys its drafts and they cannot be recovered, so one that holds any is
 * never a candidate. Single O(n) scan; allocates only for sessions that qualify.
 */
export declare function pickReclaimable(sessions: ReadonlyMap<string, ReclaimableSession>, idleMs: number, need: number, draftCount: (id: string) => number, now?: number): string[];
/** 503 for an `initialize` at the session limit when no session can be ended safely. */
export declare function sendSessionCapacity(res: ServerResponse): void;
/** 404 for a session id we do not hold; tells the client why it may be gone and what to do. */
export declare function sendUnknownSession(res: ServerResponse): void;
export declare function writeSse(res: ServerResponse, message: unknown): void;
/** Reads the request body; `holder` counts as busy while the upload runs and active when it ends, however it ends. */
export declare function readBody(req: IncomingMessage, max: number, holder?: {
    inFlight: number;
    lastSeen: number;
}): Promise<string>;
//# sourceMappingURL=http-helpers.d.ts.map