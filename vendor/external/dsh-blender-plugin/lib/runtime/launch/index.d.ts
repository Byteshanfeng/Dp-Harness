import type { LaunchOpts } from './resolve.js';
export type { LaunchOpts } from './resolve.js';
export { ADDON_NAME_HINTS, LAUNCH_BOOT_PY, addonNameHit } from './resolve.js';
export declare function launchBlender(opts?: LaunchOpts): Promise<Record<string, unknown>>;
