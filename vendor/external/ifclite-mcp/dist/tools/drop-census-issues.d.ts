/**
 * `model_audit`'s semantic-drop-census section (#4208), split out of
 * `validation.ts` to keep that module under the house line-count budget.
 *
 * Turns `@ifc-lite/parser`'s `DropCensus` into `model_audit` issues and into
 * the JSON shape the tool returns, in one place so the two can never drift
 * out of sync with each other.
 */
import type { DropCensus, ClassCensusEntry } from '@ifc-lite/parser';
export type AuditIssue = {
    severity: 'error' | 'warning' | 'info';
    category: string;
    rule: string;
    message: string;
    entityCount?: number;
};
/**
 * Build `model_audit` issues from a `DropCensus`. `skippedClasses` fires on
 * essentially every real IFC file — geometry and placement resources
 * (`IfcCartesianPoint`, `IfcIndexedPolygonalFace`, `IfcAxis2Placement3D`, …)
 * have no `GlobalId` and are never retained, and tessellated geometry alone
 * can be the majority of a file's records. Reporting that at `warning`
 * unconditionally trains people to ignore the warning.
 *
 * Split on `isRootDescendant` instead: a class with its own `GlobalId` (an
 * `IfcRoot` descendant) that still fell to `CAT_SKIP` is the actual
 * regression shape (see the `IfcCovering`/`GEOMETRY_TYPES` incident
 * documented in `columnar-entity-preparation.ts`) and stays a `warning`; a
 * resource class with no `GlobalId` is expected and demoted to `info`.
 */
export declare function buildDropCensusIssues(dropCensus: DropCensus | undefined): AuditIssue[];
/** The `dropCensus` field of `model_audit`'s JSON payload. */
export declare function dropCensusJson(dropCensus: DropCensus | undefined): {
    ran: false;
    totalScanned?: undefined;
    totalRetained?: undefined;
    totalSkipped?: undefined;
    skippedClasses?: undefined;
    expectedSkippedClasses?: undefined;
    unexpectedSkippedClasses?: undefined;
    unknownClasses?: undefined;
    relClassesSeen?: undefined;
    relClassesIndexed?: undefined;
    unindexedRelClasses?: undefined;
} | {
    ran: true;
    totalScanned: number;
    totalRetained: number;
    totalSkipped: number;
    skippedClasses: ClassCensusEntry[];
    expectedSkippedClasses: ClassCensusEntry[];
    unexpectedSkippedClasses: ClassCensusEntry[];
    unknownClasses: ClassCensusEntry[];
    relClassesSeen: number;
    relClassesIndexed: number;
    unindexedRelClasses: ClassCensusEntry[];
};
//# sourceMappingURL=drop-census-issues.d.ts.map