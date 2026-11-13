/**
 * 写权限租约：多 agent / 多会话同时驱动一个 Blender 时，靠它避免互相踩。
 * 语义：不持有租约时不拦（单机单 agent 完全无感）；一旦有人显式拿到租约，别人的写操作会被 409 挡住。
 * 过期即自动失效（TTL，默认 10 min，每次写操作自动续期）。
 */
export interface ScopeEntry {
    kind: 'collection' | 'prefix';
    value: string;
}
export interface LeaseRec {
    holder: string | null;
    token: string | null;
    acquiredAt: number | null;
    expiresAt: number | null;
    ttlMs: number;
    renewals: number;
    scope: ScopeEntry[] | null;
}
export interface LeaseView {
    active: boolean;
    holder: string | null;
    expiresInMs: number;
    ttlMs: number;
    since: number | null;
    renewals: number;
    holderAlive: boolean | null;
    scope: ScopeEntry[] | null;
    staleReclaimed: number;
}
declare const LEASE: LeaseRec;
/**
 * v0.9.4：租约持有者**是否还活着**（实测踩到：DSH 会话崩了/被关掉之后，它的租约在内存里
 * 继续生效到 TTL（默认 1 h），把别的会话的写通道整段挡死 —— 而那个会话早就不存在了）。
 * holder 约定是 `plugin-pid-<pid>`（插件前端 HOLDER，见 src/index.ts），后端与它同机 → 能直接探活。
 * 返回 true/false；**查不出来返回 null**（按"活着"处理，绝不误抢别人的租约）。
 */
/**
 * v2.6（本轮反馈 #7）：把写作用域声明规范化成 [{kind:'collection'|'prefix', value}]。
 *
 * 现场：子代理只有单一集合的写权限，于是灯（LGT-*）被迫塞进资产集合，装配时再逐个人工搬 ——
 * 「写作用域」只按集合一刀切，和「对象名前缀」这个真正的归属信号脱节。
 * 这里允许两种维度同时声明：
 *   collection:COL_Lights   或裸 COL_Lights        → 集合维度
 *   prefix:LGT-             或裸 LGT-* / LGT-      → 对象名前缀维度
 * 语义是**声明式**（advisory）：不拦写入，但会出现在 /who、/lease 与 409 回执里，
 * 让"谁该写哪"在协议层可见；强制归属由装配层的 K.route_collections() 一次归位。
 */
declare function normalizeScope(scope: unknown): ScopeEntry[] | null;
declare function holderAlive(holder: unknown): boolean | null;
declare function leaseView(): LeaseView;
/** 死会话的租约 → 立刻回收（返回被回收的 holder；没得回收返回 null）。不改租约语义，只补一个"持有者不存在"的出口。 */
declare function releaseStaleLease(why: unknown): string | null;
declare function leaseAcquire(holder: unknown, ttlMs: unknown, force?: unknown, scope?: unknown): {
    denied: true;
    granted?: false;
    holder: string | null;
    expiresInMs: number;
} | {
    granted: true;
    lease: LeaseView;
};
/** 只读 op：即便别人持有租约也放行（否则连"看看现状"都会被挡） */
declare const READ_ONLY_OPS: Record<string, string[]>;
declare function isReadOnly(path: string, op: unknown): boolean;
/** 请求带上 holder/force 时的门禁；返回 null = 放行 */
declare function leaseGate(payload?: Record<string, unknown> | null): Record<string, unknown> | null;
export { LEASE, normalizeScope, holderAlive, leaseView, releaseStaleLease, leaseAcquire, READ_ONLY_OPS, isReadOnly, leaseGate, };
