/**
 * @ifc-lite/mcp — Model Context Protocol server for ifc-lite.
 *
 * Public surface:
 *   - createMCPServer({ ... }) — build an MCPServer with sane defaults.
 *   - StdioTransport / HttpTransport / InProcessTransport — wire I/O.
 *   - loadIfcModel(path) — parse a file into a LoadedModel for the registry.
 */
export { MCPServer, SERVER_NAME } from './server.js';
export type { MCPServerOptions, OutgoingMessageSink } from './server.js';
export type { LoadedModel, ModelRegistry, ServerConfig, SessionIdentity, ToolContext, Logger, ProgressReporter } from './context.js';
export { InMemoryModelRegistry, NOOP_PROGRESS, SILENT_LOGGER, DEFAULT_CONFIG } from './context.js';
export { ToolErrorCode, ToolExecutionError, toolError } from './errors.js';
export type { ToolErrorCodeValue, ToolErrorOptions } from './errors.js';
export * from './protocol/index.js';
export * from './auth/index.js';
export { ToolRegistry, buildDefaultToolRegistry } from './tools/index.js';
export type { Tool } from './tools/index.js';
export { ResourceRegistry, buildDefaultResourceRegistry } from './resources/index.js';
export type { ResourceProvider } from './resources/index.js';
export { PromptRegistry, buildDefaultPromptRegistry } from './prompts/index.js';
export type { Prompt } from './prompts/index.js';
export { StdioTransport } from './transport/stdio.js';
export { routeConsoleToStderr } from './transport/stdio-console.js';
export { InProcessTransport } from './transport/in-process.js';
export { HttpTransport, BearerTokenAuth, AllowAllAuth } from './transport/http.js';
export type { HttpTransportOptions, HttpAuthenticator, SessionFactory } from './transport/http.js';
export { loadIfcModel } from './loader.js';
export type { LoadIfcOptions } from './loader.js';
export { HeadlessLikeBackend } from './headless-backend.js';
export { ViewerManager } from './viewer-manager.js';
export type { ViewerState, SelectionEvent, SelectionListener } from './viewer-manager.js';
import { MCPServer, type MCPServerOptions } from './server.js';
/**
 * This server's own version, read from its `package.json`.
 *
 * It was a hard-coded `'0.1.0'` literal, so `--version`, `--help` and every
 * MCP `initialize` handshake announced 0.1.0 while the package was at 0.19.0
 * (#5540). A version an operator reads out of a client UI has to be the one
 * they can actually install.
 */
export declare const VERSION: string;
/**
 * Build an MCPServer pre-loaded with every tool/resource/prompt category.
 * The caller can still pass a custom `ToolRegistry`, etc., to override.
 */
export declare function createMCPServer(opts?: Partial<MCPServerOptions>): MCPServer;
//# sourceMappingURL=index.d.ts.map