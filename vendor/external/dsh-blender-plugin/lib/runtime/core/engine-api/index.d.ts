import type { AddonClient } from '../../transport/probes.js';
import type { JobRecord } from '../../execution/jobs/index.js';
export interface EngineApiMetrics {
    [k: string]: unknown;
    lastCmdAt: number | null;
    views: number;
}
export interface EngineApiDeps {
    LEDGER: string;
    RESULTS_DIR: string;
    SESSION_NAME: string;
    TRAJ_DIR: string;
    TRAJ_FULL: boolean;
    TRAJ_OFF: boolean;
    addon: AddonClient;
    clearWorkerReaper: () => void;
    ensureRunner: () => Promise<unknown>;
    ensureView: () => Promise<unknown>;
    jobSnapshot: (j: JobRecord) => Record<string, unknown>;
    jobs: Map<string, JobRecord>;
    killWorkers: () => void;
    ledgerList: (limit?: number) => Array<Record<string, unknown>>;
    ledgerState: () => Record<string, unknown>;
    metrics: EngineApiMetrics;
    perfCall: (op: string, payload?: unknown) => Promise<unknown>;
    runSnapshot: (r: Record<string, unknown>) => Record<string, unknown>;
    runs: Map<string, unknown>;
}
export declare function createEngineApi(E: EngineApiDeps): {
    hostSceneItems(spec?: Record<string, unknown>): Promise<Record<string, unknown>>;
    start(): Promise<boolean>;
    stop(): void;
    view(spec?: Record<string, unknown>): Promise<{
        png: NonSharedBuffer;
        meta: Record<string, unknown>;
    }>;
    frameArea(areaIndex?: number): Promise<{
        png: NonSharedBuffer;
        meta: {
            method: string;
            info: string;
        };
    }>;
    frame(maxSize?: number): Promise<{
        png: NonSharedBuffer;
        meta: unknown;
    }>;
    loopStart(spec: unknown): Promise<unknown>;
    loopStatus(history?: number): Promise<unknown>;
    loopStop(): Promise<unknown>;
    loopBench(iterations?: number): Promise<unknown>;
    loopBoard(limit?: number, groups?: boolean): Promise<unknown>;
    loopExport(opts?: Record<string, unknown>): Promise<unknown>;
    loopHelp(): Promise<unknown>;
    act(code: unknown, timeoutMs?: number, file?: unknown): Promise<{
        ok: boolean;
        executed: boolean;
        ms: number;
        mainThreadMs: number;
        stdout: {};
        stderr: {};
        error: string | null;
        traceback: {} | null;
        sceneEpoch: {} | null;
        file: {} | null;
        marker_missing?: undefined;
    } | {
        ok: boolean;
        executed: boolean;
        ms: number;
        mainThreadMs: number;
        stdout: string;
        stderr: string;
        error: null;
        traceback: null;
        marker_missing: boolean;
        file: {} | null;
        sceneEpoch?: undefined;
    }>;
    cmd(name: unknown, params?: Record<string, unknown>, timeoutMs?: number): Promise<unknown>;
    protocol(): Promise<import("../../transport/probes.js").ProtocolInfoView>;
    doctor(): Promise<Record<string, unknown>>;
    status(): Promise<Record<string, unknown>>;
    commands(): Promise<{
        scene: unknown;
        file: unknown;
        total: number;
        available: string[];
        disabled: string[];
        gates: Record<string, unknown>;
        integrations: Record<string, unknown>;
    }>;
    metrics(): {
        lastCmdAgeMs: number | null;
        lastCmdAt: number | null;
        views: number;
    };
};
