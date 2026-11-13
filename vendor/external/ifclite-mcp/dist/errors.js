/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
export const ToolErrorCode = {
    ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
    MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
    MODEL_REQUIRED: 'MODEL_REQUIRED',
    INVALID_INPUT: 'INVALID_INPUT',
    CANCELLED: 'CANCELLED',
    STATE_CHANGED: 'STATE_CHANGED',
    UNSUPPORTED_OPERATION: 'UNSUPPORTED_OPERATION',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    READ_ONLY: 'READ_ONLY',
    PARSE_FAILED: 'PARSE_FAILED',
    EXTERNAL_SERVICE_FAILED: 'EXTERNAL_SERVICE_FAILED',
    RATE_LIMITED: 'RATE_LIMITED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
};
export function toolError(opts) {
    return {
        content: [{ type: 'text', text: opts.message }],
        structuredContent: {
            code: opts.code,
            message: opts.message,
            details: opts.details ?? {},
            hint: opts.hint,
        },
        isError: true,
    };
}
export class ToolExecutionError extends Error {
    code;
    details;
    hint;
    constructor(opts) {
        super(opts.message);
        this.name = 'ToolExecutionError';
        this.code = opts.code;
        this.details = opts.details;
        this.hint = opts.hint;
    }
    toToolResult() {
        return toolError({
            code: this.code,
            message: this.message,
            details: this.details,
            hint: this.hint,
        });
    }
}
//# sourceMappingURL=errors.js.map