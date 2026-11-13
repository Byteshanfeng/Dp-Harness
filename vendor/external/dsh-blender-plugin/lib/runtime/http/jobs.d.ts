/**
 * §8.3 `<trimmed job>`：只留契约点名的字段，**裁掉大字段**（`script`、超长路径串等）。
 * `resultJson` > 8 KB 截断并置 `resultTruncated:true`（别让一次轮询把面板撑爆）。
 * **纯函数、零 I/O** —— 这是 `/host/jobs` 能做到"零 Blender 往返"的前提。
 */
declare function trimJob(j: unknown): Record<string, unknown>;
/** §8.3 clamp 口径：缺省/非数 → 默认值；给了数 → 夹进 [lo,hi]（**不报错**，照 §1.x 既有口径） */
declare function clampIntParam(v: unknown, dflt: number, lo: number, hi: number): number;
export { trimJob, clampIntParam };
