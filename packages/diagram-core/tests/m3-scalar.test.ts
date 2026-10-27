/**
 * M3 §5.8 — scalar and structured validation.
 *
 * Text gains `minLength`/`pattern`/`patternName` with qualification refusals
 * (invalid, non-anchored, non-compiling or non-ASCII pattern, missing
 * patternName, minLength above maxLength) and the maxLength-first check order.
 * Quantity gains `integer`/`min`/`max` with the declared-order single-failure
 * rule, after the retained kind/finiteness/unit checks.
 */
import { describe, expect, it } from "vitest";

import {
  quantity,
  text,
  validateAttributeValue,
  validateDocument,
  validateProfile,
  SCOPED_CONSTRAINTS_ADAPTER,
  type AttributeSchema,
  type Profile,
  type SemanticDocument,
} from "../src/index.js";
import { baseDocument, ent, scopedOptions } from "./m3-helpers.js";

const KEY = "^[a-z][a-z0-9-]*$";

function scalarProfile(attribute: AttributeSchema): Profile {
  return {
    id: "synthetic@2",
    name: "synthetic",
    version: 2,
    completeness: "complete",
    entityTypes: [
      {
        id: "thing",
        label: "Thing",
        attributes: [attribute, { name: "name", kind: "text", required: true, maxLength: 200 }],
      },
    ],
    portTypes: [],
    relationTypes: [],
    constraints: [],
    limits: {},
    notes: [],
  };
}

function thingDocument(value: unknown, attribute = "code"): SemanticDocument {
  return {
    ...baseDocument(["synthetic@2"]),
    entities: {
      "entity:p": ent("p", "synthetic@2", "thing", {
        name: text("P"),
        [attribute]: value as never,
      }),
    },
  };
}

describe("text schema qualification", () => {
  const cases: { name: string; schema: AttributeSchema }[] = [
    { name: "pattern without patternName", schema: { name: "code", kind: "text", pattern: KEY } },
    { name: "non-anchored pattern", schema: { name: "code", kind: "text", pattern: "abc", patternName: "key" } },
    { name: "non-compiling pattern", schema: { name: "code", kind: "text", pattern: "([", patternName: "key" } },
    { name: "non-ASCII pattern", schema: { name: "code", kind: "text", pattern: "^[é]+$", patternName: "key" } },
    {
      name: "minLength above maxLength",
      schema: { name: "code", kind: "text", minLength: 5, maxLength: 3, pattern: KEY, patternName: "key" },
    },
  ];
  for (const { name, schema } of cases) {
    it(`refuses ${name}`, () => {
      expect(validateProfile(scalarProfile(schema), SCOPED_CONSTRAINTS_ADAPTER)).toEqual([
        {
          code: "type-definition-conflict",
          severity: "error",
          path: "profiles.synthetic@2.entityTypes[0].attributes[0]",
          message: "text schema for code has an invalid pattern or length bounds",
          refs: [],
          details: { check: "text-pattern-invalid", attribute: "code" },
        },
      ]);
    });
  }
});

describe("text value checks", () => {
  it("reports a pattern mismatch with maxLength when declared", () => {
    const schema: AttributeSchema = { name: "code", kind: "text", maxLength: 40, pattern: KEY, patternName: "key" };
    expect(validateDocument(thingDocument(text("Bad")), scopedOptions([scalarProfile(schema)]))).toEqual([
      {
        code: "text-pattern-mismatch",
        severity: "error",
        path: "entities.entity:p.attributes.code",
        message: "value does not match the key grammar",
        refs: [],
        details: { pattern: "key", length: 3, maxLength: 40 },
      },
    ]);
  });

  it("omits maxLength from the details when the schema declares none", () => {
    const schema: AttributeSchema = { name: "code", kind: "text", pattern: KEY, patternName: "key" };
    expect(validateDocument(thingDocument(text("Bad")), scopedOptions([scalarProfile(schema)]))).toEqual([
      {
        code: "text-pattern-mismatch",
        severity: "error",
        path: "entities.entity:p.attributes.code",
        message: "value does not match the key grammar",
        refs: [],
        details: { pattern: "key", length: 3 },
      },
    ]);
  });

  it("reports a short value with the minimum-only arm", () => {
    const schema: AttributeSchema = { name: "code", kind: "text", minLength: 1 };
    expect(validateDocument(thingDocument(text("")), scopedOptions([scalarProfile(schema)]))).toEqual([
      {
        code: "text-pattern-mismatch",
        severity: "error",
        path: "entities.entity:p.attributes.code",
        message: "value is shorter than the minimum length for code",
        refs: [],
        details: { pattern: "min-length", length: 0, minLength: 1 },
      },
    ]);
  });

  it("checks maxLength first, then one pattern failure", () => {
    const schema: AttributeSchema = {
      name: "code",
      kind: "text",
      maxLength: 2,
      minLength: 5,
      pattern: KEY,
      patternName: "key",
    };
    // Too long: only the retained text-too-long fires, even though the value
    // also violates the pattern.
    expect(
      validateAttributeValue(schema, text(" Way too long "), "at").map((entry) => entry.code),
    ).toEqual(["text-too-long"]);
    // Short and off-pattern: one minimum diagnostic, not two.
    expect(validateAttributeValue(schema, text(""), "at")).toEqual([
      {
        code: "text-pattern-mismatch",
        severity: "error",
        path: "at",
        message: "value is shorter than the minimum length for code",
        refs: [],
        details: { pattern: "min-length", length: 0, minLength: 5 },
      },
    ]);
  });
});

describe("quantity schema qualification and checks", () => {
  const cases: { name: string; schema: AttributeSchema }[] = [
    { name: "min above max", schema: { name: "count", kind: "quantity", units: ["unit"], min: 10, max: 5 } },
    { name: "NaN min", schema: { name: "count", kind: "quantity", units: ["unit"], min: Number.NaN } },
    { name: "infinite max", schema: { name: "count", kind: "quantity", units: ["unit"], max: Number.POSITIVE_INFINITY } },
  ];
  for (const { name, schema } of cases) {
    it(`refuses ${name}`, () => {
      expect(validateProfile(scalarProfile(schema), SCOPED_CONSTRAINTS_ADAPTER)).toEqual([
        {
          code: "type-definition-conflict",
          severity: "error",
          path: "profiles.synthetic@2.entityTypes[0].attributes[0]",
          message: "quantity schema for count has invalid numeric bounds",
          refs: [],
          details: { check: "numeric-constraint-invalid", attribute: "count" },
        },
      ]);
    });
  }

  it("refuses a fraction with the exact integer object", () => {
    const schema: AttributeSchema = { name: "count", kind: "quantity", units: ["unit"], integer: true, min: 0 };
    expect(validateAttributeValue(schema, quantity(0.5, "unit"), "at")).toEqual([
      {
        code: "quantity-not-integer",
        severity: "error",
        path: "at",
        message: "value 0.5 is not an integer",
        refs: [],
        details: { value: 0.5, integer: "required" },
      },
    ]);
  });

  it("reports below-min and above-max with exact objects, first new failure only", () => {
    const schema: AttributeSchema = { name: "count", kind: "quantity", units: ["unit"], integer: true, min: 0, max: 10 };
    expect(validateAttributeValue(schema, quantity(-1, "unit"), "at")).toEqual([
      {
        code: "quantity-below-min",
        severity: "error",
        path: "at",
        message: "value -1 is below the minimum 0",
        refs: [],
        details: { value: -1, min: 0 },
      },
    ]);
    expect(validateAttributeValue(schema, quantity(11, "unit"), "at")).toEqual([
      {
        code: "quantity-above-max",
        severity: "error",
        path: "at",
        message: "value 11 is above the maximum 10",
        refs: [],
        details: { value: 11, max: 10 },
      },
    ]);
    // A fraction below the minimum reports integrality only: one first failure.
    expect(validateAttributeValue(schema, quantity(-0.5, "unit"), "at").map((entry) => entry.code)).toEqual([
      "quantity-not-integer",
    ]);
  });

  it("keeps the retained unit and finiteness checks first", () => {
    const schema: AttributeSchema = { name: "count", kind: "quantity", units: ["unit"], integer: true, min: 0 };
    expect(validateAttributeValue(schema, { kind: "quantity", value: 1 } as never, "at").map((entry) => entry.code)).toEqual([
      "quantity-unit-missing",
    ]);
    expect(validateAttributeValue(schema, quantity(Number.NaN, "unit"), "at").map((entry) => entry.code)).toEqual([
      "value-not-finite",
    ]);
  });
});
