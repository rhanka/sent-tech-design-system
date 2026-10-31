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
import { resolveGovernedCatalog } from "../src/presentation-catalog.js";
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
    const v1Diagram = ((v1PropsRoot["presentation"] as Record<string, unknown>)["properties"] as Record<string, unknown>)[
      "diagram"
    ] as Record<string, unknown>;
    const v2Diagram = ((v2PropsRoot["presentation"] as Record<string, unknown>)["properties"] as Record<string, unknown>)[
      "diagram"
    ] as Record<string, unknown>;
    const contractDiagram = core.DIAGRAM_PRESENTATION_SCHEMA as unknown as Record<string, unknown>;
    expect(v1Diagram["properties"]).toEqual(contractDiagram["properties"]);
    expect(v1Diagram["required"]).toEqual(contractDiagram["required"]);
    expect(v2Diagram["properties"]).toEqual(contractDiagram["properties"]);
    expect(v2Diagram["required"]).toEqual(contractDiagram["required"]);
  });

  it("keeps every vendored value deeply frozen with detached copies", () => {
    expectDeepFrozen(DIAGRAM_VIEW_SCHEMA_V1);
    expectDeepFrozen(DIAGRAM_VIEW_SCHEMA_V2);
    expectDeepFrozen(DIAGRAM_VIEW_SCHEMA_V1_PIN);
    expectDeepFrozen(DIAGRAM_VIEW_SCHEMA_V2_PIN);
    expect(() => Object.assign(DIAGRAM_VIEW_SCHEMA_V1_PIN, { version: "9" })).toThrow();
    expect(() => Object.assign(DIAGRAM_VIEW_SCHEMA_V2, { $id: "mutated" })).toThrow();
  });

  it("binds every receipt hash to the tree so the receipt cannot drift", () => {
    const receiptUrl = new URL("../view-schema-pin-receipt.json", import.meta.url);
    const receipt = JSON.parse(readFileSync(receiptUrl, "utf8")) as {
      viewSchema: {
        v1: { version: string; $id: string; contentDigest: string; bytesDigest: string; fixture: string };
        v2: { version: string; $id: string; contentDigest: string; bytesDigest: string; fixture: string };
        record: string;
        recordSha256: string;
      };
      dsRevision: { files: Record<string, string> };
      presentation: { entryDigest: string; applySha256: string; validateSha256: string };
      witnesses: string[];
      reusedEvidence: string[];
    };
    const repoRoot = new URL("../../", receiptUrl);
    const repoFile = (relative: string): string => readFileSync(new URL(relative, repoRoot), "utf8");
    const sha256Of = (relative: string): string => createHash("sha256").update(repoFile(relative), "utf8").digest("hex");

    // No legacy "sid" key survives beside "$id".
    expect("sid" in (receipt.viewSchema.v1 as unknown as Record<string, unknown>)).toBe(false);
    expect("sid" in (receipt.viewSchema.v2 as unknown as Record<string, unknown>)).toBe(false);
    expect(receipt.viewSchema.v1.$id).toBe("engram:diagram-view-schema/1");
    expect(receipt.viewSchema.v2.$id).toBe("engram:diagram-view-schema/2");

    // Schema digests match the vendored bytes and the canonical fixtures.
    for (const [key, schema] of [
      ["v1", DIAGRAM_VIEW_SCHEMA_V1],
      ["v2", DIAGRAM_VIEW_SCHEMA_V2],
    ] as const) {
      const entry = receipt.viewSchema[key];
      expect(entry.contentDigest).toBe(sha256Hex(canonicalBytes(schema)));
      expect(entry.bytesDigest).toBe(sha256Hex(canonicalBytes(schema)));
      const rawFixture = repoFile(entry.fixture);
      expect(canonicalBytes(schema)).toBe(rawFixture);
      expect(createHash("sha256").update(rawFixture, "utf8").digest("hex")).toBe(entry.contentDigest);
      expect((schema as Record<string, unknown>)["$id"]).toBe(entry.$id);
    }

    // Record file, DS revision files and presentation files match their hashes.
    expect(sha256Of(receipt.viewSchema.record)).toBe(receipt.viewSchema.recordSha256);
    for (const [relative, digest] of Object.entries(receipt.dsRevision.files)) {
      expect(sha256Of(relative)).toBe(digest);
    }
    expect(sha256Of("packages/diagram-core/src/presentation-apply.ts")).toBe(receipt.presentation.applySha256);
    expect(sha256Of("packages/diagram-core/src/presentation-validate.ts")).toBe(receipt.presentation.validateSha256);
    expect(sha256Hex(canonicalBytes(resolveGovernedCatalog().entry))).toBe(receipt.presentation.entryDigest);

    // Every witness, reused-evidence and fixture file exists.
    for (const relative of [
      ...receipt.witnesses,
      ...receipt.reusedEvidence,
      receipt.viewSchema.v1.fixture,
      receipt.viewSchema.v2.fixture,
      receipt.viewSchema.record,
      ...Object.keys(receipt.dsRevision.files),
    ]) {
      expect(() => repoFile(relative), `missing receipt file: ${relative}`).not.toThrow();
    }
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
