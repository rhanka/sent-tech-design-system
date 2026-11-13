import { describe, expect, it } from "vitest";
import { join } from "node:path";

import {
  convertObjectMembers,
  convertType,
  createConvertState,
} from "../../src/generator/contracts/convert.js";
import { getFixtureType, loadDeclarationProgram } from "../../src/generator/contracts/loader.js";

const FIXTURE = join(import.meta.dirname, "fixtures", "common.d.ts");

function setup() {
  const loaded = loadDeclarationProgram([FIXTURE]);
  const state = createConvertState(loaded.checker);
  const typeOf = (name: string) => getFixtureType(loaded, FIXTURE, name);
  return { loaded, state, typeOf };
}

describe("K1b conversion table (spec 6.2)", () => {
  it("literal unions become enum, single literals become const", () => {
    const { state, typeOf } = setup();
    expect(convertType(state, typeOf("Align"), "Align")).toEqual({
      outcome: "schema",
      schema: { enum: ["start", "center", "end"] },
    });
    expect(convertType(state, typeOf("Single"), "Single")).toEqual({
      outcome: "schema",
      schema: { const: "only" },
    });
  });

  it("optional members and undefined unions stay out of required", () => {
    const { state, typeOf } = setup();
    const out = convertObjectMembers(typeOf("Props"), state, "Props");
    expect(out.required).not.toContain("label");
    expect(out.required).not.toContain("align");
    expect(out.required).not.toContain("point");
    expect(out.required).not.toContain("maybe");
    expect(out.required).toContain("mode");
    expect(out.required).toContain("count");
    expect(out.properties["maybe"]).toEqual({ type: "string" });
  });

  it("null unions keep the null member on scalars and anyOf otherwise", () => {
    const { state, typeOf } = setup();
    const out = convertObjectMembers(typeOf("Props"), state, "Props");
    expect(out.properties["count"]).toEqual({ type: ["number", "null"] });
    expect(out.properties["shape"]).toMatchObject({ anyOf: expect.any(Array) });
  });

  it("fixed tuples use prefixItems, rest tuples are unresolved", () => {
    const { state, typeOf } = setup();
    const out = convertObjectMembers(typeOf("Props"), state, "Props");
    expect(out.properties["pair"]).toEqual({
      type: "array",
      prefixItems: [{ type: "string" }, { type: "number" }],
      items: false,
    });
    expect(out.properties["rest"]).toBeUndefined();
    expect(state.unresolved.map((row) => row.name)).toContain("Props.rest");
  });

  it("index signatures record additionalProperties plus a replaced row", () => {
    const { state, typeOf } = setup();
    const out = convertObjectMembers(typeOf("Props"), state, "Props");
    expect(out.properties["map"]).toEqual({
      type: "object",
      properties: {},
      additionalProperties: { type: "number" },
    });
    expect(state.replaced.map((row) => row.name)).toContain("Props.map");
    expect(state.replaced).toEqual(
      expect.arrayContaining([{ name: "Props.map", replacement: '{"type":"number"}', reason: expect.any(String), sourceType: expect.any(String) }]),
    );
    void typeOf;
  });

  it("discriminated unions become anyOf with const discriminators", () => {
    const { state, typeOf } = setup();
    const outcome = convertType(state, typeOf("Shape"), "Shape");
    expect(outcome.outcome).toBe("schema");
    if (outcome.outcome !== "schema") return;
    const anyOf = (outcome.schema as { anyOf: { properties: Record<string, unknown> }[] }).anyOf;
    expect(anyOf).toHaveLength(2);
    expect(anyOf[0].properties["kind"]).toEqual({ const: "circle" });
    expect(anyOf[1].properties["kind"]).toEqual({ const: "rect" });
  });

  it("generic defaults are used with a warning and named types hoist", () => {
    const { state, typeOf } = setup();
    const out = convertObjectMembers(typeOf("Props"), state, "Props");
    expect(out.properties["box"]).toEqual({ $ref: "#/$defs/GenericBox" });
    expect(state.defs.get("GenericBox")).toMatchObject({
      type: "object",
      properties: { value: { type: "string" } },
    });
    expect(state.warnings.some((warning) => warning.includes("GenericBox"))).toBe(true);
  });

  it("function types report dropped, recursion hoists to $defs", () => {
    const { state, typeOf } = setup();
    const outcome = convertType(state, typeOf("Handler"), "Handler");
    expect(outcome.outcome).toBe("omitted");
    expect(state.dropped).toMatchObject([{ name: "Handler", kind: "function" }]);
    const out = convertObjectMembers(typeOf("Props"), state, "Props");
    expect(out.properties["handler"]).toBeUndefined();
    expect(state.dropped.map((row) => row.name)).toContain("Props.handler");
    const nested = out.properties["nested"] as { $ref?: string };
    expect(nested.$ref).toBe("#/$defs/TreeNode");
    expect(state.defs.get("TreeNode")).toMatchObject({ type: "object" });
  });

  it("keeps different concrete generic specializations in separate definitions", () => {
    const { state, typeOf } = setup();
    const out = convertObjectMembers(typeOf("TwoBoxes"), state, "TwoBoxes");
    expect(out.properties["text"]).toEqual({ $ref: "#/$defs/GenericBox" });
    expect(out.properties["count"]).toEqual({ $ref: "#/$defs/GenericBox%3Cnumber%3E" });
    expect(state.defs.get("GenericBox")).toMatchObject({ properties: { value: { type: "string" } } });
    expect(state.defs.get("GenericBox<number>")).toMatchObject({ properties: { value: { type: "number" } } });
  });

  it("unknown becomes replaced {}, Date becomes replaced date-time", () => {
    const { state, typeOf } = setup();
    const out = convertObjectMembers(typeOf("Props"), state, "Props");
    expect(out.properties["unknownField"]).toEqual({});
    expect(state.replaced.map((row) => row.name)).toContain("Props.unknownField");
    expect(out.properties["stamp"]).toEqual({ type: "string", format: "date-time" });
    expect(state.replaced.map((row) => row.name)).toContain("Props.stamp");
  });

  it("nested intersections merge properties (GeoChartPoint)", () => {
    const { state, typeOf } = setup();
    const outcome = convertType(state, typeOf("GeoChartPoint"), "GeoChartPoint");
    expect(outcome.outcome).toBe("schema");
    if (outcome.outcome !== "schema") return;
    expect(outcome.schema).toMatchObject({
      type: "object",
      properties: {
        latitude: { type: "number" },
        longitude: { type: "number" },
      },
    });
    expect(outcome.schema["properties"]).toMatchObject({
      label: { type: "string" },
      value: { type: "number" },
    });
    expect(outcome.schema["additionalProperties"]).toBe(false);
    expect(state.unresolved).toEqual([]);
  });

  it("Omit-intersections merge without the omitted member (MessageAction)", () => {
    const { state, typeOf } = setup();
    const outcome = convertType(state, typeOf("MessageAction"), "MessageAction");
    expect(outcome.outcome).toBe("schema");
    if (outcome.outcome !== "schema") return;
    const properties = outcome.schema["properties"] as Record<string, unknown>;
    expect(Object.keys(properties).sort()).toEqual(["disabled", "id", "label", "value", "variant"]);
    expect(outcome.schema["additionalProperties"]).toBe(false);
    expect(state.unresolved).toEqual([]);
  });
});
