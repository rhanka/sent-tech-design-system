import { describe, expect, it } from "vitest";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  DATAVIZ_MARKER,
  parseCatalogueFile,
  parseCatalogueText,
  stripDatavizMarker,
} from "../src/generator/catalog.js";
import { assertNoEditorialMetadata, parseBarrelText } from "../src/generator/barrels.js";
import { computeParity, parityAllMissing, parityProjection } from "../src/generator/parity.js";
import type { Framework } from "../src/generator/constants.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const cataloguePath = join(repoRoot, "apps", "docs", "src", "lib", "components-catalog.ts");

describe("catalogue parsing via the TypeScript compiler API", () => {
  it("parses all 210 documented rows from the real catalogue file", () => {
    const rows = parseCatalogueFile(cataloguePath);
    expect(rows).toHaveLength(210);
    expect(new Set(rows.map((r) => r.slug)).size).toBe(210);
    expect(rows.every((r) => r.status === "documented")).toBe(true);
  });

  it("reads the Button row verbatim (editorial source of truth)", () => {
    const rows = parseCatalogueFile(cataloguePath);
    const button = rows.find((r) => r.slug === "button");
    expect(button).toMatchObject({
      name: "Button",
      slug: "button",
      status: "documented",
      category: "action",
      groupSlug: "button",
      description: {
        fr: "Action primaire, secondaire, fantôme ou destructive.",
        en: "Primary, secondary, ghost, or destructive action.",
      },
    });
  });

  it("fails loudly when the COMPONENTS array is absent (no regex fallback)", () => {
    expect(() => parseCatalogueText("export const OTHER = [];", "fake.ts")).toThrow(
      /COMPONENTS/,
    );
  });

  it("fails loudly on a non-literal row", () => {
    const source = `export const COMPONENTS = [makeRow("Button")];`;
    expect(() => parseCatalogueText(source, "fake.ts")).toThrow();
  });
});

describe("dataviz marker stripping", () => {
  it("strips one trailing marker for barrel lookup", () => {
    expect(stripDatavizMarker("ScoreCard (dataviz)")).toBe("ScoreCard");
    expect(DATAVIZ_MARKER).toBe(" (dataviz)");
  });

  it("leaves unmarked names untouched (verbatim displayName)", () => {
    expect(stripDatavizMarker("Button")).toBe("Button");
  });

  it("rejects a double-stripped lookup", () => {
    expect(() => stripDatavizMarker("Grid (dataviz) (dataviz)")).toThrow(/dataviz/);
  });
});

describe("parity map computation (frozen section 3.6)", () => {
  const none: ReadonlySet<Framework> = new Set();

  it("all-present maps svelte to source-of-truth and the rest to match", () => {
    expect(computeParity([true, true, true, true], false, none)).toEqual({
      svelte: "source-of-truth",
      react: "match",
      vue: "match",
      angular: "match",
    });
  });

  it("mixed present/missing keeps present values and marks the rest missing", () => {
    expect(computeParity([true, true, false, false], false, none)).toEqual({
      svelte: "source-of-truth",
      react: "match",
      vue: "missing",
      angular: "missing",
    });
    expect(computeParity([false, true, false, false], false, none)).toEqual({
      svelte: "missing",
      react: "match",
      vue: "missing",
      angular: "missing",
    });
  });

  it("intentional sets mark absent frameworks no-counterpart", () => {
    const intentional: ReadonlySet<Framework> = new Set(["react", "vue", "angular"]);
    expect(computeParity([true, false, false, false], false, intentional)).toEqual({
      svelte: "source-of-truth",
      react: "no-counterpart",
      vue: "no-counterpart",
      angular: "no-counterpart",
    });
    const all: ReadonlySet<Framework> = new Set(["svelte", "react", "vue", "angular"]);
    expect(computeParity([false, false, false, false], false, all)).toEqual({
      svelte: "no-counterpart",
      react: "no-counterpart",
      vue: "no-counterpart",
      angular: "no-counterpart",
    });
  });

  it("dataviz-only rows map all four native keys to missing", () => {
    const map = computeParity([false, false, false, false], true, none);
    expect(map).toEqual({
      svelte: "missing",
      react: "missing",
      vue: "missing",
      angular: "missing",
    });
    expect(parityAllMissing(map)).toBe(true);
  });

  it("all-missing rows are detectable for the exported-nowhere failure", () => {
    expect(parityAllMissing(computeParity([false, false, false, false], false, none))).toBe(true);
    expect(parityAllMissing(computeParity([true, false, false, false], false, none))).toBe(false);
  });

  it("frameworks[] is the present-keys projection in fixed order", () => {
    expect(parityProjection(computeParity([true, true, true, true], false, none))).toEqual([
      "svelte",
      "react",
      "vue",
      "angular",
    ]);
    expect(parityProjection(computeParity([false, false, false, false], true, none))).toEqual([]);
    const single: ReadonlySet<Framework> = new Set(["react", "vue", "angular"]);
    expect(parityProjection(computeParity([true, false, false, false], false, single))).toEqual([
      "svelte",
    ]);
  });

  it("dataviz presence never alters the map", () => {
    expect(computeParity([true, true, true, true], true, none)).toEqual(
      computeParity([true, true, true, true], false, none),
    );
  });
});

describe("barrel metadata guard (D4.2)", () => {
  it("a value export named category fails", () => {
    const parsed = parseBarrelText('export { category } from "./tokens.js";\n', "fake.ts");
    expect(() => assertNoEditorialMetadata(parsed, "fake.ts")).toThrow(/category/);
  });

  it("a value export named description fails", () => {
    const parsed = parseBarrelText('export { description } from "./x.js";\n', "fake.ts");
    expect(() => assertNoEditorialMetadata(parsed, "fake.ts")).toThrow(/description/);
  });

  it("a Props type export does not fail and is not a value", () => {
    const parsed = parseBarrelText(
      'export { Button } from "./Button.js";\nexport type { ButtonProps } from "./Button.js";\n',
      "fake.ts",
    );
    expect(() => assertNoEditorialMetadata(parsed, "fake.ts")).not.toThrow();
    expect([...parsed.values.keys()]).toEqual(["Button"]);
    expect(parsed.types.has("ButtonProps")).toBe(true);
  });

  it("default-as re-exports resolve to their specifier", () => {
    const parsed = parseBarrelText(
      'export { default as Accordion } from "./Accordion.svelte";\n',
      "fake.ts",
    );
    expect(parsed.values.get("Accordion")).toBe("./Accordion.svelte");
  });
});
