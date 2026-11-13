/** Files produced under the run outdir, newest first. */
export interface ArtifactInfo {
    name: string;
    bytes: number;
    mtimeMs: number;
    fresh: boolean;
}
export interface ArtifactCollection {
    artifacts: ArtifactInfo[];
    noiseFiltered: number;
}
export declare function collectArtifacts(outdirWsl: string | null, t0: number, includeNoise: unknown): ArtifactCollection;
