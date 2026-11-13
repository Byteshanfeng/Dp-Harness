/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
export class ToolRegistry {
    tools = new Map();
    register(tool) {
        if (this.tools.has(tool.name)) {
            throw new Error(`Duplicate tool registration: ${tool.name}`);
        }
        this.tools.set(tool.name, tool);
    }
    registerAll(tools) {
        for (const tool of tools)
            this.register(tool);
    }
    get(name) {
        return this.tools.get(name) ?? null;
    }
    list() {
        return Array.from(this.tools.values());
    }
    has(name) {
        return this.tools.has(name);
    }
}
//# sourceMappingURL=types.js.map