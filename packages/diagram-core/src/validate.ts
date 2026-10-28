/**
 * Validation: the only place that decides whether a document or a view is
 * writable, and the only producer of the nine named rejected cases.
 *
 * Three rules it follows without exception:
 *   1. It never repairs. A document is refused with diagnostics, never
 *      "cleaned up" - a silently dropped dangling edge is what study invariant 1
 *      forbids at the semantic level.
 *   2. It reads nothing ambient. Types, roles, cardinalities, constraints and
 *      limits come from the profile registry handed to it.
 *   3. It collects. A caller gets every diagnostic of a run, not the first, so a
 *      refused transaction can be explained in one pass.
 */

import {
  referencesOf,
  validateAttributeValue,
  type AttributeSchema,
  type AttributeValue,
  type ReferenceSchema,
  type ScalarSchema,
  type StructAttributeValue,
  type StructSchema,
} from "./attributes.js";
import {
  adapterFor,
  isRetainedLegacyProfileId,
  LEGACY_CONSTRAINTS_ADAPTER,
  verifyExecutorBindings,
  type DeclarationAdapter,
  type ExecutorProfileBindings,
} from "./bindings.js";
import { retainedExecutorBindings } from "./profiles/index.js";
import { tryCanonicalise } from "./canonical.js";
import { type Diagnostic, diagnostic } from "./diagnostics.js";
import {
  CURRENT_SCHEMA_VERSION,
  type Entity,
  type PreservedExtension,
  type Relation,
  type SemanticDocument,
  type SemanticPort,
  scopeTargetOf,
} from "./document.js";
import { hashContent } from "./hash.js";
import {
  entityTypeOf,
  portTypeOf,
  qualifyAttributeSchema,
  relationTypeOf,
  roleOf,
  selectGroupingHierarchy,
  validateProfile,
  type AddedConstraint,
  type Profile,
  type ProfileConstraint,
  type ProfileId,
  type ProfileRegistry,
  type RelationTypeDeclaration,
  type UniqueAttributeScope,
} from "./profile.js";
import {
  parseRef,
  refKindOf,
  type EntityRef,
  type OccurrenceRef,
  type PortRef,
  type RefKind,
  type RelationRef,
} from "./refs.js";
import { createTypeResolver, type TypeResolver } from "./resolver.js";
import { DIAGRAM_PRESENTATION_PROFILE_ID } from "./presentation.js";
import { validateDiagramPresentation } from "./presentation-validate.js";
import {
  analyzeSummaries,
  classifyInternalRelations,
  collapsedOf,
  drawnTargetOf,
  hiddenByFold,
  parentOccurrenceOf,
  portRepresentativeOf,
  representativeOf,
} from "./fold.js";
import type { DiagramState } from "./state.js";
import type { SummaryDefinition, ViewDocument } from "./view.js";

export interface ValidationOptions {
  readonly registry: ProfileRegistry;
  /**
   * The `executor-profile-bindings@1` table (M3 §5.3.1). Absent means the
   * retained native run for exactly the four @1 identities, so they keep
   * their exact native behaviour and diagnostics. Every other profile, any
   * version, requires a verified row.
   */
  readonly bindings?: ExecutorProfileBindings;
}

/** Base type attributes plus the additive attributes of a document type definition. */
export function effectiveEntitySchemas(
  document: SemanticDocument,
  profile: Profile,
  typeId: string,
): { readonly schemas: readonly AttributeSchema[] } | { readonly diagnostic: Diagnostic } {
  const declared = entityTypeOf(profile, typeId);
  if (declared !== undefined) {
    if (declared.abstract === true) {
      return {
        diagnostic: diagnostic({
          code: "unknown-entity-type",
          path: `profiles.${profile.id}.entityTypes.${typeId}`,
          message: `entity type ${typeId} is abstract and cannot be instantiated`,
          details: { abstract: true },
        }),
      };
    }
    return { schemas: declared.attributes };
  }

  const definition = document.typeDefinitions[typeId];
  if (definition === undefined) {
    return {
      diagnostic: diagnostic({
        code: "unknown-entity-type",
        path: `profiles.${profile.id}.entityTypes.${typeId}`,
        message: `neither profile ${profile.id} nor the document declares entity type ${typeId}`,
        details: { type: typeId, profile: profile.id },
      }),
    };
  }
  const base = entityTypeOf(profile, definition.baseType);
  if (base === undefined) {
    return {
      diagnostic: diagnostic({
        code: "unknown-entity-type",
        path: `typeDefinitions.${typeId}.baseType`,
        message: `type definition ${typeId} refines ${definition.baseType}, which profile ${profile.id} does not declare`,
      }),
    };
  }
  return { schemas: [...base.attributes, ...definition.attributes] };
}

/**
 * What the scoped executor needs beyond the schema alone: the owning profile
 * (for K6 structured-type declarations), the registry (for K2 target chains)
 * and the shared resolver. Absent, the bag runs the retained native checks.
 */
export interface AttributeContext {
  readonly owner: Profile;
  readonly registry: ProfileRegistry;
  readonly resolver: TypeResolver;
}

function validateAttributeBag(
  attributes: Readonly<Record<string, AttributeValue>>,
  schemas: readonly AttributeSchema[],
  document: SemanticDocument,
  path: string,
  context?: AttributeContext,
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const byName = new Map(schemas.map((schema) => [schema.name, schema] as const));

  for (const name of Object.keys(attributes).sort()) {
    const schema = byName.get(name);
    const value = attributes[name] as AttributeValue;
    if (schema === undefined) {
      // NAMED REJECTED CASE: an attribute outside the schema is not stored as a
      // free property. Unmodelled content belongs in an extension, with its hash.
      diagnostics.push(
        diagnostic({
          code: "attribute-not-in-schema",
          path: `${path}.${name}`,
          message: `attribute ${name} is not declared by the effective schema (declared: ${[...byName.keys()].sort().join(", ") || "none"})`,
          details: { attribute: name },
        }),
      );
      continue;
    }
    diagnostics.push(...validateAttributeValue(schema, value, `${path}.${name}`));
    if (schema.kind === "struct" && value.kind === "struct" && context !== undefined) {
      diagnostics.push(...validateStructValue(schema, value, `${path}.${name}`, document, context));
    }
    for (const found of referencesOf(schema, value)) {
      const location = found.index === undefined ? `${path}.${name}` : `${path}.${name}[${found.index}]`;
      diagnostics.push(...resolveReference(document, found.raw, found.refKind, location));
      if (context !== undefined) {
        const slot: ScalarSchema | undefined =
          schema.kind === "collection" ? (schema.item as ScalarSchema) : (schema as ScalarSchema);
        diagnostics.push(...checkReferenceTargetType(document, context, slot, found.raw, location));
      }
    }
  }

  for (const schema of schemas) {
    if (schema.required === true && attributes[schema.name] === undefined) {
      diagnostics.push(
        diagnostic({
          code: "attribute-required-missing",
          path: `${path}.${schema.name}`,
          message: `attribute ${schema.name} is required by the schema`,
          details: { attribute: schema.name },
        }),
      );
    }
  }

  return diagnostics;
}

/** K2: a resolved entity reference must sit inside the declared target types. */
function checkReferenceTargetType(
  document: SemanticDocument,
  context: AttributeContext,
  slot: ScalarSchema | undefined,
  raw: string,
  location: string,
): readonly Diagnostic[] {
  if (slot?.kind !== "reference" || slot.refKind !== "entity") return [];
  const targetTypes = (slot as ReferenceSchema).targetTypes;
  if (targetTypes === undefined || targetTypes.length === 0) return [];
  const target = document.entities[raw];
  if (target === undefined) return [];
  const targetProfile = context.registry.get(target.profile);
  if (targetProfile === undefined) return [];
  const resolution = context.resolver.resolve(targetProfile, target.type);
  if (!resolution.ok) return [];
  if (targetTypes.some((type) => resolution.resolved.ancestry.includes(type))) return [];
  return [
    diagnostic({
      code: "reference-target-type",
      path: location,
      message: `reference target ${raw} has type ${target.type}; allowed types are ${targetTypes.join(", ")}`,
      refs: [raw],
      details: { seenType: target.type, allowed: targetTypes.join(",") },
    }),
  ];
}

/**
 * K6: a structured value against its resolved effective structured type,
 * recursively. The effective schema (M3 §2.3/§5.1) carries inherited fields;
 * the direct declaration alone would miss them and misreport the ones the
 * value does carry.
 */
function validateStructValue(
  schema: StructSchema,
  value: StructAttributeValue,
  path: string,
  document: SemanticDocument,
  context: AttributeContext,
): readonly Diagnostic[] {
  // An unresolvable structured type keeps the A′ unknown-type arm at the
  // value path; deeper K1/definition refusals are reported once at their own
  // stage, never duplicated here.
  const resolution = context.resolver.resolve(context.owner, value.type);
  if (!resolution.ok) {
    return [
      diagnostic({
        code: "struct-type-unknown",
        path,
        message: `structured value type ${value.type} is not declared`,
        refs: [],
        details: { type: value.type },
      }),
    ];
  }
  if (schema.targetTypes.length > 0 && !schema.targetTypes.includes(value.type)) {
    return [
      diagnostic({
        code: "struct-type-not-allowed",
        path,
        message: `structured type ${value.type} is not allowed here; allowed types are ${schema.targetTypes.join(", ")}`,
        refs: [],
        details: { type: value.type, allowed: schema.targetTypes.join(",") },
      }),
    ];
  }
  const effective = resolution.resolved.schemas;
  const diagnostics: Diagnostic[] = [];
  const byName = new Map(effective.map((field) => [field.name, field] as const));
  for (const name of Object.keys(value.fields).sort()) {
    const fieldSchema = byName.get(name);
    const fieldPath = `${path}.fields.${name}`;
    const fieldValue = value.fields[name] as AttributeValue;
    if (fieldSchema === undefined) {
      diagnostics.push(
        diagnostic({
          code: "struct-field-not-in-schema",
          path: fieldPath,
          message: `field ${name} is not declared by structured type ${value.type}`,
          refs: [],
          details: { type: value.type, field: name },
        }),
      );
      continue;
    }
    diagnostics.push(...validateAttributeValue(fieldSchema, fieldValue, fieldPath));
    if (fieldSchema.kind === "struct" && fieldValue.kind === "struct") {
      diagnostics.push(...validateStructValue(fieldSchema, fieldValue, fieldPath, document, context));
    }
    for (const found of referencesOf(fieldSchema, fieldValue)) {
      const location = found.index === undefined ? fieldPath : `${fieldPath}[${found.index}]`;
      diagnostics.push(...resolveReference(document, found.raw, found.refKind, location));
      const slot: ScalarSchema | undefined =
        fieldSchema.kind === "collection" ? (fieldSchema.item as ScalarSchema) : (fieldSchema as ScalarSchema);
      diagnostics.push(...checkReferenceTargetType(document, context, slot, found.raw, location));
    }
  }
  for (const fieldSchema of effective) {
    if (fieldSchema.required === true && value.fields[fieldSchema.name] === undefined) {
      diagnostics.push(
        diagnostic({
          code: "attribute-required-missing",
          path: `${path}.fields.${fieldSchema.name}`,
          message: `attribute ${fieldSchema.name} is required by the schema`,
          details: { attribute: fieldSchema.name },
        }),
      );
    }
  }
  return diagnostics;
}

/** Does a reference of this namespace resolve inside this document? */
function resolveReference(
  document: SemanticDocument,
  raw: string,
  expected: RefKind,
  path: string,
): readonly Diagnostic[] {
  const parsed = parseRef(expected, raw, path);
  if (!parsed.ok) return [parsed.diagnostic];
  const found =
    expected === "entity"
      ? document.entities[raw]
      : expected === "relation"
        ? document.relations[raw]
        : expected === "port"
          ? document.ports[raw]
          : expected === "resource"
            ? document.resources[raw]
            : undefined;
  if (found !== undefined) return [];
  if (expected === "occurrence" || expected === "view" || expected === "document") {
    // A document holds no occurrences and no views; those references are
    // resolved against a state, not here. Reporting them as dangling from a
    // document would be a false positive, so the schema is what refuses them.
    return [
      diagnostic({
        code: "reference-type-mismatch",
        path,
        message: `a ${expected} reference cannot be resolved from a semantic document`,
        refs: [raw],
        details: { expectedKind: expected },
      }),
    ];
  }
  return [
    diagnostic({
      code: "dangling-reference",
      path,
      message: `${raw} resolves to no ${expected} in this document`,
      refs: [raw],
      details: { expectedKind: expected },
    }),
  ];
}

function validateEntity(
  entity: Entity,
  key: string,
  document: SemanticDocument,
  options: ValidationOptions,
  resolver?: TypeResolver,
  adapter: DeclarationAdapter = LEGACY_CONSTRAINTS_ADAPTER,
): readonly Diagnostic[] {
  const path = `entities.${key}`;
  const diagnostics: Diagnostic[] = [...keyMatchesId(key, entity.id, "entity", path)];
  const profile = declaredProfile(document, entity.profile, options, path);
  if ("diagnostic" in profile) return [...diagnostics, profile.diagnostic];

  if (adapter !== LEGACY_CONSTRAINTS_ADAPTER && resolver !== undefined) {
    return [...diagnostics, ...validateScopedEntity(entity, path, document, options, profile.profile, resolver)];
  }

  const effective = effectiveEntitySchemas(document, profile.profile, entity.type);
  if ("diagnostic" in effective) return [...diagnostics, { ...effective.diagnostic, path: `${path}.type` }];

  diagnostics.push(...validateAttributeBag(entity.attributes, effective.schemas, document, `${path}.attributes`));
  return diagnostics;
}

/** The scoped entity run: resolver schemas, the abstract arm, K2/K6 values. */
function validateScopedEntity(
  entity: Entity,
  path: string,
  document: SemanticDocument,
  options: ValidationOptions,
  profile: Profile,
  resolver: TypeResolver,
): readonly Diagnostic[] {
  const resolution = resolver.resolve(profile, entity.type);
  if (!resolution.ok) {
    // Chain failures (unknown base, cycle, redeclaration) are reported once at
    // the definition that closes them; only an unknown start is reported here.
    if (resolution.diagnostic.path.startsWith("typeDefinitions.")) return [];
    return [{ ...resolution.diagnostic, path: `${path}.type` }];
  }
  if (resolution.resolved.abstract) {
    return [
      diagnostic({
        code: "abstract-instantiated",
        severity: "error",
        path: `${path}.type`,
        message: `abstract type ${entity.type} cannot be instantiated as an entity`,
        refs: [entity.id],
        details: { type: entity.type },
      }),
    ];
  }
  return validateAttributeBag(entity.attributes, resolution.resolved.schemas, document, `${path}.attributes`, {
    owner: profile,
    registry: options.registry,
    resolver,
  });
}

function validatePort(
  port: SemanticPort,
  key: string,
  document: SemanticDocument,
  options: ValidationOptions,
  resolver?: TypeResolver,
  adapter: DeclarationAdapter = LEGACY_CONSTRAINTS_ADAPTER,
): readonly Diagnostic[] {
  const path = `ports.${key}`;
  const diagnostics: Diagnostic[] = [...keyMatchesId(key, port.id, "port", path)];
  const profile = declaredProfile(document, port.profile, options, path);
  if ("diagnostic" in profile) return [...diagnostics, profile.diagnostic];

  diagnostics.push(...resolveReference(document, port.owner, "entity", `${path}.owner`));

  const declared = portTypeOf(profile.profile, port.type);
  if (declared === undefined) {
    diagnostics.push(
      diagnostic({
        code: "unknown-port-type",
        path: `${path}.type`,
        message: `profile ${port.profile} does not declare port type ${port.type}`,
        details: { type: port.type },
      }),
    );
    return diagnostics;
  }
  if (!declared.directions.includes(port.direction)) {
    diagnostics.push(
      diagnostic({
        code: "port-direction-not-allowed",
        path: `${path}.direction`,
        message: `port type ${port.type} allows ${declared.directions.join(", ")}, not ${port.direction}`,
        details: { direction: port.direction, allowed: declared.directions.join(",") },
      }),
    );
  }
  const context: AttributeContext | undefined =
    adapter !== LEGACY_CONSTRAINTS_ADAPTER && resolver !== undefined
      ? { owner: profile.profile, registry: options.registry, resolver }
      : undefined;
  diagnostics.push(
    ...validateAttributeBag(port.attributes, declared.attributes ?? [], document, `${path}.attributes`, context),
  );
  return diagnostics;
}

function validateRelation(
  relation: Relation,
  key: string,
  document: SemanticDocument,
  options: ValidationOptions,
  resolver?: TypeResolver,
  adapter: DeclarationAdapter = LEGACY_CONSTRAINTS_ADAPTER,
): readonly Diagnostic[] {
  const path = `relations.${key}`;
  const diagnostics: Diagnostic[] = [...keyMatchesId(key, relation.id, "relation", path)];
  const profile = declaredProfile(document, relation.profile, options, path);
  if ("diagnostic" in profile) return [...diagnostics, profile.diagnostic];

  const declared = relationTypeOf(profile.profile, relation.type);
  if (declared === undefined) {
    diagnostics.push(
      diagnostic({
        code: "unknown-relation-type",
        path: `${path}.type`,
        message: `profile ${relation.profile} does not declare relation type ${relation.type}`,
        details: { type: relation.type },
      }),
    );
    return diagnostics;
  }

  const maxEndpoints = profile.profile.limits.maxEndpointsPerRelation;
  if (maxEndpoints !== undefined && relation.endpoints.length > maxEndpoints) {
    diagnostics.push(
      diagnostic({
        code: "limit-exceeded",
        path: `${path}.endpoints`,
        message: `${relation.endpoints.length} endpoints; profile ${profile.profile.id} allows ${maxEndpoints}`,
        details: { limit: "maxEndpointsPerRelation", seen: relation.endpoints.length, max: maxEndpoints },
      }),
    );
  }

  const perRole = new Map<string, number>();
  relation.endpoints.forEach((endpoint, index) => {
    const endpointPath = `${path}.endpoints[${index}]`;
    const role = roleOf(declared, endpoint.role);
    if (role === undefined) {
      diagnostics.push(
        diagnostic({
          code: "endpoint-role-unknown",
          path: `${endpointPath}.role`,
          message: `relation type ${relation.type} declares ${declared.roles.map((entry) => entry.role).join(", ")}, not ${endpoint.role}`,
          details: { role: endpoint.role },
        }),
      );
      return;
    }
    perRole.set(endpoint.role, (perRole.get(endpoint.role) ?? 0) + 1);

    const seenKind = refKindOf(endpoint.target);
    // The shared relation-target carrier (§3.9.1): a scoped run admits
    // relation endpoints where the role declares them. The retained native
    // run keeps its pinned two-kind shape and arrays.
    const relationAdmitted = adapter !== LEGACY_CONSTRAINTS_ADAPTER && seenKind === "relation";
    if (seenKind !== "entity" && seenKind !== "port" && !relationAdmitted) {
      diagnostics.push(
        diagnostic({
          code: seenKind === undefined ? "malformed-ref" : "reference-type-mismatch",
          path: `${endpointPath}.target`,
          message: `an endpoint targets an entity or a port, not ${seenKind ?? JSON.stringify(endpoint.target)}`,
          refs: [String(endpoint.target)],
          ...(seenKind === undefined ? {} : { details: { seenKind } }),
        }),
      );
      return;
    }
    if (!role.targets.includes(seenKind as "entity" | "port" | "relation")) {
      diagnostics.push(
        diagnostic({
          code: "endpoint-target-not-allowed",
          path: `${endpointPath}.target`,
          message: `role ${endpoint.role} accepts ${role.targets.join(", ")}, not a ${seenKind}`,
          refs: [endpoint.target],
          details: { seenKind, allowed: role.targets.join(",") },
        }),
      );
      return;
    }

    const resolution = resolveReference(
      document,
      endpoint.target,
      seenKind as "entity" | "port" | "relation",
      `${endpointPath}.target`,
    );
    diagnostics.push(...resolution);
    if (resolution.length > 0) return;

    // M3 §3.2.1 S-4: every scoped endpoint is owned by the relation's own
    // profile. A foreign-family entity or port is refused without an admitted
    // semantic join — and no such join exists in this lot. The check covers
    // all relation types, not only hierarchy relations. The retained native
    // run is unchanged.
    if (adapter !== LEGACY_CONSTRAINTS_ADAPTER && (seenKind === "entity" || seenKind === "port")) {
      const target =
        seenKind === "entity"
          ? (document.entities[endpoint.target] as Entity | undefined)
          : (document.ports[endpoint.target] as SemanticPort | undefined);
      if (target !== undefined && target.profile !== relation.profile) {
        diagnostics.push(
          diagnostic({
            code: "endpoint-without-join",
            path: `${endpointPath}.target`,
            message: `relation ${relation.id} applies ${relation.profile} ${relation.type} to ${seenKind} ${endpoint.target} owned by profile ${target.profile} with no admitted semantic join`,
            refs: [endpoint.target],
            details: { profile: relation.profile, targetProfile: target.profile },
          }),
        );
        return;
      }
    }

    if (seenKind === "entity" && role.entityTypes !== undefined) {
      const target = document.entities[endpoint.target] as Entity;
      // A new-format role is satisfied iff the target's resolved chain contains
      // an allowed family root; the retained native run compares directly.
      const chain: readonly string[] =
        adapter !== LEGACY_CONSTRAINTS_ADAPTER && resolver !== undefined
          ? entityAncestry(options.registry, resolver, target)
          : [target.type];
      if (!role.entityTypes.some((allowed) => chain.includes(allowed))) {
        diagnostics.push(
          diagnostic({
            code: "endpoint-target-not-allowed",
            path: `${endpointPath}.target`,
            message: `role ${endpoint.role} accepts entity types ${role.entityTypes.join(", ")}; ${target.id} is a ${target.type}`,
            refs: [target.id],
            details: { seenType: target.type, allowed: role.entityTypes.join(",") },
          }),
        );
      }
    }
  });

  for (const role of declared.roles) {
    const count = perRole.get(role.role) ?? 0;
    if (count < role.cardinality.min || count > role.cardinality.max) {
      diagnostics.push(
        diagnostic({
          code: "endpoint-cardinality-violation",
          path: `${path}.endpoints`,
          message: `role ${role.role} carries ${count} endpoints; the declared cardinality is ${role.cardinality.min}..${role.cardinality.max}`,
          details: { role: role.role, seen: count, min: role.cardinality.min, max: role.cardinality.max },
        }),
      );
    }
  }

  const context: AttributeContext | undefined =
    adapter !== LEGACY_CONSTRAINTS_ADAPTER && resolver !== undefined
      ? { owner: profile.profile, registry: options.registry, resolver }
      : undefined;
  diagnostics.push(
    ...validateAttributeBag(relation.attributes, declared.attributes ?? [], document, `${path}.attributes`, context),
  );
  return diagnostics;
}

/** An entity's resolved ancestry in its own profile context; the direct type when unresolvable. */
function entityAncestry(registry: ProfileRegistry, resolver: TypeResolver, target: Entity): readonly string[] {
  const targetProfile = registry.get(target.profile);
  if (targetProfile === undefined) return [target.type];
  const resolution = resolver.resolve(targetProfile, target.type);
  if (!resolution.ok) return [target.type];
  return resolution.resolved.ancestry;
}

/**
 * Hierarchy shapes. Every DECLARED hierarchy refuses cycles, `tree` also refuses
 * a second parent. The `acyclic-hierarchy` profile constraint is the profile
 * restating the rule explicitly; `validateProfile` checks it names a declared
 * hierarchy, so the two can never disagree.
 */
function validateHierarchies(
  document: SemanticDocument,
  relationTypes: readonly { readonly profile: ProfileId; readonly declaration: RelationTypeDeclaration }[],
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  for (const { profile, declaration } of relationTypes) {
    const hierarchy = declaration.hierarchy;
    if (hierarchy === undefined) continue;

    const childToParents = new Map<string, string[]>();
    const children = new Map<string, string[]>();

    for (const relation of Object.values(document.relations)) {
      if (relation.profile !== profile || relation.type !== declaration.id) continue;
      const parents = relation.endpoints.filter((endpoint) => endpoint.role === hierarchy.parentRole);
      const kids = relation.endpoints.filter((endpoint) => endpoint.role === hierarchy.childRole);
      for (const parent of parents) {
        for (const kid of kids) {
          childToParents.set(kid.target, [...(childToParents.get(kid.target) ?? []), parent.target]);
          children.set(parent.target, [...(children.get(parent.target) ?? []), kid.target]);
        }
      }
    }

    if (hierarchy.shape === "tree") {
      for (const [child, parents] of [...childToParents.entries()].sort()) {
        if (parents.length > 1) {
          diagnostics.push(
            diagnostic({
              code: "hierarchy-multiple-parents",
              path: `relations`,
              message: `hierarchy ${hierarchy.id} is declared a tree; ${child} has ${parents.length} parents (${parents.sort().join(", ")})`,
              refs: [child, ...parents],
              details: { hierarchy: hierarchy.id, child, parents: parents.length },
            }),
          );
        }
      }
    }

    // Iterative depth-first walk with an explicit stack: a cycle must be
    // REPORTED with its members, not merely detected, so the diagnostic carries
    // the path that closes it.
    const state = new Map<string, "visiting" | "done">();
    const walk = (start: string): void => {
      const stack: { readonly node: string; readonly path: readonly string[] }[] = [{ node: start, path: [start] }];
      while (stack.length > 0) {
        const current = stack.pop() as { readonly node: string; readonly path: readonly string[] };
        const status = state.get(current.node);
        if (status === "done") continue;
        if (current.path.slice(0, -1).includes(current.node)) {
          const cycle = current.path.slice(current.path.indexOf(current.node));
          diagnostics.push(
            diagnostic({
              code: "hierarchy-cycle",
              path: "relations",
              message: `hierarchy ${hierarchy.id} closes a cycle: ${cycle.join(" -> ")}`,
              refs: cycle,
              details: { hierarchy: hierarchy.id, shape: hierarchy.shape, length: cycle.length - 1 },
            }),
          );
          continue;
        }
        state.set(current.node, "visiting");
        for (const child of (children.get(current.node) ?? []).slice().sort()) {
          stack.push({ node: child, path: [...current.path, child] });
        }
      }
      for (const [node, status] of state) if (status === "visiting") state.set(node, "done");
    };

    for (const root of [...children.keys()].sort()) walk(root);
  }

  return diagnostics;
}

function validateConstraints(
  document: SemanticDocument,
  profile: Profile,
  options: ValidationOptions,
  resolver: TypeResolver,
  adapter: DeclarationAdapter,
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const entities = Object.values(document.entities).filter((entity) => entity.profile === profile.id);

  for (const constraint of profile.constraints) {
    if (constraint.kind === "acyclic-hierarchy") continue; // handled by validateHierarchies
    if (adapter !== LEGACY_CONSTRAINTS_ADAPTER && resolver !== undefined && isAddedConstraint(constraint)) {
      diagnostics.push(
        ...validateAddedConstraint(document, profile, options, resolver, constraint, entities),
      );
      continue;
    }
    if (constraint.kind === "max-entities-of-type") {
      const count = entities.filter((entity) => entity.type === constraint.entityType).length;
      if (count > constraint.max) {
        diagnostics.push(
          diagnostic({
            code: "limit-exceeded",
            path: "entities",
            message: `${count} entities of type ${constraint.entityType}; profile ${profile.id} allows ${constraint.max}`,
            details: { type: constraint.entityType, seen: count, max: constraint.max },
          }),
        );
      }
      continue;
    }
    // New-format `AddedConstraint` members are dispatched by the scoped
    // executor; the retained native run ignores them exactly as before.
    if (constraint.kind !== "unique-attribute") continue;
    if (adapter !== LEGACY_CONSTRAINTS_ADAPTER && constraint.scope !== undefined) {
      diagnostics.push(
        ...validateScopedUniqueness(document, profile, options.registry, resolver, constraint, entities),
      );
      continue;
    }
    const seen = new Map<string, string>();
    // Insertion order is not content: walk the constrained entities sorted by id
    // in UTF-16 code-unit order, like every other sorted walk in this file and
    // in `canonical.ts` (`Object.keys(...).sort()`). The first id in that order
    // is the reference and is never reported.
    const constrained = entities
      .filter((candidate) => candidate.type === constraint.entityType)
      .slice()
      .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
    for (const entity of constrained) {
      const value = entity.attributes[constraint.attribute];
      if (value === undefined) continue;
      const key = tryCanonicalise(value, "value");
      if (!key.ok) continue;
      const previous = seen.get(key.text);
      if (previous !== undefined) {
        diagnostics.push(
          diagnostic({
            code: "unique-attribute-violation",
            path: `entities.${entity.id}.attributes.${constraint.attribute}`,
            message: `attribute ${constraint.attribute} must be unique among ${constraint.entityType} entities; ${previous} carries the same value`,
            refs: [entity.id, previous],
            details: { attribute: constraint.attribute, type: constraint.entityType },
          }),
        );
      } else {
        seen.set(key.text, entity.id);
      }
    }
  }
  return diagnostics;
}

function isAddedConstraint(constraint: ProfileConstraint): constraint is AddedConstraint {
  switch (constraint.kind) {
    case "acyclic-hierarchy":
    case "unique-attribute":
    case "max-entities-of-type":
      return false;
    default:
      return true;
  }
}

/** One entity with its resolved chain and nearest declared family type. */
interface ChainedEntity {
  readonly entity: Entity;
  readonly chain: readonly string[];
  readonly familyType: string;
}

/**
 * The resolved chain of a known entity, or `undefined` when its profile or
 * type does not resolve. Unlike `chainOfEntity`, there is no fallback chain:
 * callers that must not duplicate another stage's refusal use this.
 */
function resolvedChainOfEntity(
  registry: ProfileRegistry,
  resolver: TypeResolver,
  entity: Entity,
): ChainedEntity | undefined {
  const owner = registry.get(entity.profile);
  if (owner === undefined) return undefined;
  const resolution = resolver.resolve(owner, entity.type);
  if (!resolution.ok) return undefined;
  const familyType =
    resolution.resolved.ancestry.find((id) => entityTypeOf(owner, id) !== undefined) ?? entity.type;
  return { entity, chain: resolution.resolved.ancestry, familyType };
}

function chainOfEntity(
  document: SemanticDocument,
  registry: ProfileRegistry,
  resolver: TypeResolver,
  entityId: string,
): ChainedEntity | undefined {
  const entity = document.entities[entityId];
  if (entity === undefined) return undefined;
  const owner = registry.get(entity.profile);
  if (owner === undefined) return { entity, chain: [entity.type], familyType: entity.type };
  const resolution = resolver.resolve(owner, entity.type);
  if (!resolution.ok) return { entity, chain: [entity.type], familyType: entity.type };
  const familyType =
    resolution.resolved.ancestry.find((id) => entityTypeOf(owner, id) !== undefined) ?? entity.type;
  return { entity, chain: resolution.resolved.ancestry, familyType };
}

interface HierarchyIndex {
  readonly childToParents: ReadonlyMap<string, readonly string[]>;
}

function indexHierarchy(
  document: SemanticDocument,
  profile: Profile,
  hierarchyId: string,
): HierarchyIndex | undefined {
  const declarations = profile.relationTypes.filter(
    (declaration) => declaration.hierarchy?.id === hierarchyId,
  );
  if (declarations.length === 0) return undefined;
  const childToParents = new Map<string, string[]>();
  for (const declaration of declarations) {
    const hierarchy = declaration.hierarchy as NonNullable<RelationTypeDeclaration["hierarchy"]>;
    for (const relation of Object.values(document.relations)) {
      if (relation.profile !== profile.id || relation.type !== declaration.id) continue;
      const parents = relation.endpoints.filter((endpoint) => endpoint.role === hierarchy.parentRole);
      const kids = relation.endpoints.filter((endpoint) => endpoint.role === hierarchy.childRole);
      for (const parent of parents) {
        if (refKindOf(parent.target) !== "entity") continue;
        for (const kid of kids) {
          if (refKindOf(kid.target) !== "entity") continue;
          childToParents.set(kid.target, [...(childToParents.get(kid.target) ?? []), parent.target]);
        }
      }
    }
  }
  for (const parents of childToParents.values()) parents.sort();
  return { childToParents };
}

function validateAddedConstraint(
  document: SemanticDocument,
  profile: Profile,
  options: ValidationOptions,
  resolver: TypeResolver,
  constraint: AddedConstraint,
  entities: readonly Entity[],
): readonly Diagnostic[] {
  switch (constraint.kind) {
    case "hierarchy":
      // Declaration-level binding: qualification checks that the named
      // relation type declares this hierarchy with these roles, and
      // `validateHierarchies` enforces the tree/DAG shapes for every declared
      // hierarchy. The constraint itself adds no per-document check.
      return [];
    case "parent-family":
      return checkParentFamily(document, profile, options.registry, resolver, constraint);
    case "children-restricted":
      return checkChildrenRestricted(document, profile, options.registry, resolver, constraint);
    case "required-parent":
      return checkRequiredParent(document, profile, options.registry, resolver, constraint, entities);
    case "relationship-matrix":
      return checkRelationshipMatrix(document, profile, options.registry, resolver, constraint);
    case "bound-pair":
      return checkBoundPair(document, profile, options.registry, resolver, constraint);
    case "reference-application":
      return checkReferenceApplication(document, profile, options.registry, resolver, constraint, entities);
    case "incident-type-uniformity":
      return checkIncidentTypeUniformity(document, profile, options.registry, resolver, constraint, entities);
    case "at-most-value":
      return checkAtMostValue(document, profile, constraint);
    case "collection-unique":
      return checkCollectionUnique(document, options.registry, resolver, constraint, entities);
  }
}

function checkParentFamily(
  document: SemanticDocument,
  profile: Profile,
  registry: ProfileRegistry,
  resolver: TypeResolver,
  constraint: Extract<AddedConstraint, { kind: "parent-family" }>,
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const declaration of profile.relationTypes) {
    if (declaration.hierarchy?.id !== constraint.hierarchyId) continue;
    const hierarchy = declaration.hierarchy;
    const relations = Object.values(document.relations)
      .filter((relation) => relation.profile === profile.id && relation.type === declaration.id)
      .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
    for (const relation of relations) {
      relation.endpoints.forEach((endpoint, index) => {
        if (endpoint.role !== hierarchy.parentRole) return;
        if (refKindOf(endpoint.target) !== "entity") return;
        const info = chainOfEntity(document, registry, resolver, endpoint.target);
        if (info === undefined) return;
        if (constraint.familyRoots.some((root) => info.chain.includes(root))) return;
        diagnostics.push(
          diagnostic({
            code: "endpoint-target-not-allowed",
            path: `relations.${relation.id}.endpoints[${index}].target`,
            message: `role ${endpoint.role} accepts entity types ${constraint.familyRoots.join(", ")}; ${info.entity.id} is a ${info.entity.type}`,
            refs: [info.entity.id],
            details: { seenType: info.entity.type, allowed: constraint.familyRoots.join(",") },
          }),
        );
      });
    }
  }
  return diagnostics;
}

function checkChildrenRestricted(
  document: SemanticDocument,
  profile: Profile,
  registry: ProfileRegistry,
  resolver: TypeResolver,
  constraint: Extract<AddedConstraint, { kind: "children-restricted" }>,
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const reported = new Set<string>();
  for (const declaration of profile.relationTypes) {
    if (declaration.hierarchy?.id !== constraint.hierarchyId) continue;
    const hierarchy = declaration.hierarchy;
    const relations = Object.values(document.relations)
      .filter((relation) => relation.profile === profile.id && relation.type === declaration.id)
      .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
    for (const relation of relations) {
      const parents = relation.endpoints.filter((endpoint) => endpoint.role === hierarchy.parentRole);
      const kids = relation.endpoints.filter((endpoint) => endpoint.role === hierarchy.childRole);
      for (const parent of parents) {
        if (refKindOf(parent.target) !== "entity") continue;
        const parentInfo = chainOfEntity(document, registry, resolver, parent.target);
        if (parentInfo === undefined) continue;
        if (!constraint.parentFamilyRoots.some((root) => parentInfo.chain.includes(root))) continue;
        // The arm wording is fixed native mapping; only the family names are
        // composed from the constraint values, so any family renames cleanly.
        const roots = constraint.parentFamilyRoots.join(", ");
        const kinds = constraint.childTypes.join(", ");
        for (const kid of kids) {
          if (refKindOf(kid.target) !== "entity" || reported.has(kid.target)) continue;
          const kidInfo = chainOfEntity(document, registry, resolver, kid.target);
          if (kidInfo === undefined) continue;
          if (constraint.childTypes.some((child) => kidInfo.chain.includes(child))) continue;
          reported.add(kid.target);
          diagnostics.push(
            diagnostic({
              code: "legend-key-parent-invalid",
              path: `entities.${kid.target}`,
              message: `key entity ${kid.target} is contained by ${roots} ${parent.target}; only ${kinds} entities may be contained by a ${roots}`,
              refs: [kid.target, parent.target],
              details: {
                childType: kidInfo.entity.type,
                parentType: parentInfo.entity.type,
                constraint: "children-restricted",
              },
            }),
          );
        }
      }
    }
  }
  return diagnostics;
}

function checkRequiredParent(
  document: SemanticDocument,
  profile: Profile,
  registry: ProfileRegistry,
  resolver: TypeResolver,
  constraint: Extract<AddedConstraint, { kind: "required-parent" }>,
  entities: readonly Entity[],
): readonly Diagnostic[] {
  const index = indexHierarchy(document, profile, constraint.hierarchyId);
  if (index === undefined) return [];
  const diagnostics: Diagnostic[] = [];
  const ordered = [...entities].sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  for (const entity of ordered) {
    if (!constraint.childTypes.some((child) => entityAncestry(registry, resolver, entity).includes(child))) continue;
    const roots = constraint.parentFamilyRoots.join(", ");
    const kinds = constraint.childTypes.join(", ");
    const parents = index.childToParents.get(entity.id) ?? [];
    if (parents.length === 0) {
      diagnostics.push(
        diagnostic({
          code: "legend-key-parent-invalid",
          path: `entities.${entity.id}`,
          message: `key entity ${entity.id} has no hierarchy parent; a ${kinds} must be contained by a ${roots}`,
          refs: [entity.id],
          details: { childType: entity.type, parentType: "none", constraint: "required-parent" },
        }),
      );
      continue;
    }
    const inside = parents.filter((parent) => {
      const info = chainOfEntity(document, registry, resolver, parent);
      return info !== undefined && constraint.parentFamilyRoots.some((root) => info.chain.includes(root));
    });
    if (inside.length > 0) continue;
    const named = parents[0] as string;
    const parentInfo = chainOfEntity(document, registry, resolver, named);
    if (parentInfo === undefined) continue;
    diagnostics.push(
      diagnostic({
        code: "legend-key-parent-invalid",
        path: `entities.${entity.id}`,
        message: `key entity ${entity.id} is contained by ${named}, which is outside the ${roots} family; a ${kinds} must be contained by a ${roots}`,
        refs: [entity.id, named],
        details: { childType: entity.type, parentType: parentInfo.entity.type, constraint: "required-parent" },
      }),
    );
  }
  return diagnostics;
}

function checkRelationshipMatrix(
  document: SemanticDocument,
  profile: Profile,
  registry: ProfileRegistry,
  resolver: TypeResolver,
  constraint: Extract<AddedConstraint, { kind: "relationship-matrix" }>,
): readonly Diagnostic[] {
  const tuples = new Set(
    constraint.tuples.map((tuple) => `${tuple.relationType}\n${tuple.sourceType}\n${tuple.targetType}`),
  );
  const diagnostics: Diagnostic[] = [];
  const relations = Object.values(document.relations)
    .filter((relation) => relation.profile === profile.id)
    .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  for (const relation of relations) {
    // §5.2: relation declaration, role, kind, cardinality and resolution
    // prerequisites take precedence. A relation failing any of them already
    // carries its own refusal from endpoint validation; comparing it against
    // the matrix would add a secondary relationship-matrix-violation.
    const declared = relationTypeOf(profile, relation.type);
    if (declared === undefined) continue;
    const sourceRole = roleOf(declared, constraint.sourceRole);
    const targetRole = roleOf(declared, constraint.targetRole);
    if (sourceRole === undefined || targetRole === undefined) continue;
    const sources = relation.endpoints.filter((endpoint) => endpoint.role === constraint.sourceRole);
    const targets = relation.endpoints.filter((endpoint) => endpoint.role === constraint.targetRole);
    if (sources.length !== 1 || targets.length !== 1) continue;
    const source = sources[0] as (typeof sources)[number];
    const target = targets[0] as (typeof targets)[number];
    if (refKindOf(source.target) !== "entity" || refKindOf(target.target) !== "entity") continue;
    if (!sourceRole.targets.includes("entity") || !targetRole.targets.includes("entity")) continue;
    const counts = new Map<string, number>();
    for (const endpoint of relation.endpoints) {
      counts.set(endpoint.role, (counts.get(endpoint.role) ?? 0) + 1);
    }
    const sourceCount = counts.get(constraint.sourceRole) ?? 0;
    const targetCount = counts.get(constraint.targetRole) ?? 0;
    if (sourceCount < sourceRole.cardinality.min || sourceCount > sourceRole.cardinality.max) continue;
    if (targetCount < targetRole.cardinality.min || targetCount > targetRole.cardinality.max) continue;
    const sourceEntity = document.entities[source.target] as Entity | undefined;
    const targetEntity = document.entities[target.target] as Entity | undefined;
    if (sourceEntity === undefined || targetEntity === undefined) continue;
    const sourceInfo = resolvedChainOfEntity(registry, resolver, sourceEntity);
    const targetInfo = resolvedChainOfEntity(registry, resolver, targetEntity);
    if (sourceInfo === undefined || targetInfo === undefined) continue;
    if (
      sourceRole.entityTypes !== undefined &&
      !sourceRole.entityTypes.some((allowed) => sourceInfo.chain.includes(allowed))
    ) {
      continue;
    }
    if (
      targetRole.entityTypes !== undefined &&
      !targetRole.entityTypes.some((allowed) => targetInfo.chain.includes(allowed))
    ) {
      continue;
    }
    if (tuples.has(`${relation.type}\n${sourceInfo.familyType}\n${targetInfo.familyType}`)) continue;
    diagnostics.push(
      diagnostic({
        code: "relationship-matrix-violation",
        path: `relations.${relation.id}.endpoints`,
        message: `relation ${relation.id} of type ${relation.type} is not allowed from ${sourceInfo.familyType} to ${targetInfo.familyType} by matrix ${constraint.matrixId}`,
        refs: [relation.id, source.target, target.target],
        details: {
          matrixId: constraint.matrixId,
          relationType: relation.type,
          sourceType: sourceInfo.familyType,
          targetType: targetInfo.familyType,
        },
      }),
    );
  }
  return diagnostics;
}

function scopedRecordSchemas(
  resolver: TypeResolver,
  owner: Profile,
  recordType: string,
): readonly AttributeSchema[] | undefined {
  const resolution = resolver.resolve(owner, recordType);
  if (!resolution.ok) return undefined;
  return resolution.resolved.schemas;
}

function checkBoundPair(
  document: SemanticDocument,
  profile: Profile,
  registry: ProfileRegistry,
  resolver: TypeResolver,
  constraint: Extract<AddedConstraint, { kind: "bound-pair" }>,
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  // Every occurrence of the value type is checked, including values nested
  // inside other K6 structs: a bound pair buried one level down is the same
  // multiplicity fact as a top-level one.
  const checkValue = (value: AttributeValue, valuePath: string): void => {
    if (value.kind !== "struct") return;
    if (value.type === constraint.valueType) {
      const lower = value.fields[constraint.lowerField];
      const upper = value.fields[constraint.upperField];
      if (
        lower?.kind === "quantity" &&
        upper?.kind === "quantity" &&
        typeof lower.value === "number" &&
        typeof upper.value === "number" &&
        Number.isFinite(lower.value) &&
        Number.isFinite(upper.value) &&
        upper.value !== constraint.unboundedUpper &&
        lower.value > upper.value
      ) {
        diagnostics.push(
          diagnostic({
            code: "multiplicity-invalid",
            path: valuePath,
            message: `multiplicity lower ${String(lower.value)} exceeds finite upper ${String(upper.value)}`,
            refs: [],
            details: { lower: lower.value, upper: upper.value, constraint: "bound-pair" },
          }),
        );
      }
    }
    for (const name of Object.keys(value.fields).sort()) {
      checkValue(value.fields[name] as AttributeValue, `${valuePath}.fields.${name}`);
    }
  };
  const checkRecord = (recordPath: string, attributes: Readonly<Record<string, AttributeValue>>): void => {
    for (const name of Object.keys(attributes).sort()) {
      checkValue(attributes[name] as AttributeValue, `${recordPath}.attributes.${name}`);
    }
  };
  for (const entity of Object.values(document.entities)
    .filter((candidate) => candidate.profile === profile.id)
    .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0))) {
    if (scopedRecordSchemas(resolver, profile, entity.type) === undefined) continue;
    checkRecord(`entities.${entity.id}`, entity.attributes);
  }
  for (const relation of Object.values(document.relations)
    .filter((candidate) => candidate.profile === profile.id)
    .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0))) {
    if (relationTypeOf(profile, relation.type) === undefined) continue;
    checkRecord(`relations.${relation.id}`, relation.attributes);
  }
  // Ports carry structured attributes too: a bound pair on a port attribute
  // is the same multiplicity fact as on an entity or relation. Records walk
  // in UTF-16 id order and attributes keep the exact value path, like every
  // other sorted walk in this file.
  for (const port of Object.values(document.ports)
    .filter((candidate) => candidate.profile === profile.id)
    .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0))) {
    if (portTypeOf(profile, port.type) === undefined) continue;
    checkRecord(`ports.${port.id}`, port.attributes);
  }
  return diagnostics;
}

function checkReferenceApplication(
  document: SemanticDocument,
  profile: Profile,
  registry: ProfileRegistry,
  resolver: TypeResolver,
  constraint: Extract<AddedConstraint, { kind: "reference-application" }>,
  entities: readonly Entity[],
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const ordered = [...entities].sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  for (const entity of ordered) {
    const schemas = scopedRecordSchemas(resolver, profile, entity.type);
    if (schemas === undefined) continue;
    const schema = schemas.find((candidate) => candidate.name === constraint.attribute);
    if (schema === undefined) continue;
    const value = entity.attributes[constraint.attribute];
    if (value === undefined) continue;
    const slot = schema.kind === "collection" ? schema.item : schema;
    if (slot.kind !== "reference") continue;
    const items: readonly { readonly item: AttributeValue; readonly index: number | undefined }[] =
      value.kind === "collection"
        ? value.items.map((item, index) => ({ item, index }) as const)
        : [{ item: value, index: undefined }];
    for (const { item, index } of items) {
      if (item.kind !== "reference") continue;
      const itemPath =
        index === undefined
          ? `entities.${entity.id}.attributes.${constraint.attribute}`
          : `entities.${entity.id}.attributes.${constraint.attribute}[${index}]`;
      const target = document.entities[item.value];
      if (target === undefined) continue;
      const targetProfile = registry.get(target.profile);
      if (targetProfile === undefined) continue;
      const targetResolution = resolver.resolve(targetProfile, target.type);
      if (!targetResolution.ok) continue;
      const allowedSet = slot.targetTypes;
      if (
        allowedSet !== undefined &&
        allowedSet.length > 0 &&
        !allowedSet.some((type) => targetResolution.resolved.ancestry.includes(type))
      ) {
        continue;
      }
      // The applicable target set is the target entity's own field value, not
      // the schema's enum vocabulary: a stereotype applies exactly to the
      // types its instance declares.
      const declaration = targetResolution.resolved.schemas.find(
        (candidate) => candidate.name === constraint.allowedTypesField,
      );
      if (declaration?.kind !== "collection" || declaration.item.kind !== "enum") continue;
      const targetValue = target.attributes[constraint.allowedTypesField];
      if (targetValue?.kind !== "collection") continue;
      const allowed = targetValue.items.flatMap((entry) => (entry.kind === "enum" ? [entry.value] : []));
      const source = chainOfEntity(document, registry, resolver, entity.id);
      if (source === undefined) continue;
      if (allowed.some((type) => source.chain.includes(type))) continue;
      diagnostics.push(
        diagnostic({
          code: "stereotype-application-invalid",
          path: itemPath,
          message: `stereotype ${target.id} cannot be applied to type ${source.familyType}`,
          refs: [entity.id, target.id],
          details: { attribute: constraint.attribute, targetType: source.familyType, allowed: allowed.join(",") },
        }),
      );
    }
  }
  return diagnostics;
}

function checkIncidentTypeUniformity(
  document: SemanticDocument,
  profile: Profile,
  registry: ProfileRegistry,
  resolver: TypeResolver,
  constraint: Extract<AddedConstraint, { kind: "incident-type-uniformity" }>,
  entities: readonly Entity[],
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const ordered = [...entities].sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  const relations = Object.values(document.relations)
    .filter((relation) => relation.profile === profile.id && constraint.relationTypes.includes(relation.type))
    .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  for (const entity of ordered) {
    if (!entityAncestry(registry, resolver, entity).includes(constraint.entityType)) continue;
    const incident = relations.filter((relation) =>
      relation.endpoints.some((endpoint) => endpoint.target === entity.id),
    );
    const distinct = [...new Set(incident.map((relation) => relation.type))].sort();
    if (distinct.length <= 1) continue;
    diagnostics.push(
      diagnostic({
        code: "relationship-matrix-violation",
        path: `entities.${entity.id}`,
        message: `junction ${entity.id} connects incompatible relation types ${distinct.join(", ")}`,
        refs: [entity.id, ...incident.map((relation) => relation.id)],
        details: {
          matrixId: constraint.matrixId,
          constraint: "incident-type-uniformity",
          relationTypes: distinct.join(","),
        },
      }),
    );
  }
  return diagnostics;
}

function checkAtMostValue(
  document: SemanticDocument,
  profile: Profile,
  constraint: Extract<AddedConstraint, { kind: "at-most-value" }>,
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const relations = Object.values(document.relations)
    .filter((relation) => relation.profile === profile.id && relation.type === constraint.relationType)
    .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  for (const relation of relations) {
    const count = constraint.attributes.filter((attribute) => {
      const value = relation.attributes[attribute];
      return value !== undefined && value.kind === "enum" && value.value === constraint.value;
    }).length;
    if (count <= constraint.max) continue;
    diagnostics.push(
      diagnostic({
        code: "multiplicity-invalid",
        path: `relations.${relation.id}.attributes`,
        message: `relation ${relation.id} has ${count} ${constraint.value} ends; at most ${constraint.max} is allowed`,
        refs: [relation.id],
        details: { count, max: constraint.max, constraint: "at-most-value" },
      }),
    );
  }
  return diagnostics;
}

function checkCollectionUnique(
  document: SemanticDocument,
  registry: ProfileRegistry,
  resolver: TypeResolver,
  constraint: Extract<AddedConstraint, { kind: "collection-unique" }>,
  entities: readonly Entity[],
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const ordered = [...entities].sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  for (const entity of ordered) {
    if (!entityAncestry(registry, resolver, entity).includes(constraint.entityType)) continue;
    const value = entity.attributes[constraint.attribute];
    if (value?.kind !== "collection") continue;
    const seen = new Map<string, number>();
    value.items.forEach((item, index) => {
      const key = tryCanonicalise(item, "value");
      if (!key.ok) return;
      const first = seen.get(key.text);
      if (first !== undefined) {
        diagnostics.push(
          diagnostic({
            code: "collection-bound-exceeded",
            path: `entities.${entity.id}.attributes.${constraint.attribute}[${index}]`,
            message: `collection ${constraint.attribute} repeats item ${index}; first occurrence is ${first}`,
            refs: [],
            details: { constraint: "collection-unique", firstIndex: first, duplicateIndex: index },
          }),
        );
      } else {
        seen.set(key.text, index);
      }
    });
  }
  return diagnostics;
}

function validateScopedUniqueness(
  document: SemanticDocument,
  profile: Profile,
  registry: ProfileRegistry,
  resolver: TypeResolver,
  constraint: Extract<ProfileConstraint, { kind: "unique-attribute" }>,
  entities: readonly Entity[],
): readonly Diagnostic[] {
  const scope: UniqueAttributeScope = constraint.scope ?? "document";
  const scopeText = scope === "document" ? "document" : scope === "siblings" ? "siblings" : `within:${scope.withinType}`;
  let keyOf: ((entityId: string) => string) | undefined;
  if (scope === "document") {
    keyOf = () => "document";
  } else {
    const selection = selectGroupingHierarchy(
      profile,
      constraint.entityType,
      scope === "siblings" ? undefined : scope.withinType,
    );
    if (selection === undefined) return [];
    const index = indexHierarchy(document, profile, selection.hierarchyId);
    if (index === undefined) return [];
    if (scope === "siblings") {
      keyOf = (entityId) => index.childToParents.get(entityId)?.[0] ?? "roots";
    } else {
      keyOf = (entityId) => nearestWithinTypeAncestor(document, registry, resolver, index, entityId, scope.withinType);
    }
  }
  const keyFor = keyOf;
  const ordered = [...entities].sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  const groups = new Map<string, string[]>();
  for (const entity of ordered) {
    if (!entityAncestry(registry, resolver, entity).includes(constraint.entityType)) continue;
    const group = keyFor(entity.id);
    groups.set(group, [...(groups.get(group) ?? []), entity.id]);
  }
  const diagnostics: Diagnostic[] = [];
  for (const ids of groups.values()) {
    const seen = new Map<string, string>();
    for (const id of ids) {
      const entity = document.entities[id] as Entity;
      const value = entity.attributes[constraint.attribute];
      if (value === undefined) continue;
      const key = tryCanonicalise(value, "value");
      if (!key.ok) continue;
      const previous = seen.get(key.text);
      if (previous !== undefined) {
        diagnostics.push(
          diagnostic({
            code: "unique-attribute-violation",
            path: `entities.${id}.attributes.${constraint.attribute}`,
            message: `attribute ${constraint.attribute} must be unique among ${constraint.entityType} entities in scope ${scopeText}; ${previous} carries the same value`,
            refs: [id, previous],
            details: { attribute: constraint.attribute, type: constraint.entityType, scope: scopeText },
          }),
        );
      } else {
        seen.set(key.text, id);
      }
    }
  }
  return diagnostics;
}

/** Nearest hierarchy ancestor whose chain contains the declared type, else a singleton group. */
function nearestWithinTypeAncestor(
  document: SemanticDocument,
  registry: ProfileRegistry,
  resolver: TypeResolver,
  index: HierarchyIndex,
  entityId: string,
  withinType: string,
): string {
  let level: readonly string[] = [entityId];
  const visited = new Set<string>([entityId]);
  while (level.length > 0) {
    const next: string[] = [];
    for (const current of [...level].sort()) {
      for (const parent of index.childToParents.get(current) ?? []) {
        if (visited.has(parent)) continue;
        visited.add(parent);
        const info = chainOfEntity(document, registry, resolver, parent);
        if (info !== undefined && info.chain.includes(withinType)) return parent;
        next.push(parent);
      }
    }
    level = next;
  }
  return `none:${entityId}`;
}

function validateExtensions(document: SemanticDocument): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  document.extensions.forEach((extension: PreservedExtension, index) => {
    const path = `extensions[${index}]`;
    if (extension.validation === "unsupported") {
      // NAMED REJECTED CASE. The content is KEPT (D3-C: preserved with its hash,
      // inspectable, exportable) but the document is not writable while it
      // carries it: an unsupported extension must never look like a fact.
      diagnostics.push(
        diagnostic({
          code: "extension-unsupported",
          path,
          message: `extension ${extension.namespace}@${extension.schemaVersion} is unsupported: preserved for inspection and export, refused for write`,
          details: { namespace: extension.namespace, schemaVersion: extension.schemaVersion },
        }),
      );
    }
    const target = scopeTargetOf(extension.scope);
    if (target !== undefined) {
      const kind = extension.scope.kind as Exclude<PreservedExtension["scope"]["kind"], "document">;
      diagnostics.push(...resolveReference(document, target, kind, `${path}.scope.target`));
    }
    if (extension.contentHash.length === 0) {
      diagnostics.push(
        diagnostic({ code: "extension-hash-mismatch", path: `${path}.contentHash`, message: "an extension carries its content hash" }),
      );
    } else if (extension.source !== undefined && hashContent(extension.source) !== extension.contentHash) {
      diagnostics.push(
        diagnostic({
          code: "extension-hash-mismatch",
          path: `${path}.contentHash`,
          message: `recorded hash ${extension.contentHash} is not the hash of the retained source (${hashContent(extension.source)})`,
          details: { recorded: extension.contentHash, computed: hashContent(extension.source) },
        }),
      );
    }
  });
  return diagnostics;
}

function keyMatchesId(key: string, id: string, kind: RefKind, path: string): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const parsed = parseRef(kind, id, `${path}.id`);
  if (!parsed.ok) diagnostics.push(parsed.diagnostic);
  if (key !== id) {
    diagnostics.push(
      diagnostic({
        code: "record-key-mismatch",
        path,
        message: `record key ${key} is not the element's own id ${id}`,
        refs: [key, id],
      }),
    );
  }
  return diagnostics;
}

function declaredProfile(
  document: SemanticDocument,
  id: ProfileId,
  options: ValidationOptions,
  path: string,
): { readonly profile: Profile } | { readonly diagnostic: Diagnostic } {
  if (!document.profileRefs.includes(id)) {
    return {
      diagnostic: diagnostic({
        code: "profile-not-declared",
        path: `${path}.profile`,
        message: `profile ${id} is used but not declared by the document (declared: ${document.profileRefs.join(", ") || "none"})`,
        details: { profile: id },
      }),
    };
  }
  const profile = options.registry.get(id);
  if (profile === undefined) {
    return {
      diagnostic: diagnostic({
        code: "unknown-profile",
        path: `${path}.profile`,
        message: `profile ${id} is not in the registry (registered: ${options.registry.list().join(", ") || "none"})`,
        details: { profile: id },
      }),
    };
  }
  return { profile };
}

export function validateDocument(document: SemanticDocument, options: ValidationOptions): readonly Diagnostic[] {
  // The native object guard runs before anything else reads the document: a
  // non-object input returns the exact native diagnostic instead of throwing
  // on `profileRefs` inside binding processing.
  if (typeof document !== "object" || document === null) {
    return [diagnostic({ code: "document-not-an-object", path: "document", message: "a document is an object" })];
  }

  if (
    Array.isArray((document as { profileRefs?: unknown }).profileRefs) &&
    ((document as unknown as { profileRefs: readonly string[] }).profileRefs as readonly string[]).includes(
      DIAGRAM_PRESENTATION_PROFILE_ID,
    )
  ) {
    return [
      diagnostic({
        code: "unknown-profile",
        severity: "error",
        path: "profileRefs",
        message: `profile ${DIAGRAM_PRESENTATION_PROFILE_ID} is not a diagram profile; diagram-presentation@1 is a contract artifact, not a semantic profile`,
        details: { profile: DIAGRAM_PRESENTATION_PROFILE_ID },
      }),
    ];
  }
  if (
    options.bindings !== undefined &&
    options.bindings.rows.some((row) => row.profileId === (DIAGRAM_PRESENTATION_PROFILE_ID as never))
  ) {
    return [
      diagnostic({
        code: "type-definition-conflict",
        severity: "error",
        path: `bindings.${DIAGRAM_PRESENTATION_PROFILE_ID}`,
        message: `executor binding for ${DIAGRAM_PRESENTATION_PROFILE_ID} is refused; a contract artifact is never a family layer`,
        details: { profile: DIAGRAM_PRESENTATION_PROFILE_ID },
      }),
    ];
  }

  // A provided bindings table is verified before any document check runs; a
  // missing row or digest mismatch refuses the run instead of guessing.
  if (options.bindings !== undefined) {
    const bindingDiagnostics = verifyExecutorBindings(options.bindings, options.registry);
    if (bindingDiagnostics.length > 0) return bindingDiagnostics;
    for (const id of document.profileRefs) {
      if (adapterFor(options.bindings, id) === undefined) {
        return [
          diagnostic({
            code: "type-definition-conflict",
            path: `bindings.${id}`,
            message: `no executor binding row selects an adapter for profile ${id}`,
            details: { profile: id },
          }),
        ];
      }
    }
  } else {
    // No table, no guess (§5.3.1): implicit native compatibility is reserved
    // for exactly the four retained @1 identities. Every other profile, any
    // version, requires a verified bindings row selecting its adapter;
    // synthetic witnesses carry their explicit verified scoped rows.
    for (const id of document.profileRefs) {
      if (!isRetainedLegacyProfileId(id)) {
        return [
          diagnostic({
            code: "type-definition-conflict",
            path: `bindings.${id}`,
            message: `no executor binding row selects an adapter for profile ${id}`,
            details: { profile: id },
          }),
        ];
      }
    }
    // The packaged retained rows are the effective defaults: verify their
    // pins against the supplied registry before native execution, so
    // modified retained bytes refuse instead of running native checks.
    // Only rows both referenced and registered are verified; an unregistered
    // retained id keeps its existing unknown-profile diagnostic below.
    const effectiveDefaults: ExecutorProfileBindings = {
      schemaVersion: "1",
      rows: retainedExecutorBindings.rows.filter(
        (row) => document.profileRefs.includes(row.profileId) && options.registry.get(row.profileId) !== undefined,
      ),
    };
    const defaultDiagnostics = verifyExecutorBindings(effectiveDefaults, options.registry);
    if (defaultDiagnostics.length > 0) return defaultDiagnostics;
  }
  const diagnostics: Diagnostic[] = [];

  const version = document.schemaVersion;
  if (
    typeof version !== "object" ||
    !Number.isInteger(version.major) ||
    !Number.isInteger(version.minor) ||
    version.major < 1 ||
    version.minor < 0
  ) {
    diagnostics.push(
      diagnostic({
        code: "schema-version-malformed",
        path: "schemaVersion",
        message: `expected { major, minor } integers, got ${JSON.stringify(version)}`,
      }),
    );
  } else if (version.major !== CURRENT_SCHEMA_VERSION.major) {
    // NAMED REJECTED CASE: an unknown major is refused for WRITE. Reading,
    // inspecting and exporting it is `migrate.ts`'s job.
    diagnostics.push(
      diagnostic({
        code: "unknown-schema-major",
        path: "schemaVersion",
        message: `schema major ${version.major} is not writable by this build (current ${CURRENT_SCHEMA_VERSION.major}.${CURRENT_SCHEMA_VERSION.minor}); preserved for inspection and export`,
        details: { seenMajor: version.major, currentMajor: CURRENT_SCHEMA_VERSION.major },
      }),
    );
  } else if (version.minor !== CURRENT_SCHEMA_VERSION.minor) {
    diagnostics.push(
      diagnostic({
        code: "schema-migration-required",
        path: "schemaVersion",
        message: `schema ${version.major}.${version.minor} must be migrated to ${CURRENT_SCHEMA_VERSION.major}.${CURRENT_SCHEMA_VERSION.minor} before it is written`,
        details: { seenMinor: version.minor, currentMinor: CURRENT_SCHEMA_VERSION.minor },
      }),
    );
  }

  if (!Number.isInteger(document.revision) || document.revision < 0) {
    diagnostics.push(
      diagnostic({
        code: "value-not-finite",
        path: "revision",
        message: `a revision is a non-negative integer, got ${String(document.revision)}`,
      }),
    );
  }

  const documentIdParsed = parseRef("document", document.documentId, "documentId");
  if (!documentIdParsed.ok) diagnostics.push(documentIdParsed.diagnostic);

  if (document.profileRefs.length === 0) {
    diagnostics.push(
      diagnostic({ code: "profile-not-declared", path: "profileRefs", message: "a document declares at least one profile" }),
    );
  }
  const adapterOf = (id: ProfileId): DeclarationAdapter =>
    adapterFor(options.bindings, id) ?? LEGACY_CONSTRAINTS_ADAPTER;
  const resolver = createTypeResolver(document);

  const profiles: Profile[] = [];
  for (const id of document.profileRefs) {
    const profile = options.registry.get(id);
    if (profile === undefined) {
      diagnostics.push(
        diagnostic({
          code: "unknown-profile",
          path: "profileRefs",
          message: `profile ${id} is not in the registry (registered: ${options.registry.list().join(", ") || "none"})`,
          details: { profile: id },
        }),
      );
      continue;
    }
    profiles.push(profile);
    diagnostics.push(...validateProfile(profile, adapterOf(id)));
  }

  const emittedDefinitionPaths = new Set<string>();
  for (const key of Object.keys(document.typeDefinitions).sort()) {
    const definition = document.typeDefinitions[key] as NonNullable<(typeof document.typeDefinitions)[string]>;
    const path = `typeDefinitions.${key}`;
    if (definition.id !== key) {
      diagnostics.push(
        diagnostic({ code: "record-key-mismatch", path, message: `record key ${key} is not the definition id ${definition.id}` }),
      );
    }
    const profile = declaredProfile(document, definition.profile, options, path);
    if ("diagnostic" in profile) {
      diagnostics.push(profile.diagnostic);
      continue;
    }
    if (adapterOf(definition.profile) === LEGACY_CONSTRAINTS_ADAPTER) {
      const base = entityTypeOf(profile.profile, definition.baseType);
      if (base === undefined) {
        diagnostics.push(
          diagnostic({
            code: "unknown-entity-type",
            path: `${path}.baseType`,
            message: `profile ${definition.profile} does not declare base type ${definition.baseType}`,
          }),
        );
        continue;
      }
      const baseNames = new Set(base.attributes.map((attribute) => attribute.name));
      for (const attribute of definition.attributes) {
        if (baseNames.has(attribute.name)) {
          diagnostics.push(
            diagnostic({
              code: "type-definition-conflict",
              path: `${path}.attributes.${attribute.name}`,
              message: `type definition ${key} redeclares ${attribute.name}, which base type ${definition.baseType} already declares; refinements are additive only`,
              details: { attribute: attribute.name, baseType: definition.baseType },
            }),
          );
        }
      }
      continue;
    }
    // Scoped run: the shared resolver owns the full base chain, so a cycle,
    // a cross-owner base and an inherited redeclaration are reported once at
    // the definition that closes them.
    const resolution = resolver.resolve(profile.profile, key);
    if (!resolution.ok) {
      if (!emittedDefinitionPaths.has(resolution.diagnostic.path)) {
        emittedDefinitionPaths.add(resolution.diagnostic.path);
        diagnostics.push(resolution.diagnostic);
      }
      continue;
    }
    definition.attributes.forEach((schema, schemaIndex) => {
      diagnostics.push(...qualifyAttributeSchema(schema, `${path}.attributes[${schemaIndex}]`));
    });
  }

  for (const key of Object.keys(document.entities).sort()) {
    const entity = document.entities[key] as Entity;
    diagnostics.push(
      ...validateEntity(entity, key, document, options, resolver, adapterOf(entity.profile)),
    );
  }
  for (const key of Object.keys(document.ports).sort()) {
    const port = document.ports[key] as SemanticPort;
    diagnostics.push(...validatePort(port, key, document, options, resolver, adapterOf(port.profile)));
  }
  for (const key of Object.keys(document.relations).sort()) {
    const relation = document.relations[key] as Relation;
    diagnostics.push(
      ...validateRelation(relation, key, document, options, resolver, adapterOf(relation.profile)),
    );
  }
  for (const key of Object.keys(document.resources).sort()) {
    const resource = document.resources[key] as NonNullable<(typeof document.resources)[string]>;
    const path = `resources.${key}`;
    diagnostics.push(...keyMatchesId(key, resource.id, "resource", path));
    if (resource.uri.length === 0) {
      diagnostics.push(diagnostic({ code: "value-not-serialisable", path: `${path}.uri`, message: "a resource carries a uri" }));
    }
    if (resource.contentHash.length === 0) {
      diagnostics.push(
        diagnostic({ code: "extension-hash-mismatch", path: `${path}.contentHash`, message: "a resource carries its content hash" }),
      );
    }
    if (resource.byteLength !== undefined && (!Number.isInteger(resource.byteLength) || resource.byteLength < 0)) {
      diagnostics.push(
        diagnostic({ code: "value-not-finite", path: `${path}.byteLength`, message: `byteLength is a non-negative integer` }),
      );
    }
  }

  diagnostics.push(
    ...validateHierarchies(
      document,
      profiles.flatMap((profile) =>
        profile.relationTypes.map((declaration) => ({ profile: profile.id, declaration }) as const),
      ),
    ),
  );
  for (const profile of profiles) {
    diagnostics.push(...validateConstraints(document, profile, options, resolver, adapterOf(profile.id)));
  }
  diagnostics.push(...validateExtensions(document));

  for (const profile of profiles) {
    const entityCount = Object.values(document.entities).filter((entity) => entity.profile === profile.id).length;
    const relationCount = Object.values(document.relations).filter((relation) => relation.profile === profile.id).length;
    if (profile.limits.maxEntities !== undefined && entityCount > profile.limits.maxEntities) {
      diagnostics.push(
        diagnostic({
          code: "limit-exceeded",
          path: "entities",
          message: `${entityCount} entities of profile ${profile.id}; the declared limit is ${profile.limits.maxEntities}`,
          details: { limit: "maxEntities", seen: entityCount, max: profile.limits.maxEntities },
        }),
      );
    }
    if (profile.limits.maxRelations !== undefined && relationCount > profile.limits.maxRelations) {
      diagnostics.push(
        diagnostic({
          code: "limit-exceeded",
          path: "relations",
          message: `${relationCount} relations of profile ${profile.id}; the declared limit is ${profile.limits.maxRelations}`,
          details: { limit: "maxRelations", seen: relationCount, max: profile.limits.maxRelations },
        }),
      );
    }
  }

  const canonical = tryCanonicalise(document, "document");
  if (!canonical.ok) diagnostics.push(...canonical.diagnostics);

  return diagnostics;
}

function finiteNumbers(
  values: readonly (readonly [string, number])[],
  path: string,
): readonly Diagnostic[] {
  return values
    .filter(([, value]) => !Number.isFinite(value))
    .map(([name, value]) =>
      diagnostic({
        code: "value-not-finite",
        path: `${path}.${name}`,
        message: `${name} is ${String(value)}; geometry values are finite (study invariant 8)`,
      }),
    );
}

/**
 * Host suppression mask for the `relation-target-hidden` arm (C.4): explicit
 * requests to suppress an otherwise visible target relation occurrence
 * without the §4.4.1 fold witness. Never a `ViewDocument` field.
 */
export interface FoldValidationMask {
  readonly projectedHiddenRelationOccurrences?: readonly OccurrenceRef[];
}

/** First-failure priority for one folded projected endpoint (§4.4.4, C.4). */
function projectedEndpointDiagnostic(
  view: ViewDocument,
  document: SemanticDocument,
  options: ValidationOptions,
  resolver: TypeResolver,
  usesFoldShape: boolean,
  collapsed: ReadonlySet<string>,
  internal: ReadonlyMap<OccurrenceRef, OccurrenceRef>,
  relation: Relation,
  occurrenceId: OccurrenceRef,
  endpoint: { readonly role: string; readonly occurrence: OccurrenceRef; readonly semanticTarget?: EntityRef | PortRef | RelationRef; readonly sourceOccurrence?: OccurrenceRef },
  endpointPath: string,
): Diagnostic | undefined {
  const projected = (
    check: string,
    details: Readonly<Record<string, string>> = {},
  ): Diagnostic =>
    diagnostic({
      code: "occurrence-endpoint-mismatch",
      severity: "error",
      path: `${endpointPath}.occurrence`,
      message: `projected endpoint for role ${endpoint.role} fails check ${check}`,
      refs: [occurrenceId, endpoint.occurrence],
      details: { role: endpoint.role, check, ...details },
    });
  if ((endpoint.semanticTarget === undefined) !== (endpoint.sourceOccurrence === undefined)) {
    return projected("provenance-missing");
  }
  const semantic = endpoint.semanticTarget as EntityRef | PortRef | RelationRef;
  const sourceId = endpoint.sourceOccurrence as OccurrenceRef;
  const targets = relation.endpoints
    .filter((candidate) => candidate.role === endpoint.role)
    .map((candidate) => candidate.target);
  if (!targets.includes(semantic)) return projected("provenance-mismatch");
  const sourceDrawn = drawnTargetOf(view, sourceId);
  if (sourceDrawn === undefined || sourceDrawn !== semantic) return projected("provenance-mismatch");
  const sourceRelation = view.relationOccurrences[sourceId];
  if (
    sourceRelation !== undefined &&
    sourceRelation.endpoints.some((candidate) => candidate.semanticTarget !== undefined)
  ) {
    return projected("projection-source-projected");
  }
  const drawnEntity = view.entityOccurrences[endpoint.occurrence];
  const drawnPort = view.portOccurrences[endpoint.occurrence];
  const drawnRelation = view.relationOccurrences[endpoint.occurrence];
  if (drawnEntity === undefined && drawnPort === undefined && drawnRelation === undefined) {
    return diagnostic({
      code: "dangling-reference",
      path: `${endpointPath}.occurrence`,
      message: usesFoldShape
        ? `${endpoint.occurrence} is no entity, port or relation occurrence of this view`
        : `${endpoint.occurrence} is no entity or port occurrence of this view`,
      refs: [endpoint.occurrence],
    });
  }
  const containerOf = (entityId: EntityRef | undefined): boolean | undefined => {
    if (entityId === undefined) return undefined;
    const entity = document.entities[entityId];
    if (entity === undefined) return undefined;
    const profile = options.registry.get(entity.profile);
    if (profile === undefined) return undefined;
    const resolution = resolver.resolve(profile, entity.type);
    return resolution.ok ? resolution.resolved.container : undefined;
  };
  if (refKindOf(semantic) === "relation") {
    if (internal.get(sourceId) !== endpoint.occurrence) return projected("projection-not-folded");
    if (hiddenByFold(view, collapsed, endpoint.occurrence)) return projected("representative-hidden");
    if (containerOf(drawnEntity?.entity) === false) return projected("representative-not-container");
    return undefined;
  }
  const sourcePort = view.portOccurrences[sourceId];
  const anchor = sourcePort !== undefined ? sourcePort.ownerOccurrence : sourceId;
  const chain: OccurrenceRef[] = [];
  const seen = new Set<string>();
  let current: OccurrenceRef | undefined = anchor;
  while (current !== undefined && !seen.has(current)) {
    seen.add(current);
    chain.push(current);
    current = parentOccurrenceOf(view, current);
  }
  const foldedAncestors = chain.filter((id) => collapsed.has(id));
  if (foldedAncestors.length === 0) return projected("projection-not-folded");
  const expected =
    sourcePort !== undefined
      ? portRepresentativeOf(view, document, collapsed, sourceId)
      : (foldedAncestors[foldedAncestors.length - 1] as OccurrenceRef);
  if (endpoint.occurrence !== expected) {
    const drawnOwner = drawnPort !== undefined ? drawnPort.ownerOccurrence : endpoint.occurrence;
    if (chain.includes(drawnOwner) && collapsed.has(drawnOwner)) return projected("projection-not-outermost");
    return projected("projection-not-folded");
  }
  if (hiddenByFold(view, collapsed, endpoint.occurrence)) return projected("representative-hidden");
  const representativeEntity =
    drawnPort !== undefined
      ? view.entityOccurrences[drawnPort.ownerOccurrence]?.entity
      : drawnEntity?.entity;
  if (containerOf(representativeEntity) === false) return projected("representative-not-container");
  return undefined;
}

export function validateView(
  view: ViewDocument,
  document: SemanticDocument,
  options: ValidationOptions,
  hidden?: FoldValidationMask,
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const hiddenMask = new Set<string>(hidden?.projectedHiddenRelationOccurrences ?? []);
  const usesFoldShape =
    hiddenMask.size > 0 ||
    view.summaryLabels !== undefined ||
    Object.values(view.groups).some((group) => group.occurrence !== undefined) ||
    Object.values(view.relationOccurrences).some((occurrence) =>
      occurrence.endpoints.some(
        (endpoint) => endpoint.semanticTarget !== undefined || endpoint.sourceOccurrence !== undefined,
      ),
    );
  const resolver = createTypeResolver(document);
  const collapsed = collapsedOf(view);
  const internal = classifyInternalRelations(view, document, collapsed);
  const viewIdParsed = parseRef("view", view.viewId, "viewId");
  if (!viewIdParsed.ok) diagnostics.push(viewIdParsed.diagnostic);

  if (view.semanticDocumentId !== document.documentId) {
    diagnostics.push(
      diagnostic({
        code: "view-document-mismatch",
        path: "semanticDocumentId",
        message: `view ${view.viewId} points at ${view.semanticDocumentId}, the document is ${document.documentId}`,
        refs: [view.semanticDocumentId, document.documentId],
      }),
    );
  }
  if (!Number.isInteger(view.revision) || view.revision < 0) {
    diagnostics.push(
      diagnostic({ code: "value-not-finite", path: "revision", message: `a revision is a non-negative integer` }),
    );
  } else if (view.revision > document.revision) {
    // Divergent revisions: a view cannot be ahead of the document it draws.
    diagnostics.push(
      diagnostic({
        code: "revision-divergence",
        path: "revision",
        message: `view revision ${view.revision} is ahead of document revision ${document.revision}`,
        details: { viewRevision: view.revision, documentRevision: document.revision },
      }),
    );
  }

  const seenOccurrenceIds = new Map<string, string>();
  const noteOccurrence = (id: string, where: string): void => {
    const previous = seenOccurrenceIds.get(id);
    if (previous !== undefined) {
      diagnostics.push(
        diagnostic({
          code: "duplicate-id",
          path: where,
          message: `occurrence id ${id} is already used in ${previous}; the three occurrence maps share one identity namespace`,
          refs: [id],
        }),
      );
      return;
    }
    seenOccurrenceIds.set(id, where);
  };

  for (const key of Object.keys(view.entityOccurrences).sort()) {
    const occurrence = view.entityOccurrences[key] as NonNullable<(typeof view.entityOccurrences)[string]>;
    const path = `entityOccurrences.${key}`;
    diagnostics.push(...keyMatchesId(key, occurrence.id, "occurrence", path));
    noteOccurrence(occurrence.id, path);
    diagnostics.push(...resolveReference(document, occurrence.entity, "entity", `${path}.entity`));
    diagnostics.push(
      ...finiteNumbers(
        [
          ["x", occurrence.geometry.x],
          ["y", occurrence.geometry.y],
          ["width", occurrence.geometry.width],
          ["height", occurrence.geometry.height],
        ],
        `${path}.geometry`,
      ),
    );
    if (occurrence.group !== undefined && view.groups[occurrence.group] === undefined) {
      diagnostics.push(
        diagnostic({
          code: "dangling-reference",
          path: `${path}.group`,
          message: `visual group ${occurrence.group} is not declared by this view`,
          refs: [occurrence.group],
        }),
      );
    }
  }

  for (const key of Object.keys(view.portOccurrences).sort()) {
    const occurrence = view.portOccurrences[key] as NonNullable<(typeof view.portOccurrences)[string]>;
    const path = `portOccurrences.${key}`;
    diagnostics.push(...keyMatchesId(key, occurrence.id, "occurrence", path));
    noteOccurrence(occurrence.id, path);
    const portResolution = resolveReference(document, occurrence.port, "port", `${path}.port`);
    diagnostics.push(...portResolution);
    const owner = view.entityOccurrences[occurrence.ownerOccurrence];
    if (owner === undefined) {
      diagnostics.push(
        diagnostic({
          code: "dangling-reference",
          path: `${path}.ownerOccurrence`,
          message: `${occurrence.ownerOccurrence} is no entity occurrence of this view`,
          refs: [occurrence.ownerOccurrence],
        }),
      );
    } else if (portResolution.length === 0) {
      const port = document.ports[occurrence.port] as SemanticPort;
      if (owner.entity !== port.owner) {
        // Study invariant 4: the geometric port is bound to the occurrence of
        // the entity that OWNS the semantic port, not to any occurrence.
        diagnostics.push(
          diagnostic({
            code: "port-owner-mismatch",
            path: `${path}.ownerOccurrence`,
            message: `port ${port.id} belongs to ${port.owner}; occurrence ${owner.id} draws ${owner.entity}`,
            refs: [port.id, port.owner, owner.id, owner.entity],
          }),
        );
      }
    }
    diagnostics.push(...finiteNumbers([["order", occurrence.order], ["anchor", occurrence.anchor]], path));
    if (Number.isFinite(occurrence.anchor) && (occurrence.anchor < 0 || occurrence.anchor > 1)) {
      diagnostics.push(
        diagnostic({
          code: "limit-exceeded",
          path: `${path}.anchor`,
          message: `anchor ${occurrence.anchor} is outside 0..1`,
          details: { anchor: occurrence.anchor },
        }),
      );
    }
  }

  for (const key of Object.keys(view.relationOccurrences).sort()) {
    const occurrence = view.relationOccurrences[key] as NonNullable<(typeof view.relationOccurrences)[string]>;
    const path = `relationOccurrences.${key}`;
    diagnostics.push(...keyMatchesId(key, occurrence.id, "occurrence", path));
    noteOccurrence(occurrence.id, path);
    const relationResolution = resolveReference(document, occurrence.relation, "relation", `${path}.relation`);
    diagnostics.push(...relationResolution);
    const relation = relationResolution.length === 0 ? (document.relations[occurrence.relation] as Relation) : undefined;

    occurrence.endpoints.forEach((endpoint, index) => {
      const endpointPath = `${path}.endpoints[${index}]`;
      const drawn =
        view.entityOccurrences[endpoint.occurrence] ??
        view.portOccurrences[endpoint.occurrence] ??
        view.relationOccurrences[endpoint.occurrence];
      if (drawn === undefined) {
        diagnostics.push(
          diagnostic({
            code: "dangling-reference",
            path: `${endpointPath}.occurrence`,
            message: usesFoldShape
              ? `${endpoint.occurrence} is no entity, port or relation occurrence of this view`
              : `${endpoint.occurrence} is no entity or port occurrence of this view`,
            refs: [endpoint.occurrence],
          }),
        );
        return;
      }
      if (relation === undefined) return;
      // A host suppression mask without the §4.4.1 fold witness refuses with
      // `relation-target-hidden`; a canonical fold never emits it (§4.4.2).
      if (
        endpoint.semanticTarget === undefined &&
        endpoint.sourceOccurrence === undefined &&
        hiddenMask.has(endpoint.occurrence)
      ) {
        diagnostics.push(
          diagnostic({
            code: "occurrence-endpoint-mismatch",
            severity: "error",
            path: `${endpointPath}.occurrence`,
            message: `projected endpoint for role ${endpoint.role} fails check relation-target-hidden`,
            refs: [occurrence.id, endpoint.occurrence],
            details: { role: endpoint.role, check: "relation-target-hidden" },
          }),
        );
        return;
      }
      if (endpoint.semanticTarget !== undefined || endpoint.sourceOccurrence !== undefined) {
        const failure = projectedEndpointDiagnostic(
          view,
          document,
          options,
          resolver,
          usesFoldShape,
          collapsed,
          internal,
          relation,
          occurrence.id,
          endpoint,
          endpointPath,
        );
        if (failure !== undefined) diagnostics.push(failure);
        return;
      }
      const targets = relation.endpoints
        .filter((candidate) => candidate.role === endpoint.role)
        .map((candidate) => candidate.target);
      if (targets.length === 0) {
        diagnostics.push(
          diagnostic({
            code: "occurrence-endpoint-mismatch",
            path: `${endpointPath}.role`,
            message: `relation ${relation.id} has no endpoint with role ${endpoint.role}`,
            refs: [relation.id],
            details: { role: endpoint.role },
          }),
        );
        return;
      }
      const drawnTarget: EntityRef | PortRef | RelationRef =
        "entity" in drawn ? drawn.entity : "port" in drawn ? drawn.port : drawn.relation;
      if (!targets.includes(drawnTarget)) {
        diagnostics.push(
          diagnostic({
            code: "occurrence-endpoint-mismatch",
            path: `${endpointPath}.occurrence`,
            message: `occurrence ${endpoint.occurrence} draws ${drawnTarget}; role ${endpoint.role} of ${relation.id} targets ${targets.join(", ")}`,
            refs: [endpoint.occurrence, drawnTarget, ...targets],
            details: { role: endpoint.role },
          }),
        );
      }
    });

    for (const [index, waypoint] of (occurrence.waypoints ?? []).entries()) {
      diagnostics.push(
        ...finiteNumbers([["x", waypoint.x], ["y", waypoint.y]], `${path}.waypoints[${index}]`),
      );
    }
  }

  // Drawn representatives of projected endpoints: their container capability
  // is reported once at the endpoint (`representative-not-container`), so the
  // group binding that folds them does not double-report the same cause.
  const drawnByProjection = new Set<string>();
  for (const occurrence of Object.values(view.relationOccurrences)) {
    for (const endpoint of occurrence.endpoints) {
      if (endpoint.semanticTarget !== undefined) drawnByProjection.add(endpoint.occurrence);
    }
  }
  for (const key of Object.keys(view.groups).sort()) {
    const group = view.groups[key] as NonNullable<(typeof view.groups)[string]>;
    const path = `groups.${key}`;
    if (group.id !== key) {
      diagnostics.push(
        diagnostic({ code: "record-key-mismatch", path, message: `record key ${key} is not the group id ${group.id}` }),
      );
    }
    // Membership is not checked here because it is not stored here: an
    // occurrence names its group, and that reference is validated where the
    // occurrence is (`entityOccurrences.*.group`).
    // A fold binding names exactly one entity occurrence of a container type.
    if (group.occurrence !== undefined && !(group.collapsed === true && drawnByProjection.has(group.occurrence))) {
      const bound = view.entityOccurrences[group.occurrence];
      if (bound === undefined) {
        diagnostics.push(
          diagnostic({
            code: "dangling-reference",
            path: `${path}.occurrence`,
            message: `fold group ${key} names ${group.occurrence} which is no entity occurrence of this view`,
            refs: [group.occurrence],
          }),
        );
      } else {
        const entity = document.entities[bound.entity];
        const profile = entity === undefined ? undefined : options.registry.get(entity.profile);
        const resolution =
          entity === undefined || profile === undefined
            ? undefined
            : resolver.resolve(profile, entity.type);
        if (resolution !== undefined && resolution.ok && !resolution.resolved.container) {
          diagnostics.push(
            diagnostic({
              code: "occurrence-endpoint-mismatch",
              path: `${path}.occurrence`,
              message: `fold group ${key} binds ${group.occurrence} which draws ${bound.entity} of type ${entity?.type} outside the container family`,
              refs: [group.occurrence, bound.entity],
              details: { type: entity?.type as string },
            }),
          );
        }
      }
    }
  }

  const filterIds = new Set<string>();
  view.filters.forEach((filter, index) => {
    if (filterIds.has(filter.id)) {
      diagnostics.push(
        diagnostic({ code: "duplicate-id", path: `filters[${index}]`, message: `filter id ${filter.id} declared twice` }),
      );
    }
    filterIds.add(filter.id);
  });

  // Authored aggregate labels (§4.5): source validity of every definition,
  // then at most one active candidate per projected aggregate key. A
  // source-valid inactive definition reports nothing.
  if (view.summaryLabels !== undefined) {
    const analysis = analyzeSummaries(view, document);
    for (const issue of analysis.sourceIssues) {
      const definition = (view.summaryLabels as Record<string, SummaryDefinition>)[issue.id] as SummaryDefinition;
      diagnostics.push(
        diagnostic({
          code: "occurrence-endpoint-mismatch",
          severity: "error",
          path: `summaryLabels.${issue.id}`,
          message: `summary definition ${issue.id} fails check ${issue.check}`,
          refs: [issue.id, definition.sourceOccurrence, definition.targetOccurrence],
          details:
            issue.check === "summary-duplicate-key"
              ? { check: issue.check, firstId: issue.firstId as string }
              : issue.check === "summary-occurrence-ambiguous"
                ? { check: issue.check, relationId: issue.relationId as string }
                : { check: issue.check },
        }),
      );
    }
    for (const conflict of analysis.conflicts) {
      const definition = (view.summaryLabels as Record<string, SummaryDefinition>)[
        conflict.id
      ] as SummaryDefinition;
      diagnostics.push(
        diagnostic({
          code: "occurrence-endpoint-mismatch",
          severity: "error",
          path: `summaryLabels.${conflict.id}`,
          message: `summary definition ${conflict.id} fails check ${conflict.check}`,
          refs: [conflict.id, definition.sourceOccurrence, definition.targetOccurrence],
          details: {
            check: conflict.check,
            firstId: conflict.firstId as string,
            sourceRepresentative: conflict.sourceRepresentative as string,
            targetRepresentative: conflict.targetRepresentative as string,
            strokeStyle: conflict.strokeStyle as string,
          },
        }),
      );
    }
  }

  diagnostics.push(
    ...finiteNumbers(
      [
        ["x", view.presentation.camera.x],
        ["y", view.presentation.camera.y],
        ["zoom", view.presentation.camera.zoom],
      ],
      "presentation.camera",
    ),
  );
  if (Number.isFinite(view.presentation.camera.zoom) && view.presentation.camera.zoom <= 0) {
    diagnostics.push(
      diagnostic({
        code: "limit-exceeded",
        path: "presentation.camera.zoom",
        message: `zoom ${view.presentation.camera.zoom} must be strictly positive`,
      }),
    );
  }

  if (view.presentation.diagram !== undefined) {
    diagnostics.push(...validateDiagramPresentation(document, view, options));
  }

  const canonical = tryCanonicalise(view, "view");
  if (!canonical.ok) diagnostics.push(...canonical.diagnostics);

  return diagnostics;
}

/** Document and views together: what a transaction validates before it commits. */
export function validateState(state: DiagramState, options: ValidationOptions): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [...validateDocument(state.document, options)];
  for (const key of Object.keys(state.views).sort()) {
    const view = state.views[key] as ViewDocument;
    if (view.viewId !== key) {
      diagnostics.push(
        diagnostic({
          code: "record-key-mismatch",
          path: `views.${key}`,
          message: `record key ${key} is not the view id ${view.viewId}`,
        }),
      );
    }
    diagnostics.push(
      ...validateView(view, state.document, options).map((entry) => ({ ...entry, path: `views.${key}.${entry.path}` })),
    );
  }
  return diagnostics;
}
