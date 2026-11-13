import type { IncomingMessage, ServerResponse } from 'node:http';
import type { HttpRouteDeps } from '../deps.js';
export declare function createLeaseHandler(E: HttpRouteDeps): (req: IncomingMessage, res: ServerResponse, _url: URL, _p: string) => Promise<void>;
export declare function createReleaseHandler(E: HttpRouteDeps): (req: IncomingMessage, res: ServerResponse, _url: URL, _p: string) => Promise<void>;
