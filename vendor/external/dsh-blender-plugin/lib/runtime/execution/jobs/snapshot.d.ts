import type { JobRecord } from './types.js';
export declare function jobDir(id: string, outdir: string | null | undefined): string;
export declare function jobArtifacts(j: JobRecord): Array<{
    name: string;
    bytes: number;
    mtimeMs: number;
}>;
export declare function jobSnapshot(j: JobRecord): Record<string, unknown>;
/** 从日志文件里取尾部（run 与 job 通用） */
export declare function tailFile(p: string, tail: number): string | null;
