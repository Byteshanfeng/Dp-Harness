/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/**
 * JSON-RPC 2.0 helpers used by every MCP transport.
 */
import { JSONRPC_VERSION, } from './types.js';
export function isJsonRpcRequest(msg) {
    if (!msg || typeof msg !== 'object')
        return false;
    const m = msg;
    return m.jsonrpc === JSONRPC_VERSION
        && typeof m.method === 'string'
        && m.id !== undefined;
}
export function isJsonRpcNotification(msg) {
    if (!msg || typeof msg !== 'object')
        return false;
    const m = msg;
    return m.jsonrpc === JSONRPC_VERSION
        && typeof m.method === 'string'
        && m.id === undefined;
}
export function isJsonRpcResponse(msg) {
    if (!msg || typeof msg !== 'object')
        return false;
    const m = msg;
    if (m.jsonrpc !== JSONRPC_VERSION)
        return false;
    return 'result' in m || 'error' in m;
}
export function successResponse(id, result) {
    return { jsonrpc: JSONRPC_VERSION, id, result };
}
export function errorResponse(id, code, message, data) {
    const err = { code, message };
    if (data !== undefined)
        err.data = data;
    return { jsonrpc: JSONRPC_VERSION, id, error: err };
}
export function notification(method, params) {
    const note = { jsonrpc: JSONRPC_VERSION, method };
    if (params !== undefined)
        note.params = params;
    return note;
}
export function parseMessage(text) {
    try {
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object')
            return null;
        if (parsed.jsonrpc !== JSONRPC_VERSION)
            return null;
        return parsed;
    }
    catch {
        // Caller decides how to surface parse errors — most transports send
        // back a JSON-RPC ParseError response with id=null.
        return null;
    }
}
//# sourceMappingURL=jsonrpc.js.map