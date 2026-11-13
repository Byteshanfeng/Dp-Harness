import type { ClassificationInfo } from '@ifc-lite/parser';
/**
 * Project one resolved classification reference to the single string
 * `DataFingerprintInput.classifications` hashes: `system:identification`,
 * falling back to `name` when the reference carries no identification code.
 * Both blank is "no label" — `''` lets the fingerprint's blank filter drop
 * it, the same rule a blank material name gets. The CLI's
 * (`packages/cli/src/commands/diff-engine.ts`) twin — split into its own
 * module here only because `diff-fingerprints.ts` is at its size budget.
 */
export declare function classificationLabel(info: ClassificationInfo): string;
//# sourceMappingURL=diff-classification-label.d.ts.map