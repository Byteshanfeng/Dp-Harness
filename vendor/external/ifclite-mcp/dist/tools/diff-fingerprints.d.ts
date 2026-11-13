import { type EntityFingerprint } from '@ifc-lite/diff';
import { type IfcDataStore } from '@ifc-lite/parser';
import { type FingerprintAdapterOptions } from './diff-authored-keys.js';
export { AUTHORED_KEY_PREFIX, type FingerprintAdapterOptions } from './diff-authored-keys.js';
import { type PendingOverlay } from '@ifc-lite/sdk/headless';
/** Adapter handle threaded through the diff: the entity's express id. */
export type DiffRef = number;
/**
 * Build one {@link EntityFingerprint} per `IfcObjectDefinition` in a store.
 *
 * `components` is populated as well as `dataHash`: the content pass's only
 * defence against a `dataHash` collision retiring an unrelated add/delete pair
 * is agreement on `ifcType` and on every component sub-hash, and the second
 * check is inert unless both sides supply them (see the "Hash collisions"
 * section of `docs/guide/model-diff.md`).
 *
 * Pass `overlay` to fingerprint the model *as the session has it* rather than
 * as the file was parsed — tombstoned entities drop out, created ones join, and
 * edited names, descriptions and property values are hashed at their new
 * values. Omitting it (the CLI twin has no session to overlay) is the original
 * store-only behaviour exactly.
 */
export declare function buildModelFingerprints(store: IfcDataStore, overlay?: PendingOverlay | null, options?: FingerprintAdapterOptions): EntityFingerprint<DiffRef>[];
//# sourceMappingURL=diff-fingerprints.d.ts.map