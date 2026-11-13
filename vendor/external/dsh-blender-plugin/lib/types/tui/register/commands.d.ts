import type { TuiContext, TuiHostOptions } from '../types.js';
/** ③ @ 提及 */
export declare function registerMentionsSurface(host: TuiContext, opts: TuiHostOptions, tag: string): void;
/** ④ /blender 命令（DSH 核心接缝；Web 也会有）+ dsh-TUI 子命令补全 */
export declare function registerCommandSurface(host: TuiContext, opts: TuiHostOptions, tag: string): void;
