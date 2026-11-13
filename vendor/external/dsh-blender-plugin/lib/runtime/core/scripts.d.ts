declare function workdirBlock(p: unknown): string;
/**
 * v0.9.6（现场反馈 #4 · MK1 冒烟测试踩到）：script_file 的内容是**内联**进 dsh_headless_*.py 的，
 * 于是脚本里 __file__ 指向那个临时包装文件、脚本自己的目录也不在 sys.path —— 多文件工程第一行
 * import 就 ModuleNotFoundError: No module named 'spec'。这里显式把原路径与目录补给脚本。
 */
declare function scriptFileBlock(origWinPath: unknown): string;
declare function envPrelude(envPairs: unknown): string;
/**
 * v0.9.3：路径体检 —— Windows Blender 把 '/home/x' 当"当前盘根下的相对路径"，
 * 静默写到 C:\home\x（证据：Saved: 'C:homesixtyseven67DSH…' 紧随其后 os.path.exists() -> false）。
 * 这里在脚本收尾时检查 scene.render.filepath；配合 stdout 里的 Saved: 扫描（pathAudit）。
 *
 * 这条体检的前提是「WSL 宿主 + Windows 版 Blender」：只有那种组合才把 POSIX 绝对路径读错。
 * 原生 Linux 上 Blender 与宿主同机同 OS，'/home/x' 本来就是对的 ⇒ 必须关掉，否则每个正常脚本
 * 都回一条 `render_filepath_posix` 假警告，还把人往"改成 Windows 形式"的错方向引（issue #11）。
 */
export declare const PATH_GUARD: string;
declare function shotsBlock(args: unknown): string;
export interface FileFingerprint {
    path: string | null;
    wsl: string | null;
    size?: number;
    mtimeMs?: number;
    mtime?: string;
    md5?: string;
    md5Partial?: boolean;
    md5Note?: string;
    error?: string;
}
/** 文件指纹：返回 {path,size,mtimeMs,md5,md5Partial}；>512MB 只哈希前 64MB 并标注 partial */
declare function fileFingerprint(winPath: unknown, wslPath: string): FileFingerprint;
declare function md5File(p: string, limit?: number): string;
export { workdirBlock, scriptFileBlock, envPrelude, shotsBlock, fileFingerprint, md5File };
