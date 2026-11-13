/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
function summarize(classes) {
    const entityCount = classes.reduce((n, c) => n + c.scanned, 0);
    const sample = classes.slice(0, 10).map((c) => c.type).join(', ') + (classes.length > 10 ? ', …' : '');
    return { count: classes.length, entityCount, sample };
}
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
export function buildDropCensusIssues(dropCensus) {
    const issues = [];
    if (!dropCensus) {
        issues.push({
            severity: 'info',
            category: 'semantic-drop',
            rule: 'census-unavailable',
            message: 'Semantic drop census did not run for this model (no dropCensus on the store) — skipped/unknown classes cannot be reported.',
        });
        return issues;
    }
    if (dropCensus.unexpectedSkippedClasses.length > 0) {
        const { count, entityCount, sample } = summarize(dropCensus.unexpectedSkippedClasses);
        issues.push({
            severity: 'warning',
            category: 'semantic-drop',
            rule: 'skipped-class',
            entityCount,
            message: `${count} class(es) with a GlobalId fell to CAT_SKIP and never entered the entity table: ${sample}.`,
        });
    }
    if (dropCensus.expectedSkippedClasses.length > 0) {
        const { count, entityCount, sample } = summarize(dropCensus.expectedSkippedClasses);
        issues.push({
            severity: 'info',
            category: 'semantic-drop',
            rule: 'skipped-class-expected',
            entityCount,
            message: `${count} geometry/placement/style resource class(es) with no GlobalId fell to CAT_SKIP, as expected: ${sample}.`,
        });
    }
    if (dropCensus.unknownClasses.length > 0) {
        const { count, entityCount, sample } = summarize(dropCensus.unknownClasses);
        issues.push({
            severity: 'warning',
            category: 'semantic-drop',
            rule: 'unknown-class',
            entityCount,
            message: `${count} class(es) are not recognised by the schema registry: ${sample}.`,
        });
    }
    if (dropCensus.unindexedRelClasses.length > 0) {
        const { count, entityCount, sample } = summarize(dropCensus.unindexedRelClasses);
        issues.push({
            severity: 'info',
            category: 'semantic-drop',
            rule: 'unindexed-rel-class',
            entityCount,
            message: `${count} IFCREL* class(es) were seen but not indexed as relationship-graph edges: ${sample}.`,
        });
    }
    return issues;
}
/** The `dropCensus` field of `model_audit`'s JSON payload. */
export function dropCensusJson(dropCensus) {
    if (!dropCensus)
        return { ran: false };
    return {
        ran: true,
        totalScanned: dropCensus.totalScanned,
        totalRetained: dropCensus.totalRetained,
        totalSkipped: dropCensus.totalSkipped,
        skippedClasses: dropCensus.skippedClasses,
        expectedSkippedClasses: dropCensus.expectedSkippedClasses,
        unexpectedSkippedClasses: dropCensus.unexpectedSkippedClasses,
        unknownClasses: dropCensus.unknownClasses,
        relClassesSeen: dropCensus.relClassesSeen,
        relClassesIndexed: dropCensus.relClassesIndexed,
        unindexedRelClasses: dropCensus.unindexedRelClasses,
    };
}
//# sourceMappingURL=drop-census-issues.js.map