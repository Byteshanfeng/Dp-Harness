import type { RoomGeometryProvider } from '@ifc-lite/sdk';
/** Preserve intentional refusals; infrastructure failures are not caller input. */
export declare const provideHeadlessRoomGeometry: RoomGeometryProvider;
/** One prepared storey per loaded model; cached values hold no native handles. */
export declare function createCachedHeadlessRoomGeometryProvider(): {
    provide: RoomGeometryProvider;
    clear(): void;
};
//# sourceMappingURL=headless-room-geometry.d.ts.map