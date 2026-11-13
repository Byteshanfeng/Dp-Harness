/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
export const FULL_ACCESS = {
    scopes: ['read', 'validate', 'mutate', 'export', 'admin'],
};
export const READ_ONLY = {
    scopes: ['read', 'validate', 'export'],
};
export function scopeAllows(scope, required) {
    if (!required)
        return true;
    return scope.scopes.includes(required) || scope.scopes.includes('admin');
}
export function modelAllowed(scope, modelId) {
    if (!scope.modelIds || scope.modelIds.length === 0)
        return true;
    return scope.modelIds.includes(modelId);
}
/* The `scopes` array is copied too, not just the wrapper object: a spread
 * alone hands every caller the SAME array instance as the exported constant,
 * so `readOnlyScope().scopes.push('mutate')` widens `READ_ONLY` itself and
 * every token minted afterwards in the process gets the extra scope. */
export function readOnlyScope() {
    return { ...READ_ONLY, scopes: [...READ_ONLY.scopes] };
}
export function fullScope() {
    return { ...FULL_ACCESS, scopes: [...FULL_ACCESS.scopes] };
}
//# sourceMappingURL=scope.js.map