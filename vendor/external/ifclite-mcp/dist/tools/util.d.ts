import type { CallToolResult } from '../protocol/index.js';
import type { LoadedModel, ToolContext } from '../context.js';
import { ToolExecutionError } from '../errors.js';
/**
 * Throw PERMISSION_DENIED when the caller's scope carries a model allowlist
 * that excludes `model`. Central guard so per-model access control is enforced
 * at the model-resolution choke point rather than per-tool.
 */
export declare function assertModelAccess(ctx: ToolContext, model: LoadedModel): LoadedModel;
export declare function resolveModel(ctx: ToolContext, modelId?: string): LoadedModel;
/**
 * An entity "not found" in a model the scan read short may be one of the
 * records it dropped (an unescaped apostrophe, #7541) rather than one the file
 * never declared. Say so on the error's `hint` (#7610), where a tool's error
 * becomes a result: the dispatcher, and `mutation_batch`, which runs its
 * sub-tools itself. The lookup mirrors resolveModel without its errors, and a
 * model the caller may not access is never mentioned: a tool can miss an
 * entity (a BCF topic, say) without resolving any model.
 */
export declare function withScanHint(err: ToolExecutionError, ctx: ToolContext, modelId?: string): ToolExecutionError;
/**
 * **The GlobalId precedence rule, defined once.**
 *
 * A `model_id` names a session, not a file, so resolving a GlobalId has to
 * include what `entity_create` queued and exclude what `entity_delete`
 * tombstoned (#2004). An agent that creates an entity and then addresses it by
 * the GlobalId it just wrote — to read it back, or to set a property on it — has
 * to reach it, and one that addresses an entity it deleted must not.
 *
 * **Queued entities come first.** They are few, and a re-GUID that reuses a
 * deleted entity's GlobalId should resolve to the live one. That order is not an
 * implementation detail: it is what `get_entity`, `entity_set_property`,
 * `entity_delete` and `bsdd_match` all answer with, so anything keyed by
 * GlobalId has to agree with it or the same identifier names two different
 * entities depending on which tool you asked (#2015).
 *
 * A GlobalId is supposed to be unique and in practice is not — a session can
 * create an entity under an id the file already uses, which is exactly what
 * `model_audit`'s `duplicate-globalid` rule reports. Both functions below apply
 * the same order; {@link resolveGlobalIds} additionally hands back the whole
 * carrier list, because a caller that asked by GlobalId and got one of two
 * entities deserves to be told rather than to guess.
 */
/** The expressId carrying `globalId` in this session, or null — the first entry
 *  {@link resolveGlobalIds} would list for it. Early-exits on the first match,
 *  which is why it is the single-lookup path; error policy is the caller's, so
 *  it returns null rather than throwing. */
export declare function findByGlobalId(model: LoadedModel, globalId: string): number | null;
/**
 * Every live carrier of each requested GlobalId, in the precedence above.
 *
 * One pass over the store for the whole request rather than one per key, which
 * is why bulk readers use this instead of calling {@link findByGlobalId} in a
 * loop. Keys with no carrier are absent from the result.
 */
export declare function resolveGlobalIds(model: LoadedModel, globalIds: Iterable<string>): Map<string, number[]>;
export declare function okResult(text: string, structured?: Record<string, unknown>): CallToolResult;
/**
 * A number for tool TEXT, grouped the en-US way (`2,500`) on every host.
 *
 * `toLocaleString()` with no argument follows the host's `LC_ALL` / `LANG`, so
 * the same tool call answered `2 500` on a Swedish machine and `2.500` on a
 * German one (#7027). Tool text is English prose read by a model and a person;
 * its numbers are en-US wherever the server runs. Machine-read values do not
 * come through here: they travel as plain numbers in `structuredContent`.
 */
export declare function fmtInt(n: number): string;
export declare function fmtCount(n: number, singular: string, plural?: string): string;
/** Slice a large array down to `limit` and return `{ items, truncated }`. */
export declare function paginate<T>(items: T[], limit: number, offset?: number): {
    items: T[];
    truncated: boolean;
    total: number;
};
//# sourceMappingURL=util.d.ts.map