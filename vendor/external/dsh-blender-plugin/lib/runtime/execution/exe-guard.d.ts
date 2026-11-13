/**
 * blenderExe 为空/空白时抛结构化 blender_exe_missing（code + 可执行的配置 hint）。
 * retryTool 用于 hint 末尾的重试动作（worker 与 job 不同）。
 */
export declare function assertBlenderExe(exe: unknown, detectedFrom?: unknown, retryTool?: string): void;
export declare function blenderExeSource(): string;
