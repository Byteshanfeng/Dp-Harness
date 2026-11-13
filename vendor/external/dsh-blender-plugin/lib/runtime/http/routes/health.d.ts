import type { IncomingMessage, ServerResponse } from 'node:http';
import type { HttpRouteDeps } from './deps.js';
export declare function createHealthRoutes(E: HttpRouteDeps): {
    health(req: IncomingMessage, res: ServerResponse, _url: URL, _p: string): Promise<void>;
    gone(req: IncomingMessage, res: ServerResponse, _url: URL, _p: string): Promise<void>;
    status(req: IncomingMessage, res: ServerResponse, _url: URL, _p: string): Promise<void>;
    doctor(req: IncomingMessage, res: ServerResponse, _url: URL, _p: string): Promise<void>;
};
