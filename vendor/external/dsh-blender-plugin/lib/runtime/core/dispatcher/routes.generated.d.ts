export type GuiRouteKind = 'dispatch' | 'qc-render' | 'montage' | 'motion' | 'deliver' | 'view' | 'render';
export type EnsureName = 'ensureAssembly' | 'ensureAudit' | 'ensureBlockout' | 'ensureCalib' | 'ensureClearance' | 'ensureContract' | 'ensureDeliver' | 'ensureEvalharness' | 'ensureFace' | 'ensureFix' | 'ensureGate' | 'ensureGenerator' | 'ensureHuman' | 'ensureImg' | 'ensureMaterial' | 'ensureMontage' | 'ensureMotion' | 'ensurePipeline' | 'ensurePlanner' | 'ensurePrint' | 'ensureQc' | 'ensureQcRender' | 'ensureSculpt' | 'ensureShape' | 'ensureShapesolve' | 'ensureSurface' | 'ensureSweep' | 'ensureUv' | 'ensureVehicle' | 'ensureView' | 'ensureVisualReport';
export interface GuiRoute {
    readonly id: string;
    readonly kind: GuiRouteKind;
    readonly match: 'prefix' | 'exact';
    readonly op: string | null;
    readonly prefix: string;
    readonly strip: number;
    readonly api: string;
    readonly ensure: EnsureName;
    readonly timeoutMs: number;
    readonly sub: string | null;
    readonly preload: string | null;
    readonly subAliases: Readonly<Record<string, string>>;
}
export declare const MAIN_ROUTES: readonly GuiRoute[];
export declare const MODULE_ROUTES: readonly GuiRoute[];
export declare const EXT_ROUTES: readonly GuiRoute[];
