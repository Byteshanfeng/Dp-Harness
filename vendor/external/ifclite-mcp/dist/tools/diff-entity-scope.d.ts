/** Membership and type scope for MCP model diff (#5249). */
import { type EffectiveEntity } from '@ifc-lite/data';
import { type IfcDataStore } from '@ifc-lite/parser';
import type { PendingOverlay } from '@ifc-lite/sdk/headless';
/** How an uppercase STEP type participates in the comparison. `name` is the
 *  registry's PascalCase spelling, used instead of the `EntityTable`'s
 *  `'Unknown'` for entities the table never took in. */
interface TypeRole {
    role: 'independent' | 'dependent' | 'unknown';
    name: string;
    /** Whether the class is an `IfcTypeObject` — the gate on hashing `Tag`
     *  (issue #2021). A class no bundled schema declares is `false` rather than
     *  guessed; the fingerprint then carries no `Tag`, which is the same answer
     *  as a type object that has none. */
    typeObject: boolean;
}
/**
 * Classify one STEP type against the three `IfcRoot` branches.
 *
 * The chain has to come from **every bundled schema**, not from the parser's
 * IFC4 codegen pin. `getInheritanceChainForEntity` answers an empty chain for
 * any class the pin does not carry, and that is not a rare corner: IFC2X3 alone
 * puts 23 `IfcObjectDefinition` classes there (`IfcMove`, `IfcOrderAction`,
 * `IfcScheduleTimeControl`, `IfcSpaceProgram`, `IfcServiceLife`, …) and IFC4X3
 * another 77. Judging those as `unknown` dropped the ones the `EntityTable`
 * does not hold — real objects with real GlobalIds — and let through the
 * IFC2X3-only *resource* classes it does hold under a `…STYLE` name, keyed on
 * the Name in slot 0. Both are wrong answers about an IFC2X3 file, which is
 * still most of what is in the wild.
 *
 * `unknown` is still not `dependent`: a vendor extension no schema declares has
 * no chain to judge, so it keeps exactly the reach the `EntityTable` already
 * gave it — which for a `…TYPE` class is a genuine GlobalId, since the parser's
 * type-object branch is name-based and takes those in. Guessing that an
 * unrecognised class is an `IfcObject` and reading its source record instead
 * would cost one STEP extraction per row of every unrecognised bucket in the
 * model, on every call, to reach entities almost no file has. The price of that
 * choice is that a vendor `IfcRoot` subtype whose name does not end in `TYPE`
 * stays uncompared.
 *
 * The one name the chain is not needed for is `IFCREL…`: that prefix is the
 * parser's own rule for taking an unrecognised relationship into the table, and
 * a relationship is excluded here whether any schema can confirm it or not.
 * Without this, an unrecognised `IfcRelXxx` would be the single class of entity
 * that got in through the relationship branch the comparison deliberately shuts.
 */
export declare function classifyType(typeKey: string): TypeRole;
/** Limit the canonical walk to potentially comparable classes before it visits
 * geometry buckets. Sparse retype destinations and authored classes are added
 * even when absent from the parsed source index. */
export declare function comparableEntities(store: IfcDataStore, overlay?: PendingOverlay | null): EffectiveEntity[];
export {};
//# sourceMappingURL=diff-entity-scope.d.ts.map