/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
export class ResourceRegistry {
    providers = [];
    register(provider) {
        this.providers.push(provider);
    }
    registerAll(providers) {
        for (const p of providers)
            this.register(p);
    }
    async list(ctx) {
        const all = [];
        for (const p of this.providers) {
            const items = await p.list(ctx);
            for (const item of items)
                all.push(item);
        }
        return all;
    }
    matchProvider(uri) {
        for (const p of this.providers) {
            if (p.match(uri))
                return p;
        }
        return null;
    }
}
//# sourceMappingURL=types.js.map