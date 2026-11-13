import { json } from './response.js';
import { errorDetail } from '../core/json.js';
export function createRouter(E) {
    const routes = E.routes;
    return async function router(req, res) {
        const url = new URL(req.url || '/', 'http://' + E.HOST + ':' + String(E.PORT));
        const p = url.pathname;
        E.bump(p);
        try {
            for (const r of routes) {
                if (r.method && req.method !== r.method)
                    continue;
                const matched = r.paths
                    ? r.paths.indexOf(p) >= 0
                    : p === r.exact || (r.prefix && p.startsWith(r.prefix));
                if (!matched)
                    continue;
                await r.fn(req, res, url, p);
                return;
            }
            json(res, 404, { ok: false, error: 'not found', path: p });
        }
        catch (e) {
            json(res, 500, { ok: false, error: errorDetail(e) });
        }
    };
}
//# sourceMappingURL=router.js.map