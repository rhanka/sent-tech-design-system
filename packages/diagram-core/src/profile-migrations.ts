/**
 * Explicit @1 → @2 profile migrations (M3 §3.13.2–§3.13.4).
 *
 * Atomic versioned transactions: any blocking item returns the exact
 * original state with a typed refusal, no candidate and no writes.
 * Inverses restore the retained original byte for byte; @1 documents are
 * never silently upgraded. Supersession is lifecycle metadata, never
 * composition ancestry.
 */
import { contentDiagramDigest, imposedAdapterFor, stableStringify } from "./bindings.js";
import { tryCanonicalise } from "./canonical.js";
import { sha256Hex } from "./sha256.js";
import type { Diagnostic } from "./diagnostics.js";
import type { AttributeSchema, AttributeValue } from "./attributes.js";
import type { SemanticDocument } from "./document.js";
import { entityTypeOf, type Profile, type ProfileId } from "./profile.js";
import { archimateSkeletonProfile } from "./profiles/skeletons.js";
import { umlSkeletonProfile } from "./profiles/skeletons.js";
import { archimate2Profile } from "./profiles/archimate2.js";
import { uml2Profile } from "./profiles/uml2.js";
import { ARCHIMATE_CATALOGUE } from "./profiles/archimate-matrix.js";
import { expandArchimateTuples } from "./profiles/archimate2.js";
import { parseMultiplicity } from "./multiplicity.js";
import { validateDocument, validateState } from "./validate.js";
import { createProfileRegistry } from "./profile.js";
import { bindingRowFor } from "./bindings.js";
import { genericProfile } from "./profiles/generic.js";
import { generic2Profile } from "./profiles/generic2.js";
import { bpmnSkeletonProfile } from "./profiles/skeletons.js";
import { createTypeResolver } from "./resolver.js";
import type { DiagramState } from "./state.js";

export const BPMN_BLOCKED_ON_APRIME = true as const;

export type ProfileMigrationReason =
  | "missing-source-profile"
  | "target-already-present"
  | "missing-type-mapping"
  | "multiplicity-syntax"
  | "multiplicity-invalid"
  | "unmapped-stereotype"
  | "stereotype-application-invalid"
  | "missing-presentation-destination"
  | "destination-conflict"
  | "incompatible-attribute-schema"
  | "type-definition-conflict"
  | "endpoint-role-unknown"
  | "relationship-matrix-violation"
  | "authored-value-collision";

export interface ProfileMigrationUnmigrated {
  readonly path: string;
  readonly reason: ProfileMigrationReason;
  readonly detail?: string;
}

export interface ProfileMigrationOperation {
  readonly path: string;
  readonly action: string;
  readonly detail?: string;
}

export interface ProfileMigrationReportBase {
  readonly migrationId: string;
  readonly from: { readonly id: string; readonly version: number; readonly contentDigest: string };
  readonly to: { readonly id: string; readonly version: number; readonly contentDigest: string };
  readonly originalCanonical: string;
  readonly originalHash: string;
  readonly operations: readonly ProfileMigrationOperation[];
  readonly unmigrated: readonly ProfileMigrationUnmigrated[];
  readonly supersession: { readonly superseded: ProfileId; readonly supersededBy: ProfileId; readonly migrationRef: string };
}

export type ProfileMigrationInput = SemanticDocument | DiagramState;

export type ProfileMigrationOutcome =
  | (ProfileMigrationReportBase & {
      readonly status: "ok";
      readonly document: SemanticDocument;
      readonly state: DiagramState;
      readonly invert: (current?: SemanticDocument | DiagramState) =>
        | { readonly status: "ok"; readonly document: SemanticDocument; readonly state: DiagramState }
        | { readonly status: "refused"; readonly unmigrated: readonly ProfileMigrationUnmigrated[] };
    })
  | (ProfileMigrationReportBase & { readonly status: "refused" });

type MigrationReason = ProfileMigrationReason;
type MigrationOperation = ProfileMigrationOperation;
type MigrationUnmigrated = ProfileMigrationUnmigrated;

export const ARCHIMATE_SUPERSESSION = {
  superseded: "archimate@1",
  supersededBy: "archimate@2",
  migrationRef: "archimate@1->archimate@2",
  lineage: { parents: [], mappings: [], migrations: ["archimate@1->archimate@2"] },
} as const;

export const UML_SUPERSESSION = {
  superseded: "uml@1",
  supersededBy: "uml@2",
  migrationRef: "uml@1->uml@2",
  lineage: { parents: [], mappings: [], migrations: ["uml@1->uml@2"] },
} as const;

export const defaultArchimateMapping: { readonly entityTypes: Readonly<Record<string, string>> } = {
  entityTypes: {
    "entity:actor": "business-actor",
    "entity:process": "business-process",
    "entity:component": "application-component",
    "entity:junction": "junction",
  },
};

const catalogueById = new Map(ARCHIMATE_CATALOGUE.map((c) => [c.id, c] as const));

function sortedIds(record: Readonly<Record<string, unknown>>): string[] {
  return Object.keys(record).sort();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function textValue(value: AttributeValue | undefined): string | null {
  if (value === undefined) return null;
  if (value.kind !== "text") return null;
  return value.value;
}

function enumValue(value: AttributeValue | undefined): string | null {
  if (value === undefined) return null;
  if (value.kind !== "enum") return null;
  return value.value;
}

function fullRegistry() {
  return createProfileRegistry([
    genericProfile,
    archimateSkeletonProfile,
    bpmnSkeletonProfile,
    umlSkeletonProfile,
    generic2Profile,
    archimate2Profile,
    uml2Profile,
  ]);
}

function scopedBindingsFor(ids: readonly ProfileId[]) {
  const registry = fullRegistry();
  const rows = ids.map((id) => {
    const profile = registry.get(id);
    if (profile === undefined) throw new Error(`unknown profile ${id}`);
    const imposed = imposedAdapterFor(id);
    if (imposed === undefined) throw new Error(`no imposed executor adapter for profile ${id}`);
    return bindingRowFor(profile, imposed);
  });
  return { registry, bindings: { schemaVersion: "1" as const, rows } };
}

function isDiagramState(value: unknown): value is DiagramState {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  const document = record["document"] as Record<string, unknown> | undefined;
  const views = record["views"] as Record<string, unknown> | undefined;
  return (
    typeof document === "object" &&
    document !== null &&
    typeof (document as { documentId?: unknown }).documentId === "string" &&
    typeof views === "object" &&
    views !== null &&
    !Array.isArray(views)
  );
}

function splitInput(input: ProfileMigrationInput): { readonly document: SemanticDocument; readonly views: DiagramState["views"]; readonly isState: boolean } {
  if (isDiagramState(input)) {
    return { document: input.document, views: input.views, isState: true };
  }
  return { document: input, views: {}, isState: false };
}

function sourceCheckFor(ids: readonly ProfileId[]): {
  readonly registry: ReturnType<typeof createProfileRegistry>;
  readonly bindings: { readonly schemaVersion: "1"; readonly rows: ReturnType<typeof bindingRowFor>[] } | undefined;
} {
  try {
    return scopedBindingsFor(ids);
  } catch {
    return { registry: fullRegistry(), bindings: undefined };
  }
}

function sourceDiagnosticsFor(
  source: SemanticDocument,
  views: DiagramState["views"],
): readonly Diagnostic[] {
  const check = sourceCheckFor(source.profileRefs);
  if (check.bindings === undefined) {
    return Object.keys(views).length > 0
      ? validateState({ document: source, views }, { registry: check.registry })
      : validateDocument(source, { registry: check.registry });
  }
  return Object.keys(views).length > 0
    ? validateState({ document: source, views }, { registry: check.registry, bindings: check.bindings })
    : validateDocument(source, { registry: check.registry, bindings: check.bindings });
}

function tryOriginalOfInput(input: ProfileMigrationInput): {
  readonly ok: true;
  readonly canonical: string;
  readonly hash: string;
} | {
  readonly ok: false;
  readonly diagnostics: readonly Diagnostic[];
} {
  const tried = tryCanonicalise(input);
  if (tried.ok) return { ok: true, canonical: tried.text, hash: sha256Hex(tried.text) };
  return { ok: false, diagnostics: tried.diagnostics };
}

function sectionIndex(path: string): number {
  if (path === "profileRefs" || path.startsWith("profileRefs")) return 0;
  if (path.startsWith("typeDefinitions")) return 1;
  if (path.startsWith("entities")) return 2;
  if (path.startsWith("relations")) return 3;
  if (path.startsWith("ports")) return 4;
  if (path.startsWith("views")) return 5;
  return 6;
}

function operationIdentifier(path: string): string {
  if (path === "profileRefs" || path === "mapping" || path === "") return "";
  const firstDot = path.indexOf(".");
  if (firstDot === -1) return path;
  const rest = path.slice(firstDot + 1);
  const secondDot = rest.indexOf(".");
  if (secondDot === -1) return rest;
  return rest.slice(0, secondDot);
}

function operationRemainder(path: string): string {
  if (path === "profileRefs" || path === "mapping" || path === "") return "";
  const firstDot = path.indexOf(".");
  if (firstDot === -1) return "";
  const rest = path.slice(firstDot + 1);
  const secondDot = rest.indexOf(".");
  if (secondDot === -1) return "";
  return rest.slice(secondDot + 1);
}

function orderOperations(operations: MigrationOperation[]): MigrationOperation[] {
  return [...operations].sort((a, b) => {
    const sectionA = sectionIndex(a.path);
    const sectionB = sectionIndex(b.path);
    if (sectionA !== sectionB) return sectionA - sectionB;
    const identifierA = operationIdentifier(a.path);
    const identifierB = operationIdentifier(b.path);
    if (identifierA < identifierB) return -1;
    if (identifierA > identifierB) return 1;
    const remainderA = operationRemainder(a.path);
    const remainderB = operationRemainder(b.path);
    if (remainderA < remainderB) return -1;
    if (remainderA > remainderB) return 1;
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    if (a.action < b.action) return -1;
    if (a.action > b.action) return 1;
    return 0;
  });
}

function hasExactKeys(value: unknown, expected: readonly string[]): boolean {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return keys.length === wanted.length && keys.every((key, index) => key === wanted[index]);
}

function targetAttributeSchemas(profile: Profile, typeId: string): readonly AttributeSchema[] {
  const declared = entityTypeOf(profile, typeId);
  return declared?.attributes ?? [];
}

function promoteCompatibleAttributes(
  sourceAttributes: readonly AttributeSchema[],
  targetAttributes: readonly AttributeSchema[],
): { readonly retained: AttributeSchema[]; readonly incompatible: AttributeSchema | undefined } {
  const targetByName = new Map(targetAttributes.map((schema) => [schema.name, schema] as const));
  const retained: AttributeSchema[] = [];
  for (const schema of sourceAttributes) {
    const target = targetByName.get(schema.name);
    if (target === undefined) {
      retained.push(schema);
      continue;
    }
    if (stableStringify(schema) === stableStringify(target)) continue;
    return { retained: [], incompatible: schema };
  }
  return { retained, incompatible: undefined };
}

function schemasForEffectiveType(
  resolver: ReturnType<typeof createTypeResolver>,
  owner: Profile,
  typeId: string,
): readonly AttributeSchema[] | undefined {
  const resolution = resolver.resolve(owner, typeId);
  if (!resolution.ok) return undefined;
  return resolution.resolved.schemas;
}

function baseOf(
  source: SemanticDocument,
  fromId: ProfileId,
  toId: ProfileId,
  migrationId: string,
): { readonly from: ProfileMigrationReportBase["from"]; readonly to: ProfileMigrationReportBase["to"] } {
  const registry = fullRegistry();
  const fromProfile = registry.get(fromId);
  const toProfile = registry.get(toId);
  if (fromProfile === undefined || toProfile === undefined) throw new Error("missing migration profile");
  return {
    from: { id: fromId, version: fromProfile.version, contentDigest: contentDiagramDigest(fromProfile) },
    to: { id: toId, version: toProfile.version, contentDigest: contentDiagramDigest(toProfile) },
  };
}

function hasRelationTarget(document: SemanticDocument): boolean {
  for (const relation of Object.values(document.relations)) {
    for (const endpoint of relation.endpoints) {
      if (typeof endpoint.target === "string" && endpoint.target.startsWith("relation:")) return true;
    }
  }
  return false;
}

function archimateBaseOf(
  resolver: ReturnType<typeof createTypeResolver>,
  typeId: string,
): { readonly ok: true; readonly base: string } | { readonly ok: false; readonly diagnostic: string } {
  const resolution = resolver.resolve(archimateSkeletonProfile, typeId);
  if (!resolution.ok) return { ok: false, diagnostic: `${resolution.diagnostic.code}: ${resolution.diagnostic.message}` };
  const family = resolution.resolved.familyType;
  if (family === "element" || family === "junction" || family === "grouping") return { ok: true, base: family };
  return { ok: false, diagnostic: `unknown-entity-type: no archimate@1 family for ${typeId}` };
}

export function migrateArchimateV1ToV2(
  sourceInput: ProfileMigrationInput,
  mapping: { readonly entityTypes: Readonly<Record<string, string>> },
): ProfileMigrationOutcome {
  const { document: source, views: sourceViews } = splitInput(sourceInput);
  const { from, to } = baseOf(source, "archimate@1", "archimate@2", "archimate@1->archimate@2");
  const triedOriginal = tryOriginalOfInput(sourceInput);
  const canonical = triedOriginal.ok ? triedOriginal.canonical : "";
  const hash = triedOriginal.ok ? triedOriginal.hash : "";
  const supersession = {
    superseded: "archimate@1" as ProfileId,
    supersededBy: "archimate@2" as ProfileId,
    migrationRef: "archimate@1->archimate@2",
  };
  const refused = (path: string, reason: MigrationReason, detail?: string): ProfileMigrationOutcome => ({
    status: "refused",
    migrationId: "archimate@1->archimate@2",
    from,
    to,
    originalCanonical: canonical,
    originalHash: hash,
    operations: [],
    unmigrated: detail === undefined ? [{ path, reason }] : [{ path, reason, detail }],
    supersession,
  });
  if (!triedOriginal.ok) {
    const nativeDiagnostics = sourceDiagnosticsFor(source, sourceViews);
    const first = nativeDiagnostics[0] as (typeof nativeDiagnostics)[number] | undefined;
    if (first !== undefined) {
      return refused(first.path, "incompatible-attribute-schema", `${first.code}: ${first.message}`);
    }
    const fallback = triedOriginal.diagnostics[0] as (typeof triedOriginal.diagnostics)[number] | undefined;
    if (fallback !== undefined) {
      return refused(fallback.path, "incompatible-attribute-schema", `${fallback.code}: ${fallback.message}`);
    }
    return refused("input", "incompatible-attribute-schema", "value is not canonically serialisable");
  }
  if (!hasExactKeys(mapping, ["entityTypes"]) || !isRecord((mapping as Record<string, unknown>)["entityTypes"])) {
    return refused("mapping", "incompatible-attribute-schema");
  }
  const entityTypes = (mapping as { readonly entityTypes: Readonly<Record<string, string>> }).entityTypes;
  if (Object.values(entityTypes).some((v) => typeof v !== "string")) {
    return refused("mapping", "incompatible-attribute-schema");
  }
  const refs = [...source.profileRefs];
  if (refs.filter((r) => r === "archimate@1").length !== 1) {
    return refused("", refs.includes("archimate@2") ? "target-already-present" : "missing-source-profile");
  }
  if (refs.includes("archimate@2")) return refused("", "target-already-present");
  const sourceDiagnostics = sourceDiagnosticsFor(source, sourceViews);
  if (sourceDiagnostics.length > 0) {
    const first = sourceDiagnostics[0] as (typeof sourceDiagnostics)[number];
    return refused(first.path, "incompatible-attribute-schema", `${first.code}: ${first.message}`);
  }
  const sourceResolver = createTypeResolver(source);
  const nextRefs = refs.map((r) => (r === "archimate@1" ? ("archimate@2" as ProfileId) : r));
  const operations: MigrationOperation[] = [
    { path: "profileRefs", action: "replace-profile-ref", detail: "archimate@1→archimate@2" },
  ];
  const reserved = new Set<string>([
    ...archimate2Profile.entityTypes.map((t) => t.id),
    ...archimate2Profile.relationTypes.map((t) => t.id),
  ]);
  const nextDefinitions: Record<string, SemanticDocument["typeDefinitions"][string]> = {};
  for (const [id, rawDefinition] of Object.entries(source.typeDefinitions).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    if (reserved.has(id)) return refused(`typeDefinitions.${id}`, "type-definition-conflict", "target-reserved type id");
    const definition = clone(rawDefinition);
    if (definition.profile === "archimate@1") {
      nextDefinitions[id] = { ...definition, profile: "archimate@2" as const };
      operations.push({ path: `typeDefinitions.${id}.profile`, action: "rewrite-profile", detail: "archimate@1→archimate@2" });
    } else {
      nextDefinitions[id] = definition;
    }
  }
  const definitionUsers = new Map<string, string[]>();
  for (const entity of Object.values(source.entities)) {
    if (entity.profile !== "archimate@1") continue;
    if (source.typeDefinitions[entity.type] !== undefined) {
      definitionUsers.set(entity.type, [...(definitionUsers.get(entity.type) ?? []), entity.id]);
    }
  }
  for (const [definitionId, userIds] of [...definitionUsers.entries()].sort()) {
    const definition = source.typeDefinitions[definitionId];
    if (definition === undefined) continue;
    if (definition.baseType !== "element") continue;
    const mapped = new Set(userIds.map((id) => entityTypes[id]));
    if (mapped.size !== 1 || mapped.has(undefined)) {
      return refused(`typeDefinitions.${definitionId}.baseType`, "missing-type-mapping");
    }
    const single = [...mapped][0] as string;
    if (!catalogueById.has(single) || single === "junction" || single === "grouping") {
      return refused(`typeDefinitions.${definitionId}.baseType`, "missing-type-mapping");
    }
    const existing = nextDefinitions[definitionId];
    if (existing === undefined) return refused(`typeDefinitions.${definitionId}.baseType`, "missing-type-mapping");
    const targetSchemas = targetAttributeSchemas(archimate2Profile, single);
    const promotion = promoteCompatibleAttributes(existing.attributes as AttributeSchema[], targetSchemas);
    if (promotion.incompatible !== undefined) {
      return refused(
        `typeDefinitions.${definitionId}.attributes.${promotion.incompatible.name}`,
        "type-definition-conflict",
        "incompatible-attribute-schema",
      );
    }
    nextDefinitions[definitionId] = {
      ...existing,
      baseType: single,
      attributes: promotion.retained,
    } as SemanticDocument["typeDefinitions"][string];
    operations.push({
      path: `typeDefinitions.${definitionId}.baseType`,
      action: "rebase-residual-refinement",
      detail: `element→${single}`,
    });
  }
  for (const [id, rawDefinition] of Object.entries(nextDefinitions).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    if (rawDefinition.profile !== "archimate@2") continue;
    const original = source.typeDefinitions[id];
    if (original === undefined || original.profile !== "archimate@1") continue;
    if (original.baseType !== "junction" && original.baseType !== "grouping") continue;
    const targetSchemas = targetAttributeSchemas(archimate2Profile, original.baseType);
    const promotion = promoteCompatibleAttributes(rawDefinition.attributes as AttributeSchema[], targetSchemas);
    if (promotion.incompatible !== undefined) {
      return refused(
        `typeDefinitions.${id}.attributes.${promotion.incompatible.name}`,
        "type-definition-conflict",
        "incompatible-attribute-schema",
      );
    }
    if (promotion.retained.length !== (rawDefinition.attributes as readonly unknown[]).length) {
      nextDefinitions[id] = { ...rawDefinition, attributes: promotion.retained as never };
    }
  }
  const tuples = expandArchimateTuples();
  const allows = (relationship: string, s: string, t: string): boolean =>
    tuples.some((x) => x.relationType === relationship && x.sourceType === s && x.targetType === t);
  const entityTypeById = new Map<string, string>();
  const entities: Record<string, SemanticDocument["entities"][string]> = {};
  for (const [id, rawEntity] of Object.entries(source.entities).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    const entity = rawEntity;
    if (entity.profile !== "archimate@1") {
      entities[id] = clone(entity);
      continue;
    }
    const resolved = archimateBaseOf(sourceResolver, entity.type);
    if (!resolved.ok) return refused(`entities.${id}.type`, "type-definition-conflict", resolved.diagnostic);
    const sourceKind = resolved.base;
    if (sourceKind === "junction" || sourceKind === "grouping") {
      const mapped = entityTypes[id];
      if (mapped !== undefined && mapped !== sourceKind) {
        return refused(`entities.${id}.type`, "authored-value-collision", `mapping ${mapped} contradicts ${sourceKind} meaning`);
      }
      entityTypeById.set(id, sourceKind);
      const targetAspect = sourceKind === "junction" ? "other" : "composite";
      const authoredAspect = enumValue(entity.attributes["aspect"] as AttributeValue | undefined);
      if (authoredAspect !== null && authoredAspect !== targetAspect) {
        return refused(`entities.${id}.attributes.aspect`, "authored-value-collision", `authored aspect ${authoredAspect} collides with ${targetAspect}`);
      }
      const hasDefinition = source.typeDefinitions[entity.type] !== undefined;
      if (sourceKind === "junction") {
        const operator = enumValue(entity.attributes["operator"] as AttributeValue | undefined);
        if (operator !== "and" && operator !== "or") {
          return refused(`entities.${id}.attributes.operator`, "incompatible-attribute-schema");
        }
        const extraKeys = Object.keys(entity.attributes).filter((k) => k !== "operator" && k !== "aspect");
        if (!hasDefinition && extraKeys.length > 0) {
          return refused(`entities.${id}.attributes.${extraKeys.sort()[0]}`, "incompatible-attribute-schema");
        }
        if (hasDefinition) {
          entities[id] = {
            ...clone(entity),
            profile: "archimate@2",
            type: entity.type,
            attributes: {
              ...clone(entity.attributes),
              aspect: { kind: "enum", value: targetAspect } as AttributeValue,
            },
          };
        } else {
          entities[id] = {
            ...clone(entity),
            profile: "archimate@2",
            type: "junction",
            attributes: {
              ...clone(entity.attributes),
              aspect: { kind: "enum", value: targetAspect } as AttributeValue,
            },
          };
        }
      } else {
        const name = entity.attributes["name"] as AttributeValue | undefined;
        if (name !== undefined && (name.kind !== "text" || name.value.length > 200)) {
          return refused(`entities.${id}.attributes.name`, "incompatible-attribute-schema");
        }
        const extraKeys = Object.keys(entity.attributes).filter((k) => k !== "name" && k !== "aspect");
        if (!hasDefinition && extraKeys.length > 0) {
          return refused(`entities.${id}.attributes.${extraKeys.sort()[0]}`, "incompatible-attribute-schema");
        }
        if (hasDefinition) {
          entities[id] = {
            ...clone(entity),
            profile: "archimate@2",
            type: entity.type,
            attributes: {
              ...clone(entity.attributes),
              aspect: { kind: "enum", value: targetAspect } as AttributeValue,
            },
          };
        } else {
          const nextAttributes: Record<string, AttributeValue> = {
            ...(name !== undefined ? { name: clone(name) } : {}),
            aspect: { kind: "enum", value: targetAspect } as AttributeValue,
          };
          entities[id] = { ...clone(entity), profile: "archimate@2", type: "grouping", attributes: nextAttributes };
        }
      }
      operations.push({ path: `entities.${id}.profile`, action: "rewrite-profile", detail: "archimate@1→archimate@2; meaning retained" });
      continue;
    }
    const mapped = entityTypes[id];
    if (mapped === undefined) return refused(`entities.${id}`, "missing-type-mapping");
    const row = catalogueById.get(mapped);
    if (row === undefined || mapped === "junction" || mapped === "grouping") {
      return refused(`entities.${id}`, "missing-type-mapping");
    }
    if (source.typeDefinitions[entity.type] !== undefined) {
      const rebased = nextDefinitions[entity.type];
      if (rebased === undefined || rebased.baseType !== mapped) {
        return refused(`entities.${id}.type`, "incompatible-attribute-schema");
      }
    }
    const name = textValue(entity.attributes["name"] as AttributeValue | undefined);
    if (name === null) return refused(`entities.${id}.attributes.name`, "incompatible-attribute-schema");
    const authoredLayer = enumValue(entity.attributes["layer"] as AttributeValue | undefined);
    if (authoredLayer !== null && authoredLayer !== row.layer) {
      return refused(`entities.${id}.attributes.layer`, "authored-value-collision", `authored layer ${authoredLayer} collides with ${row.layer}`);
    }
    const authoredAspect = enumValue(entity.attributes["aspect"] as AttributeValue | undefined);
    if (authoredAspect !== null && authoredAspect !== row.aspect) {
      return refused(`entities.${id}.attributes.aspect`, "authored-value-collision", `authored aspect ${authoredAspect} collides with ${row.aspect}`);
    }
    const nextAttributes: Record<string, AttributeValue> = { ...(clone(entity.attributes) as Record<string, AttributeValue>) };
    if (row.layer !== "none") {
      nextAttributes["layer"] = { kind: "enum", value: row.layer } as AttributeValue;
    } else {
      delete nextAttributes["layer"];
    }
    nextAttributes["aspect"] = { kind: "enum", value: row.aspect } as AttributeValue;
    const declaredNames = new Set(["name", "layer", "aspect"]);
    const extraKeys = Object.keys(nextAttributes).filter((k) => !declaredNames.has(k));
    if (extraKeys.length > 0 && source.typeDefinitions[entity.type] === undefined) {
      return refused(`entities.${id}.attributes.${extraKeys.sort()[0]}`, "incompatible-attribute-schema");
    }
    const residualType = source.typeDefinitions[entity.type] !== undefined ? entity.type : mapped;
    entities[id] = { ...clone(entity), profile: "archimate@2", type: residualType, attributes: nextAttributes };
    entityTypeById.set(id, mapped);
    operations.push({ path: `entities.${id}.profile`, action: "rewrite-profile", detail: "archimate@1→archimate@2" });
    operations.push({ path: `entities.${id}.type`, action: "map-to-catalogue", detail: `${entity.type}→${mapped}` });
  }
  const relations: Record<string, SemanticDocument["relations"][string]> = {};
  for (const [id, rawRelation] of Object.entries(source.relations).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    const relation = rawRelation;
    if (relation.profile !== "archimate@1") {
      relations[id] = clone(relation);
      continue;
    }
    const sourceEndpoint = relation.endpoints.find((e) => e.role === "source");
    const targetEndpoint = relation.endpoints.find((e) => e.role === "target");
    if (sourceEndpoint === undefined || targetEndpoint === undefined) {
      return refused(`relations.${id}.endpoints`, "endpoint-role-unknown");
    }
    const sourceType = entityTypeById.get(sourceEndpoint.target);
    const targetType = entityTypeById.get(targetEndpoint.target);
    if (sourceType === undefined || targetType === undefined) {
      return refused(`relations.${id}.endpoints`, "missing-type-mapping");
    }
    if (!allows(relation.type, sourceType, targetType)) {
      return refused(`relations.${id}.endpoints`, "relationship-matrix-violation");
    }
    relations[id] = { ...clone(relation), profile: "archimate@2" as const, attributes: clone(relation.attributes) };
    operations.push({
      path: `relations.${id}.profile`,
      action: "rewrite-profile",
      detail: `matrix allows ${relation.type}(${sourceType}→${targetType})`,
    });
  }
  for (const [id, rawPort] of Object.entries(source.ports).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    const port = rawPort;
    if (port.profile === "archimate@1") {
      return refused(`ports.${id}.profile`, "incompatible-attribute-schema");
    }
  }
  const ports = clone(source.ports);
  const target: SemanticDocument = {
    ...clone(source),
    profileRefs: nextRefs,
    typeDefinitions: nextDefinitions,
    entities,
    relations,
    ports,
  };
  for (const entity of Object.values(target.entities)) {
    if ((entity.profile as string) === "archimate@1") return refused(`entities.${entity.id}.profile`, "incompatible-attribute-schema");
  }
  for (const relation of Object.values(target.relations)) {
    if ((relation.profile as string) === "archimate@1") return refused(`relations.${relation.id}.profile`, "incompatible-attribute-schema");
  }
  const check = scopedBindingsFor(target.profileRefs);
  const targetViews = clone(sourceViews);
  const candidate: DiagramState = { document: target, views: targetViews };
  const diagnostics =
    Object.keys(targetViews).length > 0
      ? validateState(candidate, { registry: check.registry, bindings: check.bindings })
      : validateDocument(target, { registry: check.registry, bindings: check.bindings });
  if (diagnostics.length > 0) {
    const first = diagnostics[0] as (typeof diagnostics)[number] | undefined;
    if (first === undefined) return refused("target", "incompatible-attribute-schema");
    return refused(first.path, "incompatible-attribute-schema", `${first.code}: ${first.message}`);
  }
  const ordered = orderOperations(operations);
  const snapshotState: DiagramState =
    sourceInput !== undefined && isDiagramState(sourceInput)
      ? clone(sourceInput)
      : { document: clone(source), views: {} };
  const migratedState: DiagramState = { document: clone(target), views: clone(targetViews) };
  const migrated = clone(target);
  return {
    status: "ok",
    migrationId: "archimate@1->archimate@2",
    from,
    to,
    originalCanonical: canonical,
    originalHash: hash,
    operations: ordered,
    unmigrated: [],
    supersession,
    document: migrated,
    state: migratedState,
    invert: (current?: SemanticDocument | DiagramState) => {
      const checkDoc =
        current === undefined ? migrated : isDiagramState(current) ? current.document : current;
      if (hasRelationTarget(checkDoc)) {
        return {
          status: "refused",
          unmigrated: [{ path: "relations", reason: "incompatible-attribute-schema", detail: "downgrade refused while relation targets exist" }],
        };
      }
      return { status: "ok", document: clone(snapshotState.document), state: clone(snapshotState) };
    },
  };
}

const UML_STEREOTYPE_TARGETS: ReadonlySet<string> = new Set(["class", "interface", "package", "property", "operation"]);

function umlEffectiveKind(
  resolver: ReturnType<typeof createTypeResolver>,
  typeId: string,
): { readonly ok: true; readonly kind: string } | { readonly ok: false; readonly diagnostic: string } {
  const direct = new Set(["class", "interface", "package", "property", "operation", "stereotype"]);
  if (direct.has(typeId)) return { ok: true, kind: typeId };
  const resolution = resolver.resolve(umlSkeletonProfile, typeId);
  if (!resolution.ok) return { ok: false, diagnostic: `${resolution.diagnostic.code}: ${resolution.diagnostic.message}` };
  const family = resolution.resolved.familyType;
  if (direct.has(family)) return { ok: true, kind: family };
  return { ok: false, diagnostic: `unknown-entity-type: no uml@1 family for ${typeId}` };
}

function resolveUmlStereotype(
  source: SemanticDocument,
  resolver: ReturnType<typeof createTypeResolver>,
  ref: string,
): { readonly ok: true; readonly extends: readonly string[] } | { readonly ok: false; readonly missing: boolean } {
  const record = source.entities[ref];
  if (record === undefined) return { ok: false, missing: true };
  if (record.profile !== "uml@1") return { ok: false, missing: false };
  const kind = umlEffectiveKind(resolver, record.type);
  if (!kind.ok || kind.kind !== "stereotype") return { ok: false, missing: false };
  const extendsValue = record.attributes["extends"] as AttributeValue | undefined;
  if (extendsValue === undefined || extendsValue.kind !== "collection") return { ok: false, missing: false };
  const values: string[] = [];
  for (const item of extendsValue.items) {
    if ((item.kind !== "text" && item.kind !== "enum") || typeof (item as { readonly value: unknown }).value !== "string") {
      return { ok: false, missing: false };
    }
    const value = (item as { readonly value: string }).value;
    if (!UML_STEREOTYPE_TARGETS.has(value)) return { ok: false, missing: false };
    values.push(value);
  }
  if (values.length < 1 || values.length > 5) return { ok: false, missing: false };
  if (new Set(values).size !== values.length) return { ok: false, missing: false };
  return { ok: true, extends: values };
}

export function migrateUmlV1ToV2(
  sourceInput: ProfileMigrationInput,
  input: { readonly stereotypes: Readonly<Record<string, string>> },
): ProfileMigrationOutcome {
  const { document: source, views: sourceViews } = splitInput(sourceInput);
  const { from, to } = baseOf(source, "uml@1", "uml@2", "uml@1->uml@2");
  const triedOriginal = tryOriginalOfInput(sourceInput);
  const canonical = triedOriginal.ok ? triedOriginal.canonical : "";
  const hash = triedOriginal.ok ? triedOriginal.hash : "";
  const supersession = {
    superseded: "uml@1" as ProfileId,
    supersededBy: "uml@2" as ProfileId,
    migrationRef: "uml@1->uml@2",
  };
  const refused = (path: string, reason: MigrationReason, detail?: string): ProfileMigrationOutcome => ({
    status: "refused",
    migrationId: "uml@1->uml@2",
    from,
    to,
    originalCanonical: canonical,
    originalHash: hash,
    operations: [],
    unmigrated: detail === undefined ? [{ path, reason }] : [{ path, reason, detail }],
    supersession,
  });
  if (!triedOriginal.ok) {
    const nativeDiagnostics = sourceDiagnosticsFor(source, sourceViews);
    const first = nativeDiagnostics[0] as (typeof nativeDiagnostics)[number] | undefined;
    if (first !== undefined) {
      return refused(first.path, "incompatible-attribute-schema", `${first.code}: ${first.message}`);
    }
    const fallback = triedOriginal.diagnostics[0] as (typeof triedOriginal.diagnostics)[number] | undefined;
    if (fallback !== undefined) {
      return refused(fallback.path, "incompatible-attribute-schema", `${fallback.code}: ${fallback.message}`);
    }
    return refused("input", "incompatible-attribute-schema", "value is not canonically serialisable");
  }
  if (!hasExactKeys(input, ["stereotypes"]) || !isRecord((input as Record<string, unknown>)["stereotypes"])) {
    return refused("mapping", "incompatible-attribute-schema");
  }
  const stereotypes = (input as { readonly stereotypes: Readonly<Record<string, string>> }).stereotypes;
  if (Object.values(stereotypes).some((v) => typeof v !== "string")) {
    return refused("mapping", "incompatible-attribute-schema");
  }
  const refs = [...source.profileRefs];
  if (refs.filter((r) => r === "uml@1").length !== 1) {
    return refused("", refs.includes("uml@2") ? "target-already-present" : "missing-source-profile");
  }
  if (refs.includes("uml@2")) return refused("", "target-already-present");
  const sourceDiagnostics = sourceDiagnosticsFor(source, sourceViews);
  if (sourceDiagnostics.length > 0) {
    const first = sourceDiagnostics[0] as (typeof sourceDiagnostics)[number];
    return refused(first.path, "incompatible-attribute-schema", `${first.code}: ${first.message}`);
  }
  const sourceResolver = createTypeResolver(source);
  const nextRefs = refs.map((r) => (r === "uml@1" ? ("uml@2" as ProfileId) : r));
  const operations: MigrationOperation[] = [
    { path: "profileRefs", action: "replace-profile-ref", detail: "uml@1→uml@2" },
  ];
  const reserved = new Set<string>([
    ...uml2Profile.entityTypes.map((t) => t.id),
    ...uml2Profile.relationTypes.map((t) => t.id),
  ]);
  const nextDefinitions: Record<string, SemanticDocument["typeDefinitions"][string]> = {};
  for (const [id, rawDefinition] of Object.entries(source.typeDefinitions).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    if (reserved.has(id)) return refused(`typeDefinitions.${id}`, "type-definition-conflict", "target-reserved type id");
    const definition = clone(rawDefinition);
    if (definition.profile === "uml@1") {
      nextDefinitions[id] = { ...definition, profile: "uml@2" as const } as SemanticDocument["typeDefinitions"][string];
      operations.push({ path: `typeDefinitions.${id}.profile`, action: "rewrite-profile", detail: "uml@1→uml@2" });
    } else {
      nextDefinitions[id] = definition;
    }
  }
  const entities: Record<string, SemanticDocument["entities"][string]> = {};
  for (const [id, rawEntity] of Object.entries(source.entities).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    const entity = rawEntity;
    if (entity.profile !== "uml@1") {
      entities[id] = clone(entity);
      continue;
    }
    const kindResolved = umlEffectiveKind(sourceResolver, entity.type);
    if (!kindResolved.ok) return refused(`entities.${id}.type`, "type-definition-conflict", kindResolved.diagnostic);
    const kind = kindResolved.kind;
    if (kind === "stereotype") {
      const name = textValue(entity.attributes["name"] as AttributeValue | undefined);
      if (name === null || name.length === 0 || name.length > 60) {
        return refused(`entities.${id}.attributes.name`, "incompatible-attribute-schema");
      }
      const extendsValue = entity.attributes["extends"] as AttributeValue | undefined;
      if (extendsValue === undefined || extendsValue.kind !== "collection") {
        return refused(`entities.${id}.attributes.extends`, "stereotype-application-invalid");
      }
      const converted: AttributeValue[] = [];
      for (let i = 0; i < extendsValue.items.length; i += 1) {
        const item = extendsValue.items[i] as AttributeValue | undefined;
        if (item === undefined) return refused(`entities.${id}.attributes.extends[${i}]`, "stereotype-application-invalid");
        const value =
          (item.kind === "text" || item.kind === "enum") && typeof (item as { readonly value: unknown }).value === "string"
            ? ((item as { readonly value: string }).value as string)
            : null;
        if (value === null || !UML_STEREOTYPE_TARGETS.has(value)) {
          return refused(`entities.${id}.attributes.extends[${i}]`, "stereotype-application-invalid");
        }
        converted.push({ kind: "enum", value } as AttributeValue);
      }
      if (converted.length < 1 || converted.length > 5) {
        return refused(`entities.${id}.attributes.extends`, "stereotype-application-invalid");
      }
      if (new Set(converted.map((c) => (c as { readonly value: string }).value)).size !== converted.length) {
        return refused(`entities.${id}.attributes.extends`, "stereotype-application-invalid");
      }
      entities[id] = {
        id: entity.id,
        profile: "uml@2",
        type: source.typeDefinitions[entity.type] !== undefined ? entity.type : "stereotype",
        attributes: {
          ...clone(entity.attributes),
          name: { kind: "text", value: name } as AttributeValue,
          extends: { kind: "collection", items: converted } as AttributeValue,
        },
      } as SemanticDocument["entities"][string];
      operations.push({ path: `entities.${id}.profile`, action: "rewrite-profile", detail: "uml@1→uml@2" });
      operations.push({ path: `entities.${id}.attributes.extends`, action: "convert-stereotype-extends", detail: `${converted.length} item(s) text→enum` });
      continue;
    }
    if (kind !== "class" && kind !== "interface" && kind !== "package" && kind !== "property" && kind !== "operation") {
      return refused(`entities.${id}.type`, "incompatible-attribute-schema");
    }
    const nextAttributes: Record<string, AttributeValue> = clone(entity.attributes) as Record<string, AttributeValue>;
    const multiplicityRaw = entity.attributes["multiplicity"] as AttributeValue | undefined;
    if (kind === "property" && multiplicityRaw !== undefined) {
      const raw = textValue(multiplicityRaw);
      if (raw === null) return refused(`entities.${id}.attributes.multiplicity`, "multiplicity-syntax");
      const parsed = parseMultiplicity(raw);
      if (!parsed.ok) return refused(`entities.${id}.attributes.multiplicity`, parsed.reason);
      nextAttributes["multiplicity"] = {
        kind: "struct",
        type: "multiplicity",
        fields: {
          lower: { kind: "quantity", value: parsed.lower, unit: "unit" },
          upper: { kind: "quantity", value: parsed.upper, unit: "unit" },
        },
      } as AttributeValue;
      operations.push({
        path: `entities.${id}.attributes.multiplicity`,
        action: "parse-multiplicity",
        detail: `${raw}→${parsed.lower}/${parsed.upper}`,
      });
    } else if (kind === "property" && multiplicityRaw !== undefined && multiplicityRaw.kind !== "text") {
      return refused(`entities.${id}.attributes.multiplicity`, "multiplicity-syntax");
    }
    const stereotypesValue = entity.attributes["stereotypes"] as AttributeValue | undefined;
    if (stereotypesValue !== undefined) {
      if (stereotypesValue.kind !== "collection") {
        return refused(`entities.${id}.attributes.stereotypes`, "unmapped-stereotype");
      }
      const converted: AttributeValue[] = [];
      for (let i = 0; i < stereotypesValue.items.length; i += 1) {
        const item = stereotypesValue.items[i] as AttributeValue | undefined;
        if (item === undefined) return refused(`entities.${id}.attributes.stereotypes[${i}]`, "unmapped-stereotype");
        const label =
          item.kind === "text" && typeof (item as { readonly value: unknown }).value === "string"
            ? ((item as { readonly value: string }).value as string)
            : null;
        if (label === null) return refused(`entities.${id}.attributes.stereotypes[${i}]`, "unmapped-stereotype");
        const ref = stereotypes[label];
        if (ref === undefined) return refused(`entities.${id}.attributes.stereotypes[${i}]`, "unmapped-stereotype");
        const declared = resolveUmlStereotype(source, sourceResolver, ref);
        if (declared.ok === false && declared.missing) {
          return refused(`entities.${id}.attributes.stereotypes[${i}]`, "unmapped-stereotype");
        }
        if (declared.ok === false) {
          return refused(`entities.${id}.attributes.stereotypes[${i}]`, "stereotype-application-invalid");
        }
        if (!declared.extends.some((allowed) => kind === allowed)) {
          return refused(`entities.${id}.attributes.stereotypes[${i}]`, "stereotype-application-invalid");
        }
        converted.push({ kind: "reference", value: ref } as AttributeValue);
      }
      nextAttributes["stereotypes"] = { kind: "collection", items: converted } as AttributeValue;
      operations.push({
        path: `entities.${id}.attributes.stereotypes`,
        action: "map-stereotypes",
        detail: `${converted.length} item(s)`,
      });
    }
    entities[id] = { id: entity.id, profile: "uml@2", type: entity.type, attributes: nextAttributes } as SemanticDocument["entities"][string];
    operations.push({ path: `entities.${id}.profile`, action: "rewrite-profile", detail: "uml@1→uml@2" });
  }
  const relations: Record<string, SemanticDocument["relations"][string]> = {};
  for (const [id, rawRelation] of Object.entries(source.relations).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    const relation = rawRelation;
    if (relation.profile !== "uml@1") {
      relations[id] = clone(relation);
      continue;
    }
    const nextAttributes: Record<string, AttributeValue> = clone(relation.attributes) as Record<string, AttributeValue>;
    for (const key of ["sourceMultiplicity", "targetMultiplicity"] as const) {
      if (relation.type === "association" && relation.attributes[key] !== undefined) {
        const raw = textValue(relation.attributes[key] as AttributeValue);
        if (raw === null) return refused(`relations.${id}.attributes.${key}`, "multiplicity-syntax");
        const parsed = parseMultiplicity(raw);
        if (!parsed.ok) return refused(`relations.${id}.attributes.${key}`, parsed.reason);
        nextAttributes[key] = {
          kind: "struct",
          type: "multiplicity",
          fields: {
            lower: { kind: "quantity", value: parsed.lower, unit: "unit" },
            upper: { kind: "quantity", value: parsed.upper, unit: "unit" },
          },
        } as AttributeValue;
        operations.push({
          path: `relations.${id}.attributes.${key}`,
          action: "parse-multiplicity",
          detail: `${raw}→${parsed.lower}/${parsed.upper}`,
        });
      }
    }
    relations[id] = {
      id: relation.id,
      profile: "uml@2",
      type: relation.type,
      endpoints: clone(relation.endpoints),
      attributes: nextAttributes,
    } as SemanticDocument["relations"][string];
    operations.push({ path: `relations.${id}.profile`, action: "rewrite-profile", detail: "uml@1→uml@2" });
  }
  for (const [id, rawPort] of Object.entries(source.ports).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    const port = rawPort;
    if (port.profile === "uml@1") {
      return refused(`ports.${id}.profile`, "incompatible-attribute-schema");
    }
  }
  const ports = clone(source.ports);
  const target: SemanticDocument = {
    ...clone(source),
    profileRefs: nextRefs,
    typeDefinitions: nextDefinitions,
    entities,
    relations,
    ports,
  };
  for (const entity of Object.values(target.entities)) {
    if ((entity.profile as string) === "uml@1") return refused(`entities.${entity.id}.profile`, "incompatible-attribute-schema");
  }
  for (const relation of Object.values(target.relations)) {
    if ((relation.profile as string) === "uml@1") return refused(`relations.${relation.id}.profile`, "incompatible-attribute-schema");
  }
  const check = scopedBindingsFor(target.profileRefs);
  const targetViews = clone(sourceViews);
  const candidate: DiagramState = { document: target, views: targetViews };
  const diagnostics =
    Object.keys(targetViews).length > 0
      ? validateState(candidate, { registry: check.registry, bindings: check.bindings })
      : validateDocument(target, { registry: check.registry, bindings: check.bindings });
  if (diagnostics.length > 0) {
    const first = diagnostics[0] as (typeof diagnostics)[number] | undefined;
    if (first === undefined) return refused("target", "incompatible-attribute-schema");
    return refused(first.path, "incompatible-attribute-schema", `${first.code}: ${first.message}`);
  }
  const ordered = orderOperations(operations);
  const snapshotState: DiagramState =
    sourceInput !== undefined && isDiagramState(sourceInput)
      ? clone(sourceInput)
      : { document: clone(source), views: {} };
  const migratedState: DiagramState = { document: clone(target), views: clone(targetViews) };
  const migrated = clone(target);
  return {
    status: "ok",
    migrationId: "uml@1->uml@2",
    from,
    to,
    originalCanonical: canonical,
    originalHash: hash,
    operations: ordered,
    unmigrated: [],
    supersession,
    document: migrated,
    state: migratedState,
    invert: () => ({ status: "ok", document: clone(snapshotState.document), state: clone(snapshotState) }),
  };
}
