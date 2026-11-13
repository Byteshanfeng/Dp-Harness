/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/**
 * Strict scope identity check used when reusing an HTTP session — both the
 * permission set and any narrowing (model_ids, user, session) must match
 * what the session was created with. We sort the scopes set so callers
 * that pass them in different orders still compare equal.
 */
export function sameScope(a, b) {
    if (a === b)
        return true;
    if (a.user !== b.user || a.session !== b.session)
        return false;
    const as = [...a.scopes].sort();
    const bs = [...b.scopes].sort();
    if (as.length !== bs.length || as.some((s, i) => s !== bs[i]))
        return false;
    const am = a.modelIds ? [...a.modelIds].sort() : undefined;
    const bm = b.modelIds ? [...b.modelIds].sort() : undefined;
    if ((am?.length ?? 0) !== (bm?.length ?? 0))
        return false;
    if (am && bm && am.some((m, i) => m !== bm[i]))
        return false;
    return true;
}
/**
 * Reflect CORS headers ONLY when the request carries an Origin we explicitly
 * allow. We never emit a wildcard `Access-Control-Allow-Origin` — that would
 * let any web page read JSON-RPC responses cross-origin. When `origin` is not
 * allowlisted we emit no CORS headers, so the browser blocks the response.
 */
export function setCors(res, origin, allowed) {
    if (!origin || !allowed.has(origin))
        return;
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id');
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');
}
/**
 * Extract the host name from a `Host` header, stripping the port. Handles the
 * bracketed IPv6 literal form (`[::1]:8765` -> `::1`).
 */
export function parseHostHeader(raw) {
    if (!raw)
        return undefined;
    const value = raw.trim();
    if (value.startsWith('[')) {
        const end = value.indexOf(']');
        return end > 0 ? value.slice(1, end) : value;
    }
    return value.split(':')[0];
}
/**
 * Refuse limits that would silently disable the policy: with `NaN` every
 * comparison is false, so `maxSessions: NaN` never caps and `sessionIdleMs: NaN`
 * lets a session be reclaimed at once.
 */
export function assertSessionLimits(opts) {
    const { maxSessions, sessionIdleMs } = opts;
    if (maxSessions !== undefined && !(Number.isInteger(maxSessions) && maxSessions >= 1)) {
        throw new RangeError(`maxSessions must be an integer >= 1, got ${String(maxSessions)}`);
    }
    if (sessionIdleMs !== undefined && !(Number.isFinite(sessionIdleMs) && sessionIdleMs >= 0)) {
        throw new RangeError(`sessionIdleMs must be a finite number >= 0, got ${String(sessionIdleMs)}`);
    }
}
export const DEFAULT_MAX_SESSIONS = 1000;
export const DEFAULT_SESSION_IDLE_MS = 30 * 60_000;
/**
 * Pick up to `need` sessions that are safe to end, oldest `lastSeen` first.
 * Safe means all four hold: no open SSE stream, no request in flight, inactive
 * for at least `idleMs`, and no unpublished layer drafts. Ending a session
 * destroys its drafts and they cannot be recovered, so one that holds any is
 * never a candidate. Single O(n) scan; allocates only for sessions that qualify.
 */
export function pickReclaimable(sessions, idleMs, need, draftCount, now = Date.now()) {
    if (need <= 0)
        return [];
    const safe = [];
    for (const [id, s] of sessions) {
        if (s.sseClients.size > 0)
            continue;
        if (s.inFlight > 0)
            continue;
        if (now - s.lastSeen < idleMs)
            continue;
        if (draftCount(id) > 0)
            continue;
        safe.push({ id, lastSeen: s.lastSeen });
    }
    safe.sort((x, y) => x.lastSeen - y.lastSeen);
    return safe.slice(0, need).map((c) => c.id);
}
/** 503 for an `initialize` at the session limit when no session can be ended safely. */
export function sendSessionCapacity(res) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        error: 'session-capacity',
        message: 'The server is at its session limit and no session can be ended safely: every one is recently active, has a request in flight or an open event stream, or holds unpublished layer drafts. No session was ended. End a session you no longer need with DELETE, or retry later.',
    }));
}
/** 404 for a session id we do not hold; tells the client why it may be gone and what to do. */
export function sendUnknownSession(res) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        error: 'unknown-session',
        message: 'Unknown session. It was ended with DELETE, or the server ended it after it sat idle, holding no unpublished layer drafts, while the server was at its session limit. Send initialize without Mcp-Session-Id to start a new session.',
    }));
}
export function writeSse(res, message) {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
}
/** Reads the request body; `holder` counts as busy while the upload runs and active when it ends, however it ends. */
export async function readBody(req, max, holder) {
    if (holder)
        holder.inFlight++;
    try {
        return await readBodyChunks(req, max);
    }
    finally {
        if (holder) {
            holder.inFlight--;
            holder.lastSeen = Date.now();
        }
    }
}
function readBodyChunks(req, max) {
    return new Promise((resolve, reject) => {
        let total = 0;
        const chunks = [];
        req.on('data', (chunk) => {
            total += chunk.length;
            if (total > max) {
                reject(new Error('Request body too large'));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        req.on('error', reject);
    });
}
//# sourceMappingURL=http-helpers.js.map