import net from 'node:net';
import type { AddonProtocol, ProtocolInfo } from '../addon-protocol.js';
export declare function tcpProbe(host?: string, port?: number, timeoutMs?: number): Promise<boolean>;
export declare function freshPing(host?: string, port?: number, timeoutMs?: number): Promise<number>;
export interface Diagnosis {
    kind: string;
    tcp: boolean;
    ping: boolean | null;
    ping_ms?: number;
    summary: string;
    fix: string;
    hint: string;
    error?: string;
}
export declare function diagnose(): Promise<Diagnosis>;
/** 通道运行时实际使用的协议（给 /doctor、/who、工具输出用） */
export interface ProtocolInfoView {
    id: string | null;
    label?: string;
    from?: string;
    detected?: unknown;
    configured: string;
    error?: string;
}
export declare function protocolInfo(): Promise<ProtocolInfoView>;
interface PendingRequest {
    resolve: (v: unknown) => void;
    reject: (e: Error) => void;
    timer: NodeJS.Timeout;
    post?: (data: unknown) => unknown;
    proto: AddonProtocol;
}
export declare class AddonClient {
    addr: {
        host: string;
        port: number;
    };
    sock: net.Socket | null;
    queue: Promise<unknown>;
    buf: string;
    pending: PendingRequest | null;
    proto: AddonProtocol | null;
    protocolInfo: ProtocolInfo | null;
    _seq: number;
    constructor(addr?: {
        host: string;
        port: number;
    });
    protocol(): Promise<ProtocolInfo>;
    connect(timeoutMs?: number): Promise<boolean>;
    _onData(d: Buffer): void;
    ensure(): Promise<void>;
    send(type: string, params?: Record<string, unknown>, timeoutMs?: number, _opts?: {
        noMark?: boolean;
    }): Promise<unknown>;
    close(): void;
}
export {};
