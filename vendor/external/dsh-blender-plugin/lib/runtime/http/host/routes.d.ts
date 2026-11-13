import type { IncomingMessage, ServerResponse } from 'node:http';
import type { HostRoutesDeps } from './index.js';
export declare function handleHost(E: HostRoutesDeps, req: IncomingMessage, res: ServerResponse, url: URL, p: string): Promise<void>;
