/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
export class PromptRegistry {
    prompts = new Map();
    register(prompt) {
        if (this.prompts.has(prompt.name)) {
            throw new Error(`Duplicate prompt registration: ${prompt.name}`);
        }
        this.prompts.set(prompt.name, prompt);
    }
    registerAll(prompts) {
        for (const p of prompts)
            this.register(p);
    }
    get(name) {
        return this.prompts.get(name) ?? null;
    }
    list() {
        return Array.from(this.prompts.values()).map((p) => ({
            name: p.name,
            description: p.description,
            arguments: p.arguments,
        }));
    }
}
//# sourceMappingURL=types.js.map