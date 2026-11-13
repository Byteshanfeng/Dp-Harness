/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { createDataAccessor } from '@ifc-lite/ids/bridge';
/**
 * `mutationView`, when supplied, is consulted for entity membership only.
 * Enumeration excludes tombstones and includes overlay-created entities, and
 * a retyped entity answers its new class (#5184). It satisfies the bridge's
 * `EntityVisibilityView` structurally, so no adapter is needed. Omitting it
 * leaves the accessor answering for the file as parsed.
 */
export function buildIdsAccessor(store, mutationView) {
    return createDataAccessor(store, undefined, mutationView ?? undefined);
}
//# sourceMappingURL=ids-accessor.js.map