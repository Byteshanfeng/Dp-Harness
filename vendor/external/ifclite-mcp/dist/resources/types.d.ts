import type { ResourceContents, ResourceDefinition } from '../protocol/index.js';
import type { ToolContext } from '../context.js';
/**
 * A ResourceProvider can either:
 *   - enumerate concrete resources (`list()`) — useful for static resources
 *   - resolve URIs by pattern (`match()` + `read()`) — for dynamic ones
 *     (e.g. `ifc-lite://model/{id}/entity/{globalId}`)
 *
 * Most providers do both: they enumerate the "manifest" resources and serve
 * any URI that matches their patterns.
 */
export interface ResourceProvider {
    /** Stable name for diagnostics. */
    name: string;
    /** Static resources advertised in `resources/list`. */
    list(ctx: ToolContext): Promise<ResourceDefinition[]> | ResourceDefinition[];
    /** True iff this provider can read the given URI. */
    match(uri: string): boolean;
    /** Read the resource. Throws when uri doesn't match. */
    read(uri: string, ctx: ToolContext): Promise<ResourceContents[]> | ResourceContents[];
}
export declare class ResourceRegistry {
    private providers;
    register(provider: ResourceProvider): void;
    registerAll(providers: ResourceProvider[]): void;
    list(ctx: ToolContext): Promise<ResourceDefinition[]>;
    matchProvider(uri: string): ResourceProvider | null;
}
//# sourceMappingURL=types.d.ts.map