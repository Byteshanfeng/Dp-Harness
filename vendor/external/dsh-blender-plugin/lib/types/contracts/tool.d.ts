import type { ToolDefinition } from '@deepseek-ai/dsh-tools';
import type zt from '@deepseek-ai/schemastery';
type DynamicToolSpec = Record<string, unknown>;
/**
 * Wrap one tool definition with the plugin's shared behaviour.
 *
 * Tool definitions are authored as object literals (and share schemastery's
 * dynamically resolved schema), so the boundary is typed as a dynamic record
 * and the final options are narrowed once at the defineTool call. The wrapper
 * keeps the public contract of v2.x: card presenters, version prefix and the
 * lossless sanitize gate on every return value.
 */
export declare const vTool: (spec: DynamicToolSpec) => ToolDefinition;
export declare const schemaResolve: {
    z?: typeof zt;
    via?: string;
    error?: string;
    tried: string[];
};
export declare const z: Schemastery.Static | undefined;
export {};
