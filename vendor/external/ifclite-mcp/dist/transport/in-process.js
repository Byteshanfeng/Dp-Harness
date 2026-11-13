/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
export class InProcessTransport {
    server = null;
    listeners = [];
    async connect(server) {
        this.server = server;
        server.attach(this.makeSink());
    }
    /** Client → server. Returns the response (if any) for convenience. */
    async send(message) {
        if (!this.server)
            throw new Error('InProcessTransport: not connected');
        return this.server.handleMessage(message);
    }
    /** Subscribe to messages emitted by the server (responses + notifications). */
    onMessage(handler) {
        this.listeners.push(handler);
        return () => {
            const idx = this.listeners.indexOf(handler);
            if (idx >= 0)
                this.listeners.splice(idx, 1);
        };
    }
    close() {
        this.server?.detach();
        this.server = null;
        this.listeners = [];
    }
    makeSink() {
        return {
            send: (message) => {
                for (const listener of this.listeners) {
                    try {
                        listener(message);
                    }
                    catch (err) {
                        // A listener throwing should not crash the server; log to stderr.
                        // eslint-disable-next-line no-console
                        console.error('[in-process] listener error', err);
                    }
                }
            },
        };
    }
}
//# sourceMappingURL=in-process.js.map