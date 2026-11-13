/**
 * Human-readable "Materials:"/"Material:" line for `viewer_get_selection`'s
 * text summary. Split out of `viewer.ts` (which sits at its module-size
 * budget) rather than grown in place.
 */
import type { MaterialData } from '@ifc-lite/sdk';
/**
 * Format a `MaterialData` value as a single summary line, or undefined
 * when there is nothing to show. Every multi-material shape
 * `extractMaterialsOnDemand` can produce is listed by its member names
 * (`.layers[]`, `.profiles[]`, `.constituents[]`, `.materials[]`) before
 * falling back to a single name — an `IfcMaterialProfileSet` or
 * `IfcMaterialConstituentSet` with no set-level `Name` used to fall
 * through to that single-name check alone, which found nothing and
 * dropped the whole line instead of naming the assigned material.
 *
 * The single-name fallback still runs when the member arrays name nothing,
 * so a NAMED set whose members are all unnamed keeps printing its own
 * `Name` rather than a row of `?` placeholders.
 */
export declare function formatMaterialsBlock(mat: MaterialData | null | undefined): string | undefined;
//# sourceMappingURL=material-summary.d.ts.map