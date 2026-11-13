/** Process-local provenance, retained only while the loaded model is alive. */
interface SourceFileIdentity {
    readonly path: string;
    readonly dev: bigint;
    readonly ino: bigint;
}
export declare function rememberLoadedSource(model: object, source: SourceFileIdentity): void;
export declare function getLoadedSource(model: object): SourceFileIdentity | undefined;
export {};
//# sourceMappingURL=loaded-source.d.ts.map