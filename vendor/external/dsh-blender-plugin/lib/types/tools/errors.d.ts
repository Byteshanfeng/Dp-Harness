export interface ToolFailure {
    text: string;
    envelope: {
        ok: false;
        error: {
            code: string;
            message: string;
            next_action: string;
            detail?: string;
        };
    };
}
/** Strip stack frames, API keys and bearer/token values from a diagnostic. */
export declare function redactSecrets(input: unknown): string;
/** Host-side cancellation (exec.signal abort) must keep propagating, not become a tool result. */
export declare function isHostAbort(error: unknown): boolean;
/** First readable line of an exception, with secrets/stack removed. */
export declare function errorLine(error: unknown): string;
/**
 * Build a lossless tool failure. text keeps the human/model channel readable;
 * envelope.error is the machine-readable channel used by the contract.
 */
export declare function toolError(code: string, message: string, nextAction: string, detail?: unknown): ToolFailure;
