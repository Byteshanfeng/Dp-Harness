import type { JobRecord } from '../types.js';
import type { PreparedJob } from '../script/index.js';
import type { JobStartDeps } from './index.js';
export declare function buildJobRecord(p: PreparedJob): JobRecord;
/** stdout/stderr 收尾解析（HEADLESS / DSH_SHOTS / 路径体检） */
export declare function collectJobOutputs(j: JobRecord, p: PreparedJob): void;
/** 结果落盘 + 终态摘要 + 台账（后端重启后仍可查） */
export declare function persistJobResult(d: JobStartDeps, j: JobRecord, p: PreparedJob, opts: Record<string, unknown>): void;
