import type { IncomingMessage, ServerResponse } from 'node:http';
export interface RouteDef {
    method?: string | null;
    paths?: string[];
    exact?: string;
    prefix?: string;
    fn: (req: IncomingMessage, res: ServerResponse, url: URL, p: string) => Promise<unknown> | unknown;
}
export interface RouterDeps {
    HOST: string;
    PORT: number;
    bump: (p: string) => void;
    routes: RouteDef[];
}
export declare function createRouter(E: RouterDeps): (req: IncomingMessage, res: ServerResponse) => Promise<void>;
