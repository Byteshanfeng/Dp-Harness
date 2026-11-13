/** Flags that consume the following argv token as their value. */
export declare const MCP_VALUE_FLAGS: readonly string[];
/** Flags that stand alone, taking no value. */
export declare const MCP_BOOLEAN_FLAGS: readonly string[];
/**
 * Flags the standalone binary understands that the `ifc-lite mcp` subcommand
 * does not act on. Their VALUES are still skipped (that is what caused the
 * bogus-path bug), but the subcommand warns rather than pretending to honour
 * them.
 */
export declare const MCP_SUBCOMMAND_UNSUPPORTED_FLAGS: readonly string[];
/** True when `arg` consumes the next argv token. */
export declare function isMcpValueFlag(arg: string): boolean;
export interface CliOptions {
    files: string[];
    readOnly: boolean;
    federate: boolean;
    transport: 'stdio' | 'http';
    port: number;
    /** undefined → caller didn't pass --host; CLI picks loopback by default */
    host?: string;
    token?: string;
    bsdd?: string;
    allowedPaths?: string[];
    /** Browser Origins allowed to read HTTP responses cross-origin. Empty = none. */
    allowedOrigins?: string[];
    autoViewer: boolean;
    viewerPort: number;
    openBrowser: boolean;
    insecure: boolean;
    /** `--help`/`-h` was passed. The caller prints usage and exits. */
    help: boolean;
    /** `--version`/`-v` was passed. The caller prints the version and exits. */
    version: boolean;
}
export declare function parseArgs(argv: string[]): CliOptions;
//# sourceMappingURL=cli-args.d.ts.map