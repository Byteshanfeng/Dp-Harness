/**
 * F-09 · file= 参数守卫（engine 与工具端共用）——
 * 「file= 缺失 / 空串 / 参数名拼错」不再被静默包装成一次成功执行
 * （旧症状：ok=true / exitCode=0 / inputFile=null / 零警告 / 脚本拿到出厂空场景）。
 *
 * 纯函数模块，三个消费面共用同一份判定：
 *  - runtime/execution/headless.ts + runtime/execution/jobs.ts（直连 /headless 的兜底守卫 + 回执语义）
 *  - src/index.ts（工具端 ALIAS / 空串拦截 —— 工具端在 body 组装前就把 falsy 剥成
 *    undefined，引擎侧守卫对工具路径**永不触发**，所以 ALIAS 必须落在这一侧）
 *  - tests/unit/js/headless-file-guard.test.ts（离线单测，不需要 Blender / 后端）
 */
/** file= 的常见误用参数名。工具端见到这些键存在（≠undefined）就必须明确报错，
 *  而不是静默当成"没传"——静默丢参数正是 F-09 签名之一（blend=<好路径> → 空场景 ok=true）。 */
export declare const FILE_ALIAS_KEYS: string[];
/** 返回 args 里出现过的 file= 别名键（用于报错文案点出"正名是 file"）。 */
export declare function detectFileAlias(args: unknown): string[];
/**
 * 引擎侧守卫：返回规范化的 file=（非空字符串）或 undefined（= 未传）。
 *  - '' / 纯空白 → throw code='file-empty'：显式拒绝"传了但为空"，不再静默当没传
 *  - null / undefined → undefined（未传语义；回执侧由 describeMissingInput + no_input_file 警告补话）
 *  - 单元素字符串数组 → 取唯一元素（保留既有 String([p])===p 的便利行为，不借修复之名改语义）
 *  - 其余非字符串 → throw code='file-type'（对象/数组旧行为是拼成 "[object Object]" 走 ENOENT，
 *    现在提前一步给出可读错误，错误路径不变式：ok=false）
 */
export declare function validateFileOpt(raw: unknown): string | undefined;
/**
 * 「没开档」的回执语义：不再用一个裸 null —— given/opened/reason 让
 * 「没给档」与「给了 .py」在回执里可区分。
 * 形态冻结（issue 兼容性条款）：正常路径的 fileFingerprint 返回值**一字不动**；
 * 只把原 null 分支换成带语义的对象。仓内 truthiness 消费点（src/index.ts 的
 * `if (r.inputFile && r.inputFile.md5)`）由 .md5 存在性把关，不受影响。
 */
export declare function describeMissingInput(fileOpt: unknown, fileLooksPython: boolean): {
    given: boolean;
    opened: boolean;
    reason: string;
};
/** 「成功但没开档」不许再无声：升级为回执 warnings 里的显式条目（不必翻 scriptFile 中继数据才知道）。 */
export declare function noInputFileWarning(fileLooksPython: boolean): {
    code: string;
    hint: string;
};
/**
 * stdout/stderr log 文件名去同毫秒撞名（与 staging 脚本撞名同根，issue）：
 * 旧档名只精确到毫秒，同毫秒两个 run 的 createWriteStream 追加写同一文件、stdout 互脏。
 * runId 每 run 唯一（客户端生成或引擎生成），拼进档名后同毫秒也不再相撞。
 */
export declare function headlessLogNames(stamp: string, runId: string | null | undefined): {
    stdout: string;
    stderr: string;
};
