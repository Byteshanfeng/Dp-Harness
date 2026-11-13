declare function extractTag(out: unknown, tag: string): unknown;
declare function extractLoop(out: unknown): unknown;
declare function jsonFromStdout(out: unknown): unknown;
/** 路径映射见 config.mjs：winToWsl / wslToWin（Windows 上原样返回） */
/** 无头运行用的 python 脚本落到 Windows 可见目录；/mnt 不可写时退回包内 tmp + UNC */
/** v0.8.10：长输出"头+尾+省略标记"—— 旧版只回尾部，长 JSON 的头被吃掉 */
declare function clipMiddle(s: unknown, head: number, tail: number): string;
/**
 * v0.9.6（现场反馈：WSL 绝对路径的"二次前缀"）：`home/.../DSH/测试/x.py` 这种**漏了开头 /** 的路径
 * 会被当相对路径接到 cwd 后面，得到 `...DSH\\home\\sixtyseven67\\DSH\\测试\\x.py`。
 * 判据：补一个 "/" 之后确实存在 → 纠正并记一笔（同时写后端 stderr，便于排错）。
 */
declare function slipFixPath(p: unknown, notes?: string[] | null): string;
export { extractTag, extractLoop, jsonFromStdout, clipMiddle, slipFixPath };
