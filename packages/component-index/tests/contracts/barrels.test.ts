import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { parseBarrelFile, parseBarrelText } from "../../src/generator/barrels.js";
import { loadBaseline } from "../../src/generator/emit.js";

const PACKAGE_DIR = join(import.meta.dirname, "..", "..");

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
