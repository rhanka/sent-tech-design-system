// apps/docs/src/lib/compare/reference-themes.test.ts
import { describe, it, expect } from "vitest";
import { REFERENCE_THEMES } from "./reference-themes.mjs";

describe("REFERENCE_THEMES", () => {
  it("covers the import themes", () => {
    expect(Object.keys(REFERENCE_THEMES).sort()).toEqual(["canada", "carbon", "dsfr", "quebec"]);
  });
  it("pins every CDN URL to a version (no floating latest)", () => {
    for (const t of Object.values(REFERENCE_THEMES)) {
      expect(t.cssUrl).toMatch(/@\d/); // contains @<version>
      expect(t.cssUrl).not.toMatch(/\/npm\/(@gouvfr\/dsfr|carbon-components)\//); // unversioned form forbidden
    }
  });
  it("exposes label + brandFont", () => {
    for (const t of Object.values(REFERENCE_THEMES)) {
      expect(typeof t.label).toBe("string");
      expect(typeof t.brandFont).toBe("string");
    }
  });
});
