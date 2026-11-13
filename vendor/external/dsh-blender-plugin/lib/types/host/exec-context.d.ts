import { AsyncLocalStorage } from 'node:async_hooks';
export interface ExecContextStore {
    signal?: AbortSignal;
}
export declare const EXEC_CTX: AsyncLocalStorage<ExecContextStore>;
/** 当前工具调用对应的宿主 exec.signal（没有则 undefined） */
export declare function execSignal(): AbortSignal | undefined;
