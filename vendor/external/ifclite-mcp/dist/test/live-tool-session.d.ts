import { InMemoryModelRegistry } from '../context.js';
import { InProcessTransport } from '../transport/in-process.js';
import type { CallToolResult } from '../protocol/index.js';
export declare function liveToolSession(count: number, readOnly?: boolean): Promise<{
    registry: InMemoryModelRegistry;
    transport: InProcessTransport;
    call(name: string, args: Record<string, unknown>): Promise<CallToolResult>;
}>;
//# sourceMappingURL=live-tool-session.d.ts.map