import { type CoordinateInfo, type MeshData } from '@ifc-lite/geometry';
import { type IfcDataStore } from '@ifc-lite/parser';
import type { ModellingStoreModelResolver } from '@ifc-lite/sdk';
/** One fresh current-overlay native pipeline for headless geometry commands. */
export declare function withHeadlessGeometry<P, T>(model: ReturnType<ModellingStoreModelResolver>, prepare: (source: IfcDataStore) => P, consume: (prepared: P, meshes: readonly MeshData[], coord: CoordinateInfo | undefined) => T | Promise<T>): Promise<T>;
//# sourceMappingURL=headless-native-geometry.d.ts.map