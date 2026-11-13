/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { createStreamingViewerAdapter, createStreamingVisibilityAdapter, startViewerServer, } from '@ifc-lite/viewer-core';
import { EntityNode } from '@ifc-lite/query';
export class ViewerManager {
    server = null;
    port = 0;
    startedAt = 0;
    modelId = null;
    currentSelection = [];
    listeners = new Set();
    sseAbort = null;
    resolveModel;
    /**
     * Once-per-session latches for the two high-frequency degradation paths
     * below (`handleSseFrame`, `handlePicked`). Both triggers are viewer/client
     * controlled and can repeat once per frame or once per pick — logging every
     * occurrence would let a misbehaving or hostile viewer client flood the
     * host console. Reset in `open()` so a fresh session reports again.
     */
    sseParseWarned = false;
    globalIdWarned = false;
    constructor(resolveModel) {
        this.resolveModel = resolveModel;
    }
    isOpen() {
        return this.server !== null;
    }
    state() {
        if (!this.server)
            return null;
        return {
            port: this.port,
            url: `http://localhost:${this.port}/`,
            modelId: this.modelId,
            startedAt: this.startedAt,
            clientCount: this.server.clientCount(),
            selection: [...this.currentSelection],
        };
    }
    /**
     * Start the viewer for `model`. If already running for the same model,
     * returns the existing state. If a different model is requested, the
     * caller must `close()` first — we don't auto-swap to avoid surprising
     * mid-session changes.
     */
    async open(model, requestedPort = 0) {
        if (this.server) {
            if (this.modelId === model.id) {
                return this.state();
            }
            throw new Error(`Viewer already open for model '${this.modelId}'. Call viewer_close before switching to '${model.id}'.`);
        }
        if (!model.filePath) {
            throw new Error(`Cannot open viewer: model '${model.id}' has no on-disk file path. The viewer streams the .ifc directly from disk.`);
        }
        let resolvedPort = requestedPort;
        this.server = await startViewerServer({
            filePath: model.filePath,
            fileName: model.name,
            port: requestedPort,
            onReady: (boundPort) => {
                resolvedPort = boundPort;
            },
        });
        this.port = resolvedPort;
        this.modelId = model.id;
        this.startedAt = Date.now();
        this.currentSelection = [];
        this.sseParseWarned = false;
        this.globalIdWarned = false;
        this.subscribeToEvents();
        return this.state();
    }
    close() {
        this.sseAbort?.abort();
        this.sseAbort = null;
        if (this.server) {
            try {
                this.server.close();
            }
            catch (err) {
                // Server already disposed — surface for diagnostics, then move on.
                // eslint-disable-next-line no-console
                console.error('[viewer-manager] close error', err);
            }
        }
        this.server = null;
        this.port = 0;
        this.modelId = null;
        this.currentSelection = [];
    }
    /** Subscribe to selection changes. Returns an unsubscribe handle. */
    onSelection(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    /** Build viewer + visibility streaming adapters bound to the running port. */
    adapters() {
        if (!this.server)
            return null;
        return {
            viewer: createStreamingViewerAdapter(this.port),
            visibility: createStreamingVisibilityAdapter(this.port),
        };
    }
    /** Send a one-off command via the viewer's REST API. */
    async sendCommand(action, payload = {}) {
        if (!this.server)
            throw new Error('Viewer is not open. Call viewer_open first.');
        const res = await fetch(`http://localhost:${this.port}/api/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...payload }),
        });
        if (!res.ok) {
            throw new Error(`Viewer command '${action}' failed: HTTP ${res.status}`);
        }
    }
    // ── internals ──────────────────────────────────────────────────────────
    subscribeToEvents() {
        this.sseAbort = new AbortController();
        void this.consumeSse(this.sseAbort.signal).catch((err) => {
            if (err.name === 'AbortError')
                return;
            // eslint-disable-next-line no-console
            console.error('[viewer-manager] SSE error', err);
        });
    }
    async consumeSse(signal) {
        const url = `http://localhost:${this.port}/events`;
        const res = await fetch(url, { signal, headers: { Accept: 'text/event-stream' } });
        if (!res.body)
            return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { value, done } = await reader.read();
            if (done)
                break;
            buf += decoder.decode(value, { stream: true });
            let idx = buf.indexOf('\n\n');
            while (idx !== -1) {
                const frame = buf.slice(0, idx);
                buf = buf.slice(idx + 2);
                this.handleSseFrame(frame);
                idx = buf.indexOf('\n\n');
            }
        }
    }
    handleSseFrame(frame) {
        // Each frame is one or more `data: ...` lines.
        const dataLines = frame.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim());
        if (dataLines.length === 0)
            return;
        const payload = dataLines.join('\n');
        let parsed;
        try {
            parsed = JSON.parse(payload);
        }
        catch (err) {
            // Legitimately silent as a *control-flow* matter: the viewer's SSE
            // stream carries frames this client does not model (and
            // comment/keepalive lines). A frame we can't parse is one we don't act
            // on — dropping it loses nothing, and the caller's contract (no throw)
            // is unchanged. But it should not be silent as a *diagnostic* matter:
            // warn once per session rather than once per frame, since this trigger
            // is server-controlled and can repeat at frame frequency.
            if (!this.sseParseWarned) {
                this.sseParseWarned = true;
                // eslint-disable-next-line no-console
                console.warn('[viewer-manager] SSE frame failed to parse as JSON; dropping it (further occurrences this session are suppressed)', err);
            }
            return;
        }
        if (parsed.action === 'picked' && typeof parsed.expressId === 'number') {
            this.handlePicked(parsed.expressId, parsed.ifcType);
        }
    }
    handlePicked(expressId, ifcType) {
        const model = this.resolveModel(this.modelId);
        let globalId;
        // @raw-entity-enumeration-ok optional GlobalId enrichment for one source pick event, not a live entity enumeration
        if (model && model.store.entityIndex.byId.has(expressId)) {
            try {
                globalId = new EntityNode(model.store, expressId).globalId || undefined;
            }
            catch (err) {
                // Legitimately silent as a *control-flow* matter: GlobalId is an
                // optional enrichment of the selection event. Its absence is already
                // representable (`undefined`) and the selection is still reported
                // with expressId + ifcType — the caller's contract does not change.
                // But it should not be silent as a *diagnostic* matter: warn once
                // per session rather than once per pick, since picks are
                // viewer-client controlled and can repeat quickly.
                if (!this.globalIdWarned) {
                    this.globalIdWarned = true;
                    // eslint-disable-next-line no-console
                    console.warn('[viewer-manager] globalId enrichment failed; reporting selection without globalId (further occurrences this session are suppressed)', err);
                }
                globalId = undefined;
            }
        }
        this.currentSelection = [{ expressId, ifcType, globalId }];
        for (const listener of this.listeners) {
            try {
                listener(this.currentSelection, model);
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error('[viewer-manager] listener error', err);
            }
        }
    }
}
//# sourceMappingURL=viewer-manager.js.map