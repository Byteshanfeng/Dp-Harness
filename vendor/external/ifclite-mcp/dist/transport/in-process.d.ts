/**
 * In-process transport — for hosts that already manage the BIM context
 * (e.g., the Tauri desktop app or unit tests). The "client" is just another
 * object in the same process that pushes JSON-RPC messages and listens for
 * outgoing ones.
 *
 * Useful for:
 *   - Unit tests (drive the server with hand-crafted messages, assert results)
 *   - Embedded LLM hosts that pipe their own MCP-aware client into the server
 */
import { JsonRpcMessage } from '../protocol/index.js';
import { MCPServer } from '../server.js';
export type IncomingHandler = (message: JsonRpcMessage) => void;
export declare class InProcessTransport {
    private server;
    private listeners;
    connect(server: MCPServer): Promise<void>;
    /** Client → server. Returns the response (if any) for convenience. */
    send(message: JsonRpcMessage): Promise<JsonRpcMessage | null>;
    /** Subscribe to messages emitted by the server (responses + notifications). */
    onMessage(handler: IncomingHandler): () => void;
    close(): void;
    private makeSink;
}
//# sourceMappingURL=in-process.d.ts.map