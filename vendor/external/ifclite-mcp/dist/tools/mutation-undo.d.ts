/** Revert recorded compound commits and raw mutation operations (#6232 D5). */
import { type MutablePropertyView } from '@ifc-lite/mutations';
type MutationView = MutablePropertyView;
export declare function undoPendingMutations(view: MutationView, n: number): number;
export {};
//# sourceMappingURL=mutation-undo.d.ts.map