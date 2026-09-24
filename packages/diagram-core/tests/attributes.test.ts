/**
 * The attribute layer, directly.
 *
 * The document suites exercise attributes through a whole document, which proves
 * they are wired but leaves the edges untested: a text over its length, a date
 * that has the right shape and does not exist, a unit outside the declared list, a
 * collection under its minimum. Those are asserted here, against the schema
 * alone, and so are the value constructors and the reference extraction the
 * validator relies on.
 */
import { describe, expect, it } from "vitest";

import {
  boolean,
  codesOf,
  collection,
  date,
  enumeration,
  errorsOf,
  hasErrors,
  quantity,
  reference,
  referencesOf,
  text,
  validateAttributeValue,
  type AttributeSchema,
} from "../src/index.js";

const codes = (schema: AttributeSchema, value: Parameters<typeof validateAttributeValue>[1]): readonly string[] =>
  validateAttributeValue(schema, value, "at").map((entry) => entry.code);

describe("value constructors say what they build", () => {
  it("builds each kind with its own discriminant", () => {
    expect(text("a")).toEqual({ kind: "text", value: "a" });
    expect(boolean(true)).toEqual({ kind: "boolean", value: true });
    expect(date("2026-09-24")).toEqual({ kind: "date", value: "2026-09-24" });
    expect(quantity(3, "kg")).toEqual({ kind: "quantity", value: 3, unit: "kg" });
    expect(enumeration("active")).toEqual({ kind: "enum", value: "active" });
    expect(reference("entity:a")).toEqual({ kind: "reference", value: "entity:a" });
    expect(collection([{ kind: "text", value: "a" }])).toEqual({
      kind: "collection",
      items: [{ kind: "text", value: "a" }],
    });
  });
});

describe("text", () => {
  const schema: AttributeSchema = { name: "label", kind: "text", maxLength: 3 };

  it("accepts a value at its bound and refuses one above it", () => {
    expect(codes(schema, text("abc"))).toEqual([]);
    expect(codes(schema, text("abcd"))).toEqual(["text-too-long"]);
    expect(validateAttributeValue(schema, text("abcd"), "at")[0]?.details).toEqual({ length: 4, maxLength: 3 });
  });

  it("refuses a value of another kind", () => {
    expect(codes(schema, boolean(true))).toEqual(["attribute-type-mismatch"]);
    expect(codes(schema, collection([]))).toEqual(["attribute-type-mismatch"]);
  });
});

describe("date", () => {
  const schema: AttributeSchema = { name: "when", kind: "date" };

  it("accepts a calendar date and a date-time with an offset", () => {
    expect(codes(schema, date("2026-09-24"))).toEqual([]);
    expect(codes(schema, date("2026-09-24T10:30"))).toEqual([]);
    expect(codes(schema, date("2026-09-24T10:30:00.123Z"))).toEqual([]);
    expect(codes(schema, date("2026-09-24T10:30:00+02:00"))).toEqual([]);
  });

  it("refuses a date that has the shape but not the day", () => {
    // The regexp alone would accept this one; the calendar check is what refuses it.
    expect(codes(schema, date("2026-02-30"))).toEqual(["date-not-iso8601"]);
    expect(codes(schema, date("24/09/2026"))).toEqual(["date-not-iso8601"]);
    expect(codes(schema, date("2026-09-24 10:30"))).toEqual(["date-not-iso8601"]);
  });
});

describe("quantity", () => {
  const schema: AttributeSchema = { name: "duration", kind: "quantity", units: ["s", "min"] };

  it("accepts a declared unit", () => {
    expect(codes(schema, quantity(90, "s"))).toEqual([]);
  });

  it("refuses a missing unit and an undeclared one, with different codes", () => {
    expect(codes(schema, { kind: "quantity", value: 90 } as never)).toEqual(["quantity-unit-missing"]);
    expect(codes(schema, quantity(90, ""))).toEqual(["quantity-unit-missing"]);
    expect(codes(schema, quantity(90, "h"))).toEqual(["quantity-unit-not-allowed"]);
  });

  it("refuses a non-finite magnitude, and still reports the unit problem", () => {
    expect(codes(schema, quantity(Number.NaN, "s"))).toEqual(["value-not-finite"]);
    expect(codes(schema, { kind: "quantity", value: Number.POSITIVE_INFINITY } as never)).toEqual([
      "quantity-unit-missing",
      "value-not-finite",
    ]);
  });
});

describe("enum and reference", () => {
  it("refuses a value outside the declared set, and names the set", () => {
    const schema: AttributeSchema = { name: "state", kind: "enum", values: ["draft", "active"] };
    expect(codes(schema, enumeration("active"))).toEqual([]);
    const refused = validateAttributeValue(schema, enumeration("retired"), "at");
    expect(refused[0]?.code).toBe("enum-value-not-allowed");
    expect(refused[0]?.details).toEqual({ value: "retired", allowedValues: "draft,active" });
  });

  it("distinguishes a non-reference from a reference of the wrong namespace", () => {
    const schema: AttributeSchema = { name: "owner", kind: "reference", refKind: "entity" };
    expect(codes(schema, reference("entity:a"))).toEqual([]);
    expect(codes(schema, reference("plain-string"))).toEqual(["malformed-ref"]);
    expect(codes(schema, reference("occurrence:a"))).toEqual(["reference-type-mismatch"]);
  });
});

describe("bounded collections", () => {
  const schema: AttributeSchema = {
    name: "tags",
    kind: "collection",
    item: { kind: "text", maxLength: 4 },
    maxItems: 2,
    minItems: 1,
  };

  it("accepts a collection inside its bounds", () => {
    expect(codes(schema, collection([{ kind: "text", value: "a" }]))).toEqual([]);
  });

  it("refuses above the maximum and below the minimum, naming which bound", () => {
    const tooMany = validateAttributeValue(
      schema,
      collection([
        { kind: "text", value: "a" },
        { kind: "text", value: "b" },
        { kind: "text", value: "c" },
      ]),
      "at",
    );
    expect(tooMany[0]?.code).toBe("collection-bound-exceeded");
    expect(tooMany[0]?.details).toEqual({ bound: "max", items: 3, maxItems: 2 });

    const tooFew = validateAttributeValue(schema, collection([]), "at");
    expect(tooFew[0]?.code).toBe("collection-bound-exceeded");
    expect(tooFew[0]?.details).toEqual({ bound: "min", items: 0, minItems: 1 });
  });

  it("validates each item against the item schema, with its index in the path", () => {
    const refused = validateAttributeValue(
      schema,
      collection([
        { kind: "text", value: "ok" },
        { kind: "text", value: "far too long" },
      ]),
      "at",
    );
    expect(refused.map((entry) => entry.path)).toEqual(["at[1]"]);
    expect(refused[0]?.code).toBe("text-too-long");
  });

  it("refuses a scalar where a collection is declared, and the reverse", () => {
    expect(codes(schema, text("a"))).toEqual(["attribute-type-mismatch"]);
  });
});

describe("reference extraction", () => {
  it("finds a scalar reference and every reference of a collection, with indices", () => {
    const scalar: AttributeSchema = { name: "owner", kind: "reference", refKind: "entity" };
    expect(referencesOf(scalar, reference("entity:a"))).toEqual([{ raw: "entity:a", refKind: "entity" }]);

    const list: AttributeSchema = {
      name: "owners",
      kind: "collection",
      item: { kind: "reference", refKind: "entity" },
      maxItems: 4,
    };
    expect(
      referencesOf(
        list,
        collection([
          { kind: "reference", value: "entity:a" },
          { kind: "reference", value: "entity:b" },
        ]),
      ),
    ).toEqual([
      { raw: "entity:a", refKind: "entity", index: 0 },
      { raw: "entity:b", refKind: "entity", index: 1 },
    ]);
  });

  it("finds nothing in a schema that declares no reference", () => {
    expect(referencesOf({ name: "label", kind: "text" }, text("a"))).toEqual([]);
    expect(
      referencesOf({ name: "tags", kind: "collection", item: { kind: "text" }, maxItems: 2 }, collection([])),
    ).toEqual([]);
  });
});

describe("diagnostic helpers", () => {
  const schema: AttributeSchema = { name: "state", kind: "enum", values: ["draft"] };
  const diagnostics = validateAttributeValue(schema, enumeration("nope"), "at");

  it("answers about severity and codes without a caller re-implementing it", () => {
    expect(hasErrors(diagnostics)).toBe(true);
    expect(hasErrors([])).toBe(false);
    expect(errorsOf(diagnostics)).toEqual(diagnostics);
    expect(codesOf(diagnostics)).toEqual(["enum-value-not-allowed"]);
  });
});
