/**
 * Scope-based tool gating.
 *
 * Every tool declares the scope a caller needs (`read`, `validate`, `mutate`,
 * `export`, `admin`). At `tools/list` time we filter the advertised set so a
 * read-only token never even sees the mutation tools — the LLM can't try to
 * call something it isn't allowed to use.
 */
import type { ToolScope } from '../protocol/index.js';
export interface AuthScope {
    scopes: ToolScope[];
    /** Optional model_id allowlist. Empty / undefined = all models. */
    modelIds?: string[];
    /** Audit metadata (user_id, session_id) — copied into log entries. */
    user?: string;
    session?: string;
}
export declare const FULL_ACCESS: AuthScope;
export declare const READ_ONLY: AuthScope;
export declare function scopeAllows(scope: AuthScope, required?: ToolScope): boolean;
export declare function modelAllowed(scope: AuthScope, modelId: string): boolean;
export declare function readOnlyScope(): AuthScope;
export declare function fullScope(): AuthScope;
//# sourceMappingURL=scope.d.ts.map