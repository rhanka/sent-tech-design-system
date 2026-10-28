/**
 * Versioned profiles (decision D1-A).
 *
 * A profile is a SCHEMA MODULE with a version in its id (`generic@1`). It
 * declares the entity, port and relation types that exist, which endpoints a
 * relation legally has, the constraints the document must satisfy, and the
 * limits it refuses to go beyond. Validation reads nothing else: there is no
 * ambient truth about "a node" or "a flow" anywhere in this package.
 *
 * `completeness` is part of the declaration, and it is not decoration. Only
 * `generic@1` is `"complete"` in this lot. `bpmn@1`, `archimate@1` and `uml@1`
 * are `"skeleton"`: their types and relation matrix are declared and validated
 * by the same machinery, their qualification fixtures are partial, and NO
 * conformance to BPMN, ArchiMate or UML is claimed. A consumer can read that
 * field and refuse to rely on them.
 */

import type { AttributeSchema, QuantitySchema, TextSchema } from "./attributes.js";
import { stableStringify, type DeclarationAdapter } from "./bindings.js";
import { type Diagnostic, diagnostic } from "./diagnostics.js";

/** `<name>@<major>`; the major is part of the identity, so `bpmn@1` and `bpmn@2` coexist. */
export type ProfileId = `${string}@${number}`;

export type PortDirection = "in" | "out" | "inout";

export interface EntityTypeDeclaration {
  readonly id: string;
  readonly label: string;
  readonly attributes: readonly AttributeSchema[];
  /** An abstract type may be refined by a document type definition but not instantiated. */
  readonly abstract?: boolean;
  /**
   * Container capability (M3 §3.1/§5.1). Inherited through the resolved base
   * chain; a leaf refinement never acquires it by geometry. No footprint, icon
   * or token field is added here: those live in the view/presentation contract.
   */
  readonly container?: boolean;
  /** K1 base types, in declaration order (depth-first, left-to-right). */
  readonly supertypes?: readonly string[];
}

export interface PortTypeDeclaration {
  readonly id: string;
  readonly label: string;
  readonly directions: readonly PortDirection[];
  readonly attributes?: readonly AttributeSchema[];
}

/**
 * What a relation endpoint may point at. Entities, ports and relations are
 * not interchangeable. The `relation` kind is the shared relation-target
 * carrier of M3 §3.9.1; legacy @1 adapters retain their pinned two-kind run.
 */
export type EndpointTargetKind = "entity" | "port" | "relation";

export interface RelationRoleDeclaration {
  readonly role: string;
  /** How many endpoints may carry this role. `max` is required: an unbounded role is a bag. */
  readonly cardinality: { readonly min: number; readonly max: number };
  readonly targets: readonly EndpointTargetKind[];
  /** When present, the only entity types this role accepts. Absent = any declared type. */
  readonly entityTypes?: readonly string[];
}

/**
 * A relation type may declare that its instances form a HIERARCHY. `shape:
 * "tree"` is what makes `hierarchy-cycle` and `hierarchy-multiple-parents`
 * checkable; `shape: "dag"` allows several parents but still refuses cycles.
 * Business containment, processing hierarchy and visual grouping stay distinct
 * (study invariant 3): this declaration is about business containment only.
 */
export interface HierarchyDeclaration {
  readonly id: string;
  readonly shape: "tree" | "dag";
  readonly parentRole: string;
  readonly childRole: string;
}

export interface RelationTypeDeclaration {
  readonly id: string;
  readonly label: string;
  readonly direction: "directed" | "undirected";
  readonly roles: readonly RelationRoleDeclaration[];
  readonly attributes?: readonly AttributeSchema[];
  readonly hierarchy?: HierarchyDeclaration;
}

/**
 * Constraints beyond the type matrix. Every kind here is EXECUTABLE by
 * `validate.ts` - a constraint vocabulary nothing enforces would be prose in a
 * data structure.
 */
/**
 * Scoped uniqueness grouping (M3 §5.3). `document` groups all effective
 * members; `siblings` groups by the declared hierarchy parent (roots form one
 * sibling group); `{ withinType }` groups by the nearest ancestor of the
 * declared type in that hierarchy.
 */
export type UniqueAttributeScope = "document" | "siblings" | { readonly withinType: string };

/**
 * The closed M3 `AddedConstraint` union (M3 §5.4): generic hierarchy, family,
 * matrix and scalar mechanisms. No member carries a family-specific literal;
 * the executor implements each one generically.
 */
export type AddedConstraint =
  | {
      readonly kind: "hierarchy";
      readonly relationType: string;
      readonly hierarchyId: string;
      readonly parentRole: string;
      readonly childRole: string;
    }
  | { readonly kind: "parent-family"; readonly hierarchyId: string; readonly familyRoots: readonly string[] }
  | {
      readonly kind: "children-restricted";
      readonly parentFamilyRoots: readonly string[];
      readonly childTypes: readonly string[];
      readonly hierarchyId: string;
    }
  | {
      readonly kind: "required-parent";
      readonly childTypes: readonly string[];
      readonly parentFamilyRoots: readonly string[];
      readonly hierarchyId: string;
    }
  | {
      readonly kind: "relationship-matrix";
      readonly matrixId: string;
      readonly sourceRole: string;
      readonly targetRole: string;
      readonly tuples: readonly {
        readonly relationType: string;
        readonly sourceType: string;
        readonly targetType: string;
      }[];
    }
  | {
      readonly kind: "bound-pair";
      readonly valueType: string;
      readonly lowerField: string;
      readonly upperField: string;
      readonly unboundedUpper: number;
    }
  | {
      readonly kind: "reference-application";
      readonly attribute: string;
      readonly declarationType: string;
      readonly allowedTypesField: string;
    }
  | {
      readonly kind: "incident-type-uniformity";
      readonly matrixId: string;
      readonly entityType: string;
      readonly relationTypes: readonly string[];
    }
  | {
      readonly kind: "at-most-value";
      readonly relationType: string;
      readonly attributes: readonly string[];
      readonly value: string;
      readonly max: number;
    }
  | { readonly kind: "collection-unique"; readonly entityType: string; readonly attribute: string };

export type ProfileConstraint =
  | { readonly kind: "acyclic-hierarchy"; readonly hierarchyId: string }
  | {
      readonly kind: "unique-attribute";
      readonly entityType: string;
      readonly attribute: string;
      /** Mandatory for new-format declarations; absent on the retained @1 rows. */
      readonly scope?: UniqueAttributeScope;
    }
  | { readonly kind: "max-entities-of-type"; readonly entityType: string; readonly max: number }
  | AddedConstraint;

export interface ProfileLimits {
  readonly maxEntities?: number;
  readonly maxRelations?: number;
  readonly maxEndpointsPerRelation?: number;
}

export interface Profile {
  readonly id: ProfileId;
  readonly name: string;
  readonly version: number;
  readonly completeness: "complete" | "skeleton";
  readonly entityTypes: readonly EntityTypeDeclaration[];
  readonly portTypes: readonly PortTypeDeclaration[];
  readonly relationTypes: readonly RelationTypeDeclaration[];
  readonly constraints: readonly ProfileConstraint[];
  readonly limits: ProfileLimits;
  /** Declared limits, in prose, for a human reading a skeleton profile. */
  readonly notes: readonly string[];
}

export interface ProfileRegistry {
  get(id: ProfileId): Profile | undefined;
  has(id: ProfileId): boolean;
  list(): readonly ProfileId[];
}

export function createProfileRegistry(profiles: readonly Profile[]): ProfileRegistry {
  const byId = new Map<ProfileId, Profile>();
  for (const profile of profiles) {
    const existing = byId.get(profile.id);
    if (existing !== undefined) {
      throw new Error(`profile ${profile.id} registered twice; a profile id is a version, not a name`);
    }
    byId.set(profile.id, profile);
  }
  return {
    get: (id) => byId.get(id),
    has: (id) => byId.has(id),
    list: () => [...byId.keys()].sort(),
  };
}

export const entityTypeOf = (profile: Profile, typeId: string): EntityTypeDeclaration | undefined =>
  profile.entityTypes.find((type) => type.id === typeId);

export const portTypeOf = (profile: Profile, typeId: string): PortTypeDeclaration | undefined =>
  profile.portTypes.find((type) => type.id === typeId);

export const relationTypeOf = (profile: Profile, typeId: string): RelationTypeDeclaration | undefined =>
  profile.relationTypes.find((type) => type.id === typeId);

export const roleOf = (
  relationType: RelationTypeDeclaration,
  role: string,
): RelationRoleDeclaration | undefined => relationType.roles.find((declared) => declared.role === role);

/**
 * A profile is itself validated, once, when it enters a registry-backed run.
 * A profile whose hierarchy names a role it does not declare would make
 * `hierarchy-cycle` unreachable, which is worse than a loud refusal.
 */
export function validateProfile(
  profile: Profile,
  adapter: DeclarationAdapter = "legacy-constraints@1",
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const path = `profiles.${profile.id}`;

  const seenEntityTypes = new Set<string>();
  for (const type of profile.entityTypes) {
    if (seenEntityTypes.has(type.id)) {
      diagnostics.push(
        diagnostic({ code: "duplicate-id", path: `${path}.entityTypes.${type.id}`, message: "entity type declared twice" }),
      );
    }
    seenEntityTypes.add(type.id);
    diagnostics.push(...duplicateAttributeNames(type.attributes, `${path}.entityTypes.${type.id}.attributes`));
  }

  for (const type of profile.relationTypes) {
    const roles = new Set(type.roles.map((role) => role.role));
    for (const role of type.roles) {
      if (role.cardinality.max < role.cardinality.min || role.cardinality.min < 0) {
        diagnostics.push(
          diagnostic({
            code: "endpoint-cardinality-violation",
            path: `${path}.relationTypes.${type.id}.roles.${role.role}`,
            message: `declared cardinality ${role.cardinality.min}..${role.cardinality.max} is empty or negative`,
          }),
        );
      }
      for (const entityType of role.entityTypes ?? []) {
        if (!seenEntityTypes.has(entityType)) {
          diagnostics.push(
            diagnostic({
              code: "unknown-entity-type",
              path: `${path}.relationTypes.${type.id}.roles.${role.role}.entityTypes`,
              message: `role accepts entity type ${entityType}, which the profile does not declare`,
            }),
          );
        }
      }
    }
    const hierarchy = type.hierarchy;
    if (hierarchy !== undefined) {
      for (const role of [hierarchy.parentRole, hierarchy.childRole]) {
        if (!roles.has(role)) {
          diagnostics.push(
            diagnostic({
              code: "endpoint-role-unknown",
              path: `${path}.relationTypes.${type.id}.hierarchy`,
              message: `hierarchy ${hierarchy.id} names role ${role}, which the relation type does not declare`,
            }),
          );
        }
      }
    }
  }

  for (const [index, constraint] of profile.constraints.entries()) {
    if (constraint.kind === "acyclic-hierarchy") {
      const declared = profile.relationTypes.some((type) => type.hierarchy?.id === constraint.hierarchyId);
      if (!declared) {
        diagnostics.push(
          diagnostic({
            code: "type-definition-conflict",
            path: `${path}.constraints`,
            message: `constraint names hierarchy ${constraint.hierarchyId}, which no relation type declares`,
          }),
        );
      }
    } else if (constraint.kind === "unique-attribute" || constraint.kind === "max-entities-of-type") {
      if (!seenEntityTypes.has(constraint.entityType)) {
        diagnostics.push(
          diagnostic({
            code: "unknown-entity-type",
            path: `${path}.constraints`,
            message: `constraint names entity type ${constraint.entityType}, which the profile does not declare`,
          }),
        );
      }
      if (
        constraint.kind === "unique-attribute" &&
        adapter === "scoped-constraints@1" &&
        constraint.scope === undefined
      ) {
        diagnostics.push(
          diagnostic({
            code: "type-definition-conflict",
            path: `${path}.constraints[${index}]`,
            message: `unique-attribute constraint for ${constraint.entityType}.${constraint.attribute} requires an explicit scope`,
            refs: [],
            details: { check: "unique-scope-missing", type: constraint.entityType, attribute: constraint.attribute },
          }),
        );
      }
    }
    // New-format `AddedConstraint` members are qualified by the M3 declaration
    // checks below; the retained native run ignores them exactly as before.
  }

  diagnostics.push(...validateM3Declarations(profile, seenEntityTypes, adapter));

  return diagnostics;
}

/**
 * M3 declaration qualification (M3 §5.3.1, §5.4, §5.8, C.5).
 *
 * Legacy profiles never declare the new fields, so this pass is silent on
 * them: it only fires on abstract containers, new scalar bounds, K1
 * supertypes, scoped uniqueness without a scope, ambiguous hierarchy
 * selection, invalid matrix tuples and dangling new-constraint references.
 */
function validateM3Declarations(
  profile: Profile,
  seenEntityTypes: Readonly<Set<string>>,
  adapter: DeclarationAdapter,
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const path = `profiles.${profile.id}`;

  profile.entityTypes.forEach((type, typeIndex) => {
    if (type.abstract === true && type.container === true) {
      diagnostics.push(
        diagnostic({
          code: "type-definition-conflict",
          path: `${path}.entityTypes[${typeIndex}]`,
          message: `abstract type ${type.id} cannot declare container capability`,
          refs: [],
          details: { check: "abstract-container", type: type.id },
        }),
      );
    }
    type.attributes.forEach((schema, schemaIndex) => {
      diagnostics.push(
        ...qualifyAttributeSchema(schema, `${path}.entityTypes[${typeIndex}].attributes[${schemaIndex}]`),
      );
    });
  });
  profile.portTypes.forEach((type, typeIndex) => {
    (type.attributes ?? []).forEach((schema, schemaIndex) => {
      diagnostics.push(
        ...qualifyAttributeSchema(schema, `${path}.portTypes[${typeIndex}].attributes[${schemaIndex}]`),
      );
    });
  });
  profile.relationTypes.forEach((type, typeIndex) => {
    (type.attributes ?? []).forEach((schema, schemaIndex) => {
      diagnostics.push(
        ...qualifyAttributeSchema(schema, `${path}.relationTypes[${typeIndex}].attributes[${schemaIndex}]`),
      );
    });
  });

  diagnostics.push(...validateSupertypes(profile));

  profile.constraints.forEach((constraint, index) => {
    const constraintPath = `${path}.constraints[${index}]`;
    switch (constraint.kind) {
      case "unique-attribute":
        if (constraint.scope !== undefined && adapter === "scoped-constraints@1") {
          diagnostics.push(
            ...validateUniqueScope(
              profile,
              constraint.entityType,
              constraint.attribute,
              constraint.scope,
              constraintPath,
            ),
          );
        }
        break;
      case "relationship-matrix": {
        const seen = new Set<string>();
        let invalid = false;
        for (const tuple of constraint.tuples) {
          const key = `${tuple.relationType}\n${tuple.sourceType}\n${tuple.targetType}`;
          if (
            tuple.relationType.length === 0 ||
            tuple.sourceType.length === 0 ||
            tuple.targetType.length === 0 ||
            seen.has(key) ||
            profile.relationTypes.every((declared) => declared.id !== tuple.relationType) ||
            !seenEntityTypes.has(tuple.sourceType) ||
            !seenEntityTypes.has(tuple.targetType)
          ) {
            invalid = true;
            break;
          }
          seen.add(key);
        }
        if (invalid) {
          diagnostics.push(
            diagnostic({
              code: "type-definition-conflict",
              path: constraintPath,
              message: `relationship matrix ${constraint.matrixId} has an invalid or duplicate tuple`,
              refs: [],
              details: { check: "matrix-constraint-invalid", matrixId: constraint.matrixId },
            }),
          );
        }
        break;
      }
      case "hierarchy": {
        const declaration = profile.relationTypes.find((type) => type.id === constraint.relationType);
        const hierarchy = declaration?.hierarchy;
        if (
          declaration === undefined ||
          hierarchy === undefined ||
          hierarchy.id !== constraint.hierarchyId ||
          hierarchy.parentRole !== constraint.parentRole ||
          hierarchy.childRole !== constraint.childRole
        ) {
          diagnostics.push(
            diagnostic({
              code: "type-definition-conflict",
              path: constraintPath,
              message: `hierarchy constraint names relation type ${constraint.relationType}, which does not declare hierarchy ${constraint.hierarchyId} with roles ${constraint.parentRole}/${constraint.childRole}`,
              refs: [],
              details: {
                check: "hierarchy-constraint-invalid",
                relationType: constraint.relationType,
                hierarchyId: constraint.hierarchyId,
              },
            }),
          );
        }
        break;
      }
      case "parent-family":
        diagnostics.push(...requireHierarchy(profile, constraint.hierarchyId, constraintPath));
        for (const root of constraint.familyRoots) {
          requireEntityType(seenEntityTypes, root, constraintPath, diagnostics);
        }
        break;
      case "children-restricted":
      case "required-parent": {
        diagnostics.push(...requireHierarchy(profile, constraint.hierarchyId, constraintPath));
        for (const root of constraint.parentFamilyRoots) {
          requireEntityType(seenEntityTypes, root, constraintPath, diagnostics);
        }
        for (const child of constraint.childTypes) {
          requireEntityType(seenEntityTypes, child, constraintPath, diagnostics);
        }
        break;
      }
      case "bound-pair":
        requireEntityType(seenEntityTypes, constraint.valueType, constraintPath, diagnostics);
        break;
      case "reference-application":
        requireEntityType(seenEntityTypes, constraint.declarationType, constraintPath, diagnostics);
        break;
      case "incident-type-uniformity":
        requireEntityType(seenEntityTypes, constraint.entityType, constraintPath, diagnostics);
        for (const relationType of constraint.relationTypes) {
          if (profile.relationTypes.every((declared) => declared.id !== relationType)) {
            diagnostics.push(
              diagnostic({
                code: "unknown-relation-type",
                path: constraintPath,
                message: `constraint names relation type ${relationType}, which the profile does not declare`,
              }),
            );
          }
        }
        break;
      case "at-most-value":
        if (profile.relationTypes.every((declared) => declared.id !== constraint.relationType)) {
          diagnostics.push(
            diagnostic({
              code: "unknown-relation-type",
              path: constraintPath,
              message: `constraint names relation type ${constraint.relationType}, which the profile does not declare`,
            }),
          );
        }
        break;
      case "collection-unique":
        requireEntityType(seenEntityTypes, constraint.entityType, constraintPath, diagnostics);
        break;
      case "acyclic-hierarchy":
      case "max-entities-of-type":
        break;
    }
  });

  return diagnostics;
}

function requireEntityType(
  seenEntityTypes: Readonly<Set<string>>,
  typeId: string,
  constraintPath: string,
  diagnostics: Diagnostic[],
): void {
  if (!seenEntityTypes.has(typeId)) {
    diagnostics.push(
      diagnostic({
        code: "unknown-entity-type",
        path: constraintPath,
        message: `constraint names entity type ${typeId}, which the profile does not declare`,
      }),
    );
  }
}

function requireHierarchy(profile: Profile, hierarchyId: string, constraintPath: string): readonly Diagnostic[] {
  const declared = profile.relationTypes.some((type) => type.hierarchy?.id === hierarchyId);
  if (declared) return [];
  return [
    diagnostic({
      code: "type-definition-conflict",
      path: constraintPath,
      message: `constraint names hierarchy ${hierarchyId}, which no relation type declares`,
    }),
  ];
}

/** A profile type with its transitive supertypes, self-first, cycle-guarded. */
function profileAncestry(profile: Profile, typeId: string): readonly string[] {
  const ancestry: string[] = [typeId];
  const seen = new Set<string>([typeId]);
  const stack: string[] = [typeId];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    const declared = profile.entityTypes.find((type) => type.id === current);
    for (const superId of declared?.supertypes ?? []) {
      if (seen.has(superId)) continue;
      seen.add(superId);
      ancestry.push(superId);
      stack.push(superId);
    }
  }
  return ancestry;
}

/** The unique selectable hierarchy for a scoped grouping, if exactly one exists. */
export function selectGroupingHierarchy(
  profile: Profile,
  entityType: string,
  withinType?: string,
): { readonly hierarchyId: string } | undefined {
  const candidates = profile.relationTypes.filter((relation) => {
    const hierarchy = relation.hierarchy;
    if (hierarchy === undefined) return false;
    const parent = relation.roles.find((role) => role.role === hierarchy.parentRole);
    const child = relation.roles.find((role) => role.role === hierarchy.childRole);
    if (parent === undefined || child === undefined) return false;
    // Family-role satisfaction (§5.2) runs on resolved ancestry for parent
    // and child alike: a refinement of an accepted family is accepted, so a
    // hierarchy admitting `base` children selects for a `sub` constraint.
    if (!roleAccepts(profile, child, entityType)) return false;
    if (withinType !== undefined && !roleAccepts(profile, parent, withinType)) return false;
    return true;
  });
  if (candidates.length !== 1) return undefined;
  const hierarchy = (candidates[0] as (typeof candidates)[number]).hierarchy as NonNullable<
    (typeof candidates)[number]["hierarchy"]
  >;
  return { hierarchyId: hierarchy.id };
}

function roleAccepts(
  profile: Profile,
  role: { readonly targets: readonly string[]; readonly entityTypes?: readonly string[] },
  entityType: string,
): boolean {
  if (!role.targets.includes("entity")) return false;
  if (role.entityTypes === undefined) return true;
  return role.entityTypes.some((allowed) => profileAncestry(profile, entityType).includes(allowed));
}

function validateUniqueScope(
  profile: Profile,
  entityType: string,
  attribute: string,
  scope: UniqueAttributeScope,
  constraintPath: string,
): readonly Diagnostic[] {
  if (scope === "document") return [];
  const noHierarchy = (): readonly Diagnostic[] => [
    diagnostic({
      code: "type-definition-conflict",
      path: constraintPath,
      message: `unique-attribute constraint for ${entityType}.${attribute} selects no unique hierarchy`,
      refs: [],
      details: { check: "unique-hierarchy-selection", type: entityType, attribute },
    }),
  ];
  if (scope === "siblings") {
    if (selectGroupingHierarchy(profile, entityType) === undefined) return noHierarchy();
    return [];
  }
  if (!profile.entityTypes.some((type) => type.id === scope.withinType)) {
    return [
      diagnostic({
        code: "unknown-entity-type",
        path: constraintPath,
        message: `constraint names entity type ${scope.withinType}, which the profile does not declare`,
      }),
    ];
  }
  if (selectGroupingHierarchy(profile, entityType, scope.withinType) === undefined) return noHierarchy();
  return [];
}

/** Anchored ASCII pattern, no flags: `^...$` with an unescaped closing anchor. */
function isQualifiablePattern(source: string): boolean {
  if (source.length === 0 || source[0] !== "^") return false;
  if (!/^[\x00-\x7F]*$/.test(source)) return false;
  // The closing anchor is escaped only by an odd run of backslashes: an even
  // run (including zero) leaves the `$` unescaped, so a pattern matching a
  // trailing literal backslash still qualifies.
  let backslashes = 0;
  for (let index = source.length - 2; index >= 0 && source[index] === "\\"; index -= 1) {
    backslashes += 1;
  }
  if (source[source.length - 1] !== "$" || backslashes % 2 === 1) return false;
  try {
    new RegExp(source);
    return true;
  } catch {
    return false;
  }
}

export function qualifyAttributeSchema(schema: AttributeSchema, schemaPath: string): readonly Diagnostic[] {
  // A collection is only as qualifiable as its item schema: an invalid item
  // grammar or bound refused at the item would otherwise pass qualification
  // and have its match exception absorbed at value time (M3 §5.8).
  if (schema.kind === "collection") {
    const item = schema.item;
    if (item.kind === "text" || item.kind === "quantity") {
      return qualifyScalarShape(item, `${schemaPath}.item`, schema.name);
    }
    return [];
  }
  if (schema.kind === "text" || schema.kind === "quantity") {
    return qualifyScalarShape(schema, schemaPath, schema.name);
  }
  return [];
}

/**
 * Grammar and bound qualification shared by a top-level scalar schema and a
 * collection item schema. `attributeName` names the owning attribute so the
 * item refusal keeps the C.5 literal wording.
 */
function qualifyScalarShape(
  shape: TextSchema | QuantitySchema,
  shapePath: string,
  attributeName: string,
): readonly Diagnostic[] {
  if (shape.kind === "text") {
    const patternInvalid =
      (shape.pattern !== undefined &&
        (shape.patternName === undefined || !isQualifiablePattern(shape.pattern))) ||
      (shape.minLength !== undefined && shape.minLength < 0) ||
      (shape.maxLength !== undefined && shape.maxLength < 0) ||
      (shape.minLength !== undefined && shape.maxLength !== undefined && shape.minLength > shape.maxLength);
    if (patternInvalid) {
      return [
        diagnostic({
          code: "type-definition-conflict",
          path: shapePath,
          message: `text schema for ${attributeName} has an invalid pattern or length bounds`,
          refs: [],
          details: { check: "text-pattern-invalid", attribute: attributeName },
        }),
      ];
    }
    return [];
  }
  const boundsInvalid =
    (shape.min !== undefined && (typeof shape.min !== "number" || !Number.isFinite(shape.min))) ||
    (shape.max !== undefined && (typeof shape.max !== "number" || !Number.isFinite(shape.max))) ||
    (shape.min !== undefined && shape.max !== undefined && shape.min > shape.max);
  if (boundsInvalid) {
    return [
      diagnostic({
        code: "type-definition-conflict",
        path: shapePath,
        message: `quantity schema for ${attributeName} has invalid numeric bounds`,
        refs: [],
        details: { check: "numeric-constraint-invalid", attribute: attributeName },
      }),
    ];
  }
  return [];
}

/** K1 declaration resolution, depth-first left-to-right over declared supertypes. */
function validateSupertypes(profile: Profile): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const path = `profiles.${profile.id}`;
  const byId = new Map(profile.entityTypes.map((type) => [type.id, type] as const));

  // An invalid edge (unknown parent, cycle) is reported once per profile, and
  // its invalidity propagates: a type whose transitive closure contains a
  // broken edge gets no descendant effective-schema check, exactly as the
  // shared resolver refuses the descendants of a broken definition (C.2).
  const reportedUnknown = new Set<string>();
  const reportedCycles = new Set<string>();
  // Memoized broken status per type id: whether its transitive closure holds
  // an unknown or cyclic edge. Lets a shared DAG skip re-traversal while
  // still propagating invalidity to every descendant root.
  const memoBroken = new Map<string, boolean>();
  // Memoized inherited schemas per type id (ancestors only, base-first).
  const memoInherited = new Map<string, Map<string, AttributeSchema[]>>();

  const reportUnknown = (holderId: string, superId: string, index: number): void => {
    if (reportedUnknown.has(superId)) return;
    reportedUnknown.add(superId);
    diagnostics.push(
      diagnostic({
        code: "supertype-unknown",
        path: `${path}.entityTypes.${holderId}.supertypes[${index}]`,
        message: `supertype ${superId} is not declared`,
        refs: [],
        details: { supertype: superId },
      }),
    );
  };

  const reportCycle = (holderId: string, ordered: readonly string[]): void => {
    // Rotation-independent ordered key: the directed cycle in path order,
    // rotated so its smallest member (UTF-16) comes first. Every root
    // reaching this directed cycle reports the same key, so the cycle is
    // refused once; disjoint cycles and opposite directions keep distinct
    // keys. JSON serialisation keeps the key unambiguous: no delimiter
    // can collide with a member id. Path, message and details all aim at
    // the edge owner that closes it.
    const smallest = [...ordered].sort()[0] as string;
    const first = ordered.indexOf(smallest);
    const key = JSON.stringify([...ordered.slice(first), ...ordered.slice(0, first)]);
    if (reportedCycles.has(key)) return;
    reportedCycles.add(key);
    diagnostics.push(
      diagnostic({
        code: "supertype-cycle",
        path: `${path}.entityTypes.${holderId}.supertypes`,
        message: `supertype chain for ${holderId} is cyclic`,
        refs: [],
        details: { type: holderId },
      }),
    );
  };

  interface WalkFrame {
    readonly id: string;
    readonly supers: readonly string[];
    next: number;
    broken: boolean;
  }

  const walkBroken = (rootId: string): boolean => {
    const cached = memoBroken.get(rootId);
    if (cached !== undefined) return cached;
    const root = byId.get(rootId);
    if (root === undefined) return true;
    const direct = root.supertypes ?? [];
    if (direct.length === 0) {
      memoBroken.set(rootId, false);
      return false;
    }
    let rootBroken = false;
    const trail: string[] = [rootId];
    const onTrail = new Set<string>([rootId]);
    const stack: WalkFrame[] = [{ id: rootId, supers: direct, next: 0, broken: false }];
    while (stack.length > 0) {
      const frame = stack[stack.length - 1] as WalkFrame;
      if (frame.next < frame.supers.length) {
        const superId = frame.supers[frame.next] as string;
        const edgeIndex = frame.next;
        frame.next += 1;
        const declared = byId.get(superId);
        if (declared === undefined) {
          frame.broken = true;
          rootBroken = true;
          reportUnknown(frame.id, superId, edgeIndex);
          continue;
        }
        if (onTrail.has(superId)) {
          frame.broken = true;
          rootBroken = true;
          reportCycle(frame.id, trail.slice(trail.indexOf(superId)));
          continue;
        }
        const known = memoBroken.get(superId);
        if (known !== undefined) {
          if (known) {
            frame.broken = true;
            rootBroken = true;
          }
          continue;
        }
        trail.push(superId);
        onTrail.add(superId);
        stack.push({ id: superId, supers: declared.supertypes ?? [], next: 0, broken: false });
      } else {
        memoBroken.set(frame.id, frame.broken);
        stack.pop();
        const removed = trail.pop() as string;
        onTrail.delete(removed);
        if (frame.broken) {
          rootBroken = true;
          const parent = stack[stack.length - 1] as WalkFrame | undefined;
          if (parent !== undefined) parent.broken = true;
        }
      }
    }
    memoBroken.set(rootId, rootBroken);
    return rootBroken;
  };

  const inheritedOf = (rootId: string): Map<string, AttributeSchema[]> => {
    const cached = memoInherited.get(rootId);
    if (cached !== undefined) return cached;
    // Postorder over the reachable subgraph, base-first: every base resolves
    // before the node that refines it. Shared ancestors are visited once.
    const reachable: string[] = [];
    const seen = new Set<string>([rootId]);
    const order: string[] = [];
    const stack: { readonly id: string; next: number; readonly supers: readonly string[] }[] = [];
    const rootDeclared = byId.get(rootId);
    if (rootDeclared === undefined) {
      const empty = new Map<string, AttributeSchema[]>();
      memoInherited.set(rootId, empty);
      return empty;
    }
    stack.push({ id: rootId, next: 0, supers: rootDeclared.supertypes ?? [] });
    while (stack.length > 0) {
      const frame = stack[stack.length - 1] as { readonly id: string; next: number; readonly supers: readonly string[] };
      if (frame.next < frame.supers.length) {
        const superId = frame.supers[frame.next] as string;
        (frame as { next: number }).next += 1;
        if (seen.has(superId)) continue;
        const declared = byId.get(superId);
        if (declared === undefined) continue;
        seen.add(superId);
        reachable.push(superId);
        stack.push({ id: superId, next: 0, supers: declared.supertypes ?? [] });
      } else {
        order.push(frame.id);
        stack.pop();
      }
    }
    // `order` is base-first and ends with the root; drop the root itself so
    // only ancestors contribute, then fold them base-first in declaration
    // order through the memoized per-node maps.
    for (const id of order) {
      if (memoInherited.has(id)) continue;
      const declared = byId.get(id);
      if (declared === undefined) continue;
      const merged = new Map<string, AttributeSchema[]>();
      for (const superId of declared.supertypes ?? []) {
        const parentInherited = memoInherited.get(superId);
        if (parentInherited !== undefined) {
          for (const [name, schemas] of parentInherited) {
            const existing = merged.get(name);
            if (existing === undefined) merged.set(name, [...schemas]);
            else existing.push(...schemas);
          }
        }
        const parent = byId.get(superId);
        if (parent === undefined) continue;
        for (const schema of parent.attributes) {
          const existing = merged.get(schema.name);
          if (existing === undefined) merged.set(schema.name, [schema]);
          else existing.push(schema);
        }
      }
      memoInherited.set(id, merged);
    }
    return memoInherited.get(rootId) ?? new Map<string, AttributeSchema[]>();
  };

  for (const type of profile.entityTypes) {
    const supertypes = type.supertypes;
    if (supertypes === undefined || supertypes.length === 0) continue;
    const broken = walkBroken(type.id);

    // Inherited conflicts, once per field, after valid parents resolve.
    if (broken) continue;
    const inherited = inheritedOf(type.id);
    const own = new Map(type.attributes.map((schema) => [schema.name, schema] as const));
    for (const [name, candidates] of inherited) {
      const compared = [...candidates.map((schema) => stableStringify(schema))];
      const ownSchema = own.get(name);
      if (ownSchema !== undefined) compared.push(stableStringify(ownSchema));
      if (new Set(compared).size > 1) {
        diagnostics.push(
          diagnostic({
            code: "attribute-conflict",
            path: `${path}.entityTypes.${type.id}.attributes.${name}`,
            message: `inherited attribute ${name} has incompatible schemas on ${type.id}`,
            refs: [],
            details: { attribute: name, type: type.id },
          }),
        );
      }
    }
  }

  return diagnostics;
}

function duplicateAttributeNames(attributes: readonly AttributeSchema[], path: string): readonly Diagnostic[] {
  const seen = new Set<string>();
  const diagnostics: Diagnostic[] = [];
  for (const attribute of attributes) {
    if (seen.has(attribute.name)) {
      diagnostics.push(
        diagnostic({ code: "duplicate-id", path: `${path}.${attribute.name}`, message: "attribute declared twice" }),
      );
    }
    seen.add(attribute.name);
  }
  return diagnostics;
}
