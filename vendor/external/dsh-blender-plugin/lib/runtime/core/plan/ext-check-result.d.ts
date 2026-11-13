import type { ExtCandidateRun } from './ext-check-candidates.js';
/** glTF-Validator result: bounded message list, validator info and pass rule. */
export declare function gltfResult(parsed: Record<string, unknown> | null, winPath: string, run: Pick<ExtCandidateRun, 'used'>): Record<string, unknown>;
/** open3d result: the checker's own JSON plus the routing trace. */
export declare function open3dResult(parsed: Record<string, unknown> | null, run: Pick<ExtCandidateRun, 'used' | 'tried'>): Record<string, unknown>;
