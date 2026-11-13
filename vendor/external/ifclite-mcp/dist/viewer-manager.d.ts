import { createStreamingViewerAdapter, createStreamingVisibilityAdapter } from '@ifc-lite/viewer-core';
import type { LoadedModel } from './context.js';
export interface SelectionEvent {
    expressId: number;
    ifcType?: string;
    globalId?: string;
}
export interface ViewerState {
    port: number;
    url: string;
    modelId: string | null;
    startedAt: number;
    clientCount: number;
    selection: SelectionEvent[];
}
export type SelectionListener = (selection: SelectionEvent[], model: LoadedModel | null) => void;
export declare class ViewerManager {
    private server;
    private port;
    private startedAt;
    private modelId;
    private currentSelection;
    private listeners;
    private sseAbort;
    private resolveModel;
    /**
     * Once-per-session latches for the two high-frequency degradation paths
     * below (`handleSseFrame`, `handlePicked`). Both triggers are viewer/client
     * controlled and can repeat once per frame or once per pick — logging every
     * occurrence would let a misbehaving or hostile viewer client flood the
     * host console. Reset in `open()` so a fresh session reports again.
     */
    private sseParseWarned;
    private globalIdWarned;
    constructor(resolveModel: (id: string | null) => LoadedModel | null);
    isOpen(): boolean;
    state(): ViewerState | null;
    /**
     * Start the viewer for `model`. If already running for the same model,
     * returns the existing state. If a different model is requested, the
     * caller must `close()` first — we don't auto-swap to avoid surprising
     * mid-session changes.
     */
    open(model: LoadedModel, requestedPort?: number): Promise<ViewerState>;
    close(): void;
    /** Subscribe to selection changes. Returns an unsubscribe handle. */
    onSelection(listener: SelectionListener): () => void;
    /** Build viewer + visibility streaming adapters bound to the running port. */
    adapters(): {
        viewer: ReturnType<typeof createStreamingViewerAdapter>;
        visibility: ReturnType<typeof createStreamingVisibilityAdapter>;
    } | null;
    /** Send a one-off command via the viewer's REST API. */
    sendCommand(action: string, payload?: Record<string, unknown>): Promise<void>;
    private subscribeToEvents;
    private consumeSse;
    private handleSseFrame;
    private handlePicked;
}
//# sourceMappingURL=viewer-manager.d.ts.map