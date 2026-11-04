import { describe, expect, it } from "vitest";
import { join } from "node:path";

import { loadDeclarationProgram } from "../../src/generator/contracts/loader.js";
import { extractSvelte, type FrameworkInput } from "../../src/generator/contracts/svelte.js";

const FIXTURE = join(import.meta.dirname, "fixtures", "svelte-fixture.d.ts");

function inputFor(identifier: string): FrameworkInput {
  const loaded = loadDeclarationProgram([FIXTURE]);
  const declFile = loaded.program.getSourceFile(FIXTURE);
  if (declFile === undefined) throw new Error("fixture file missing from program");
  return {
    program: loaded.program,
    checker: loaded.checker,
    declFile,
    repoDeclPath: "packages/component-index/tests/contracts/fixtures/svelte-fixture.d.ts",
    declarationDigest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    packageName: "@sentropic/fixture-svelte",
    packageVersion: "0.0.0",
    identifier,
  };
}

describe("K1b Svelte extractor (spec 7.2)", () => {
  it("classifies props, snippet slots, on events and bindable", () => {
    const body = extractSvelte(inputFor("Widget"));
    expect(body.status).toBe("partial");
    expect(body.source.propsType).toBe("WidgetProps");
    expect(Object.keys(body.props?.["properties"] ?? {})).toEqual(["page", "size", "title"]);
    expect(body.slots.map((slot) => slot.name)).toEqual(["children", "header"]);
    expect(body.slots[1]).toMatchObject({ params: { type: "string" } });
    expect(body.events.map((event) => event.name)).toEqual(["onSelect", "onclose"]);
    expect(body.events.find((event) => event.name === "onSelect")).toMatchObject({
      payload: { type: "string" },
    });
    expect(body.events.find((event) => event.name === "onclose")).not.toHaveProperty("payload");
    expect(body.bindable).toEqual(["page"]);
    expect(body.dropped.map((row) => row.name)).toEqual(["callback"]);
    expect(body.limitations.length).toBeGreaterThan(0);
  });

  it("fails when a bindable name is not a props member", () => {
    expect(() => extractSvelte(inputFor("Orphan"))).toThrow(/missing/);
  });

  it("falls back to the Component first type argument with a warning", () => {
    const body = extractSvelte(inputFor("Fallback"));
    expect(body.source.propsType).toBe("OtherShape");
    expect(body.warnings.some((warning) => warning.includes("fallback"))).toBe(true);
  });
});
