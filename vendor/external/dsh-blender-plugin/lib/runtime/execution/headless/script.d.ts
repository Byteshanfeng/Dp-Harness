import { writeHeadlessScript } from '../../staging.js';
import type { PreparedHeadless } from './types.js';
export interface BuiltHeadlessScript {
    body: string;
    args: string[];
    sp: ReturnType<typeof writeHeadlessScript> | null;
}
/**
 * Assemble the Python prelude/body and Blender argv. Pure string construction except for
 * the temporary script file written by writeHeadlessScript (which is the staging seam).
 */
export declare function buildHeadlessScript(p: PreparedHeadless): BuiltHeadlessScript;
