/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/** Membership and type scope for MCP model diff (#5249). */
import { iterateEffectiveEntities } from '@ifc-lite/data';
import { getInheritanceChainAcrossSchemas } from '@ifc-lite/parser';
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
export function classifyType(typeKey) {
    const upper = typeKey.toUpperCase();
    const chain = getInheritanceChainAcrossSchemas(upper);
    if (chain.length === 0) {
        return {
            role: upper.startsWith('IFCREL') ? 'dependent' : 'unknown',
            name: typeKey,
            typeObject: false,
        };
    }
    // The chain holds the class itself plus its supertypes; which end the leaf
    // sits at is the schema source's business — the union walk answers leaf→root
    // and the IFC4 pin it falls back to answers root→leaf — so find it by name.
    const name = chain.find((ancestor) => ancestor.toUpperCase() === upper) ?? typeKey;
    const typeObject = chain.includes('IfcTypeObject');
    if (!chain.includes('IfcRoot'))
        return { role: 'dependent', name, typeObject };
    return {
        role: chain.includes('IfcObjectDefinition') ? 'independent' : 'dependent',
        name,
        typeObject,
    };
}
/** Limit the canonical walk to potentially comparable classes before it visits
 * geometry buckets. Sparse retype destinations and authored classes are added
 * even when absent from the parsed source index. */
export function comparableEntities(store, overlay) {
    const types = new Set();
    // @raw-entity-enumeration-ok the diff chooses candidate source CLASS keys only; iterateEffectiveEntities handles membership below
    for (const type of store.entityIndex.byType.keys()) {
        if (classifyType(type).role !== 'dependent')
            types.add(type);
    }
    const retypes = overlay?.typeMutations?.();
    for (const change of retypes?.values() ?? []) {
        if (classifyType(change.newType).role !== 'dependent')
            types.add(change.newType);
    }
    const created = overlay?.created ?? [];
    for (const entity of created) {
        if (classifyType(entity.ifcType).role !== 'dependent')
            types.add(entity.ifcType);
    }
    if (types.size === 0)
        return [];
    const createdById = new Map(created.map(entity => [entity.expressId, entity]));
    const membership = overlay ? {
        isDeleted: (id) => overlay.deleted.has(id),
        getNewEntities: () => created.map(entity => ({ expressId: entity.expressId, type: entity.ifcType })),
        getNewEntity: (id) => {
            const entity = createdById.get(id);
            return entity ? { type: entity.ifcType } : null;
        },
        getTypeMutations: () => retypes ?? new Map(),
    } : null;
    return [...iterateEffectiveEntities(store, membership, [...types])];
}
//# sourceMappingURL=diff-entity-scope.js.map