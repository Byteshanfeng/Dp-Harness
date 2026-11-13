/** 探测依赖面：默认 = 生产实现；测试按需覆盖（未给的键仍走生产实现） */
export interface BlenderDetectDeps {
    env: Record<string, string | undefined>;
    isWin: boolean;
    isMac: boolean;
    homedir: () => string;
    exists: (p: string) => boolean;
    listDir: (p: string) => string[];
    readText: (p: string) => string | null;
    exec: (cmd: string, args: string[]) => string;
    /** 配置文件内容（config.ts 的 FILE.cfg）；单独给是为了让 env/config 覆盖也能被测到 */
    fileCfg: Record<string, unknown>;
}
export interface BlenderDetectResult {
    /** 命中的 blender 可执行文件；都没有就是 null */
    exe: string | null;
    /** 溯源：config / auto:install / auto:steam / auto:path / not-found */
    from: string;
}
export declare function detectBlenderExe(over?: Partial<BlenderDetectDeps>): BlenderDetectResult;
