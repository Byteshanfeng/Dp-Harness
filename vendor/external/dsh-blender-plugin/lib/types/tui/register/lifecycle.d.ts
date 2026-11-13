import type { TuiContext, TuiHostOptions, TuiServices } from '../types.js';
/** 注册一个"宿主 effect 生命周期内按固定间隔跑、不重入"的轮询；返回的清理函数由 c.effect 管理。 */
export declare function every(c: TuiServices, ms: number, fn: () => Promise<void>, label: string): void;
/** ① 选中 → chip（toast 可选：有就提示，没有也照常挂 chip） */
export declare function registerSelectionSurface(host: TuiContext, opts: TuiHostOptions, tag: string): void;
/** ② 页脚字段（tuiStatus.setField 是 dsh-TUI 较新的接缝：旧版只有 set()，这里不退化成整行状态） */
export declare function registerStatusSurface(host: TuiContext, opts: TuiHostOptions, tag: string): void;
