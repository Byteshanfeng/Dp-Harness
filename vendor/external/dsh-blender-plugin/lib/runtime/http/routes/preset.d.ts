import type { IncomingMessage, ServerResponse } from 'node:http';
import type { HttpRouteDeps } from './deps.js';
export declare function createPresetRoutes(E: HttpRouteDeps): {
    preset(req: IncomingMessage, res: ServerResponse, _url: URL, _p: string): Promise<void>;
};
