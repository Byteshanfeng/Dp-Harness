/**
 * S6 · 建模类型指引表（"哪类建模 → 第一步 + 该用哪些算子 + 禁止自造什么 + 验收门"）
 *
 * 为什么单独一份：catalog 是"能力族"视角（audit/qc/vehicle/…），模型想的是"我要建什么"。
 * 实测教训：另一个建模 AI 有 vehicle_* 配方、知道 Recipe 17/18/19，仍然自己写参数化放样 ⇒
 * 一张连续光滑面、没棱没缝、6 处结构硬伤。根因不是缺文档，是缺"入口 + 禁止自造 + 可数值判的验收门"。
 * 本表把这三样按**建模类型**写死，并让目录能按类查询：
 *   blender_rt_plan(op="catalog", args={classes:true})         → 全部类型
 *   blender_rt_plan(op="catalog", args={class:"recon"})        → 单类（入口/算子链/禁止自造/验收门）
 * 完整性由 tests/unit/js/contract/guidance.test.ts 机械检查（缺字段/写错 op 名会红）。
 */
export interface ModelingClassGuide {
    c: string;
    name: string;
    entry: string;
    chain: string;
    forbid: string;
    gate: string;
}
export declare const MODELING_CLASS_GUIDE: ModelingClassGuide[];
/** 单类的短渲染（模型一屏能读完：入口 → 链 → 禁止 → 门） */
export declare function renderClassText(r: ModelingClassGuide): string;
/** 供机械检查用：缺字段的类别会被 guidance contract test 报红 */
export declare function classGuideStats(): {
    classes: number;
    keys: string[];
    missing: string[];
};
/** 模型侧工具清单（15 个；v2.3 删除 blender_rt_pick）—— 与 capability.lock.json 逐名对拍（guidance contract test 守） */
export declare const MODEL_FACING_TOOLS: string[];
/**
 * 子代理交接块（S6-b）—— 主模型把它**原样粘进子代理提示词**。
 *
 * 为什么必需：子代理是自包含上下文（看不到主模型读过的 catalog），而它们倾向直接写 Python 绕过 plan 通道；
 * 实测后果就是"没用 vehicle_* 而自造放样 → 一张没棱没缝的光滑面"。
 * 目标：**短**（能塞进子代理提示词）、**只给判断所需的**（类型→第一步→禁止自造 + 工具名 + 硬规则 + 通道纪律）。
 */
export declare function renderHandoff(): string;
