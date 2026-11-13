import fs from 'node:fs';
import type { ChildProcess } from 'node:child_process';
import type { JobRecord } from '../types.js';
import type { PreparedJob } from '../script/index.js';
import type { JobStartDeps } from './index.js';
export declare function spawnJobChild(d: JobStartDeps, j: JobRecord, p: PreparedJob, so: fs.WriteStream, se: fs.WriteStream, opts: Record<string, unknown>): {
    child: ChildProcess;
    stopHb: () => void;
};
