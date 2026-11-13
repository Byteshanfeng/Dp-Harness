/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/**
 * Model Context Protocol (MCP) wire types.
 *
 * Implements the subset of MCP 2025-11 we need. JSON-RPC 2.0 envelopes,
 * tool/resource/prompt shapes, progress notifications, and the cancellation
 * helpers. We deliberately avoid `any` and keep the types narrow so the
 * tool implementations get strong type-checking out of the box.
 */
export const PROTOCOL_VERSION = '2025-11-05';
/**
 * Protocol versions we are willing to negotiate. The server's wire surface
 * (initialize, tools/{list,call}, resources/*, prompts/*, notifications/*,
 * logging) has been backwards-compatible across these spec revisions, so we
 * accept any of them and echo the requested version back during initialize.
 * Unrecognized versions get downgraded to PROTOCOL_VERSION instead.
 */
export const SUPPORTED_PROTOCOL_VERSIONS = new Set([
    '2025-03-26',
    '2025-06-18',
    '2025-11-05',
    '2025-11-25',
]);
export const JSONRPC_VERSION = '2.0';
export const JsonRpcErrorCode = {
    ParseError: -32700,
    InvalidRequest: -32600,
    MethodNotFound: -32601,
    InvalidParams: -32602,
    InternalError: -32603,
    // MCP-defined extension range starts at -32000.
    ServerNotInitialized: -32002,
    RequestCancelled: -32800,
};
//# sourceMappingURL=types.js.map