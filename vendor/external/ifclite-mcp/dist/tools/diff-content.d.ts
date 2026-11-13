import { type PendingOverlay } from '@ifc-lite/sdk/headless';
import type { LoadedModel } from '../context.js';
/** Default cap on the listed `contentMatches`. Per-kind totals are reported
 *  whole, so the cap bounds the payload without hiding anything. */
export declare const DEFAULT_MAX_MATCHES = 200;
/**
 * Default cap on the GlobalIds listed per side of one match.
 *
 * `max_matches` bounds how many groups come back, not how big one is, and a
 * `duplicated` / `deduplicated` / `ambiguous` group is a set of candidates that
 * in a repetitive model can run to thousands of entities on each side. Without
 * this, `max_matches: 1` could still return a model-sized payload and overflow
 * the context window the cap exists to protect.
 *
 * 20 is chosen against what the list is *for*. A group is the engine declining
 * to guess, so its members are a hand-off to the caller; twenty candidates on a
 * side is already past what anyone resolves by reading a list rather than by
 * querying the two models. The overwhelmingly common match is a 1:1 `renamed`
 * pair, which this never touches. Every group still reports `baseCount` and
 * `headCount` whole, computed before the cap for the same reason
 * `contentMatchCounts` is: truncation must never be what makes a model look
 * cleanly matched.
 */
export declare const DEFAULT_MAX_GROUP_MEMBERS = 20;
/** Run the real `@ifc-lite/diff` engine over two loaded models. See the
 *  module doc for the scope and abstention contract. */
export declare function contentDiff(left: LoadedModel, right: LoadedModel, overlays: {
    left: PendingOverlay | null;
    right: PendingOverlay | null;
}, maxMatches: number, maxGroupMembers: number, keyProperty?: string, splitMerge?: boolean, successors?: boolean): Record<string, unknown>;
/** One-line human summary of the engine result, for the text block. */
export declare function describeCounts(content: Record<string, unknown>): string;
//# sourceMappingURL=diff-content.d.ts.map