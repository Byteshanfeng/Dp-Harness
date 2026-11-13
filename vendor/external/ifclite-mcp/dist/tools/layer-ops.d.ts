import type { ScopeClaim, ScopeOpDescriptor } from '@ifc-lite/extensions';
import type { IfcxFile } from '@ifc-lite/ifcx';
export type DraftOpKind = 'create_entity' | 'set_attribute' | 'set_property' | 'delete_entity';
export interface DraftOpInput {
    op: DraftOpKind;
    path: string;
    ifc_type?: string;
    name?: string;
    pset?: string;
    prop?: string;
    value?: unknown;
}
/**
 * Capability target for an attribute key: the Pset/Qto set name when the
 * key carries one, else the last `::` segment (write-time and publish-time
 * use the same normalization so they cannot drift).
 */
export declare function mutationTarget(attributeKey: string): string;
/** Write-time descriptor for one draft op. */
export declare function descriptorForDraftOp(op: DraftOpInput, ifcType: string | undefined): ScopeOpDescriptor;
/**
 * Write-time enforcement: drafts with claims only accept covered ops;
 * drafts with empty claims are unrestricted. Throws the structured error
 * the agent can reason about.
 */
export declare function assertOpWithinClaims(claims: readonly ScopeClaim[], rawClaims: readonly string[], descriptor: ScopeOpDescriptor, op: DraftOpInput): void;
export interface ScopeMismatch {
    path: string;
    capability: string;
    ifcType?: string;
}
export interface ScopeVerification {
    verified: boolean;
    mismatches: ScopeMismatch[];
}
/**
 * Publish-time descriptors from a frozen layer's data nodes (same mapping
 * as the CLI's `deriveScopeOps`):
 *   - tombstone opinion (`ifclite::deleted`) → model.delete
 *   - path absent from the base stack state  → model.create
 *   - attribute keys on existing entities    → model.mutate:<target>
 *   - children/inherits slot changes         → model.mutate:children / :inherits
 * `ifclite::*` bookkeeping keys never produce ops.
 */
export declare function deriveLayerDescriptors(file: IfcxFile, baseFiles: readonly IfcxFile[]): Array<ScopeOpDescriptor & {
    path: string;
}>;
/**
 * Verify a published layer's actual ops against its manifest scope claims.
 * Empty claims mean an unrestricted draft — trivially verified.
 */
export declare function verifyLayerAgainstClaims(file: IfcxFile, baseFiles: readonly IfcxFile[], rawClaims: readonly string[]): ScopeVerification;
//# sourceMappingURL=layer-ops.d.ts.map