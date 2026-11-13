import { NativeReviewCaptures, type NativeReviewModel } from '@ifc-lite/sdk/review';
import type { LoadedModel, ToolContext } from '../context.js';
export declare function reviewCaptures(ctx: ToolContext): NativeReviewCaptures;
export declare function nativeReviewModel(model: LoadedModel): NativeReviewModel;
/** Pin the call owner while reading live permissions and registry membership. */
export declare function reviewAccess(ctx: ToolContext, permission: 'read' | 'validate'): {
    allowed: (id: string) => boolean;
    models: () => NativeReviewModel[];
};
//# sourceMappingURL=review-captures.d.ts.map