import type { Tool } from './types.js';
import type { ToolContext } from '../context.js';
/**
 * Resolve IDS source from `ids_xml` (inline) or `ids_path` (disk),
 * enforcing the optional `allowedPaths` allowlist on disk reads. Shared by
 * `ids_validate` and `ids_explain` so both tools apply identical guards;
 * the previous arrangement let `ids_explain` read arbitrary paths in
 * restricted stdio deployments.
 */
export declare function loadIdsXml(input: Record<string, unknown>, ctx: ToolContext): Promise<string>;
export declare const validationTools: Tool[];
//# sourceMappingURL=validation.d.ts.map