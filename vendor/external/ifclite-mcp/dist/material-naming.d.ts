import type { MaterialData } from '@ifc-lite/sdk';
/**
 * A candidate name is absent for grouping purposes when it is
 * undefined/null OR blank/whitespace-only (`IFCMATERIAL('',$,$)`, or a
 * whitespace-only source value — a real shape, see #3714). Chaining raw
 * candidates with `??` (the pre-fix bug) only falls through on
 * null/undefined, so a present-but-blank `Name` short-circuits the chain
 * and is returned verbatim instead of falling through to the next
 * candidate.
 */
export declare function isBlank(name: string | undefined | null): boolean;
/**
 * First candidate that is not blank per `isBlank`, or undefined if none.
 * Exported for reuse at every other MCP call site with the same "blank
 * name should fall through to the caller's own placeholder" shape
 * (`quantity_diff`'s group-by-storey, `playground-dispatcher`'s
 * group-by-storey and entity/selection name summaries) — not just
 * material names.
 */
export declare function firstNonBlank(...candidates: Array<string | undefined>): string | undefined;
/**
 * Grouping name for a `MaterialData` result, or undefined when none is
 * available. `.name` alone only covers a plain `Material` (and, when
 * authored in the source file, a LayerSet/ProfileSet/ConstituentSet) — an
 * `IfcMaterialList` never carries a list-level name, only `.materials[]`,
 * so reading `.name` alone mis-buckets every list-material entity as
 * unnamed. `computeMaterialSummary`
 * (`packages/cli/src/commands/stats-aggregation.ts`) already falls back to
 * `.materials[0]` for that case; the layer, profile and constituent
 * fallbacks below go beyond it.
 *
 * Returns undefined when every candidate is absent or blank, rather than
 * hardcoding a placeholder here: the two MCP callers (`materials_list` /
 * `count_entities` group_by material vs. `query_entities`'s
 * per-entity summary) each apply their own wording (`(unnamed)` vs.
 * `(no material)`) via `?? '(placeholder)'` on the return value.
 *
 * Shared by every MCP call site that needs a single label for a
 * `MaterialData` value (the `materials` resource, `viewer_get_selection`'s
 * text summary): each of these read the same `extractMaterialsOnDemand`
 * shape and used to fall back independently, drifting on which multi-
 * material shapes they covered.
 */
export declare function materialFallbackName(mat: MaterialData | null | undefined): string | undefined;
//# sourceMappingURL=material-naming.d.ts.map