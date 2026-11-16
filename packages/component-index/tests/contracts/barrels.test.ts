import { describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { parseBarrelFile, parseBarrelText, parseComponentBarrels, resolveModuleFile } from "../../src/generator/barrels.js";
import { barrelNamesForSource } from "../../src/generator/contracts/resolve.js";
import { loadBaseline } from "../../src/generator/emit.js";

const PACKAGE_DIR = join(import.meta.dirname, "..", "..");

describe("public component subpath inventories", () => {
  it.each(["svelte", "vue"])("inventories %s public subpaths without root runtime re-exports", (framework) => {
    const scratch = mkdtempSync(join(tmpdir(), "k1b-public-subpaths-"));
    try {
      const pkg = join(scratch, "packages", `components-${framework}`);
      const source = join(pkg, "src", ...(framework === "svelte" ? ["lib"] : []));
      const extension = framework === "svelte" ? "svelte" : "vue";
      mkdirSync(join(source, "rich-text-editor"), { recursive: true });
      writeFileSync(join(pkg, "package.json"), JSON.stringify({ exports: { "./rich-text-editor": { types: "./dist/rich-text-editor/index.d.ts" } } }));
      writeFileSync(join(source, "index.ts"), "export {};\n");
      writeFileSync(join(source, "rich-text-editor", `RichTextEditor.${extension}`), "<div></div>");
      writeFileSync(join(source, "rich-text-editor", "index.ts"), framework === "svelte"
        ? 'import RichTextEditor from "./RichTextEditor.svelte";\nexport { RichTextEditor };\nexport type { RichTextEditorProps } from "./RichTextEditor.svelte";\n'
        : 'export { default, default as RichTextEditor } from "./RichTextEditor.vue";\nexport type { RichTextEditorProps } from "./RichTextEditor.vue";\n');
      const parsed = parseComponentBarrels(pkg);
      expect([...parsed.values.keys()]).toEqual(["RichTextEditor"]);
      expect(parsed.values.get("RichTextEditor")).toBe(`./rich-text-editor/RichTextEditor.${extension}`);
      expect(parsed.types.has("RichTextEditorProps")).toBe(true);
      expect(barrelNamesForSource(pkg, `packages/components-${framework}/src/${framework === "svelte" ? "lib/" : ""}rich-text-editor/RichTextEditor.${extension}`, "rich-text-editor")).toBe("RichTextEditor");
      expect(readFileSync(join(source, "index.ts"), "utf8")).toBe("export {};\n");
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });

  it("fails when a declared public component subpath has no source barrel", () => {
    const scratch = mkdtempSync(join(tmpdir(), "k1b-missing-subpath-"));
    try {
      mkdirSync(join(scratch, "src"));
      writeFileSync(join(scratch, "src", "index.ts"), "export {};\n");
      writeFileSync(join(scratch, "package.json"), JSON.stringify({ exports: { "./presence-badge": {} } }));
      expect(() => parseComponentBarrels(scratch)).toThrow(/presence-badge.*no source barrel/);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });
});

it("resolves template SFCs directly and keeps JS shims unambiguous", () => {
  const source = join(PACKAGE_DIR, "..", "components-vue", "src");
  expect(resolveModuleFile(source, "./DiagramCard.vue")).toBe(join(source, "DiagramCard.vue"));
  expect(resolveModuleFile(source, "./ForceGraph.js")).toBe(join(source, "ForceGraph.ts"));
});

describe("K1b barrel enum/namespace/interface forms", () => {
  const fakeBarrel = [
    `export enum ButtonVariant { Primary = "primary", Ghost = "ghost" }`,
    `export namespace ModalSlots { export type Header = string; }`,
    `export interface DataTableColumn { key: string; label: string }`,
    `export declare const Button: string;`,
    `export { Button } from "./Button.js";`,
    ``,
  ].join("\n");

  it("records enum/namespace/interface as type-side exports only", () => {
    const parsed = parseBarrelText(fakeBarrel, "fake-barrel.ts");
    expect(parsed.types.has("ButtonVariant")).toBe(true);
    expect(parsed.types.has("ModalSlots")).toBe(true);
    expect(parsed.types.has("DataTableColumn")).toBe(true);
    expect(parsed.values.has("ButtonVariant")).toBe(false);
    expect(parsed.values.has("ModalSlots")).toBe(false);
    expect(parsed.values.has("DataTableColumn")).toBe(false);
  });

  it("keeps value exports as presence", () => {
    const parsed = parseBarrelText(fakeBarrel, "fake-barrel.ts");
    expect(parsed.values.has("Button")).toBe(true);
    expect(parsed.types.has("Button")).toBe(false);
  });
});

describe("K1b baseline stars rename", () => {
  it("the committed baseline uses stars, not the retired unresolvedStars key", () => {
    const baseline = JSON.parse(
      readFileSync(join(PACKAGE_DIR, "parity-baseline.json"), "utf8"),
    ) as Record<string, unknown>;
    expect("stars" in baseline).toBe(true);
    expect("unresolvedStars" in baseline).toBe(false);
  });

  it("a baseline with the retired key fails with a rename instruction", () => {
    const scratch = mkdtempSync(join(tmpdir(), "k1b-baseline-"));
    try {
      const current = JSON.parse(
        readFileSync(join(PACKAGE_DIR, "parity-baseline.json"), "utf8"),
      ) as Record<string, unknown>;
      const retired = { ...current, unresolvedStars: current["stars"] };
      delete (retired as Record<string, unknown>)["stars"];
      writeFileSync(join(scratch, "parity-baseline.json"), `${JSON.stringify(retired, null, 2)}\n`, "utf8");
      expect(() => loadBaseline(scratch)).toThrow(/rename.*"stars"/);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });
});

describe("K1b non-relative star specifiers", () => {
  it("a bare star specifier throws", () => {
    const scratch = mkdtempSync(join(tmpdir(), "k1b-barrel-"));
    try {
      const barrelPath = join(scratch, "index.ts");
      writeFileSync(
        barrelPath,
        `export { Button } from "./Button.js";\nexport * from "some-bare-package";\n`,
        "utf8",
      );
      expect(() => parseBarrelFile(barrelPath)).toThrow(/non-relative/);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });

  it("a relative star specifier resolves", () => {
    const scratch = mkdtempSync(join(tmpdir(), "k1b-barrel-"));
    try {
      writeFileSync(join(scratch, "Button.ts"), `export declare const Button: string;\n`, "utf8");
      const barrelPath = join(scratch, "index.ts");
      writeFileSync(barrelPath, `export * from "./Button.js";\n`, "utf8");
      const parsed = parseBarrelFile(barrelPath);
      expect(parsed.values.has("Button")).toBe(true);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });
});
