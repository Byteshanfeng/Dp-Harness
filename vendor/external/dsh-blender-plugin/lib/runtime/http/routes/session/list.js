export function createWhoHandler(E) {
    const { PORT, describeConfig, engine, json, leaseView, reqCounts, stats } = E;
    return async function who(req, res, _url, _p) {
        json(res, 200, {
            ok: true,
            lease: leaseView(),
            metrics: engine.metrics(),
            stats: stats,
            config: describeConfig({ httpPort: PORT }),
            requests: Object.fromEntries(reqCounts),
        });
        return;
    };
}
//# sourceMappingURL=list.js.map