/** Minimal profile DATA, with the predicate identities supplied by engram. */
import {
  createView, entityRef, occurrenceRef, relationRef, viewRef,
  type ChainPath, type ChainPredicate, type Entity, type EntityOccurrence, type Profile,
  type Relation, type RelationOccurrence, type RelationOccurrenceEndpoint, type VisualGroup,
} from "../src/index.js";
import { baseDocument, ent, rel, scopedOptions } from "./m3-helpers.js";

export const ids = {
  p1: "archi2.chain.api-exposer",
  p2: "archi2.chain.package-repo-or-runtime",
  p3: "archi2.chain.external-api-exposer",
  p4: "archi2.chain.dependency-bundle",
} as const;
export const repoPath: ChainPath = {
  steps: [{ relationTypes: ["managedIn", "partOf"], direction: "forward", repeat: "oneOrMore" }],
  endTypes: ["repo"],
};
export const exposePath: ChainPath = {
  steps: [{ relationTypes: ["exposesApi"], direction: "inverse", repeat: "one" }],
  endTypes: ["service", "runtime"],
};
export const externalPath: ChainPath = {
  steps: [{ relationTypes: ["partOf"], direction: "forward", repeat: "one" }],
  endTypes: ["system"], endConstraints: [{ attribute: "externalVendor", equals: true }],
};
export const predicates: readonly ChainPredicate[] = [
  { id: ids.p1, appliesTo: { relationTypes: ["calls", "routesTo", "dependsOn"], roles: ["target"], startTypes: ["api"] },
    alternatives: [exposePath], selection: "unique" },
  { id: ids.p2, appliesTo: { relationTypes: ["dependsOn"], roles: ["target"], startTypes: ["package"] },
    alternatives: [repoPath, { steps: [{ relationTypes: ["deployedAs"], direction: "forward", repeat: "one" }],
      endTypes: ["runtime", "service"] }], selection: "ordered" },
  { id: ids.p3, appliesTo: { relationTypes: ["calls", "routesTo", "dependsOn"], roles: ["target"], startTypes: ["api"] },
    alternatives: [{ steps: [...exposePath.steps,
      { relationTypes: ["partOf"], direction: "forward", repeat: "zeroOrMore" }],
      endTypes: ["system"], endConstraints: externalPath.endConstraints! }], selection: "first-drawn" },
  { id: ids.p4, appliesTo: { relationTypes: ["dependsOn"], roles: ["source"], startTypes: ["package", "runtime", "component"] },
    alternatives: [repoPath], selection: "aggregate", aggregation: {
      memberRelationTypes: ["dependsOn"], memberTargetChain: externalPath, memberSourceChain: repoPath,
      sort: "sourceId,targetId,relationId",
    } },
];
export const chainProfile: Profile = {
  id: "chain@2", name: "Chain fixture", version: 2, completeness: "complete",
  entityTypes: ["api", "service", "runtime", "package", "component", "repo", "system"].map((id) => ({
    id, label: id, attributes: [
      { name: "externalVendor", kind: "boolean" as const },
      { name: "registryType", kind: "enum" as const, values: ["npm", "maven"] },
    ], ...(id === "repo" || id === "system" ? { container: true } : {}),
  })),
  portTypes: [{ id: "socket", label: "Socket", directions: ["in", "out"] }],
  relationTypes: ["calls", "routesTo", "dependsOn", "exposesApi", "managedIn", "partOf", "deployedAs"].map((id) => ({
    id, label: id, direction: "directed", roles: ["source", "target"].map((role) => ({
      role, targets: ["entity"], cardinality: { min: 1, max: 1 },
    })),
  })),
  constraints: [], limits: {}, notes: [], chainPredicates: predicates,
};

export function single(kind: "p1" | "p2" | "p3" = "p1", drawn = "svc", hops = ["expose"]) {
  const d = { ...baseDocument([chainProfile.id]), entities: {} as Record<string, Entity>, relations: {} as Record<string, Relation> };
  for (const [id, type] of Object.entries({ client: "service", api: "api", svc: "service", svc2: "service", p: "package",
    nested: "package", repo: "repo", repo2: "repo", runtime: "runtime", system: "system", mid: "component" })) {
    d.entities[entityRef(id)] = ent(id, chainProfile.id, type, type === "system" ? { externalVendor: { kind: "boolean", value: true } } : {});
  }
  const v = { ...createView({ viewId: viewRef("chains"), semanticDocumentId: d.documentId }),
    entityOccurrences: {} as Record<string, EntityOccurrence>, relationOccurrences: {} as Record<string, RelationOccurrence>,
    groups: {} as Record<string, VisualGroup> };
  const f = { d, v, profile: chainProfile };
  link(f, "edge", kind === "p2" ? "dependsOn" : "calls", "client", kind === "p2" ? "p" : "api");
  v.relationOccurrences[occurrenceRef("edge")] = { id: occurrenceRef("edge"), relation: relationRef("edge"), endpoints: [{
    role: "target", occurrence: occurrenceRef(drawn), semanticTarget: entityRef(kind === "p2" ? "p" : "api"),
    chainProvenance: { predicateId: ids[kind], hops: hops.map(relationRef) },
  }] };
  draw(f, drawn);
  if (kind !== "p2") link(f, "expose", "exposesApi", "svc", "api");
  if (kind === "p3") link(f, "parent", "partOf", "svc", "system");
  return f;
}
export type Fixture = ReturnType<typeof single>;
export function link(f: Fixture, id: string, type: string, source: string, target: string): void {
  f.d.relations[relationRef(id)] = rel(id, f.profile.id, type, [
    { role: "source", target: entityRef(source) }, { role: "target", target: entityRef(target) },
  ]);
}
export function draw(f: Fixture, id: string, entity = id): void {
  f.v.entityOccurrences[occurrenceRef(id)] = { id: occurrenceRef(id), entity: entityRef(entity),
    geometry: { x: 0, y: 0, width: 100, height: 50 } };
}
export function endpoint(f: Fixture): RelationOccurrenceEndpoint {
  return f.v.relationOccurrences[occurrenceRef("edge")]!.endpoints[0]!;
}
export function change(f: Fixture, update: { [K in keyof RelationOccurrenceEndpoint]?: RelationOccurrenceEndpoint[K] | undefined }): void {
  const edge = f.v.relationOccurrences[occurrenceRef("edge")]!;
  const next = Object.fromEntries(Object.entries({ ...endpoint(f), ...update }).filter(([, value]) => value !== undefined)) as unknown as RelationOccurrenceEndpoint;
  f.v.relationOccurrences[edge.id] = { ...edge, endpoints: [next] };
}
export const options = (f: Fixture) => scopedOptions([f.profile]);

export function bundle(): Fixture {
  const f = single("p2", "repo", []);
  delete f.d.relations[relationRef("edge")];
  for (const [id, type] of [["a", "package"], ["b", "runtime"], ["c", "component"], ["target", "package"]]) {
    f.d.entities[entityRef(id!)] = ent(id!, f.profile.id, type!);
  }
  for (const [i, source] of ["a", "b", "c"].entries()) {
    link(f, `m${i + 1}`, "dependsOn", source, "target");
    link(f, `r${i + 1}`, "managedIn", source, "repo");
  }
  link(f, "registry", "partOf", "target", "system");
  const edge = f.v.relationOccurrences[occurrenceRef("edge")]!;
  f.v.relationOccurrences[edge.id] = { ...edge, relation: relationRef("m1") };
  change(f, { role: "source", semanticTarget: entityRef("a"), chainProvenance: {
    predicateId: ids.p4, hops: [relationRef("r1")], members: ["m1", "m2", "m3"].map(relationRef),
  } });
  f.v.groups["fold"] = { id: "fold", occurrence: occurrenceRef("repo"), collapsed: true };
  return f;
}
