import type { LoadedModel } from './context.js';
export interface LoadIfcOptions {
    /** Override the registered model ID (default = file basename without extension). */
    modelId?: string;
    /** Restrict reads to these absolute path prefixes. Used by the stdio CLI. */
    allowedPaths?: string[];
}
/** Load IFC bytes and retain the opened file identity for source-write protection. */
export declare function loadIfcModel(filePath: string, opts?: LoadIfcOptions): Promise<LoadedModel>;
/**
 * Parse IFC bytes already in memory (a flow's `model.openFromSource`) into a
 * `LoadedModel` — the same unwrap, signature check and parser setup as
 * {@link loadIfcModel}, which reads the file and calls this. `label` names the
 * source in errors; it defaults to `name`.
 */
export declare function loadIfcModelFromBytes(bytes: Uint8Array, name: string, modelId?: string, label?: string): Promise<LoadedModel>;
export declare function deriveModelId(name: string): string;
//# sourceMappingURL=loader.d.ts.map