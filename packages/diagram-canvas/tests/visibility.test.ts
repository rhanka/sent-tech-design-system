/**
 * Filter evaluation and the cascade, which `diagram-core` hands to this lot by
 * name. Every decision in the module header has an assertion here, including the
 * two the persisted schema leaves genuinely open.
 */
import { describe, expect, it } from "vitest";

import { EXCLUSION_REASONS, evaluateVisibility } from "../src/visibility.js";
import {
  OCC_A,
  OCC_B,
  OCC_C,
  OCC_E1,
  OCC_E2,
  OCC_PA,
  OCC_PB,
  occurrenceCount,
  sampleDocument,
  sampleView,
} from "./fixtures.js";

function evaluate(overrides: Parameters<typeof sampleView>[0] = {}) {
  const document = sampleDocument();
  const view = sampleView(overrides);
  return { view, ...evaluateVisibility({ document, view }) };
}

describe("no filters", () => {
  it("shows every occurrence and excludes none", () => {
    const { view, visible, exclusions } = evaluate();
    expect(exclusions).toEqual([]);
    expect([...visible].sort()).toEqual([OCC_A, OCC_B, OCC_C, OCC_E1, OCC_E2, OCC_PA, OCC_PB].sort());
    // Conservation: nothing appeared and nothing vanished.
    expect(visible.size + exclusions.length).toBe(occurrenceCount(view));
  });
});

describe("one filter of one kind", () => {
  it("excludes what an exclude filter matches, naming the filter", () => {
    const { visible, exclusions } = evaluate({
      filters: [{ id: "f1", kind: "entity-type", types: ["container"], mode: "exclude" }],
    });
    expect(visible.has(OCC_C)).toBe(false);
    expect(exclusions).toContainEqual({ occurrence: OCC_C, kind: "entity", reason: "filtered-out", cause: "f1" });
    expect(visible.has(OCC_A)).toBe(true);
  });

  it("excludes what an include filter does NOT match, with a different reason", () => {
    const { visible, exclusions } = evaluate({
      filters: [{ id: "f1", kind: "entity-type", types: ["container"], mode: "include" }],
    });
    expect(visible.has(OCC_C)).toBe(true);
    expect(visible.has(OCC_A)).toBe(false);
    expect(exclusions).toContainEqual({ occurrence: OCC_A, kind: "entity", reason: "not-included" });
  });
});

describe("decision 1: several filters of one kind", () => {
  it("unites two include filters rather than intersecting them", () => {
    // Intersecting would leave NOTHING visible, which is the defect the decision
    // exists to prevent: adding a second type to a legend cannot empty the view.
    const { visible } = evaluate({
      filters: [
        { id: "f1", kind: "entity-type", types: ["node"], mode: "include" },
        { id: "f2", kind: "entity-type", types: ["container"], mode: "include" },
      ],
    });
    expect(visible.has(OCC_A)).toBe(true);
    expect(visible.has(OCC_C)).toBe(true);
  });

  it("lets an exclude filter win over an include filter that matches too", () => {
    const { visible, exclusions } = evaluate({
      filters: [
        { id: "inc", kind: "entity-type", types: ["node", "container"], mode: "include" },
        { id: "exc", kind: "entity-type", types: ["container"], mode: "exclude" },
      ],
    });
    expect(visible.has(OCC_A)).toBe(true);
    expect(visible.has(OCC_C)).toBe(false);
    expect(exclusions).toContainEqual({ occurrence: OCC_C, kind: "entity", reason: "filtered-out", cause: "exc" });
  });

  it("combines two kinds with AND", () => {
    const { visible } = evaluate({
      filters: [
        { id: "f1", kind: "entity-type", types: ["node"], mode: "include" },
        { id: "f2", kind: "attribute-equals", attribute: "state", value: "active", mode: "include" },
      ],
    });
    // A is a node AND state=active; B is a node but state=draft; C is neither.
    expect(visible.has(OCC_A)).toBe(true);
    expect(visible.has(OCC_B)).toBe(false);
    expect(visible.has(OCC_C)).toBe(false);
  });
});

describe("decision 2: attribute-equals applies to relations as well as entities", () => {
  it("excludes a relation occurrence on an entity-side attribute filter only through its own attributes", () => {
    // r1 and r2 carry NO attributes, so an `include` on `state` matches neither
    // and both relations go. That is the stated rule: an element without the
    // attribute matches nothing.
    const { visible, exclusions } = evaluate({
      filters: [{ id: "f1", kind: "attribute-equals", attribute: "state", value: "active", mode: "include" }],
    });
    expect(visible.has(OCC_E1)).toBe(false);
    expect(visible.has(OCC_E2)).toBe(false);
    expect(exclusions.filter((entry) => entry.kind === "relation").map((entry) => entry.reason)).toEqual([
      "not-included",
      "not-included",
    ]);
  });

  it("does not exclude an element that simply lacks the attribute, under an exclude filter", () => {
    const { visible } = evaluate({
      filters: [{ id: "f1", kind: "attribute-equals", attribute: "state", value: "active", mode: "exclude" }],
    });
    expect(visible.has(OCC_A)).toBe(false);
    // C is a container: it has no `state` attribute at all, so it matches the
    // exclude filter not at all and stays.
    expect(visible.has(OCC_C)).toBe(true);
  });
});

describe("decision 3: a collection attribute has items, not a value", () => {
  it("matches when any item equals the filter's value", () => {
    // B carries tags = ["blue", "green"]. The schema comment says the comparison
    // is against "the attribute value's own `value` field", which a collection
    // does not have - this is the reading this package fixes.
    const { visible } = evaluate({
      filters: [{ id: "f1", kind: "attribute-equals", attribute: "tags", value: "green", mode: "include" }],
    });
    expect(visible.has(OCC_B)).toBe(true);
    expect(visible.has(OCC_A)).toBe(false);
  });

  it("does not match an item the collection does not hold", () => {
    const { visible } = evaluate({
      filters: [{ id: "f1", kind: "attribute-equals", attribute: "tags", value: "red", mode: "include" }],
    });
    expect(visible.has(OCC_B)).toBe(false);
  });
});

describe("decision 4: the cascade, reported and never silent", () => {
  it("excludes a relation whose endpoint is hidden, naming the endpoint", () => {
    const { visible, exclusions } = evaluate({
      filters: [{ id: "f1", kind: "entity-type", types: ["container"], mode: "include" }],
    });
    // A and B are gone, so their ports go, and both links lose an endpoint.
    expect(visible.has(OCC_PA)).toBe(false);
    expect(exclusions).toContainEqual({ occurrence: OCC_PA, kind: "port", reason: "owner-hidden", cause: OCC_A });
    const e1 = exclusions.find((entry) => entry.occurrence === OCC_E1);
    expect(e1).toEqual({ occurrence: OCC_E1, kind: "relation", reason: "endpoint-hidden", cause: OCC_PA });
    const e2 = exclusions.find((entry) => entry.occurrence === OCC_E2);
    expect(e2).toEqual({ occurrence: OCC_E2, kind: "relation", reason: "endpoint-hidden", cause: OCC_A });
  });

  it("excludes the members of a collapsed group and nothing else", () => {
    const { visible, exclusions } = evaluate({ collapseGroup: true });
    expect(exclusions).toContainEqual({ occurrence: OCC_A, kind: "entity", reason: "group-collapsed", cause: "g1" });
    // B and C are in no group and stay; A's port and both links follow A.
    expect(visible.has(OCC_B)).toBe(true);
    expect(visible.has(OCC_C)).toBe(true);
    expect(visible.has(OCC_PA)).toBe(false);
  });

  it("conserves every occurrence under the hardest cascade", () => {
    const { view, visible, exclusions } = evaluate({
      filters: [{ id: "f1", kind: "entity-type", types: ["container"], mode: "include" }],
      collapseGroup: true,
    });
    expect(visible.size + exclusions.length).toBe(occurrenceCount(view));
    expect(new Set(exclusions.map((entry) => entry.occurrence)).size).toBe(exclusions.length);
  });

  it("reports an unresolved reference rather than pretending the occurrence is filtered", () => {
    const document = sampleDocument();
    const view = sampleView();
    const entities = { ...document.entities };
    delete (entities as Record<string, unknown>)[OCC_A];
    // Remove the ENTITY the occurrence draws, not the occurrence.
    const broken = { ...document, entities: Object.fromEntries(Object.entries(entities).filter(([key]) => key !== "entity:a")) };
    const { visible, exclusions } = evaluateVisibility({ document: broken as typeof document, view });
    expect(visible.has(OCC_A)).toBe(false);
    expect(exclusions).toContainEqual({
      occurrence: OCC_A,
      kind: "entity",
      reason: "unresolved-reference",
      cause: "entity:a",
    });
  });
});

describe("the reason list", () => {
  // The list is derived from a `Record<ExclusionReason, true>`, so the COMPILER holds
  // its completeness (drop a key and `npm run check` reports TS2741). What is
  // left to assert at runtime is that the derived array really is the seven
  // reasons, sorted - a literal expectation rather than a count, so a reason
  // added without a thought for this file fails here and names itself.
  //
  // The first version of this assertion was `EXCLUSION_REASONS.length).toBe(7)`
  // against a hand-written array, and it went red because the array had SIX
  // entries: `endpoint-hidden`, the reason the cascade exists for, was missing
  // while `satisfies` looked on. That is why the shape changed.
  it("is exactly the declared reasons, sorted and unique", () => {
    expect(EXCLUSION_REASONS).toEqual([
      "endpoint-hidden",
      "filtered-out",
      "geometry-not-finite",
      "group-collapsed",
      "not-included",
      "owner-hidden",
      "unresolved-reference",
    ]);
    expect(new Set(EXCLUSION_REASONS).size).toBe(EXCLUSION_REASONS.length);
  });

  // Not a vacuous list: every reason has a producer some suite of this package
  // actually observes. Five are observed above; the two geometric ones are
  // observed in scene.test.ts, which names them in the same words.
  it("has an observed producer for every reason", () => {
    const observedHere = new Set([
      "endpoint-hidden",
      "filtered-out",
      "group-collapsed",
      "not-included",
      "owner-hidden",
      "unresolved-reference",
    ]);
    const observedInSceneSuite = new Set(["geometry-not-finite", "owner-hidden"]);
    for (const reason of EXCLUSION_REASONS) {
      expect(observedHere.has(reason) || observedInSceneSuite.has(reason), reason).toBe(true);
    }
  });
});
