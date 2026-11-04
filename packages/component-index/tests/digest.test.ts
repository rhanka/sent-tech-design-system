import { describe, expect, it } from "vitest";

import { canonicalizeJson, entryDigest, taggedDigest } from "../src/generator/digest.js";

// Frozen spec section 5.5 vectors, copied verbatim. V2a is the key-reordered
// twin of V1 and must collide; V3a/V3b differ only by array order and must
// differ. V1/V2a/V6 embed the frozen producer "sentropic-ds" (digests
// d1720794... / 62d91275...); V3a/V3b/V4/V5 embed no frozen-changed input
// and are byte-identical to the predecessor session values.
const V1 = { componentId: "button", delivery: [], producerId: "sentropic-ds", renderable: "doc-only" };
const V1_DIGEST = "sha256:d172079430459701ece33f43537a0fdcb87a6b6a2a153624d164027fd8cb791c";
const V1_CANONICAL =
  '{"componentId":"button","delivery":[],"producerId":"sentropic-ds","renderable":"doc-only"}';

const V2A = { renderable: "doc-only", producerId: "sentropic-ds", delivery: [], componentId: "button" };

const V3A = { channels: ["source", "esm"] };
const V3A_DIGEST = "sha256:4a81552e15f6b04f945c8276851892616cbee590a880743e355511f813070769";
const V3B = { channels: ["esm", "source"] };
const V3B_DIGEST = "sha256:678393c4da182fc5c8cad3edd1965861487c6a51b01698b7622640e4c18b4c5a";

const V4 = { description: { en: "Generic layered 2D map", fr: "Carte géographique — été, où, façade" } };
const V4_DIGEST = "sha256:69017334df2ca9e73268eb848f7c08cecfbf7bdc95e6bf0b889ef8f07b2ef461";

const V5 = {
  contract: { source: "published", version: "1.0" },
  limits: { max: 100, ratio: 2.5 },
  flags: { stable: true, note: null },
};
const V5_CANONICAL =
  '{"contract":{"source":"published","version":"1.0"},"flags":{"note":null,"stable":true},"limits":{"max":100,"ratio":2.5}}';
const V5_DIGEST = "sha256:7c67b8b3f504547d3fa216f4de4d582af8d1645e2ad9720bd3695d32db376a06";

// V6 digests the intent shape only (section 5.5): no servable entry, the
// delivery file digest is absent because the file does not exist on
// origin/main.
const V6 = {
  producerId: "sentropic-ds",
  componentId: "geo-map",
  displayName: "GeoMap",
  renderable: "doc-only",
  delivery: [
    {
      channel: "source",
      framework: "svelte",
      package: "@sentropic/design-system-geo-svelte",
      version: "0.0.0",
      path: "packages/components-geo-svelte/src/index.ts",
    },
  ],
  frameworks: ["svelte"],
};
const V6_CANONICAL =
  '{"componentId":"geo-map","delivery":[{"channel":"source","framework":"svelte","package":"@sentropic/design-system-geo-svelte","path":"packages/components-geo-svelte/src/index.ts","version":"0.0.0"}],"displayName":"GeoMap","frameworks":["svelte"],"producerId":"sentropic-ds","renderable":"doc-only"}';
const V6_DIGEST = "sha256:62d91275fe271f0c4959119af54954421327013366582813549ccdc9250c80ef";

const ENTRY_TAG = "sentropic.ds.component-entry/v1";

describe("spec section 5.5 vectors", () => {
  it("V1 canonical form and digest match byte-for-byte", () => {
    expect(canonicalizeJson(V1)).toBe(V1_CANONICAL);
    expect(taggedDigest(V1, ENTRY_TAG)).toBe(V1_DIGEST);
    expect(entryDigest(V1)).toBe(V1_DIGEST);
  });

  it("V2a (key order) collides with V1", () => {
    expect(canonicalizeJson(V2A)).toBe(V1_CANONICAL);
    expect(taggedDigest(V2A, ENTRY_TAG)).toBe(V1_DIGEST);
  });

  it("V3a and V3b differ by array order only", () => {
    expect(canonicalizeJson(V3A)).toBe('{"channels":["source","esm"]}');
    expect(canonicalizeJson(V3B)).toBe('{"channels":["esm","source"]}');
    expect(taggedDigest(V3A, ENTRY_TAG)).toBe(V3A_DIGEST);
    expect(taggedDigest(V3B, ENTRY_TAG)).toBe(V3B_DIGEST);
    expect(taggedDigest(V3A, ENTRY_TAG)).not.toBe(taggedDigest(V3B, ENTRY_TAG));
  });

  it("V4 unicode digest matches", () => {
    expect(taggedDigest(V4, ENTRY_TAG)).toBe(V4_DIGEST);
  });

  it("V5 nesting digest matches with sorted keys", () => {
    expect(canonicalizeJson(V5)).toBe(V5_CANONICAL);
    expect(taggedDigest(V5, ENTRY_TAG)).toBe(V5_DIGEST);
  });

  it("V6 entry-shaped digest matches", () => {
    expect(canonicalizeJson(V6)).toBe(V6_CANONICAL);
    expect(taggedDigest(V6, ENTRY_TAG)).toBe(V6_DIGEST);
  });
});

describe("digest properties", () => {
  it("key permutation never changes a digest on the fixture set", () => {
    const fixtures: unknown[] = [V1, V3A, V4, V5, V6];
    for (const fixture of fixtures) {
      const before = taggedDigest(fixture, ENTRY_TAG);
      const permuted = reverseKeys(fixture);
      expect(taggedDigest(permuted, ENTRY_TAG)).toBe(before);
    }
  });

  it("array order always changes a digest", () => {
    expect(taggedDigest({ a: [1, 2] }, ENTRY_TAG)).not.toBe(taggedDigest({ a: [2, 1] }, ENTRY_TAG));
  });

  it("rejects non-finite numbers", () => {
    expect(() => canonicalizeJson({ v: Number.NaN })).toThrow();
    expect(() => canonicalizeJson({ v: Number.POSITIVE_INFINITY })).toThrow();
  });

  it("entry and index tags never collide on the same value", () => {
    const value = { componentId: "button" };
    expect(taggedDigest(value, ENTRY_TAG)).not.toBe(
      taggedDigest(value, "sentropic.ds.component-index/v1"),
    );
  });
});

// Reverses every object's key order recursively (arrays keep order).
function reverseKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reverseKeys);
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>).reverse();
    return Object.fromEntries(entries.map(([k, v]) => [k, reverseKeys(v)]));
  }
  return value;
}
