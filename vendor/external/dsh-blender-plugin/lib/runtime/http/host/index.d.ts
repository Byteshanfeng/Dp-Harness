import type { IncomingMessage, ServerResponse } from 'node:http';
import type { EngineSurface } from '../../core/engine/index.js';
export interface SelectionStoreView {
    put: (payload: unknown) => Record<string, unknown>;
    snapshot: () => unknown;
    consume: (seq: unknown, payload: Record<string, unknown>) => Record<string, unknown>;
}
export interface HostRoutesDeps {
    engine: EngineSurface;
    selectionStore: SelectionStoreView;
    hostJson: (res: ServerResponse, code: number, obj: unknown, origin?: unknown) => void;
    hostErrText: (e: unknown) => string;
}
export declare function createHostRoutes(E: HostRoutesDeps): {
    host(req: IncomingMessage, res: ServerResponse, url: URL, p: string): Promise<void>;
};
