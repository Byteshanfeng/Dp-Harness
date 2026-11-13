import type { IncomingMessage, ServerResponse } from 'node:http';
import type { HttpRouteDeps } from './deps.js';
export declare function createFrameRoutes(E: HttpRouteDeps): {
    frame(req: IncomingMessage, res: ServerResponse, url: URL, _p: string): Promise<void>;
};
