import { describe, expect, it } from "vitest";
import { COMPONENTS } from "./components-catalog";
import {
  DOCS_TOP_NAV,
  DOCS_VERSION,
  buildComponentNavGroups,
  resolveBreadcrumb
} from "./docs-navigation";

describe("docs navigation model", () => {
  it("exposes the high-level documentation tracks used by the top nav", () => {
    expect(DOCS_VERSION).toMatch(/^v\d+\.\d+\.\d+$/);
    expect(DOCS_TOP_NAV.map((item) => item.label)).toEqual([
      "Fondations",
      "Composants",
      "Tokens",
      "Thèmes",
      "Contrats"
    ]);
  });

  it("builds a side navigation entry for every exported component", () => {
    const groups = buildComponentNavGroups();
    const items = groups.flatMap((group) => group.items);

    expect(groups.length).toBeGreaterThan(0);
    expect(items).toHaveLength(COMPONENTS.length);
    expect(items.every((item) => item.href.startsWith("/components/"))).toBe(true);
  });

  it("resolves breadcrumbs for the catalogue and component pages", () => {
    expect(resolveBreadcrumb("/").map((item) => item.label)).toEqual(["Catalogue"]);
    expect(resolveBreadcrumb("/components/button").map((item) => item.label)).toEqual([
      "Catalogue",
      "Composants",
      "Button"
    ]);
  });
});
