export interface TxnDeps {
    addon: import('../transport/probes.js').AddonClient;
    ensureTxn: () => Promise<unknown>;
}
export declare function createTxnApi(E: TxnDeps): {
    txnCall: (op: unknown, payload: unknown) => Promise<unknown>;
};
