/**
 * stdio transport — newline-delimited JSON-RPC over stdin/stdout.
 *
 * This is the transport every MCP client uses when launching the server as a
 * subprocess (Claude Desktop, Cursor, Goose, etc.). The framing rule is
 * simple: one JSON message per line on stdout; one per line read on stdin.
 *
 * We avoid Buffer string concatenation cost by buffering a single Buffer and
 * scanning for `\n` boundaries. Anything written to stderr is reserved for
 * server logs so the client's stdout reader doesn't choke on it.
 */
import { Readable, Writable } from 'node:stream';
import { MCPServer } from '../server.js';
export interface StdioTransportOptions {
    stdin?: Readable;
    stdout?: Writable;
    stderr?: Writable;
}
export declare class StdioTransport {
    private stdin;
    private stdout;
    private stderr;
    private buffer;
    private server;
    private closed;
    constructor(opts?: StdioTransportOptions);
    connect(server: MCPServer): Promise<void>;
    close(): void;
    private makeSink;
    private onData;
    private handleLine;
}
//# sourceMappingURL=stdio.d.ts.map