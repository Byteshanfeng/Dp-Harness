/**
 * Narrow helpers for lossless-JSON boundaries.
 *
 * Host/backend payloads are dynamic: they come from JSON.parse, an HTTP body or
 * another process and cannot be trusted to match a hand-written interface.
 * These helpers keep that boundary explicit (unknown in, checked value out)
 * instead of spreading any through the call sites.
 */
export type UnknownRecord = Record<string, unknown>;
export declare function isRecord(value: unknown): value is UnknownRecord;
/** A record view of a dynamic value; non-objects become an empty record. */
export declare function asRecord(value: unknown): UnknownRecord;
/** Read an object property without asserting the value's shape. */
export declare function get(value: unknown, key: string): unknown;
/** An array view of a dynamic value; non-arrays become an empty array. */
export declare function asArray(value: unknown): unknown[];
/** String coercion that keeps the historical String(v ?? '') call-site behaviour. */
export declare function text(value: unknown): string;
/** String coercion with a null result for missing values (for lossless envelopes). */
export declare function optionalText(value: unknown): string | null;
/** The message of an Error-like value, without assuming the thrown value is an Error. */
export declare function errorMessage(value: unknown): string;
