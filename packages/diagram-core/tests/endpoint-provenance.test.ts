import { describe, expect, it } from "vitest";
import {
  createProfileRegistry, defaultProfileRegistry, entityRef, occurrenceRef, portRef, relationRef, validateDocument, validateView,
  serialiseContent, sha256Hex, type Profile,
} from "../src/index.js";
import { ent, rel } from "./m3-helpers.js";
import { bundle, chainProfile, change, draw, endpoint, ids, link, options, single, type Fixture } from "./endpoint-provenance-fixtures.js";
import { readFixture, stateOf } from "./fixtures.js";

const endpointPath = "relationOccurrences.occurrence:edge.endpoints[0].occurrence";
const validate = (f: Fixture) => validateView(f.v, f.d, options(f));
function refusal(f: Fixture, check: string, extras: Record<string, string | number | boolean> = {}, extraRefs: readonly string[] = []): void {
  const e = endpoint(f);
  expect(validate(f)).toEqual([{
    code: "occurrence-endpoint-mismatch", severity: "error", path: endpointPath,
    message: `chain endpoint for role ${e.role} fails check ${check} (predicate ${e.chainProvenance!.predicateId})`,
    refs: ["occurrence:edge", e.occurrence, e.semanticTarget, ...extraRefs],
    details: { role: e.role, check, predicateId: e.chainProvenance!.predicateId, ...extras },
  }]);
}
function hops(f: Fixture, values: string[]): void {
  change(f, { chainProvenance: { ...endpoint(f).chainProvenance!, hops: values.map(relationRef) } });
}
function members(f: Fixture, values: string[]): void {
  change(f, { chainProvenance: { ...endpoint(f).chainProvenance!, members: values.map(relationRef) } });
}
function repoFixture(): Fixture {
  const f = single("p2", "repo", ["manage", "parent"]);
  link(f, "manage", "managedIn", "p", "nested");
  link(f, "parent", "partOf", "nested", "repo");
  return f;
}
function externalFixture(): Fixture { return single("p3", "system", ["expose", "parent"]); }

describe("P1 api exposer", () => {
  it("AC-01 accepts the unique exposer", () => expect(validate(single())).toEqual([]));
  it("AC-02 refuses an unrelated drawn end before comparing hops", () => {
    const f = single("p1", "svc2");
    refusal(f, "chain-not-proven", { expectedEnd: "entity:svc" });
  });
  it("AC-03 reports the first forged hop", () => {
    const f = single(); link(f, "forged", "partOf", "p", "repo"); hops(f, ["forged"]);
    refusal(f, "chain-hop-mismatch", { hopIndex: 0, hop: "relation:forged" }, ["relation:forged"]);
  });
  it("AC-21 refuses zero exposers", () => {
    const f = single(); delete f.d.relations[relationRef("expose")]; hops(f, []);
    refusal(f, "chain-not-proven");
  });
  it("AC-22 counts distinct ends in the document, including undrawn exposers", () => {
    const f = single(); link(f, "expose2", "exposesApi", "svc2", "api");
    refusal(f, "chain-not-proven", { cause: "cardinality" });
    // validateView owns selection only; it never invokes semantic cardinality validation.
    expect(validate(f).some((d) => d.code === "endpoint-cardinality-violation")).toBe(false);
  });
  it("AC-46 keeps parallel relations distinct, with UTF-16 candidate order", () => {
    const f = single(); link(f, "Exposer", "exposesApi", "svc", "api");
    refusal(f, "chain-hop-mismatch", { hopIndex: 0, hop: "relation:expose" }, ["relation:expose"]);
    hops(f, ["Exposer"]); expect(validate(f)).toEqual([]);
  });
});

describe("P2 ordered package lift", () => {
  it("AC-04 accepts undrawn package via the ordered mixed repeating step", () => expect(validate(repoFixture())).toEqual([]));
  it("AC-05 selects a drawn repo before deployed runtime", () => {
    const f = repoFixture(); link(f, "deploy", "deployedAs", "p", "runtime"); draw(f, "runtime");
    expect(validate(f)).toEqual([]);
    change(f, { occurrence: occurrenceRef("runtime") }); hops(f, ["deploy"]);
    refusal(f, "chain-not-proven", { expectedEnd: "entity:repo" });
  });
  it("AC-06 accepts the only drawn runtime when no repo is drawn", () => {
    const f = repoFixture(); delete f.v.entityOccurrences[occurrenceRef("repo")]; draw(f, "runtime");
    link(f, "deploy", "deployedAs", "p", "runtime"); change(f, { occurrence: occurrenceRef("runtime") }); hops(f, ["deploy"]);
    expect(validate(f)).toEqual([]);
  });
  it("AC-07 reports two drawn runtime candidates in refs, with scalar details", () => {
    const f = single("p2", "runtime", ["deploy"]); draw(f, "svc");
    link(f, "deploy", "deployedAs", "p", "runtime"); link(f, "deploy2", "deployedAs", "p", "svc");
    refusal(f, "chain-ambiguous", { candidateCount: 2 }, ["entity:runtime", "entity:svc"]);
  });
  it("AC-08 refuses when no admitted end is drawn", () => {
    const f = repoFixture(); draw(f, "svc"); delete f.v.entityOccurrences[occurrenceRef("repo")];
    change(f, { occurrence: occurrenceRef("svc") }); refusal(f, "chain-not-proven");
  });
  it("AC-16 closes a partOf cycle", () => {
    const f = single("p2", "repo", ["loop1", "loop2"]);
    link(f, "loop1", "partOf", "p", "nested"); link(f, "loop2", "partOf", "nested", "p");
    refusal(f, "chain-not-proven");
  });
  it("AC-23 stops at the first admitted repo and refuses overshoot", () => {
    const f = repoFixture(); link(f, "beyond", "partOf", "repo", "system");
    expect(validate(f)).toEqual([]); hops(f, ["manage", "parent", "beyond"]);
    refusal(f, "chain-hop-mismatch", { hopIndex: 2, hop: "relation:beyond" }, ["relation:beyond"]);
  });
  it("AC-24 refuses swapped hop order", () => {
    const f = repoFixture(); hops(f, ["parent", "manage"]);
    refusal(f, "chain-hop-mismatch", { hopIndex: 0, hop: "relation:parent" }, ["relation:parent"]);
  });
  it("AC-25 reports ambiguity within the first successful alternative", () => {
    const f = repoFixture(); link(f, "second", "managedIn", "p", "repo2"); draw(f, "repo2");
    refusal(f, "chain-ambiguous", { candidateCount: 2 }, ["entity:repo", "entity:repo2"]);
  });
  it("AC-45 explores a shared node on another branch instead of using global visits", () => {
    const f = single("p2", "repo", ["b", "join"]);
    link(f, "a", "partOf", "p", "repo"); link(f, "b", "partOf", "p", "nested");
    link(f, "join", "managedIn", "nested", "repo");
    // First visit: repo at the start of oneOrMore has no required outgoing
    // hop. Second visit: the diamond reaches repo after taking that hop.
    const predicate = f.profile.chainPredicates![1]!;
    f.profile = { ...f.profile, chainPredicates: [{ ...predicate, alternatives: [{
      steps: [
        { relationTypes: ["partOf"], direction: "forward", repeat: "one" },
        { relationTypes: ["managedIn"], direction: "forward", repeat: "oneOrMore" },
      ], endTypes: ["repo"],
    }] }] };
    expect(validate(f)).toEqual([]);
  });
  it("uses relation type precedence before relation id and stops at the nearest repo", () => {
    const f = single("p2", "repo", ["z-manage"]);
    link(f, "a-part", "partOf", "p", "nested"); link(f, "next", "partOf", "nested", "repo");
    link(f, "z-manage", "managedIn", "p", "repo"); expect(validate(f)).toEqual([]);
  });
  it("revisits a cycle-pruned suffix when another branch permits its continuation", () => {
    const f = single("p2", "repo", ["z", "bc", "ca", "exit"]);
    for (const node of ["a", "b", "c"]) f.d.entities[entityRef(node)] = ent(node, f.profile.id, "package");
    link(f, "a", "partOf", "p", "a"); link(f, "z", "partOf", "p", "b");
    link(f, "ac", "managedIn", "a", "c"); link(f, "bc", "managedIn", "b", "c");
    link(f, "ca", "managedIn", "c", "a"); link(f, "exit", "deployedAs", "a", "repo");
    f.profile = { ...f.profile, chainPredicates: [{ ...f.profile.chainPredicates![1]!, alternatives: [{
      steps: [
        { relationTypes: ["partOf"], direction: "forward", repeat: "one" },
        { relationTypes: ["managedIn"], direction: "forward", repeat: "oneOrMore" },
        { relationTypes: ["deployedAs"], direction: "forward", repeat: "one" },
      ], endTypes: ["repo"],
    }] }] };
    // a -> c -> a closes the first branch before its mandatory repeat can
    // finish at a. b -> c -> a can finish there and take the exit to repo.
    expect(validate(f)).toEqual([]);
  });
  it.each(["parallel", "diamond", "parallel-cycle", "diamond-cycle"])("bounds work on 30 layers of %s routes and keeps the first witness", (shape) => {
    const f = single("p2", "repo", []);
    const values: string[] = [];
    const size = 30;
    for (let i = 0; i < size; i++) {
      const source = i === 0 ? "p" : `join${i - 1}`;
      const target = i === size - 1 ? "repo" : `join${i}`;
      if (target !== "repo") f.d.entities[entityRef(target)] = ent(target, f.profile.id, "package");
      for (const branch of ["b", "a"]) {
        const id = `${branch}${i}`;
        const intermediate = `${branch}node${i}`;
        if (shape.startsWith("diamond")) {
          f.d.entities[entityRef(intermediate)] = ent(intermediate, f.profile.id, "package");
          link(f, id, "partOf", source, intermediate);
          link(f, `${id}end`, "partOf", intermediate, target);
        } else link(f, id, "partOf", source, target);
      }
      values.push(`a${i}`);
      if (shape.startsWith("diamond")) values.push(`a${i}end`);
      if (shape.endsWith("cycle") && target !== "repo") link(f, `cycle${i}`, "partOf", target, "p");
    }
    hops(f, values);
    // Count document reads rather than elapsed time; abort a regressed walk
    // promptly instead of enumerating 2**30 successful routes.
    let reads = 0;
    const budget = size * 100;
    f.d.entities = new Proxy(f.d.entities, {
      get(target, key, receiver) {
        if (++reads > budget) throw new Error("chain traversal exceeded entity-read budget");
        return Reflect.get(target, key, receiver);
      },
    });
    expect(validate(f)).toEqual([]);
    expect(reads).toBeLessThanOrEqual(budget);
  });
});

describe("P3 first drawn external API lift", () => {
  it("AC-09 accepts the drawn exposer on a proven external chain", () => expect(validate(single("p3"))).toEqual([]));
  it("AC-09 accepts the drawn exposer without an onward external chain", () => {
    const f = single("p3");
    delete f.d.relations[relationRef("parent")];
    expect(validate(f)).toEqual([]);
  });
  it("AC-10 accepts the drawn external system when the exposer is undrawn", () => expect(validate(externalFixture())).toEqual([]));
  it("AC-11 refuses lifting past an earlier drawn exposer", () => {
    const f = externalFixture(); draw(f, "svc"); refusal(f, "chain-not-proven", { earlierDrawn: "entity:svc" });
  });
  it("AC-26 blocks at a drawn non-admitted intermediate", () => {
    const f = single("p3", "system", ["expose", "parent", "outer"]);
    link(f, "parent", "partOf", "svc", "mid"); link(f, "outer", "partOf", "mid", "system"); draw(f, "mid");
    refusal(f, "chain-not-proven", { blockingDrawn: "entity:mid" });
  });
  it.each(["system", "repo"])("AC-27 refuses a first drawn non-external system (%s)", (drawn) => {
    const f = externalFixture();
    f.d.entities[entityRef("system")] = { ...f.d.entities[entityRef("system")]!, attributes: { externalVendor: { kind: "boolean", value: false } } };
    if (drawn === "repo") {
      link(f, "outer", "partOf", "system", "repo"); draw(f, "repo"); change(f, { occurrence: occurrenceRef("repo") });
    }
    refusal(f, "chain-not-proven");
  });
  it("AC-47 gives earlierDrawn precedence over forged hops", () => {
    const f = externalFixture(); draw(f, "svc"); hops(f, ["parent", "expose"]);
    refusal(f, "chain-not-proven", { earlierDrawn: "entity:svc" });
  });
  it("uses the first successful branch for first-drawn selection", () => {
    const f = single("p3", "svc2", ["expose2"]);
    link(f, "expose2", "exposesApi", "svc2", "api"); link(f, "parent2", "partOf", "svc2", "system");
    // The first successful semantic route (svc -> system) has no drawn node.
    refusal(f, "chain-not-proven");
  });
});

describe("P4 entity-scoped dependency bundle", () => {
  it("AC-12 accepts three sorted members with the smallest carrier", () => expect(validate(bundle())).toEqual([]));
  it.each([{ values: ["m1", "m3"] }, { values: ["m1", "m2", "m3", "foreign"] }])("AC-13 refuses omitted or added members ($values)", ({ values }) => {
    const f = bundle(); link(f, "foreign", "calls", "client", "api"); members(f, values);
    refusal(f, "chain-aggregation-mismatch", { expectedCount: 3, declaredCount: values.length }, values.length === 2 ? ["relation:m3"] : ["relation:foreign"]);
  });
  it("AC-14 refuses an unsorted complete set", () => {
    const f = bundle(); members(f, ["m2", "m1", "m3"]);
    refusal(f, "chain-aggregation-mismatch", { expectedCount: 3, declaredCount: 3 }, ["relation:m2"]);
  });
  it("AC-28 excludes a target under a non-registry system", () => {
    const f = bundle(); f.d.entities[entityRef("local")] = ent("local", f.profile.id, "system", { externalVendor: { kind: "boolean", value: false } });
    f.d.entities[entityRef("localTarget")] = ent("localTarget", f.profile.id, "package");
    link(f, "localParent", "partOf", "localTarget", "local"); link(f, "localMember", "dependsOn", "c", "localTarget");
    expect(validate(f)).toEqual([]); members(f, ["m1", "m2", "localMember", "m3"]);
    refusal(f, "chain-aggregation-mismatch", { expectedCount: 3, declaredCount: 4 }, ["relation:localMember"]);
  });
  it("AC-29 refuses the second member as carrier even with correct counts", () => {
    const f = bundle(); const edge = f.v.relationOccurrences[occurrenceRef("edge")]!;
    f.v.relationOccurrences[edge.id] = { ...edge, relation: relationRef("m2") };
    change(f, { semanticTarget: entityRef("b") }); hops(f, ["r2"]);
    refusal(f, "chain-aggregation-mismatch", { expectedCount: 3, declaredCount: 3 }, ["relation:m1"]);
  });
  it("AC-30 excludes a source whose first admitted repo differs", () => {
    const f = bundle(); link(f, "r3", "managedIn", "c", "repo2");
    refusal(f, "chain-aggregation-mismatch", { expectedCount: 2, declaredCount: 3 }, ["relation:m3"]);
    members(f, ["m1", "m2"]); expect(validate(f)).toEqual([]);
  });
  it("AC-31 refuses N=0 before carrier hops", () => {
    const f = bundle(); change(f, { occurrence: occurrenceRef("repo2") }); draw(f, "repo2");
    refusal(f, "chain-aggregation-mismatch", { expectedCount: 0, declaredCount: 3 }, ["relation:m1"]);
  });
  it("AC-32 accepts another occurrence drawing the same repo", () => {
    const f = bundle(); draw(f, "another", "repo"); change(f, { occurrence: occurrenceRef("another") }); expect(validate(f)).toEqual([]);
  });
  it("orders the carrier by source and target before relation id", () => {
    const f = bundle(); f.d.entities[entityRef("atarget")] = ent("atarget", f.profile.id, "package");
    link(f, "aparent", "partOf", "atarget", "system"); link(f, "zzz", "dependsOn", "a", "atarget");
    const edge = f.v.relationOccurrences[occurrenceRef("edge")]!;
    f.v.relationOccurrences[edge.id] = { ...edge, relation: relationRef("zzz") };
    members(f, ["zzz", "m1", "m2", "m3"]); expect(validate(f)).toEqual([]);
  });
  it("AC-34 refuses aggregate witnesses without members", () => {
    const f = bundle(); change(f, { chainProvenance: { predicateId: ids.p4, hops: [relationRef("r1")] } });
    refusal(f, "chain-hop-mismatch");
  });
  it("AC-51 refuses empty declared members with N=3", () => {
    const f = bundle(); members(f, []);
    refusal(f, "chain-aggregation-mismatch", { expectedCount: 3, declaredCount: 0 }, ["relation:m1"]);
  });
});

describe("dispatch, pairing and document/view boundaries", () => {
  it.each([
    ["archimate-skeleton-document", "e444c136956db1aed6afc5bb0122ffa925d5b57f3d6ceeb82505f08b1a168533"],
    ["bpmn-skeleton-document", "a5a7e503fcca82550a34e10fd25bf599fc45f3d76cfebca7df849546410363d9"],
    ["generic-state", "3b015123ad6fea7488cebccc1a957bc3df4b61bc72139aad896ede035aa7f567"],
    ["uml-skeleton-document", "7cbeab1b3b02ee10c83c1ae195dc94e784bff9bd3d8fdec33f8155fb5d1899f2"],
  ])("AC-19 retains baseline canonical bytes and document output (%s)", (name, digest) => {
    // Captured from the unchanged origin/main fixtures at d9a04d2e.
    const state = stateOf(readFixture(`valid/${name}.json`));
    expect(sha256Hex(serialiseContent(state))).toBe(digest);
    expect(validateDocument(state.document, { registry: defaultProfileRegistry })).toEqual([]);
    for (const view of Object.values(state.views)) expect(validateView(view, state.document, { registry: defaultProfileRegistry })).toEqual([]);
  });
  it.each(["missing", "no-predicates", "empty-predicates"])("AC-15 refuses an undeclared id (%s)", (kind) => {
    const f = single();
    if (kind === "missing") change(f, { chainProvenance: { ...endpoint(f).chainProvenance!, predicateId: "unknown" } });
    else { const { chainPredicates: _, ...profile } = f.profile; f.profile = kind === "no-predicates" ? profile : { ...profile, chainPredicates: [] }; }
    refusal(f, "chain-not-declared");
  });
  it("AC-17 ignores groups, collapsed flags, geometry and filters for chain proofs", () => {
    const f = single(); draw(f, "repo"); draw(f, "nested");
    f.v.entityOccurrences[occurrenceRef("nested")] = { ...f.v.entityOccurrences[occurrenceRef("nested")]!, group: "fold" };
    f.v.entityOccurrences[occurrenceRef("svc")] = { ...f.v.entityOccurrences[occurrenceRef("svc")]!, group: "fold" };
    f.v.groups.fold = { id: "fold", occurrence: occurrenceRef("repo"), collapsed: true };
    f.v.filters = [{ id: "hide", kind: "entity-type", types: ["service"], mode: "exclude" }];
    f.v.presentation = { camera: { x: 42, y: -123, zoom: 7 } };
    expect(validate(f)).toEqual([]);
  });
  it.each([
    ["AC-18", true, true, true], ["AC-37", true, false, false], ["AC-38", false, true, false],
    ["AC-39", false, false, true], ["AC-40", false, true, true],
  ] as const)("%s pins the fold-template pairing refusal", (_, s, o, c) => {
    const f = single(); const e = endpoint(f);
    change(f, { semanticTarget: s ? e.semanticTarget : undefined, sourceOccurrence: o ? occurrenceRef("origin") : undefined,
      chainProvenance: c ? e.chainProvenance : undefined });
    expect(validate(f)).toEqual([{
      code: "occurrence-endpoint-mismatch", severity: "error", path: endpointPath,
      message: "projected endpoint for role target fails check provenance-missing", refs: ["occurrence:edge", "occurrence:svc"],
      details: { role: "target", check: "provenance-missing" },
    }]);
  });
  it("AC-33 refuses members on a non-aggregate after predicate lookup", () => {
    const f = single(); members(f, []); refusal(f, "chain-hop-mismatch");
    change(f, { chainProvenance: { ...endpoint(f).chainProvenance!, predicateId: "unknown" } }); refusal(f, "chain-not-declared");
  });
  it("AC-35 refuses a predicate on an undeclared relation type", () => {
    const f = single(); link(f, "edge", "partOf", "client", "api"); refusal(f, "chain-hop-mismatch");
  });
  it("AC-36 refuses empty hops", () => { const f = single(); hops(f, []); refusal(f, "chain-not-proven"); });
  it("AC-41 suppresses endpoint diagnostics when the drawn relation is dangling", () => {
    const f = single(); delete f.d.relations[relationRef("edge")];
    expect(validate(f)).toEqual([{ code: "dangling-reference", severity: "error", path: "relationOccurrences.occurrence:edge.relation",
      message: "relation:edge resolves to no relation in this document", refs: ["relation:edge"], details: { expectedKind: "relation" } }]);
  });
  it.each(["relation", "intermediate", "end"])("AC-42 isolates profile scope (%s)", (kind) => {
    const f = repoFixture(); const foreign: Profile = { ...chainProfile, id: "foreign@2" };
    if (kind === "relation") f.d.relations[relationRef("parent")] = { ...f.d.relations[relationRef("parent")]!, profile: foreign.id };
    else { const id = entityRef(kind === "intermediate" ? "nested" : "repo"); f.d.entities[id] = { ...f.d.entities[id]!, profile: foreign.id }; }
    const diagnostics = validateView(f.v, f.d, { registry: createProfileRegistry([f.profile, foreign]) });
    expect(diagnostics).toMatchObject([{ code: "occurrence-endpoint-mismatch", path: endpointPath, details: { check: "chain-not-proven" } }]);
    expect(diagnostics).toHaveLength(1);
  });
  it("AC-43 resolves declared and document type ancestry in the own profile", () => {
    const f = single(); f.profile = { ...f.profile, entityTypes: [...f.profile.entityTypes,
      { id: "specialApi", label: "Special API", attributes: [], supertypes: ["api"] },
      { id: "specialService", label: "Special service", attributes: [], supertypes: ["service"] },
    ] };
    f.d.entities[entityRef("api")] = { ...f.d.entities[entityRef("api")]!, type: "specialApi" };
    f.d.entities[entityRef("svc")] = { ...f.d.entities[entityRef("svc")]!, type: "specialService" };
    expect(validate(f)).toEqual([]);
    f.d.typeDefinitions = {
      customApi: { id: "customApi", profile: f.profile.id, baseType: "specialApi", attributes: [] },
      customService: { id: "customService", profile: f.profile.id, baseType: "specialService", attributes: [] },
    };
    f.d.entities[entityRef("api")] = { ...f.d.entities[entityRef("api")]!, type: "customApi" };
    f.d.entities[entityRef("svc")] = { ...f.d.entities[entityRef("svc")]!, type: "customService" };
    expect(validate(f)).toEqual([]);
    f.d.entities[entityRef("svc")] = { ...f.d.entities[entityRef("svc")]!, type: "missing" };
    refusal(f, "chain-not-proven");
  });
  it("AC-44 strictly unwraps enum/string and boolean constraints", () => {
    const f = single(); f.profile = { ...f.profile, chainPredicates: [{ ...f.profile.chainPredicates![0]!,
      startConstraints: [{ attribute: "registryType", equals: "npm" }],
    }] };
    f.d.entities[entityRef("api")] = { ...f.d.entities[entityRef("api")]!, attributes: { registryType: { kind: "enum", value: "npm" } } };
    expect(validate(f)).toEqual([]);
    const external = externalFixture(); external.d.entities[entityRef("system")] = { ...external.d.entities[entityRef("system")]!,
      attributes: { externalVendor: { kind: "text", value: "true" } } };
    refusal(external, "chain-not-proven");
  });
  it("AC-50 retains the proof with only D drawn", () => {
    const f = single(); draw(f, "api"); draw(f, "client");
    for (const key of Object.keys(f.v.entityOccurrences)) if (key !== "occurrence:svc") delete f.v.entityOccurrences[key];
    expect(validate(f)).toEqual([]);
  });
  it.each(["hop", "member"])("resolves dangling %s refs before predicate lookup", (kind) => {
    const f = single(); change(f, { chainProvenance: { predicateId: "unknown", hops: kind === "hop" ? [relationRef("absent")] : [],
      ...(kind === "member" ? { members: [relationRef("absent")] } : {}) } });
    expect(validate(f)).toEqual([{ code: "dangling-reference", severity: "error", path: endpointPath,
      message: "relation:absent is no relation of this document", refs: ["relation:absent"] }]);
  });
  it("preserves semantic-target and drawn-occurrence pre-check priority", () => {
    const f = single(); change(f, { semanticTarget: entityRef("p"), occurrence: occurrenceRef("absent") });
    expect(validate(f)).toEqual([{ code: "occurrence-endpoint-mismatch", severity: "error", path: endpointPath,
      message: "projected endpoint for role target fails check provenance-mismatch", refs: ["occurrence:edge", "occurrence:absent"],
      details: { role: "target", check: "provenance-mismatch" } }]);
    change(f, { semanticTarget: entityRef("api") });
    expect(validate(f)).toMatchObject([{ code: "dangling-reference", path: endpointPath, refs: ["occurrence:absent"] }]);
  });
  it("uses a drawn port's owner entity for type and identity tests", () => {
    const f = single();
    f.d.ports = { [portRef("out")]: { id: portRef("out"), profile: f.profile.id, type: "socket", owner: entityRef("svc"),
      name: "Out", direction: "out", attributes: {} } };
    f.v.portOccurrences = { [occurrenceRef("out")]: { id: occurrenceRef("out"), port: portRef("out"), ownerOccurrence: occurrenceRef("svc"),
      side: "east", order: 0, anchor: 0.5 } };
    change(f, { occurrence: occurrenceRef("out") }); expect(validate(f)).toEqual([]);
  });
  it("terminates deep paths without recursive calls", () => {
    const f = single("p2", "repo", []); const size = 12000;
    const values: string[] = [];
    for (let i = 0; i < size; i++) {
      const node = `deep${i}`; f.d.entities[entityRef(node)] = ent(node, f.profile.id, "package");
      const id = `hop${i}`; values.push(id); link(f, id, "partOf", i === 0 ? "p" : `deep${i - 1}`, node);
    }
    link(f, "last", "managedIn", `deep${size - 1}`, "repo"); values.push("last"); hops(f, values);
    expect(validate(f)).toEqual([]);
  });
});
