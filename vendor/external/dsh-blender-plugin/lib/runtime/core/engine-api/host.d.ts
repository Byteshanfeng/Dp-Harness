import type { EngineApiDeps } from './index.js';
export declare function createHostApi(E: EngineApiDeps): {
    hostSceneItems(spec?: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * 启动时连上常驻 socket。
     *
     * 修复（serial tax）：首版这里还发过一次"尽力而为"的未 await `get_addon_info`。
     * AddonClient 的请求是**串行队列**（transport/probes.ts 里 queue.then(run)），这条不等待的
     * 探测会占住队列头最多 3s 超时 —— 紧接着的 /status、/doctor 只能排在它后面，预算被迫
     * 收紧到 3.5s/3s。该探测的结果从未被使用，连接本身由 ensure() 建立；删掉它，串行队列
     * 不再替启动探测付税（与 lifecycle 的失败 diagnose 各司其职，不重复）。
     */
    start(): Promise<boolean>;
    stop(): void;
};
