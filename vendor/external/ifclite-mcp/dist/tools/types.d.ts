import type { CallToolResult, JsonSchema, ToolScope } from '../protocol/index.js';
import type { ToolContext } from '../context.js';
export interface Tool {
    name: string;
    description: string;
    inputSchema: JsonSchema;
    scope?: ToolScope;
    handler(input: Record<string, unknown>, ctx: ToolContext): Promise<CallToolResult> | CallToolResult;
}
export declare class ToolRegistry {
    private tools;
    register(tool: Tool): void;
    registerAll(tools: Tool[]): void;
    get(name: string): Tool | null;
    list(): Tool[];
    has(name: string): boolean;
}
//# sourceMappingURL=types.d.ts.map