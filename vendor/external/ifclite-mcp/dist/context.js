/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
export class InMemoryModelRegistry {
    models = new Map();
    list() {
        return Array.from(this.models.values());
    }
    get(id) {
        return this.models.get(id) ?? null;
    }
    resolve(id) {
        if (id)
            return this.models.get(id) ?? null;
        if (this.models.size === 1) {
            const only = this.models.values().next().value;
            return only ?? null;
        }
        return null;
    }
    add(model) {
        const previous = this.models.get(model.id);
        if (previous && previous !== model)
            previous.backend.dispose();
        this.models.set(model.id, model);
        model.backend.setPeerScopes(() => this.list().filter(peer => peer !== model).map(peer => ({ dataStore: peer.store, view: peer.backend.getMutationView() })));
    }
    remove(id) {
        this.models.get(id)?.backend.dispose();
        return this.models.delete(id);
    }
    count() {
        return this.models.size;
    }
}
export const NOOP_PROGRESS = {
    report() { },
};
export const SILENT_LOGGER = {
    log() { },
};
export const DEFAULT_CONFIG = {
    readOnly: false,
    samplingEnabled: false,
};
//# sourceMappingURL=context.js.map