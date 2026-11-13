export interface TrajWriteDeps {
    TRAJ_OFF: boolean;
    TRAJ_DIR: string;
    TRAJ_FULL: boolean;
    TRAJ_MAX_BYTES: number;
}
export declare function trajRecord(deps: TrajWriteDeps, route: string, op: unknown, args: unknown, ms: number, ok: unknown, err: unknown, extra: unknown): void;
