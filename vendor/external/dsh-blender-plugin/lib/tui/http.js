import { isRecord } from '../contracts/dynamic.js';
const HTTP_TIMEOUT_MS = 1500;
export function base(port) {
    return 'http://127.0.0.1:' + String(port);
}
export function withTimeout(ms, outer) {
    const own = AbortSignal.timeout(ms);
    return outer && typeof AbortSignal.any === 'function' ? AbortSignal.any([own, outer]) : own;
}
export async function getJson(port, path, signal, timeoutMs = HTTP_TIMEOUT_MS) {
    try {
        const r = await fetch(base(port) + path, {
            cache: 'no-store',
            signal: withTimeout(timeoutMs, signal),
        });
        const body = await r.json();
        return isRecord(body) ? body : null;
    }
    catch {
        return null;
    }
}
export async function postJson(port, path, body) {
    try {
        const r = await fetch(base(port) + path, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
            signal: withTimeout(HTTP_TIMEOUT_MS),
        });
        const parsed = await r.json();
        return isRecord(parsed) ? parsed : null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=http.js.map