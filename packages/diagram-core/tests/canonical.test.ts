/**
 * Canonical serialisation and content hashing.
 *
 * The inverse tests are only as strong as this: if the serialisation depended on
 * insertion order, or turned a function into `null`, "byte for byte" would mean
 * nothing.
 */
import { describe, expect, it } from "vitest";

import {
  CanonicalisationError,
  HASH_ALGORITHM,
  canonicalise,
  createDocument,
  createState,
  createView,
  documentRef,
  GENERIC_PROFILE_ID,
  hashContent,
  isHashOf,
  serialiseContent,
  serialiseState,
  tryCanonicalise,
  viewRef,
} from "../src/index.js";
import { readFixture, stateOf } from "./fixtures.js";

describe("canonical JSON", () => {
  it("sorts object keys and writes no whitespace", () => {
    expect(canonicalise({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it("is insensitive to insertion order, which is what makes an inverse comparable", () => {
    const left = canonicalise({ alpha: [1, 2], beta: { x: 1, y: 2 } });
    const right = canonicalise({ beta: { y: 2, x: 1 }, alpha: [1, 2] });
    expect(left).toBe(right);
  });

  it("keeps array order, because a list's order IS content", () => {
    expect(canonicalise([3, 1, 2])).toBe("[3,1,2]");
  });

  it("writes -0 and 0 identically", () => {
    expect(canonicalise({ value: -0 })).toBe(canonicalise({ value: 0 }));
  });

  it("omits an undefined member exactly as an absent one", () => {
    expect(canonicalise({ a: 1, b: undefined })).toBe(canonicalise({ a: 1 }));
  });

  it("writes an absent array member as null, since the length is content", () => {
    expect(canonicalise([1, undefined, 3])).toBe("[1,null,3]");
  });

  it("refuses a function instead of silently dropping it", () => {
    const refused = tryCanonicalise({ run: () => 1 }, "$");
    expect(refused.ok).toBe(false);
    if (refused.ok) throw new Error("unreachable");
    expect(refused.diagnostics[0]?.code).toBe("value-not-serialisable");
    expect(refused.diagnostics[0]?.path).toBe("$.run");
    expect(refused.diagnostics[0]?.details).toEqual({ valueType: "function" });
  });

  it("refuses NaN, Infinity, a BigInt, a symbol and a cycle, each with a path", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic["self"] = cyclic;
    for (const [value, code] of [
      [{ n: Number.NaN }, "value-not-finite"],
      [{ n: Number.POSITIVE_INFINITY }, "value-not-finite"],
      [{ n: 1n }, "value-not-serialisable"],
      [{ n: Symbol("x") }, "value-not-serialisable"],
      [cyclic, "value-not-serialisable"],
    ] as const) {
      const refused = tryCanonicalise(value, "$");
      expect(refused.ok).toBe(false);
      if (refused.ok) throw new Error("unreachable");
      expect(refused.diagnostics[0]?.code).toBe(code);
    }
  });

  it("throws CanonicalisationError where a refusal would be a bug", () => {
    expect(() => canonicalise({ run: () => 1 })).toThrow(CanonicalisationError);
  });

  it("normalises revisions in serialiseContent, and only there", () => {
    const state = stateOf(readFixture("valid/generic-state.json"));
    expect(serialiseState(state)).toContain('"revision":4');
    expect(serialiseContent(state)).not.toContain('"revision":4');
    expect(serialiseContent(state)).toContain('"revision":0');
    // Two states differing ONLY by revision have the same content bytes...
    const bumped = { ...state, document: { ...state.document, revision: 99 } };
    expect(serialiseContent(bumped)).toBe(serialiseContent(state));
    // ... and different full bytes.
    expect(serialiseState(bumped)).not.toBe(serialiseState(state));
  });

  it("serialises an empty state stably", () => {
    const document = createDocument({ documentId: documentRef("empty"), profileRefs: [GENERIC_PROFILE_ID] });
    const state = createState(document, [
      createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
    ]);
    expect(serialiseState(state)).toBe(
      '{"document":{"documentId":"document:empty","entities":{},"extensions":[],"ports":{},' +
        '"profileRefs":["generic@1"],"relations":{},"resources":{},"revision":0,' +
        '"schemaVersion":{"major":1,"minor":1},"typeDefinitions":{}},' +
        '"views":{"view:v":{"entityOccurrences":{},"filters":[],"groups":{},"portOccurrences":{},' +
        '"presentation":{"camera":{"x":0,"y":0,"zoom":1}},"relationOccurrences":{},"revision":0,' +
        '"semanticDocumentId":"document:empty","viewId":"view:v"}}}',
    );
  });
});

describe("content hashing", () => {
  it("names its algorithm in the value", () => {
    expect(hashContent("x").startsWith(`${HASH_ALGORITHM}:`)).toBe(true);
    expect(hashContent("x")).toMatch(/^fnv1a64:[0-9a-f]{16}$/);
  });

  it("is stable, and changes when the content changes", () => {
    expect(hashContent("abc")).toBe(hashContent("abc"));
    expect(hashContent("abc")).not.toBe(hashContent("abd"));
    expect(isHashOf("abc", hashContent("abc"))).toBe(true);
    expect(isHashOf("abd", hashContent("abc"))).toBe(false);
  });

  it("hashes UTF-8 bytes, including astral code points", () => {
    // Different code points must not collide through a lossy encoding step.
    expect(hashContent("é")).not.toBe(hashContent("e"));
    expect(hashContent("𝄞")).not.toBe(hashContent("?"));
    expect(hashContent("")).toBe("fnv1a64:cbf29ce484222325");
  });
});
