import type { Logger, ModelRegistry } from './context.js';
import type { ViewerManager } from './viewer-manager.js';
/** A failed session resource must not prevent disposal of the other models. */
export declare function disposeSessionResources(viewer: ViewerManager, registry: ModelRegistry, sessionId: string | undefined, logger: Logger): void;
//# sourceMappingURL=session-cleanup.d.ts.map