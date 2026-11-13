import type { ToolContext } from '../context.js';
import type { Tool } from './types.js';
/** Stable across authenticated sessions; local stdio shares the CLI journal. */
export declare function mcpPublicationNamespace(ctx: ToolContext, requiresStableIdentity?: boolean): string | undefined;
export declare const bcfPublicationTools: Tool[];
//# sourceMappingURL=bcf-publication.d.ts.map