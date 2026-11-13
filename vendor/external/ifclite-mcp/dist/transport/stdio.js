/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { errorResponse, parseMessage } from '../protocol/jsonrpc.js';
import { JsonRpcErrorCode } from '../protocol/index.js';
import { routeConsoleToStderr } from './stdio-console.js';
export class StdioTransport {
    stdin;
    stdout;
    stderr;
    buffer = '';
    server = null;
    closed = false;
    constructor(opts = {}) {
        this.stdin = opts.stdin ?? process.stdin;
        this.stdout = opts.stdout ?? process.stdout;
        this.stderr = opts.stderr ?? process.stderr;
    }
    async connect(server) {
        this.server = server;
        // stdout is the JSON-RPC channel: nothing that logs may reach it.
        if (this.stdout === process.stdout)
            routeConsoleToStderr();
        server.attach(this.makeSink());
        // UTF-8 — MCP spec mandates it.
        this.stdin.setEncoding('utf8');
        this.stdin.on('data', (chunk) => this.onData(chunk));
        this.stdin.on('end', () => this.close());
        this.stdin.on('error', (err) => {
            this.stderr.write(`[ifc-lite-mcp] stdin error: ${err.message}\n`);
            this.close();
        });
    }
    close() {
        if (this.closed)
            return;
        this.closed = true;
        this.server?.detach();
        this.server = null;
    }
    makeSink() {
        return {
            send: (message) => {
                if (this.closed)
                    return;
                try {
                    const line = JSON.stringify(message) + '\n';
                    this.stdout.write(line);
                }
                catch (err) {
                    this.stderr.write(`[ifc-lite-mcp] failed to serialize outgoing message: ${err.message}\n`);
                }
            },
        };
    }
    async onData(chunk) {
        this.buffer += chunk;
        let newline = this.buffer.indexOf('\n');
        while (newline !== -1) {
            const line = this.buffer.slice(0, newline).trim();
            this.buffer = this.buffer.slice(newline + 1);
            if (line.length > 0) {
                await this.handleLine(line);
            }
            newline = this.buffer.indexOf('\n');
        }
    }
    async handleLine(line) {
        if (!this.server)
            return;
        const parsed = parseMessage(line);
        if (!parsed) {
            // Send a Parse Error with id=null per JSON-RPC 2.0 spec.
            const sink = this.makeSink();
            void sink.send(errorResponse(null, JsonRpcErrorCode.ParseError, 'Failed to parse JSON-RPC message'));
            return;
        }
        try {
            const response = await this.server.handleMessage(parsed);
            if (response) {
                const sink = this.makeSink();
                void sink.send(response);
            }
        }
        catch (err) {
            this.stderr.write(`[ifc-lite-mcp] handler error: ${err.message}\n`);
        }
    }
}
//# sourceMappingURL=stdio.js.map