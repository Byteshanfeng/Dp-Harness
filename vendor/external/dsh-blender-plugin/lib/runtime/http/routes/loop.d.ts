import type { IncomingMessage, ServerResponse } from 'node:http';
import type { HttpRouteDeps } from './deps.js';
export declare function createLoopRoutes(E: HttpRouteDeps): {
    loop(req: IncomingMessage, res: ServerResponse, _url: URL, _p: string): Promise<void>;
};
