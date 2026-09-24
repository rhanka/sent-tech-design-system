/**
 * The valid fixtures: the complete `generic@1` state and one PARTIAL
 * qualification document per declared skeleton profile.
 *
 * "Valid" here means: zero error diagnostics, canonically serialisable, and -
 * for the skeletons - validated by the same machinery as the complete profile,
 * which is exactly what "ossature de validation" (SPEC 3.3) asks for and all it
 * asks for. None of these fixtures is evidence of BPMN, ArchiMate or UML
 * conformance.
 */
import { describe, expect, it } from "vitest";

import {
  defaultProfileRegistry,
  formatDiagnostics,
  occurrencesOfEntity,
  serialiseState,
  tryCanonicalise,
  validateDocument,
  validateState,
} from "../src/index.js";
import { distinctErrorCodes, expectedCodes, readFixture, stateOf } from "./fixtures.js";

const registry = defaultProfileRegistry;

describe("generic@1 reference state", () => {
  const fixture = readFixture("valid/generic-state.json");
  const state = stateOf(fixture);

  it("validates with no diagnostic at all", () => {
    const diagnostics = validateState(state, { registry });
    expect(formatDiagnostics(diagnostics)).toBe("");
  });

  it("draws one entity twice in one view and once in another (study invariant 2)", () => {
    const main = state.views["view:main"] as NonNullable<(typeof state.views)[string]>;
    const detail = state.views["view:detail"] as NonNullable<(typeof state.views)[string]>;
    expect(occurrencesOfEntity(main, "entity:alpha" as never).map((occurrence) => occurrence.id)).toEqual([
      "occurrence:alpha-1",
      "occurrence:alpha-2",
    ]);
    expect(occurrencesOfEntity(detail, "entity:alpha" as never)).toHaveLength(1);
    // ... and the entity itself exists exactly once.
    expect(Object.keys(state.document.entities).filter((key) => key === "entity:alpha")).toHaveLength(1);
  });

  it("keeps one business id for a three-member hyperrelation", () => {
    const triple = state.document.relations["relation:triple"] as NonNullable<
      (typeof state.document.relations)[string]
    >;
    expect(triple.endpoints).toHaveLength(3);
    expect(new Set(triple.endpoints.map((endpoint) => endpoint.role))).toEqual(new Set(["member"]));
    expect(triple.id).toBe("relation:triple");
  });

  it("serialises canonically, with sorted keys and no whitespace", () => {
    const text = serialiseState(state);
    expect(text.startsWith('{"document":{"documentId":"document:d1"')).toBe(true);
    expect(text).not.toMatch(/\n| {2}/);
    // Deterministic: the same content produces the same bytes.
    expect(serialiseState(state)).toBe(text);
  });
});

describe("declared skeleton profiles", () => {
  for (const [name, file] of [
    ["bpmn@1", "valid/bpmn-skeleton-document.json"],
    ["archimate@1", "valid/archimate-skeleton-document.json"],
    ["uml@1", "valid/uml-skeleton-document.json"],
  ] as const) {
    it(`${name}: its partial fixture validates through the same machinery`, () => {
      const fixture = readFixture(file);
      const document = stateOf(fixture).document;
      expect(formatDiagnostics(validateDocument(document, { registry }))).toBe("");
      expect(tryCanonicalise(document).ok).toBe(true);
      // The profile says of ITSELF that it is a skeleton.
      expect(registry.get(document.profileRefs[0] as never)?.completeness).toBe("skeleton");
    });
  }
});

describe("divergent revisions", () => {
  it("refuses a view stamped ahead of its document", () => {
    const fixture = readFixture("revisions/view-ahead-of-document.json");
    const diagnostics = validateState(stateOf(fixture), { registry });
    expect(distinctErrorCodes(diagnostics)).toEqual(expectedCodes(fixture));
    const divergence = diagnostics.find((entry) => entry.code === "revision-divergence");
    expect(divergence?.details).toEqual({ viewRevision: 9, documentRevision: 3 });
  });
});
