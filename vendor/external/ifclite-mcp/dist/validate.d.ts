/**
 * Tiny JSON-Schema input validator (Draft 2020-12 subset).
 *
 * We only support the keywords our hand-authored tool schemas use:
 *   type, properties, required, items, enum, minimum, exclusiveMinimum, maximum,
 *   minLength, maxLength, minItems, maxItems, default, anyOf,
 *   additionalProperties.
 *
 * `anyOf` is checked against the *original* input (not `walk`'s
 * default-filled/type-narrowed copy of it), and only requires ONE branch to
 * validate cleanly; it does not merge a matching branch's own defaults or
 * error paths into the result. We deliberately do not support `oneOf`
 * (exactly-one-of): none of our schemas need "match precisely one branch,
 * reject on more than one", and getting that half-implemented is worse than
 * not offering it.
 *
 * A top-level `anyOf` is enforced here but NOT advertised: the Anthropic
 * Messages API rejects a tool `input_schema` carrying `oneOf`/`allOf`/`anyOf`
 * at the root with a 400 that fails the whole request, so every Claude-backed
 * MCP client would lose the entire tool list over one schema.
 * `advertisedInputSchema` strips it from what `tools/list` returns; tools state
 * the constraint in their property descriptions instead (#5192).
 *
 * That's enough to surface clear `INVALID_INPUT` errors back to the LLM
 * without bringing in `ajv` (and its 200+ KB of metaschema) or zod.
 */
import type { JsonSchema } from './protocol/index.js';
export interface ValidationIssue {
    path: string;
    message: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationIssue[];
    /** Input with `default` values filled in. */
    value: unknown;
}
export declare function validateInput(schema: JsonSchema, input: unknown): ValidationResult;
/**
 * The schema `tools/list` publishes for a tool: its input schema without the
 * root-level `anyOf` (see the file header). Nested `anyOf` is left alone —
 * only the root is rejected by the Anthropic API.
 */
export declare function advertisedInputSchema(schema: JsonSchema): JsonSchema;
//# sourceMappingURL=validate.d.ts.map