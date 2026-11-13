/**
 * `bim.structural` had a headless backend adapter (`headless-backend.ts`'s
 * `this.structural = createStructuralAdapter(...)`) and full CLI/SDK/viewer
 * coverage, but no MCP tool of its own — `packages/mcp/src/tools/index.ts`
 * registered `costTools` from a sibling `cost.ts` with no structural
 * equivalent, so an MCP client had no way to read the structural analysis
 * model at all (#4206). Mirrors `cost.ts`'s shape.
 */
import type { Tool } from './types.js';
export declare const structuralTools: Tool[];
//# sourceMappingURL=structural.d.ts.map