/**
 * selectionstore.ts —— 「Blender 原生选中 → DSH」事件存储（v2.3）。
 *
 * 为什么需要它：v2.3 起"选中"从 DSH 面板点截图迁到 **Blender N 面板**：
 * 用户在 Blender 原生选区里选好物体 → 点「发送选中到 DSH」→ addon `POST /host/selection`
 * → Web/TUI 的客户端半边轮询 `/host/selection/latest` → 把对象名插入**当前会话草稿**
 * （不自动发送）→ `POST /host/selection/consume` 标记已消费。
 *
 * 唯一真源：`docs/宿主集成-接口契约-v2.3增补.md`。
 *
 * 纪律：
 *   · 纯内存、零 I/O、零 Blender 往返（addon 自己 POST 过来；轮询方绝不碰 Blender）。
 *   · payload 在入口**消毒**（长度 / 条数上限），不让任意字符串把面板或回执撑爆。
 *   · `consume` 只增不减；同一份选中最多被插入一次（多标签页竞争的最坏结果是重复插入，服务端不撒谎）。
 */
/** 名字条数上限（选择全部 4000 对象时也不让 payload 失控）。 */
export declare const MAX_SELECTION_NAMES = 200;
/** 对象明细条数上限（名字之外的那份）。 */
export declare const MAX_SELECTION_OBJECTS = 50;
/** 「选中涉及哪些集合」摘要条数上限。 */
export declare const MAX_SELECTION_COLLECTIONS = 50;
/** 单个字符串上限。 */
export declare const MAX_STRING_CHARS = 200;
/** 子元素（编辑模式）索引/骨骼条数上限。 */
export declare const MAX_SUB_INDICES = 2000;
export declare const MAX_SUB_BONES = 500;
export declare const MAX_SUB_POINTS = 2000;
/** 未消费的选中超过这个年龄只做提示，不阻止消费。 */
export declare const STALE_MS: number;
export type SelectionObject = {
    name: string;
    type: string;
    dimensions_mm?: Array<number | null>;
};
export type SelectionCollection = {
    name: string;
    count: number;
};
export type SelectionSub = {
    type: string;
    object: string;
    mode: string | null;
    counts: Record<string, number>;
    truncated: boolean;
    note?: string;
    select_mode?: {
        vertex: boolean;
        edge: boolean;
        face: boolean;
    };
    indices?: Record<string, number[]>;
    bones?: string[];
    points?: Array<[number, number]>;
};
export type SanitizedSelection = {
    kind: 'objects' | 'collection';
    collection: string | null;
    count: number;
    names: string[];
    truncated: boolean;
    active: string | null;
    mode: string | null;
    objects: SelectionObject[];
    collections: SelectionCollection[];
    sub: SelectionSub | null;
};
export type SanitizedActivity = {
    state: string | null;
    human_active: boolean;
    agent_active: boolean;
};
export type SanitizedPayload = {
    v: 1;
    source: string;
    sent_at: number | null;
    selection: SanitizedSelection;
    scene: {
        name: string | null;
        file: string | null;
    };
    activity: SanitizedActivity | null;
};
export type LastConsume = {
    seq: number;
    ok: boolean | null;
    how: string | null;
    reason: string | null;
    at: number;
};
export type PutResult = {
    ok: true;
    seq: number;
    received_at: number;
} | {
    ok: false;
    error: string;
};
export type ConsumeResult = {
    ok: boolean;
    consumed_seq: number;
    error?: string;
};
export type SelectionSnapshot = {
    ok: true;
    seq: number;
    consumed_seq: number;
    unconsumed: boolean;
    received_at: number | null;
    stale_ms: number | null;
    selection: SanitizedSelection | null;
    activity: SanitizedActivity | null;
    scene: SanitizedPayload['scene'] | null;
    last_consume: LastConsume | null;
};
export type SelectionStore = {
    put: (payload: unknown) => PutResult;
    snapshot: () => SelectionSnapshot;
    consume: (value: unknown, meta?: unknown) => ConsumeResult;
    currentSeq: () => number;
    consumedSeq: () => number;
};
/**
 * 消毒 v2.4 的子元素选择（编辑模式点线面 / 骨骼 / 曲线点 / 晶格点）。
 * 保留数组但夹上限；类型不在白名单时只留 note。
 * @param sub addon 的 selection.sub
 * @returns 规范化后的子选择；结构不合法时 null
 */
export declare function sanitizeSubSelection(sub: unknown): SelectionSub | null;
/**
 * 消毒 addon 推来的 payload。保留字段名（客户端文本生成依赖它们），超出部分丢弃。
 * @param payload addon 的 JSON body
 * @returns 可存储的规范化 payload
 */
export declare function sanitizeSelectionPayload(payload: unknown): SanitizedPayload;
/**
 * 建一个选择事件存储（纯内存；`now` 可注入，便于单测）。
 * @param now 时钟（毫秒）
 */
export declare function createSelectionStore(now?: () => number): SelectionStore;
