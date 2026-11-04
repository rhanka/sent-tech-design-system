import { describe, expect, it } from "vitest";
import { join } from "node:path";

import { loadDeclarationProgram } from "../../src/generator/contracts/loader.js";
import { extractReact, type FrameworkInput } from "../../src/generator/contracts/react.js";

const FIXTURE = join(import.meta.dirname, "fixtures", "react-fixture.d.ts");

function inputFor(identifier: string): FrameworkInput {
  const loaded = loadDeclarationProgram([FIXTURE]);
  const declFile = loaded.program.getSourceFile(FIXTURE);
  if (declFile === undefined) throw new Error("fixture file missing from program");
  return {
    program: loaded.program,
    checker: loaded.checker,
    declFile,
    repoDeclPath: "packages/component-index/tests/contracts/fixtures/react-fixture.d.ts",
    declarationDigest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    packageName: "@sentropic/fixture-react",
    packageVersion: "0.0.0",
    identifier,
  };
}

describe("K1b React extractor (spec 7.3)", () => {
  it("classifies children slots, render-function slots, drops and events", () => {
    const body = extractReact(inputFor("Card"));
    expect(body.status).toBe("partial");
    expect(body.slots.map((slot) => slot.name)).toEqual(["cell", "children"]);
    expect(body.slots.find((slot) => slot.name === "cell")).toMatchObject({
      params: { type: "string" },
    });
    expect(body.events.map((event) => event.name)).toEqual(["onSubmit"]);
    expect(body.events[0]).toMatchObject({ payload: { type: "boolean" } });
    expect(body.dropped.map((row) => `${row.name}:${row.kind}`)).toEqual(
      expect.arrayContaining(["footer:node", "helper:function", "onselect:function"]),
    );
    const propNames = Object.keys(body.props?.["properties"] ?? {});
    expect(propNames).not.toContain("ref");
    expect(propNames).toContain("count");
  });

  it("uses generic defaults with a warning and stays complete", () => {
    const body = extractReact(inputFor("Box"));
    expect(body.status).toBe("complete");
    expect(body.props?.["properties"]).toMatchObject({ value: { type: "string" } });
    expect(body.warnings.some((warning) => warning.includes("BoxProps"))).toBe(true);
  });

  it("records unconstrained generic params as unresolved", () => {
    const body = extractReact(inputFor("Raw"));
    expect(body.status).toBe("partial");
    expect(body.unresolved.map((row) => `${row.name}:${row.kind}`)).toContain("value:generic");
  });
});
