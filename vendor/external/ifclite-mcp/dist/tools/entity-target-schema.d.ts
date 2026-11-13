import type { JsonSchema } from '../protocol/index.js';
/**
 * Input schema for a mutate tool that targets one existing entity.
 *
 * Every such tool resolves its target through `resolveExpressId` in
 * `mutate.ts`, which reads `express_id`, else `global_id`, and throws
 * `INVALID_INPUT` when neither is present. The `anyOf` states that same
 * contract in the schema so `validateInput` rejects the call before the
 * handler runs, and one builder keeps the four tools from drifting (#5192).
 *
 * `tools/list` does not publish the root `anyOf` (the Anthropic API rejects
 * root combinators, see `advertisedInputSchema`), so the property
 * descriptions carry the rule for the agent reading the schema.
 */
export declare function entityTargetSchema(properties: Record<string, JsonSchema>, required?: string[]): JsonSchema;
//# sourceMappingURL=entity-target-schema.d.ts.map