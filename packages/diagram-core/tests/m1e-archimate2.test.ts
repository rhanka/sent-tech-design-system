/**
 * M1-e RED: archimate@2 completed declaration (spec §3.9.2, A.4).
 * Fails on the base commit: archimate@2 does not exist there.
 */
import { describe, expect, it } from "vitest";

import {
  archimate2Profile,
  canonicalBytes,
  contentDiagramDigest,
  contentDiagramPreimage,
  sha256Hex,
} from "../src/index.js";

describe("archimate@2 declaration", () => {
  it("reproduces content 1ffa38c1 and artifact b7dd36d5", () => {
    expect(contentDiagramDigest(archimate2Profile)).toBe(
      "1ffa38c1169b43d932b7c6d69cea24b52dd753f0f4e14eb43f6e83746cce1189",
    );
    expect(sha256Hex(canonicalBytes(archimate2Profile))).toBe(
      "b7dd36d534e1aceb42d2aff433a1988f462a9eeaefe58bc541a3d6936a95b267",
    );
    expect(canonicalBytes(contentDiagramPreimage(archimate2Profile)).length).toBe(1047531);
  });

  it("declares 62 entity types and 12 relation types with the matrix", () => {
    expect(archimate2Profile.completeness).toBe("complete");
    expect(archimate2Profile.entityTypes).toHaveLength(62);
    expect(archimate2Profile.entityTypes[0]).toMatchObject({ id: "element", abstract: true });
    expect(archimate2Profile.relationTypes).toHaveLength(12);
    const matrix = archimate2Profile.constraints.find((c) => c.kind === "relationship-matrix") as {
      kind: "relationship-matrix";
      matrixId: string;
      tuples: readonly unknown[];
    };
    expect(matrix.matrixId).toBe("archimate-3.2");
    expect(matrix.tuples).toHaveLength(11569);
    expect(archimate2Profile.limits).toEqual({ maxEndpointsPerRelation: 2 });
  });

  it("reproduces the A.1 catalogue and tuple oracles", async () => {
    const { ARCHIMATE_CATALOGUE, expandArchimateTuples } = await import("../src/index.js");
    expect(ARCHIMATE_CATALOGUE).toHaveLength(61);
    expect(canonicalBytes(ARCHIMATE_CATALOGUE.map((c) => ({ aspect: c.aspect, id: c.id, layer: c.layer, name: c.name })))).toHaveLength(5280);
    expect(sha256Hex(canonicalBytes(ARCHIMATE_CATALOGUE.map((c) => ({ aspect: c.aspect, id: c.id, layer: c.layer, name: c.name }))))).toBe(
      "114cdca0c1e538f9cedf09613f415a6464bc9f4f54471c62ecfafcf6fede916e",
    );
    const tuples = expandArchimateTuples();
    expect(tuples).toHaveLength(11569);
    expect(canonicalBytes(tuples)).toHaveLength(1027156);
    expect(sha256Hex(canonicalBytes(tuples))).toBe(
      "a13f4112164afd177923a67b424d4c9b6ee57c1b993c4d11c94d5227385267f9",
    );
  });

  it("holds the A.1 pair witnesses", async () => {
    const { expandArchimateTuples } = await import("../src/index.js");
    const tuples = expandArchimateTuples();
    const allows = (r: string, s: string, t: string): boolean =>
      tuples.some((x) => x.relationType === r && x.sourceType === s && x.targetType === t);
    expect(allows("access", "application-component", "data-object")).toBe(true);
    expect(allows("access", "data-object", "application-component")).toBe(false);
    expect(allows("association", "data-object", "application-component")).toBe(true);
  });
});
