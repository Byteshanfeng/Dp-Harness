import { HeadlessBackend } from '@ifc-lite/sdk/headless';
import type { IfcDataStore } from '@ifc-lite/parser';
export { expandTypes, isProductType } from '@ifc-lite/sdk/headless';
/** Preserve the MCP constructor while the shared SDK owns model/query/edit/export. */
export declare class HeadlessLikeBackend extends HeadlessBackend {
    constructor(store: IfcDataStore, modelName: string, modelId: string);
}
//# sourceMappingURL=headless-backend.d.ts.map