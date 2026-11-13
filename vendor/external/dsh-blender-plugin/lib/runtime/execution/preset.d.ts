export interface PresetDeps {
    addon: import('../transport/probes.js').AddonClient;
    ensurePreset: () => Promise<unknown>;
}
export declare function createPresetApi(E: PresetDeps): {
    presetCall: (op: unknown, payload: unknown) => Promise<unknown>;
};
