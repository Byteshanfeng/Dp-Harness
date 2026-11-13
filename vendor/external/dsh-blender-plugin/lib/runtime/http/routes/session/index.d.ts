import type { HttpRouteDeps } from '../deps.js';
export declare function createSessionRoutes(E: HttpRouteDeps): {
    launch: (req: import("http").IncomingMessage, res: import("http").ServerResponse, _url: URL, _p: string) => Promise<void>;
    who: (req: import("http").IncomingMessage, res: import("http").ServerResponse, _url: URL, _p: string) => Promise<void>;
    lease: (req: import("http").IncomingMessage, res: import("http").ServerResponse, _url: URL, _p: string) => Promise<void>;
    release: (req: import("http").IncomingMessage, res: import("http").ServerResponse, _url: URL, _p: string) => Promise<void>;
};
