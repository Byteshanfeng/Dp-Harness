export function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/** A record view of a dynamic value; non-objects become an empty record. */
export function asRecord(value) {
    return isRecord(value) ? value : {};
}
/** Read an object property without asserting the value's shape. */
export function get(value, key) {
    return asRecord(value)[key];
}
/** An array view of a dynamic value; non-arrays become an empty array. */
export function asArray(value) {
    return Array.isArray(value) ? value : [];
}
/** String coercion that keeps the historical String(v ?? '') call-site behaviour. */
export function text(value) {
    return value === undefined || value === null ? '' : String(value);
}
/** String coercion with a null result for missing values (for lossless envelopes). */
export function optionalText(value) {
    return value === undefined || value === null ? null : String(value);
}
/** The message of an Error-like value, without assuming the thrown value is an Error. */
export function errorMessage(value) {
    if (isRecord(value) && typeof value.message === 'string')
        return value.message;
    return text(value);
}
//# sourceMappingURL=dynamic.js.map