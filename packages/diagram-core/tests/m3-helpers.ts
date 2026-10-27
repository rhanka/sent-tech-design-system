/**
 * Shared builders for the M3 semantic-executor suites.
 *
 * Every synthetic profile below uses ids that carry no catalogue meaning
 * (except where an Appendix C oracle is reproduced byte-for-byte with plain
 * strings such as `multiplicity` or `entity:order`, which are ordinary
 * nominal ids, not catalogue data). Nothing here imports archimate@2 or uml@2:
 * those completions belong to a later lot.
 */
import {
  bindingRowFor,
  createProfileRegistry,
  documentRef,
  entityRef,
  LEGACY_CONSTRAINTS_ADAPTER,
  portRef,
  relationRef,
  SCOPED_CONSTRAINTS_ADAPTER,
  type AttributeValue,
  type Entity,
  type ExecutorProfileBindings,
  type Profile,
  type ProfileId,
  type Relation,
  type SemanticDocument,
  type SemanticPort,
  type ValidationOptions,
} from "../src/index.js";
import { CURRENT_SCHEMA_VERSION, text } from "../src/index.js";

export const emptyAttributes: Readonly<Record<string, AttributeValue>> = {};

export function baseDocument(profileRefs: readonly ProfileId[]): SemanticDocument {
  return {
    documentId: documentRef("m3"),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 0,
    profileRefs: [...profileRefs],
    typeDefinitions: {},
    entities: {},
    relations: {},
    ports: {},
    resources: {},
    extensions: [],
  };
}

export function ent(
  id: string,
  profile: ProfileId,
  type: string,
  attributes: Readonly<Record<string, AttributeValue>> = emptyAttributes,
): Entity {
  return { id: entityRef(id), profile, type, attributes };
}

export function rel(
  id: string,
  profile: ProfileId,
  type: string,
  endpoints: readonly { readonly role: string; readonly target: string }[],
  attributes: Readonly<Record<string, AttributeValue>> = emptyAttributes,
): Relation {
  return {
    id: relationRef(id),
    profile,
    type,
    endpoints: endpoints.map((endpoint) => ({ role: endpoint.role, target: endpoint.target as never })),
    attributes,
  };
}

export function port(
  id: string,
  profile: ProfileId,
  type: string,
  ownerLocalId: string,
  direction: SemanticPort["direction"] = "out",
): SemanticPort {
  return {
    id: portRef(id),
    profile,
    type,
    owner: entityRef(ownerLocalId),
    name: id,
    direction,
    attributes: {},
  };
}

export function scopedOptions(profiles: readonly Profile[]): ValidationOptions {
  const registry = createProfileRegistry(profiles);
  const bindings: ExecutorProfileBindings = {
    schemaVersion: "1",
    rows: profiles.map((profile) => bindingRowFor(profile, SCOPED_CONSTRAINTS_ADAPTER)),
  };
  return { registry, bindings };
}

export function legacyOptions(profiles: readonly Profile[]): ValidationOptions {
  return { registry: createProfileRegistry(profiles) };
}

/**
 * An explicit legacy-adapter run: every profile carries a verified
 * `legacy-constraints@1` row. Version-1 profiles only run the retained
 * native checks through such an explicit row — never by omitting the
 * bindings table outside the four retained identities.
 */
export function explicitLegacyOptions(profiles: readonly Profile[]): ValidationOptions {
  const registry = createProfileRegistry(profiles);
  const bindings: ExecutorProfileBindings = {
    schemaVersion: "1",
    rows: profiles.map((profile) => bindingRowFor(profile, LEGACY_CONSTRAINTS_ADAPTER)),
  };
  return { registry, bindings };
}

/** The canonical valid generic@2 scene: legend l with keys k1/k2, container c with node n. */
export function validGeneric2Document(): SemanticDocument {
  const document = baseDocument(["generic@2"]);
  const entities: Record<string, Entity> = {
    "entity:l": ent("l", "generic@2", "legend", { name: text("L") }),
    "entity:k1": ent("k1", "generic@2", "legend-key", { name: text("K1"), category: text("risk") }),
    "entity:k2": ent("k2", "generic@2", "legend-key", { name: text("K2"), category: text("danger") }),
    "entity:c": ent("c", "generic@2", "container", { name: text("C") }),
    "entity:n": ent("n", "generic@2", "node", { name: text("N") }),
  };
  const relations: Record<string, Relation> = {
    "relation:lk1": rel("lk1", "generic@2", "contains", [
      { role: "parent", target: "entity:l" },
      { role: "child", target: "entity:k1" },
    ]),
    "relation:lk2": rel("lk2", "generic@2", "contains", [
      { role: "parent", target: "entity:l" },
      { role: "child", target: "entity:k2" },
    ]),
    "relation:cn": rel("cn", "generic@2", "contains", [
      { role: "parent", target: "entity:c" },
      { role: "child", target: "entity:n" },
    ]),
  };
  return { ...document, entities, relations };
}
