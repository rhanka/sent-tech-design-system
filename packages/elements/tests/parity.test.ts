/**
 * AC-L1 witnesses on the four-framework parity guard (§5.1, §15).
 *
 * RED HISTORY (observed before the implementation existed, 2026-10-30): every
 * test in this file failed at that point — `src/generator/parity.js` was not
 * a resolvable module and `catalog.json` did not exist. This suite is the RED
 * witness for the AC-L1 item "the four-framework parity guard passes or
 * records each mismatch in x-sentropic.parity".
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { contracts } from "../src/contracts/index.js";
import { compareJsonProps } from "../src/generator/parity.js";

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = join(here, "..");
const repoRoot = join(packageDir, "..", "..");

const catalog = JSON.parse(readFileSync(join(packageDir, "catalog.json"), "utf8")) as {
  components: Record<string, { "x-sentropic"?: { parity?: Record<string, Record<string, unknown>> } }>;
};

describe("x-sentropic.parity records the four frameworks for every component", () => {
  for (const contract of contracts) {
    const entry = catalog.components[contract.component]!;
    const parity = entry["x-sentropic"]?.parity;

    it(`${contract.component}: has svelte, react, vue and angular rows`, () => {
      expect(parity).toBeDefined();
      expect(Object.keys(parity ?? {}).sort()).toEqual(["angular", "react", "svelte", "vue"]);
    });

    it(`${contract.component}: every compared file exists in the repository`, () => {
      for (const row of Object.values(parity ?? {})) {
        const file = row["file"] as string | undefined;
        expect(file, JSON.stringify(row)).toBeDefined();
        expect(existsSync(join(repoRoot, file!)), `${file} (from x-sentropic.parity)`).toBe(true);
      }
    });
  }

  it("BarChart: the three framework implementations match the catalogued surface", () => {
    const parity = catalog.components.BarChart!["x-sentropic"]?.parity;
    for (const framework of ["react", "vue", "angular"]) {
      const row = parity?.[framework];
      expect(row?.["status"], framework).toBe("match");
      expect(row?.["comparedProps"], framework).toBe(17);
    }
    expect(parity?.["svelte"]?.["status"]).toBe("source-of-truth");
  });

  it("BpmnCanvas and DecisionDossier record that no framework counterpart exists", () => {
    for (const component of ["BpmnCanvas", "DecisionDossier"]) {
      const parity = catalog.components[component]!["x-sentropic"]?.parity;
      for (const framework of ["react", "vue", "angular"]) {
        expect(parity?.[framework]?.["status"], `${component}/${framework}`).toBe("no-counterpart");
      }
      expect(parity?.["svelte"]?.["status"], `${component}/svelte`).toBe("no-counterpart");
    }
  });
});

describe("compareJsonProps (the guard's comparison rule)", () => {
  const catalogProps = {
    label: { type: "string", description: "Human-readable chart label." },
    data: { type: "array", items: { type: "object", properties: { label: { type: "string" }, value: { type: "number" } }, required: ["label", "value"], additionalProperties: false } },
  };

  it("identical surfaces compare equal (descriptions ignored, key order irrelevant)", () => {
    // Same schema as the catalogued `data`, written with different key,
    // property and `required` order: the rule compares canonical structures.
    const frameworkProps = {
      data: {
        type: "array",
        items: {
          required: ["value", "label"],
          properties: { value: { type: "number" }, label: { type: "string" } },
          additionalProperties: false,
          type: "object",
        },
      },
      label: { type: "string" },
    };
    expect(
      compareJsonProps(catalogProps, frameworkProps, {
        excluded: [],
        drops: [],
        catalogRequired: ["data", "label"],
        frameworkRequired: ["label", "data"],
      }),
    ).toEqual({ status: "match", differences: [] });
  });

  it("a declared narrowing drop is applied before comparing (dataLabels.format)", () => {
    const catalogDataLabels = { anyOf: [{ type: "boolean" }, { type: "object", properties: { position: { type: "string", enum: ["auto", "center", "inside", "outside", "top"] } }, additionalProperties: false }] };
    const frameworkDataLabels = { anyOf: [{ type: "boolean" }, { type: "object", properties: { format: { type: "object", $comment: "(value: number) => string" }, position: { type: "string", enum: ["auto", "inside", "outside", "top", "center"] } }, additionalProperties: false }] };
    expect(
      compareJsonProps({ dataLabels: catalogDataLabels }, { dataLabels: frameworkDataLabels }, { excluded: [], drops: [{ prop: "dataLabels", members: ["format"] }], catalogRequired: [], frameworkRequired: [] }),
    ).toEqual({ status: "match", differences: [] });
  });

  it("an excluded prop is removed from the framework surface before comparing", () => {
    const frameworkProps = { ...catalogProps, onSelect: { type: "object", $comment: "(key: string) => void" } };
    expect(
      compareJsonProps(catalogProps, frameworkProps, {
        excluded: [{ prop: "onSelect" }],
        drops: [],
        catalogRequired: ["label", "data"],
        // `onSelect` is required in the framework source but excluded from the
        // compared surface: the required filter drops it with the prop.
        frameworkRequired: ["label", "data", "onSelect"],
      }),
    ).toEqual({ status: "match", differences: [] });
  });

  it("a missing catalogued prop is a mismatch", () => {
    const frameworkProps = { label: { type: "string" } };
    const result = compareJsonProps(catalogProps, frameworkProps, { excluded: [], drops: [], catalogRequired: ["data", "label"], frameworkRequired: ["label"] });
    expect(result.status).toBe("mismatch");
    expect(result.differences).toContain("missing in framework: data");
  });

  it("a type drift is a mismatch", () => {
    const frameworkProps = { ...catalogProps, label: { type: "number" } };
    const result = compareJsonProps(catalogProps, frameworkProps, { excluded: [], drops: [], catalogRequired: ["data", "label"], frameworkRequired: ["data", "label"] });
    expect(result.status).toBe("mismatch");
    expect(result.differences.some((difference) => difference.startsWith("label:"))).toBe(true);
  });

  it("an undeclared extra framework prop is a mismatch", () => {
    const frameworkProps = { ...catalogProps, surprise: { type: "string" } };
    const result = compareJsonProps(catalogProps, frameworkProps, { excluded: [], drops: [], catalogRequired: ["data", "label"], frameworkRequired: ["data", "label"] });
    expect(result.status).toBe("mismatch");
    expect(result.differences).toContain("not catalogued, not excluded: surprise");
  });

  it("a prop required in the catalog but optional in the framework is a mismatch", () => {
    const frameworkProps = { ...catalogProps };
    const result = compareJsonProps(catalogProps, frameworkProps, { excluded: [], drops: [], catalogRequired: ["data", "label"], frameworkRequired: ["data"] });
    expect(result.status).toBe("mismatch");
    expect(result.differences).toContain("label: required in catalog but optional in framework");
  });

  it("a prop optional in the catalog but required in the framework is a mismatch", () => {
    const frameworkProps = { ...catalogProps };
    const result = compareJsonProps(catalogProps, frameworkProps, { excluded: [], drops: [], catalogRequired: ["data"], frameworkRequired: ["data", "label"] });
    expect(result.status).toBe("mismatch");
    expect(result.differences).toContain("label: required in framework but optional in catalog");
  });
});
