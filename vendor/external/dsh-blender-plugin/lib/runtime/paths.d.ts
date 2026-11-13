/** 与 engine.mjs 同目录（runtime/） */
export declare const HERE: string;
/** Python 资产根：源码树里 = runtime/；构建产物里 = 包根 runtime/（lib/runtime/*.js 的上一层再上两层） */
export declare const PY_ROOT: string;
export declare const ADDRESS: {
    host: string;
    port: number;
};
export declare const WIN_TMP: string;
export declare const WSL_TMP: string;
export declare const LIVE_PNG_WIN: string;
export declare const LIVE_PNG_WSL: string;
/**
 * 把宿主侧路径表达成「Blender 进程侧」的形式。
 * Windows：path.win32.join（反斜杠 + 盘符）；WSL：wslToWin；macOS：identity（同机同 OS）。
 * macOS 支持：原先散落的 path.win32.join 在 mac 上会产出 \Users\... 这种垃圾串，
 * 统一收到这里，避免以后再漏。
 */
export declare function blenderJoin(...parts: string[]): string;
export declare const PY_DOMAINS: string[];
/** 公开模块名 → runtime/py/<domain>/<name>.py（唯一登记源是 modules.json）。 */
export declare function pyModuleFile(name: unknown): string;
/** 全部公开模块名（preload 报错时列出用；不随文件系统变化）。 */
export declare function pyModuleNames(): string[];
export declare function pyModuleExists(name: unknown): boolean;
/** 共享内核（kit）：JSON/API 样板·单位·几何·度量·回执骨架的唯一实现 */
export declare const KIT_PATH: string;
/** 几何底座（geo）：**机制层** —— 布尔/开孔/开槽/镜像/阵列/拉伸/放样/倒角/自动平滑。
 *  只给动词、不给名词（不含任何形状默认值）；与 kit 同等由 KERNEL_BOOTSTRAP 保证在场。 */
export declare const GEO_PATH: string;
export declare const RUNNER_PATH: string;
export declare const PERF_PATH: string;
export declare const VIEW_PATH: string;
/** 契约层：组件/连接注册、包络/干涉/接口校验、破坏性门控、证据账本、三态判定 */
export declare const CONTRACT_PATH: string;
/** 规划器：对象图 → 诊断 → 编译到 bpy → 图导出 */
export declare const PLANNER_PATH: string;
export declare const WORKER_PATH: string;
export declare const TXN_PATH: string;
/** 内置 QC（v0.7.0）：掩膜 / IoU / 剖面 / 对照图 + 内环 measure 预置 */
export declare const QC_PATH: string;
/** 渲染 harness（v0.8.8）：自动取景 + 固定三点光 + 逐张 jsonl 计时 + 预算判定 */
export declare const QC_RENDER_PATH: string;
/** 配方库（v0.8.2）：参数组合的保存 / 套用 / 导出 */
export declare const PRESET_PATH: string;
/** 网格体检（v0.9.0 接通）：audit_* 前缀 op 走这里。
 *  此前 audit.py 只存在于 preload 通道，docs 里文档化的 blender_rt_plan(op="audit_mesh") 其实没有路由。 */
export declare const AUDIT_PATH: string;
/** 拼图（v0.9.0 接通）：montage op 走这里（证据分级 L2：裁切拼图给眼看的少数格） */
export declare const MONTAGE_PATH: string;
/** 铰接/机构（v0.9.0）：关节实测 + 扫掠验证 + URDF/USDA 导出（motion_* 前缀 op） */
export declare const MOTION_PATH: string;
/** 交付导出（v0.9.0）：单位盒归一化 + 多组 OBJ/MTL + manifest(md5)（deliver_* 前缀 op） */
export declare const DELIVER_PATH: string;
/** 生成器注册表（v0.9.0 · #18 代码化建模通道的 Blender 原生轻量版）：已归入 geometry 领域包。 */
export declare const GENERATOR_PATH: string;
/** 程序化雕刻（v0.9.6 · 上游整合）：sculpt_* 前缀 op 走这里。
 *  上游两家都做不到程序化雕刻（blend-ai 自述不能模拟笔触；mcp-for-blender 没有雕刻），
 *  本模块用 numpy 位移笔刷 + 拓扑准备 + 遮罩把"雕刻"变成可复算的几何操作。 */
export declare const SCULPT_PATH: string;
/** 网格修复闭环（v0.9.6 · 上游整合）：fix_* 前缀 op —— audit 只诊断，这里负责治。 */
export declare const FIX_PATH: string;
/** UV 四件套（v0.9.6 · 上游整合）：已归入 geometry 领域包。 */
export declare const UV_PATH: string;
/** 制造检查（v0.9.6 · 上游整合）：print_* 前缀 op（薄壁 / 悬垂 / 壳体 / 汇总）。 */
export declare const PRINT_PATH: string;
/** 沿路径扫掠（v0.9.6 · 上游整合）：sweep_* 前缀 op（管路/线缆/轨道 + 弯折半径先算后建）。 */
export declare const SWEEP_PATH: string;
/** 材质节点图（v0.9.6）：material_* 前缀 op —— 实测 2,732 次节点连线 / 204 个脚本在重复造轮子 */
export declare const MATERIAL_PATH: string;
/** 渲染状态跟踪（v0.9.6）：渲染开始写磁盘标记、结束删；后端读文件秒判 busy */
export declare const RENDER_GUARD_PATH: string;
/** 规格驱动门包（v0.9.6 · 现场反馈 #3）：一份 spec 跑完所有门（三态判定） */
export declare const GATE_PATH: string;
/** 参考图量具（整合方案）：量成数字 / 裁出来放大 / 画回去 / 差分 */
export declare const IMG_PATH: string;
/** 门标定套件：注入 8 类缺陷量门抓得住几类 + 健康基线对照 */
export declare const CALIB_PATH: string;
/** 人脸比例门：landmarks → 6 个无量纲比例 → 与经典/参考比差 */
export declare const FACE_PATH: string;
/** 人形素体（零素材）：关节坐标+半径 → Skin+Subsurf → 比例正确的假人 */
export declare const HUMAN_PATH: string;
/** 成对间隙门：规则表驱动的最近距离 + 互穿判定 */
export declare const CLEARANCE_PATH: string;
/** 车辆外壳：纵向剖面 → 放样成壳（解析轮眉）+ 比例门 */
export declare const VEHICLE_PATH: string;
/** 参考图通用还原方法层：类别协议 + 通用量具/放样/拟合/分件/旋转体 */
export declare const SHAPE_PATH: string;
/** 流水线：工件注册表 + 步骤编排 */
export declare const PIPELINE_PATH: string;
/** 装配：manifest / 全对全分类扫描 / 合并 / 装配门 */
export declare const ASSEMBLY_PATH: string;
/** 白模：声明式 blockout + 3 视图 + GLB 导出 */
export declare const BLOCKOUT_PATH: string;
/** 同机位 QC 视觉报告（verdict-first） */
export declare const VISUALREPORT_PATH: string;
/** 无头多视轮廓拟合（解析投影，不渲染） */
export declare const SHAPESOLVE_PATH: string;
/** 缺陷注入/基线回放评估（evalharness） */
export declare const EVALHARNESS_PATH: string;
/** 曲面算法包：loft/sweep/patch/validate */
export declare const SURFACE_PATH: string;
/**
 * 用户 Blender 配置目录（GPU 偏好所在）—— 无头进程默认读不到它，Cycles 会静默回落 CPU。
 * 分享版默认 null（用系统默认配置）；要继承某套配置就设 DSH_BLENDER_USER_CONFIG / 配置项 blenderUserConfig。
 */
export declare const USER_CONFIG_WIN: string | null;
export declare const USER_SCRIPTS_WIN: string | null;
/** GPU 前导：无头进程里把 Cycles 设备配好，并打印 DSH_GPU 回执（详见 README「GPU 语义」） */
/**
 * 引擎前导（v0.8.0）：默认 **EEVEE + 光追**，可选 cycles（OptiX 设备前导）/ keep（不动）。
 * 为什么默认换 EEVEE：① 它本来就是纯 GPU 渲染，走图形后端（本机 OPENGL / RTX 4060），
 *   **不依赖 compute_device_type 这类"偏好"** → 无头里不会像 Cycles 那样静默回落 CPU；
 * ② 实测（360 对象 / 350 网格 / 512×512 / 64 采样）：EEVEE+RT 预热帧 **1.35 s** vs Cycles GPU **3.13 s**（2.3×）；
 * ③ 代价：首帧着色器编译 ~16 s → 迭代请配 blender_rt_worker 热会话（编译一次，此后每帧 1.35 s）。
 * 回执标记沿用 DSH_GPU（兼容），内含 engine / backend / renderer / rt 状态。
 */
export declare const GPU_PRELUDE: string;
/** 自定义视角出图（默认覆盖写这个文件） */
export declare const VIEW_PNG_WIN: string;
export declare const VIEW_PNG_WSL: string;
/** 无头 Blender 可执行文件（WSL 侧路径；spawn 走 binfmt 直接起 Windows 进程）；找不到时由工具给出配置指引 */
export declare const BLENDER_EXE: string | null;
export { PKG_ROOT } from './config.js';
export declare const PATH_HELPERS: string;
/** act 包装：异常也回传 partial stdout/stderr/traceback（v0.7.0） */
export declare const ACT_WRAPPER: (src: string) => string;
export declare const KIT_SRC: string;
export declare const KIT_HASH: string;
export declare const GEO_SRC: string;
export declare const GEO_HASH: string;
