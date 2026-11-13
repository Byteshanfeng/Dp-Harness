import type { IncomingMessage, ServerResponse } from 'node:http';
import type { HttpRouteDeps } from './deps.js';
export declare function createCommandsRoutes(E: HttpRouteDeps): {
    commands(req: IncomingMessage, res: ServerResponse, _url: URL, _p: string): Promise<void>;
    cmd(req: IncomingMessage, res: ServerResponse, _url: URL, _p: string): Promise<void>;
};
