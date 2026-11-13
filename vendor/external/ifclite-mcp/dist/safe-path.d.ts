import type { LoadedModel, ServerConfig } from './context.js';
/**
 * The slice of the server context this module actually reads. Only
 * `filePath` is consulted on each listed model, so the registry is described
 * by that member alone — a real `ModelRegistry` satisfies it, and so does a
 * test double that need not fabricate a whole `LoadedModel`.
 */
interface PathContext {
    config: Pick<ServerConfig, 'allowedPaths'>;
    registry: {
        list(): ReadonlyArray<Pick<LoadedModel, 'filePath'>>;
    };
}
export type PathMode = 'read' | 'write';
/**
 * Validate and canonicalise a path supplied by an MCP tool caller.
 *
 * - `mode === 'read'`: the file must exist; its realpath must land in an
 *   allowed root.
 * - `mode === 'write'`: the file may not exist yet. The realpath of the
 *   closest existing ancestor is used for the bounds check, then the missing
 *   tail is reattached.
 */
export declare function resolveSafePath(raw: unknown, ctx: PathContext, mode: PathMode): Promise<string>;
export {};
//# sourceMappingURL=safe-path.d.ts.map