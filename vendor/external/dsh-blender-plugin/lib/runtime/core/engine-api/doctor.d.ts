import type { EngineApiDeps } from './index.js';
/**
 * addon 侧阶段预算。宿主 backendJson 默认 20s、T.commands 静态截止 60s；
 * 这里的预算必须落在宿主之前，否则模型只拿到 aborted，看不到任何结构化诊断。
 */
/**
 * /status 的 bpy 往返（REGION_CODE）预算：5s —— 修复后的诚实值（启动探测不再占串行队列头，
 * 修复前只能收到 3.5s）。注意 installAddonSend 在 transport 错误后还会串一次 diagnose()
 * （半开 addon 约 2.5s），所以这里不能贴着 host 的 20s，留足余量（半开稳态 ≈5s + 2.5s）。
 */
export declare const ADDON_STATUS_TIMEOUT_MS = 5000;
/** /doctor 的 status 阶段预算：4s（修复后回调；半开场景 ≈4s + 复用诊断 ≈2.5s，仍 <10s 目标）。 */
export declare const ADDON_DOCTOR_STATUS_TIMEOUT_MS = 4000;
/** /commands 的 FLAGS + 5 个集成必须整段落在客户端预算内：15s + 5×(3s+~2.5s 诊断)≈42.5s < 45s 客户端 < 60s 宿主。 */
export declare const ADDON_FLAGS_TIMEOUT_MS = 15000;
/** /commands 单个集成 status 预算（5 个串行；失败还会各串一次 ~2.5s 诊断，故取 3s）。 */
export declare const ADDON_INTEGRATION_TIMEOUT_MS = 3000;
/** 是否"等不到 addon 回包"类错误（超时/被 abort）：把失败归因到 addon/bpy 而不是后端进程。 */
export declare function isAddonTimeout(e: unknown): boolean;
export declare function statusView(E: EngineApiDeps, opts?: {
    addonTimeoutMs?: number;
}): Promise<Record<string, unknown>>;
/**
 * （PR review）：addon 明确回了错误（非超时）时的归因。
 * 这类失败说明通道在（TCP 通、addon 有响应），不要归成 main-thread-busy / blender-unreachable。
 */
export declare function addonErrorDiagnosis(error: string): Record<string, unknown>;
export declare function createDoctorApi(E: EngineApiDeps): {
    protocol(): Promise<import("../../transport/probes.js").ProtocolInfoView>;
    /** 现场体检：真跑一次 bpy 往返（status），通了才算 ok；不通才去三级判定 */
    doctor(): Promise<Record<string, unknown>>;
    /** 3D 视口区域 rect / 窗口尺寸 / 着色模式 */
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
};
