/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
// Keep native filesystem metadata out of the public/browser model surface.
const sources = new WeakMap();
export function rememberLoadedSource(model, source) {
    sources.set(model, Object.freeze({ ...source }));
}
export function getLoadedSource(model) {
    return sources.get(model);
}
//# sourceMappingURL=loaded-source.js.map