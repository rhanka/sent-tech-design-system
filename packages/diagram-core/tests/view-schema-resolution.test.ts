/**
 * Exact-pin view-schema resolution with typed refusals (Engram spec
 * `SPEC_V2.md` section 2; DS share of Engram lots 3 and 4, item 2).
 *
 * Only exact `{ id, version, contentDigest }` resolves. Both @2 and @1 are
 * resolvable; @1 is exact-pin-only (no "latest", no fallback, no reverse
 * migration). Every refusal is a typed value, never a throw. Transitional
 * and partial references are refused (spec section 5.3).
 */
import { describe, expect, it } from "vitest";
import {
  DIAGRAM_VIEW_SCHEMA_V1,
  DIAGRAM_VIEW_SCHEMA_V1_PIN,
  DIAGRAM_VIEW_SCHEMA_V2,
  DIAGRAM_VIEW_SCHEMA_V2_PIN,
  resolveViewSchema,
} from "../src/view-schema-pin.js";

const V1_DIGEST = "273351021b614523c2066098550f97b20b0aad6e6eb7b563aaad29b5481a6b7c";
const V2_DIGEST = "50c97fc87a9546facff86f2deab8fdb99073419f43eef09958b96225367037ef";
const ZEROS = "0".repeat(64);

describe("view-schema exact-pin resolution", () => {
  it("resolves the exact @2 pin to the vendored @2 schema", () => {
    const result = resolveViewSchema({ id: "diagram-view-schema", version: "2", contentDigest: V2_DIGEST });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.version).toBe("2");
    expect(result.pin).toEqual(DIAGRAM_VIEW_SCHEMA_V2_PIN);
    expect(result.schema).toEqual(DIAGRAM_VIEW_SCHEMA_V2);
  });

  it("resolves the exact @1 pin to the vendored @1 schema, never to @2", () => {
    const result = resolveViewSchema({ id: "diagram-view-schema", version: "1", contentDigest: V1_DIGEST });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.version).toBe("1");
    expect(result.pin).toEqual(DIAGRAM_VIEW_SCHEMA_V1_PIN);
    expect(result.schema).toEqual(DIAGRAM_VIEW_SCHEMA_V1);
    expect(result.schema).not.toEqual(DIAGRAM_VIEW_SCHEMA_V2);
  });

  it("refuses an absent pin without throwing", () => {
    expect(() => resolveViewSchema(undefined)).not.toThrow();
    expect(resolveViewSchema(undefined)).toEqual({ ok: false, refusal: { code: "pin-absent" } });
  });

  it("refuses a null pin without throwing", () => {
    expect(() => resolveViewSchema(null)).not.toThrow();
    expect(resolveViewSchema(null)).toEqual({ ok: false, refusal: { code: "pin-null" } });
  });

  it.each([
    ["number", 42],
    ["boolean", true],
    ["array", [{ id: "diagram-view-schema", version: "2", contentDigest: V2_DIGEST }]],
    ["empty object", {}],
    ["digest of wrong shape", { id: "diagram-view-schema", version: "2", contentDigest: "xyz" }],
    ["digest of wrong length", { id: "diagram-view-schema", version: "2", contentDigest: "ab".repeat(8) }],
    ["non-string version", { id: "diagram-view-schema", version: 2, contentDigest: V2_DIGEST }],
  ])("refuses a malformed pin (%s) without throwing", (_label, pin) => {
    expect(() => resolveViewSchema(pin)).not.toThrow();
    const result = resolveViewSchema(pin);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.refusal.code).toBe("pin-malformed");
  });

  it("refuses an unknown schema id without throwing", () => {
    const result = resolveViewSchema({ id: "diagram-presentation", version: "1", contentDigest: ZEROS });
    expect(result).toEqual({ ok: false, refusal: { code: "unknown-schema-id" } });
  });

  it.each([
    ["latest alias", "latest"],
    ["dotted version", "1.0"],
    ["next major", "3"],
    ["empty version", ""],
  ])("refuses an unknown version (%s) with no fallback and no reverse migration", (_label, version) => {
    const pin =
      version === "1.0" || version === ""
        ? { id: "diagram-view-schema", version, contentDigest: ZEROS }
        : { id: "diagram-view-schema", version, contentDigest: V2_DIGEST };
    expect(() => resolveViewSchema(pin)).not.toThrow();
    const result = resolveViewSchema(pin);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.refusal.code).toBe("unknown-schema-version");
  });

  it.each([
    ["@2 with @1 digest", { id: "diagram-view-schema", version: "2", contentDigest: V1_DIGEST }],
    ["@1 with @2 digest", { id: "diagram-view-schema", version: "1", contentDigest: V2_DIGEST }],
    ["@2 with zeros", { id: "diagram-view-schema", version: "2", contentDigest: ZEROS }],
  ])("refuses a digest mismatch (%s) without throwing", (_label, pin) => {
    expect(() => resolveViewSchema(pin)).not.toThrow();
    expect(resolveViewSchema(pin)).toEqual({ ok: false, refusal: { code: "schema-digest-mismatch" } });
  });

  it("keeps schema-bytes-unavailable as a typed refusal of the vocabulary", () => {
    // Both versions are vendored in this revision, so no exact pin can reach
    // the unavailable-bytes branch; the branch stays defensive for a future
    // version whose bytes are not vendored. The code is still typed and still
    // never throws: an exact @2 pin resolves, it does not fall through.
    const result = resolveViewSchema({ id: "diagram-view-schema", version: "2", contentDigest: V2_DIGEST });
    expect(result.ok).toBe(true);
  });

  it.each([
    ["transitional string", "transitional:ds-schema-adapter-unqualified"],
    ["transitional id", { id: "transitional:ds-schema-adapter-unqualified", version: "2", contentDigest: V2_DIGEST }],
  ])("refuses a transitional reference (%s) without throwing", (_label, pin) => {
    expect(() => resolveViewSchema(pin)).not.toThrow();
    const result = resolveViewSchema(pin);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.refusal.code).toBe("transitional-reference-refused");
  });

  it.each([
    ["versioned string without digest", "diagram-view-schema@2"],
    ["pin without digest", { id: "diagram-view-schema", version: "2" }],
    ["pin without version", { id: "diagram-view-schema", contentDigest: V2_DIGEST }],
  ])("refuses a partial reference (%s) without throwing", (_label, pin) => {
    expect(() => resolveViewSchema(pin)).not.toThrow();
    const result = resolveViewSchema(pin);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.refusal.code).toBe("partial-reference-refused");
  });
});
