// apps/docs/src/lib/compare/manifest.test.ts
import { describe, it, expect } from "vitest";
import { COMPARE_MANIFEST } from "./manifest.mjs";

// The 22 bench keys that MUST migrate, with their theme coverage.
// (mirrors fidelity.mjs COMPONENTS + COMPONENT_THEMES; Carbon lacks Badge/Quote/Highlight)
const EXPECTED = {
  dsfr: ["Button", "ButtonDisabled", "Input", "InputError", "InputDisabled", "Textarea", "Select", "Search", "Link", "Checkbox", "Radio", "Toggle", "Tag", "Badge", "Alert", "Accordion", "Breadcrumb", "Pagination", "Card", "Tabs", "Quote", "Highlight"],
  carbon: ["Button", "ButtonDisabled", "Input", "InputError", "InputDisabled", "Textarea", "Select", "Search", "Link", "Checkbox", "Radio", "Toggle", "Tag", "Alert", "Accordion", "Breadcrumb", "Pagination", "Card", "Tabs"],
};

describe("COMPARE_MANIFEST parity with the legacy bench", () => {
  it("covers exactly the expected keys per theme", () => {
    expect(Object.keys(COMPARE_MANIFEST.dsfr).sort()).toEqual([...EXPECTED.dsfr].sort());
    expect(Object.keys(COMPARE_MANIFEST.carbon).sort()).toEqual([...EXPECTED.carbon].sort());
  });
  it("every entry has non-empty selectors, markup, and an explicit identity", () => {
    for (const theme of Object.keys(COMPARE_MANIFEST)) {
      for (const [key, m] of Object.entries(COMPARE_MANIFEST[theme])) {
        expect(m.ourSelector, `${theme}/${key} ourSelector`).toBeTruthy();
        expect(m.refSelector, `${theme}/${key} refSelector`).toBeTruthy();
        expect(m.refMarkup, `${theme}/${key} refMarkup`).toBeTruthy();
        expect(m.component, `${theme}/${key} component`).toBeTruthy();
        expect(m.scenario, `${theme}/${key} scenario`).toBeTruthy();
        expect(["rest", "focus", "disabled", "error", "selected"]).toContain(m.state);
      }
    }
  });
});
