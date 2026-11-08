/**
 * §1 placement witness: the workspace exists, is private, and pins its
 * workspace dependencies exactly (as `@sentropic/diagram-canvas` does), so a
 * dependency bump cannot silently move the harness to another DS commit.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const manifestPath = fileURLToPath(new URL("../package.json", import.meta.url));
const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;

describe("§1 package scaffold", () => {
  it("is the private workspace @sentropic/diagram-bijection 0.1.0", () => {
    expect(manifest.name).toBe("@sentropic/diagram-bijection");
    expect(manifest.version).toBe("0.1.0");
    expect(manifest.private).toBe(true);
    expect(manifest.license).toBe("MIT");
    expect(manifest.type).toBe("module");
  });

  it("pins the three DS workspace dependencies exactly", () => {
    expect(manifest.dependencies).toEqual({
      "@sentropic/design-system-svelte": "0.37.0",
      "@sentropic/diagram-canvas": "0.1.0",
      "@sentropic/diagram-core": "0.1.0",
    });
  });

  it("scopes build/check/test to src and tests, never preview/, rawgate/ or vendor/", () => {
    // tsconfig.json is JSONC (it carries comments), so assert on the raw text.
    const tsconfigText = readFileSync(fileURLToPath(new URL("../tsconfig.json", import.meta.url)), "utf8");
    expect(tsconfigText).toContain('"include": ["src", "tests"]');
    expect(manifest.scripts).toEqual({
      build: "tsc -p tsconfig.json",
      check: "tsc -p tsconfig.json --noEmit",
      test: "vitest run",
    });
  });
});
