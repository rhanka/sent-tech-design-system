/**
 * M1-e RED: uml@2 completed declaration (spec §3.11.1, A.4).
 * Fails on the base commit: uml@2 does not exist there.
 */
import { describe, expect, it } from "vitest";

import {
  canonicalBytes,
  contentDiagramDigest,
  contentDiagramPreimage,
  sha256Hex,
  uml2Profile,
} from "../src/index.js";

describe("uml@2 declaration", () => {
  it("reproduces content d7da59f2 and artifact ab6cf4de", () => {
    expect(contentDiagramDigest(uml2Profile)).toBe(
      "d7da59f277c0f4216a32c201dacdb837270e687ef5d8b1838f00f083e14f9e96",
    );
    expect(sha256Hex(canonicalBytes(uml2Profile))).toBe(
      "ab6cf4de23ad003f376239a23a0bae3adec929b7866edb1e0adeaa4156cdba41",
    );
    expect(canonicalBytes(contentDiagramPreimage(uml2Profile)).length).toBe(5068);
  });

  it("holds the §3.11 declaration recipe", () => {
    expect(uml2Profile.completeness).toBe("complete");
    const byId = new Map(uml2Profile.entityTypes.map((t) => [t.id, t] as const));
    expect([...byId.keys()].sort()).toEqual(
      ["class", "interface", "multiplicity", "operation", "package", "property", "stereotype"].sort(),
    );
    const multiplicity = byId.get("multiplicity");
    expect(multiplicity).toMatchObject({ abstract: true });
    expect(
      multiplicity?.attributes.find((a) => a.name === "lower"),
    ).toMatchObject({ kind: "quantity", required: true, integer: true, min: 0, max: 9007199254740991 });
    expect(
      multiplicity?.attributes.find((a) => a.name === "upper"),
    ).toMatchObject({ kind: "quantity", required: true, integer: true, min: -1, max: 9007199254740991 });
    expect(uml2Profile.constraints).toContainEqual({
      kind: "bound-pair",
      valueType: "multiplicity",
      lowerField: "lower",
      upperField: "upper",
      unboundedUpper: -1,
    });
    expect(uml2Profile.constraints).toContainEqual({
      kind: "at-most-value",
      relationType: "association",
      attributes: ["sourceAggregation", "targetAggregation"],
      value: "composite",
      max: 1,
    });
    expect(uml2Profile.constraints).toContainEqual({
      kind: "collection-unique",
      entityType: "stereotype",
      attribute: "extends",
    });
    const stereotype = byId.get("stereotype");
    expect(stereotype?.attributes.find((a) => a.name === "extends")).toMatchObject({ minItems: 1, maxItems: 5 });
  });
});
