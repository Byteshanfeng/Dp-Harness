import type { TuiHostOptions } from './types.js';
export declare const SUBCOMMANDS: {
    name: string;
    description: string;
}[];
/** '/blender <sub>' → 文本。导出给自检。 */
export declare function blenderCommand(rawInput: string, opts: TuiHostOptions, signal?: AbortSignal): Promise<{
    kind: string;
    text: string;
}>;
