import type { EngineApiDeps } from './index.js';
export declare function createActApi(E: EngineApiDeps): {
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
    /** 通用命令透传：任意 addon 命令名 + 参数（MCP 那层不暴露的也能调） */
    cmd(name: unknown, params?: Record<string, unknown>, timeoutMs?: number): Promise<unknown>;
};
