/**
 * AC-L1 witness for the canonical ordering (§5.1): keys and `$defs` sorted,
 * so a regeneration without a type change produces no diff.
 *
 * RED HISTORY (observed before the implementation existed, 2026-10-30):
 * `src/generator/canonical.js` was not a resolvable module.
 */
import { describe, expect, it } from "vitest";

import { canonicalize, stableStringify } from "../src/generator/canonical.js";

describe("canonicalize", () => {
  it("sorts object keys recursively", () => {
    expect(canonicalize({ b: 1, a: { d: 2, c: 3 } })).toEqual({ a: { c: 3, d: 2 }, b: 1 });
    expect(Object.keys(canonicalize({ $defs: {}, components: {}, $id: "", $schema: "" }) as Record<string, unknown>)).toEqual([
      "$defs",
      "$id",
      "$schema",
      "components",
    ]);
  });

  it("sorts string-only arrays (required, enum) but leaves structural arrays in order", () => {
    expect(canonicalize({ required: ["b", "a"] })).toEqual({ required: ["a", "b"] });
    expect(canonicalize({ enum: ["log", "linear"] })).toEqual({ enum: ["linear", "log"] });
    // allOf / oneOf are ORDERED compositions: their order is part of the form.
    const structural = { allOf: [{ unevaluatedProperties: false }, { type: "object" }] };
    expect(canonicalize(structural)).toEqual(structural);
    // A tuple's item schemas keep their positions.
    const points = { points: [{ y: { type: "number" }, x: { type: "number" } }] };
    expect(canonicalize(points)).toEqual(points);
  });

  it("sorts $defs (§5.1: keys and $defs)", () => {
    const input = { $defs: { zeta: { type: "string" }, alpha: { type: "number" } } };
    expect(Object.keys((canonicalize(input) as { $defs: Record<string, unknown> }).$defs)).toEqual(["alpha", "zeta"]);
  });

  it("leaves scalars and empty containers untouched", () => {
    expect(canonicalize(42)).toBe(42);
    expect(canonicalize(null)).toBe(null);
    expect(canonicalize([3, 1, 2])).toEqual([3, 1, 2]);
    expect(canonicalize({})).toEqual({});
  });
});

describe("stableStringify", () => {
  it("is key-order-insensitive and formatted for committed artifacts", () => {
    const a = stableStringify({ b: 1, a: 2 });
    const b = stableStringify({ a: 2, b: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{\n  "a": 2,\n  "b": 1\n}\n');
  });
});
