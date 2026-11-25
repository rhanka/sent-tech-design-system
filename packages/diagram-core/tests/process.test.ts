import { describe, expect, it } from "vitest";
import {
  allProfilesRegistry,
  createDocument,
  createProcessFlowExtension,
  DIAGRAM_NOTATION_PIN,
  documentRef,
  entityRef,
  enumeration,
  imposedAdapterFor,
  isRelationRef,
  m3ProfileRegistry,
  parseProcessFlowExtension,
  PROCESS_PROFILE_ID,
  processNotation,
  processProfile,
  quantity,
  relationRef,
  resolveNotation,
  SCOPED_CONSTRAINTS_ADAPTER,
  shippedExecutorBindings,
  text,
  validateDocument,
  validateNotation,
  validateProfile,
  type NotationBlock,
  type SemanticDocument,
} from "../src/index.js";

const options = { registry: m3ProfileRegistry, bindings: shippedExecutorBindings };

function makeProcessDocument(
  overrides: Partial<SemanticDocument> = {},
): SemanticDocument {
  const base = createDocument({
    documentId: documentRef("proc-1"),
    profileRefs: [PROCESS_PROFILE_ID],
  });
  return {
    ...base,
    entities: {
      "entity:intake": {
        id: entityRef("intake"),
        profile: PROCESS_PROFILE_ID,
        type: "step",
        attributes: { name: text("Intake"), kind: enumeration("start"), stepNumber: text("1") },
      },
      "entity:review": {
        id: entityRef("review"),
        profile: PROCESS_PROFILE_ID,
        type: "step",
        attributes: { name: text("Review"), kind: enumeration("task"), subtitle: text("Analyst") },
      },
      "entity:decide": {
        id: entityRef("decide"),
        profile: PROCESS_PROFILE_ID,
        type: "step",
        attributes: { name: text("Approved?"), kind: enumeration("decision") },
      },
      "entity:done": {
        id: entityRef("done"),
        profile: PROCESS_PROFILE_ID,
        type: "step",
        attributes: { name: text("Done"), kind: enumeration("end") },
      },
    },
    relations: {
      "relation:intake.review": {
        id: relationRef("intake.review"),
        profile: PROCESS_PROFILE_ID,
        type: "transition",
        endpoints: [
          { role: "source", target: entityRef("intake") },
          { role: "target", target: entityRef("review") },
        ],
        attributes: { kind: enumeration("normal") },
      },
      "relation:review.decide": {
        id: relationRef("review.decide"),
        profile: PROCESS_PROFILE_ID,
        type: "transition",
        endpoints: [
          { role: "source", target: entityRef("review") },
          { role: "target", target: entityRef("decide") },
        ],
        attributes: {},
      },
      "relation:decide.review": {
        id: relationRef("decide.review"),
        profile: PROCESS_PROFILE_ID,
        type: "transition",
        endpoints: [
          { role: "source", target: entityRef("decide") },
          { role: "target", target: entityRef("review") },
        ],
        attributes: { label: text("Rework"), kind: enumeration("retry") },
      },
      "relation:decide.done": {
        id: relationRef("decide.done"),
        profile: PROCESS_PROFILE_ID,
        type: "transition",
        endpoints: [
          { role: "source", target: entityRef("decide") },
          { role: "target", target: entityRef("done") },
        ],
        attributes: { label: text("Yes"), emphasis: enumeration("emphasis") },
      },
    },
    ...overrides,
  };
}

describe("process@1 profile and registry", () => {
  it("registers process@1 in m3ProfileRegistry, allProfilesRegistry and shippedExecutorBindings", () => {
    expect(PROCESS_PROFILE_ID).toBe("process@1");
    expect(processProfile.completeness).toBe("complete");
    expect(m3ProfileRegistry.get(PROCESS_PROFILE_ID)).toBe(processProfile);
    expect(allProfilesRegistry.get(PROCESS_PROFILE_ID)).toBe(processProfile);
    expect(imposedAdapterFor(PROCESS_PROFILE_ID)).toBe(SCOPED_CONSTRAINTS_ADAPTER);
    expect(shippedExecutorBindings.rows.some((r) => r.profileId === PROCESS_PROFILE_ID)).toBe(true);
    expect(validateProfile(processProfile, SCOPED_CONSTRAINTS_ADAPTER)).toEqual([]);
  });

  it("keeps DIAGRAM_NOTATION_PIN untouched", () => {
    expect(DIAGRAM_NOTATION_PIN).toEqual({
      id: "diagram-notation",
      version: "1",
      contentDigest: "b4bfa7174a7a53ec23b8a8d7580d6bdfc3bab7f29deb1204aa2e4ce12424909f",
    });
  });

  it("marks lane without container: true so layout stays single-level", () => {
    const lane = processProfile.entityTypes.find((t) => t.id === "lane");
    expect(lane?.container).toBeUndefined();
  });
});

describe("diagram-notation@1 minimal executor", () => {
  it("validates processNotation against processProfile", () => {
    expect(validateNotation(processNotation, processProfile)).toEqual([]);
  });

  it("refuses illegal notation slots and missing strict types", () => {
    const badLaneIcon: NotationBlock = {
      ...processNotation,
      entityTypes: {
        ...processNotation.entityTypes,
        lane: { role: "lane", nature: "responsibility", icon: "cluster" },
      },
    };
    expect(validateNotation(badLaneIcon, processProfile).length).toBeGreaterThan(0);

    const badVariant: NotationBlock = {
      ...processNotation,
      entityTypes: {
        ...processNotation.entityTypes,
        step: { role: "flow-node", nature: "activity", variant: "unknown-shape" },
      },
    };
    expect(validateNotation(badVariant, processProfile).length).toBeGreaterThan(0);

    const missingRelation: NotationBlock = {
      ...processNotation,
      relationTypes: { transition: processNotation.relationTypes["transition"]! },
    };
    expect(validateNotation(missingRelation, processProfile).length).toBeGreaterThan(0);
  });

  it("resolves entity roles/variants and relation encodings/provisional state", () => {
    const doc = makeProcessDocument({
      entities: {
        ...makeProcessDocument().entities,
        "entity:lane1": {
          id: entityRef("lane1"),
          profile: PROCESS_PROFILE_ID,
          type: "lane",
          attributes: { name: text("Operations"), order: quantity(0, "index") },
        },
      },
      relations: {
        ...makeProcessDocument().relations,
        "relation:lane1.intake": {
          id: relationRef("lane1.intake"),
          profile: PROCESS_PROFILE_ID,
          type: "inLane",
          endpoints: [
            { role: "lane", target: entityRef("lane1") },
            { role: "step", target: entityRef("intake") },
          ],
          attributes: {},
        },
      },
    });
    const resolved = resolveNotation(processNotation, processProfile, doc);
    expect(resolved.entities["entity:intake"]).toMatchObject({ role: "flow-node", nature: "activity", variant: "start" });
    expect(resolved.entities["entity:review"]).toMatchObject({ role: "flow-node", nature: "activity", variant: "task" });
    expect(resolved.entities["entity:decide"]).toMatchObject({ role: "flow-node", nature: "activity", variant: "decision" });
    expect(resolved.entities["entity:done"]).toMatchObject({ role: "flow-node", nature: "activity", variant: "end" });
    expect(resolved.entities["entity:lane1"]).toMatchObject({ role: "lane", nature: "responsibility" });
    expect(resolved.relations["relation:intake.review"]).toMatchObject({
      encoding: "arrow",
      ends: "arrow",
      provisional: false,
    });
    expect(resolved.relations["relation:decide.review"]).toMatchObject({
      encoding: "arrow",
      ends: "arrow",
      provisional: true,
    });
    expect(resolved.relations["relation:lane1.intake"]).toMatchObject({
      encoding: "containment",
    });
  });
});

describe("process@1 validateDocument and sentropic:process-flow extension", () => {
  it("validates process documents with parallel relation:<from>.<to>.2 ids and lanes", () => {
    const doc = makeProcessDocument();
    const withParallelAndLanes: SemanticDocument = {
      ...doc,
      entities: {
        ...doc.entities,
        "entity:laneA": {
          id: entityRef("laneA"),
          profile: PROCESS_PROFILE_ID,
          type: "lane",
          attributes: { name: text("Front"), order: quantity(0, "index") },
        },
        "entity:laneB": {
          id: entityRef("laneB"),
          profile: PROCESS_PROFILE_ID,
          type: "lane",
          attributes: { name: text("Back"), order: quantity(1, "index") },
        },
      },
      relations: {
        ...doc.relations,
        "relation:decide.done.2": {
          id: relationRef("decide.done.2"),
          profile: PROCESS_PROFILE_ID,
          type: "transition",
          endpoints: [
            { role: "source", target: entityRef("decide") },
            { role: "target", target: entityRef("done") },
          ],
          attributes: { label: text("Fast-track"), kind: enumeration("exception") },
        },
        "relation:laneA.intake": {
          id: relationRef("laneA.intake"),
          profile: PROCESS_PROFILE_ID,
          type: "inLane",
          endpoints: [
            { role: "lane", target: entityRef("laneA") },
            { role: "step", target: entityRef("intake") },
          ],
          attributes: {},
        },
        "relation:laneB.review": {
          id: relationRef("laneB.review"),
          profile: PROCESS_PROFILE_ID,
          type: "inLane",
          endpoints: [
            { role: "lane", target: entityRef("laneB") },
            { role: "step", target: entityRef("review") },
          ],
          attributes: {},
        },
      },
      extensions: [createProcessFlowExtension({ direction: "LR", numbered: true })],
    };
    expect(isRelationRef("relation:decide.done.2")).toBe(true);
    expect(validateDocument(withParallelAndLanes, options)).toEqual([]);
    expect(parseProcessFlowExtension(withParallelAndLanes)).toEqual({ direction: "LR", numbered: true });
  });

  it("refuses a step assigned to multiple lanes", () => {
    const doc = makeProcessDocument();
    const multiLane: SemanticDocument = {
      ...doc,
      entities: {
        ...doc.entities,
        "entity:laneA": { id: entityRef("laneA"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("A") } },
        "entity:laneB": { id: entityRef("laneB"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("B") } },
      },
      relations: {
        ...doc.relations,
        "relation:laneA.intake": {
          id: relationRef("laneA.intake"),
          profile: PROCESS_PROFILE_ID,
          type: "inLane",
          endpoints: [{ role: "lane", target: entityRef("laneA") }, { role: "step", target: entityRef("intake") }],
          attributes: {},
        },
        "relation:laneB.intake": {
          id: relationRef("laneB.intake"),
          profile: PROCESS_PROFILE_ID,
          type: "inLane",
          endpoints: [{ role: "lane", target: entityRef("laneB") }, { role: "step", target: entityRef("intake") }],
          attributes: {},
        },
      },
    };
    expect(validateDocument(multiLane, options).map((d) => d.code)).toContain("hierarchy-multiple-parents");
  });

  it("refuses invalid sentropic:process-flow extension payloads", () => {
    const base = makeProcessDocument();
    const badDirectionExt = createProcessFlowExtension({ direction: "UP" as never });
    const badDoc: SemanticDocument = { ...base, extensions: [badDirectionExt] };
    expect(validateDocument(badDoc, options).length).toBeGreaterThan(0);

    const badScopeDoc: SemanticDocument = {
      ...base,
      extensions: [
        {
          ...createProcessFlowExtension({ direction: "TB" }),
          scope: { kind: "entity", target: entityRef("intake") },
        },
      ],
    };
    expect(validateDocument(badScopeDoc, options).length).toBeGreaterThan(0);
  });
});
