import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { COMPONENTS } from "./components-catalog";
import {
  DOCS_FOUNDATION_NAV,
  DOCS_TOP_NAV,
  DOCS_VERSION,
  buildComponentNavGroups,
  resolveBreadcrumb
} from "./docs-navigation";

describe("docs navigation model", () => {
  it("keeps the component catalog aligned with public Svelte exports", () => {
    const publicIndexPath = fileURLToPath(
      new URL("../../../../packages/components-svelte/src/lib/index.ts", import.meta.url)
    );
    const indexSource = readFileSync(
      publicIndexPath,
      "utf8"
    );
    const exportedComponents = [...indexSource.matchAll(/export \{ default as (\w+) \}/g)]
      .map((match) => match[1])
      // ThemeProvider = primitive infra ; GraphLegend = compagnon de ForceGraph
      // (légende du graphe, documentée avec le composant graphe), pas une brique
      // catalogue autonome.
      .filter((name) => name !== "ThemeProvider" && name !== "GraphLegend")
      .sort();
    const catalogComponents = COMPONENTS.map((component) => component.name).sort();

    expect(catalogComponents).toEqual(exportedComponents);
    expect(COMPONENTS.every((component) => component.status === "documented")).toBe(true);
  });

  it("exposes the high-level documentation tracks used by the top nav", () => {
    expect(DOCS_VERSION).toMatch(/^v\d+\.\d+\.\d+$/);
    expect(DOCS_TOP_NAV.map((item) => item.label)).toEqual([
      "Fondations",
      "Composants",
      "Vues",
      "Aperçu",
      "Tokens",
      "Thèmes",
      "Contrats"
    ]);
  });

  it("drops the dedicated React surface in favour of the framework switcher", () => {
    const reactRoute = fileURLToPath(new URL("../routes/react/+page.svelte", import.meta.url));

    expect(existsSync(reactRoute)).toBe(false);
    expect(DOCS_TOP_NAV.some((item) => item.href === "/react")).toBe(false);
    expect(DOCS_FOUNDATION_NAV.some((item) => item.href === "/react")).toBe(false);
    expect(resolveBreadcrumb("/react").map((item) => item.label)).toEqual(["Catalogue"]);
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
