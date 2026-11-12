import { describe, expect, it } from "vitest";
import { join } from "node:path";

import { loadDeclarationProgram } from "../../src/generator/contracts/loader.js";
import { extractVue, type FrameworkInput } from "../../src/generator/contracts/vue.js";

const FIXTURE = join(import.meta.dirname, "fixtures", "vue-fixture.d.ts");

function inputFor(identifier: string, expectedSlots: string[] = []): FrameworkInput {
  const loaded = loadDeclarationProgram([FIXTURE]);
  const declFile = loaded.program.getSourceFile(FIXTURE);
  if (declFile === undefined) throw new Error("fixture file missing from program");
  return {
    program: loaded.program,
    checker: loaded.checker,
    declFile,
    repoDeclPath: "packages/component-index/tests/contracts/fixtures/vue-fixture.d.ts",
    declarationDigest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    packageName: "@sentropic/fixture-vue",
    packageVersion: "0.0.0",
    identifier,
    expectedSlots,
  };
}

describe("K1b Vue extractor (spec 7.4)", () => {
  it("preserves script-setup events and binding from public $emit overloads", () => {
    const body = extractVue(inputFor("TemplateMenu"));
    expect(body.events.map((event) => event.name)).toEqual(["onSelect", "select", "update:open"]);
    expect(body.bindable).toEqual(["open"]);
  });
  it("derives events from emits and onX, pairs update: with bindable", () => {
    const body = extractVue(inputFor("Sheet"));
    // GEN-C2: the onClose payload (...args: unknown[]) records a replaced
    // row even in payload mode, so the cell is partial.
    expect(body.status).toBe("partial");
    expect(body.replaced.map((row) => row.name)).toContain("onClose.args[]");
    expect(Object.keys(body.props?.["properties"] ?? {})).toEqual(["count", "modelValue", "open", "title"]);
    expect(body.events.map((event) => event.name).sort()).toEqual(["close", "onClose", "update:modelValue"]);
    expect(body.events.find((event) => event.name === "close")).not.toHaveProperty("payload");
    expect(body.warnings.some((warning) => warning.includes("payload not in declaration"))).toBe(true);
    expect(body.warnings.some((warning) => warning.includes("close") && warning.includes("onClose"))).toBe(true);
    expect(body.bindable).toEqual(["modelValue"]);
    expect(body.slots).toEqual([]);
    expect(body.limitations.some((limitation) => limitation.includes("Slot surface"))).toBe(true);
  });

  it("forces partial when the baseline expects slots", () => {
    const body = extractVue(inputFor("Sheet", ["default", "footer"]));
    expect(body.status).toBe("partial");
  });

  it("records none with no-props-type when XProps is absent", () => {
    const body = extractVue(inputFor("Missing"));
    expect(body.status).toBe("none");
    expect(body.reason).toBe("no-props-type");
    expect(body.props).toBeUndefined();
  });
});
