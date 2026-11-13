import type { Server } from 'node:http';
export interface StartServerOpts {
    server: Server;
    engine: {
        stop: () => unknown;
    };
    port: number;
    host: string;
    routes: string[];
}
export declare function startServer({ server, engine, port, host, routes }: StartServerOpts): void;
