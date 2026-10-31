/**
 * Engram diagram-view-schema@2 private frozen record: digest gate and
 * byte identity (DS share of Engram lots 3 and 4, item 1).
 *
 * The record lives in `src/view-schema-pin.ts`, beside the presentation
 * catalog, and is NOT exported from the package entry. Both schemas are
 * vendored as data (exact JSON values of the canonical files). This test
 * recomputes `sha256Hex(canonicalBytes(schema))` at test time and compares
 * it with the stored digest, the Pin and the Engram literal, and asserts the
 * vendored bytes equal the canonical fixture files byte for byte.
 *
 * Engram source (read-only): graphify@310a9270
 * `src/ontology-guardian/diagram-schemas.ts`, `canonical.ts`.
 * DS pattern: `src/presentation.ts:185-228`, `presentation-catalog.ts`,
 * `tests/presentation-catalog-pin.test.ts`, `src/sha256.ts`.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import * as core from "../src/index.js";
import { canonicalBytes, sha256Hex } from "../src/sha256.js";
import {
  DIAGRAM_VIEW_SCHEMA_ID,
  DIAGRAM_VIEW_SCHEMA_V1,
  DIAGRAM_VIEW_SCHEMA_V1_DIGEST,
  DIAGRAM_VIEW_SCHEMA_V1_PIN,
  DIAGRAM_VIEW_SCHEMA_V2,
  DIAGRAM_VIEW_SCHEMA_V2_DIGEST,
  DIAGRAM_VIEW_SCHEMA_V2_PIN,
} from "../src/view-schema-pin.js";

const V1_LITERAL = "273351021b614523c2066098550f97b20b0aad6e6eb7b563aaad29b5481a6b7c";
const V2_LITERAL = "50c97fc87a9546facff86f2deab8fdb99073419f43eef09958b96225367037ef";
const FIXTURE_V1 = new URL("./fixtures/diagram-view-schema-1-27335102.json", import.meta.url);
const FIXTURE_V2 = new URL("./fixtures/diagram-view-schema-2-50c97fc8.json", import.meta.url);

function expectDeepFrozen(value: unknown): void {
  if (value === null || typeof value !== "object") return;
  expect(Object.isFrozen(value)).toBe(true);
  for (const child of Object.values(value)) expectDeepFrozen(child);
}

function summaryOf(schema: Record<string, unknown>): Record<string, unknown> {
  const properties = schema["properties"] as Record<string, unknown>;
  const summaryLabels = properties["summaryLabels"] as Record<string, unknown>;
  return summaryLabels["additionalProperties"] as Record<string, unknown>;
}

describe("view-schema frozen record digest gate", () => {
  it("recomputes the @2 digest and matches the stored digest, the Pin and the Engram literal", () => {
    expect(DIAGRAM_VIEW_SCHEMA_ID).toBe("diagram-view-schema");
    const recomputed = sha256Hex(canonicalBytes(DIAGRAM_VIEW_SCHEMA_V2));
    expect(recomputed).toBe(DIAGRAM_VIEW_SCHEMA_V2_DIGEST);
    expect(recomputed).toBe(DIAGRAM_VIEW_SCHEMA_V2_PIN.contentDigest);
    expect(recomputed).toBe(V2_LITERAL);
    expect(DIAGRAM_VIEW_SCHEMA_V2_PIN).toEqual({
      id: "diagram-view-schema",
      version: "2",
      contentDigest: V2_LITERAL,
    });
    expect((DIAGRAM_VIEW_SCHEMA_V2 as Record<string, unknown>)["$id"]).toBe("engram:diagram-view-schema/2");
  });

  it("recomputes the @1 digest and matches the stored digest, the Pin and the Engram literal", () => {
    const recomputed = sha256Hex(canonicalBytes(DIAGRAM_VIEW_SCHEMA_V1));
    expect(recomputed).toBe(DIAGRAM_VIEW_SCHEMA_V1_DIGEST);
    expect(recomputed).toBe(DIAGRAM_VIEW_SCHEMA_V1_PIN.contentDigest);
    expect(recomputed).toBe(V1_LITERAL);
    expect(DIAGRAM_VIEW_SCHEMA_V1_PIN).toEqual({
      id: "diagram-view-schema",
      version: "1",
      contentDigest: V1_LITERAL,
    });
    expect((DIAGRAM_VIEW_SCHEMA_V1 as Record<string, unknown>)["$id"]).toBe("engram:diagram-view-schema/1");
  });

  it("holds vendored bytes byte-for-byte equal to the canonical fixture files", () => {
    const rawV1 = readFileSync(FIXTURE_V1, "utf8");
    const rawV2 = readFileSync(FIXTURE_V2, "utf8");
    expect(canonicalBytes(DIAGRAM_VIEW_SCHEMA_V1)).toBe(rawV1);
    expect(canonicalBytes(DIAGRAM_VIEW_SCHEMA_V2)).toBe(rawV2);
    expect(createHash("sha256").update(rawV1, "utf8").digest("hex")).toBe(V1_LITERAL);
    expect(createHash("sha256").update(rawV2, "utf8").digest("hex")).toBe(V2_LITERAL);
    expect(JSON.parse(rawV1)).toEqual(DIAGRAM_VIEW_SCHEMA_V1);
    expect(JSON.parse(rawV2)).toEqual(DIAGRAM_VIEW_SCHEMA_V2);
  });

  it("keeps the exact four-path @1/@2 delta and an unchanged presentation subtree", () => {
    const v1 = summaryOf(DIAGRAM_VIEW_SCHEMA_V1 as unknown as Record<string, unknown>);
    const v2 = summaryOf(DIAGRAM_VIEW_SCHEMA_V2 as unknown as Record<string, unknown>);
    expect(v1["required"]).toEqual(["sourceOccurrence", "targetOccurrence", "label", "relationIds"]);
    expect(v2["required"]).toEqual(["id", "sourceOccurrence", "targetOccurrence", "label", "relationIds"]);
    const v1Props = v1["properties"] as Record<string, unknown>;
    const v2Props = v2["properties"] as Record<string, unknown>;
    expect(v1Props["label"]).toEqual({ type: "string", minLength: 1 });
    expect(v2Props["label"]).toEqual({ type: "string" });
    expect("relationOccurrences" in v1Props).toBe(false);
    expect(v2Props["relationOccurrences"]).toEqual({ type: "array", items: { type: "string" } });
    const v1Root = DIAGRAM_VIEW_SCHEMA_V1 as unknown as Record<string, unknown>;
    const v2Root = DIAGRAM_VIEW_SCHEMA_V2 as unknown as Record<string, unknown>;
    const v1PropsRoot = v1Root["properties"] as Record<string, unknown>;
    const v2PropsRoot = v2Root["properties"] as Record<string, unknown>;
    expect(v2PropsRoot["presentation"]).toEqual(v1PropsRoot["presentation"]);
  });

  it("keeps every vendored value deeply frozen with detached copies", () => {
    expectDeepFrozen(DIAGRAM_VIEW_SCHEMA_V1);
    expectDeepFrozen(DIAGRAM_VIEW_SCHEMA_V2);
    expectDeepFrozen(DIAGRAM_VIEW_SCHEMA_V1_PIN);
    expectDeepFrozen(DIAGRAM_VIEW_SCHEMA_V2_PIN);
    expect(() => Object.assign(DIAGRAM_VIEW_SCHEMA_V1_PIN, { version: "9" })).toThrow();
    expect(() => Object.assign(DIAGRAM_VIEW_SCHEMA_V2, { $id: "mutated" })).toThrow();
  });

  it("stays private: nothing from the record is exported from the package entry", () => {
    expect(core).not.toHaveProperty("DIAGRAM_VIEW_SCHEMA_V1");
    expect(core).not.toHaveProperty("DIAGRAM_VIEW_SCHEMA_V2");
    expect(core).not.toHaveProperty("DIAGRAM_VIEW_SCHEMA_V1_PIN");
    expect(core).not.toHaveProperty("DIAGRAM_VIEW_SCHEMA_V2_PIN");
    expect(core).not.toHaveProperty("resolveViewSchema");
    expect(core).not.toHaveProperty("resolveGovernedCatalog");
  });
});
