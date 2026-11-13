/**
 * Pre-baked prompt templates (spec §9). The aim is the same as Claude
 * Code's slash commands: package the "BIM expert" intent + the right tool
 * sequence so a non-power user gets a useful answer in one click.
 *
 * Templates are pure text — no eval, no interpolation beyond `${arg}`.
 */
import type { Prompt } from './types.js';
export declare const auditModel: Prompt;
export declare const findFireRatedDoors: Prompt;
export declare const generateBcfFromIds: Prompt;
export declare const compareVersions: Prompt;
export declare const spaceProgramCheck: Prompt;
export declare const clashReview: Prompt;
export declare const propQualityPass: Prompt;
export declare const migrateToIfcx: Prompt;
export declare const visualAudit: Prompt;
export declare const interactivePropertyInspect: Prompt;
export declare const visualizeQuery: Prompt;
export declare const allPrompts: Prompt[];
//# sourceMappingURL=templates.d.ts.map