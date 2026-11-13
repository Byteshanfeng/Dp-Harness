/**
 * Attribute reading for the MCP diff adapter, and authored keys (issue #4955): `key_from` keys the
 * comparison on `Tag` or a `Pset.Prop` instead of GlobalId. Read through the
 * session OVERLAY, like every other fingerprinted value, so a queued edit or
 * tombstone is what the comparison sees. Split out of `diff-fingerprints.ts`
 * for size.
 */
import { EntityExtractor, type IfcDataStore } from '@ifc-lite/parser';
import type { EntityFingerprint } from '@ifc-lite/diff';
import type { EffectiveEntity } from '@ifc-lite/data';
import { type PendingOverlay } from '@ifc-lite/sdk/headless';
/** Adapter options (issue #4955); the CLI's `FingerprintAdapterOptions` restated. */
export interface FingerprintAdapterOptions {
    /** `Tag` or `<PsetName>.<PropertyName>`; see the CLI copy for the rules. */
    keyProperty?: string;
    duplicateAuthoredKeys?: Map<string, number[]>;
}
/** Prefix on a fingerprint key taken from an authored property rather than a GlobalId. */
export declare const AUTHORED_KEY_PREFIX = "prop:";
/**
 * A collision found on either revision invalidates that authored value on
 * both. The first side may already have been built when the second reveals the
 * collision, so repair its key back to the entity's GlobalId before diffing.
 */
export declare function fallbackPairDuplicateAuthoredKeys(sides: readonly {
    fingerprints: EntityFingerprint<number>[];
    store: IfcDataStore;
    overlay?: PendingOverlay | null;
}[], duplicates: ReadonlyMap<string, number[]>): void;
/**
 * Build the key resolver for one model: `prop:<value>` where the entity carries
 * a non-empty value nobody else does, GlobalId otherwise. Duplicate values are
 * reported on `options.duplicateAuthoredKeys`. Tombstoned entities are not
 * owners: a deleted twin no longer contests the key. A created entity has no
 * store row to read and keeps its GlobalId.
 */
export declare function authoredKeyResolver(store: IfcDataStore, overlay: PendingOverlay | null | undefined, options: FingerprintAdapterOptions, extractor: EntityExtractor, entities: readonly EffectiveEntity[]): (expressId: number, globalId: string) => string;
/**
 * One named attribute, read positionally through the **cross-schema** attribute
 * list (issue #2021). The CLI's twin, and it must stay one.
 *
 * `extractAllEntityAttributes` names attributes through the parser's IFC4
 * codegen pin, which answers an EMPTY list for a class the pin does not carry —
 * so a `.find(name === 'Tag')` over it silently finds nothing on every
 * IFC4X3-only type object (`IfcRailType`, `IfcTrackElementType`,
 * `IfcSignalType`, …) while working perfectly on IFC2X3 and IFC4. That is a
 * no-op nobody would notice: the entity is in scope, its class name is right,
 * `isTypeObject` is right, and only the evidence is missing.
 *
 * This is the same pinned-registry family as the membership defect `#2001`
 * fixed, and it has to be answered from the same place: the inheritance chain
 * decides *whether* to read a `Tag`, so the attribute list that decides *where*
 * it sits must span the same schemas. `getAttributeNamesAcrossSchemas` returns
 * the pinned result unchanged for every class the pin does know, so this is
 * additive — no IFC2X3 or IFC4 entity's hash moves because of it.
 *
 * Reads the raw STEP slot rather than reusing `extractAllEntityAttributes`'
 * display normalization: this value is hashed, not shown, so `$` (absent) is
 * the only case that needs interpreting and it arrives as null.
 */
export declare function attributeAcrossSchemas(store: IfcDataStore, expressId: number, ifcType: string, attributeName: string): string | undefined;
/**
 * An overlay override wins whenever one exists, including when it is empty —
 * `entity_set_attribute` with `''` clears the attribute, and falling back to
 * the stored value there would hash the edit away.
 */
export declare function override(edited: string | undefined, stored: string | undefined): string | undefined;
//# sourceMappingURL=diff-authored-keys.d.ts.map