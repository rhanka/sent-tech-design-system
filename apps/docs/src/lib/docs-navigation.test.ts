import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
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
      .filter((name) => name !== "ThemeProvider")
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
      "React",
      "Tokens",
      "Thèmes",
      "Contrats"
    ]);
  });

  it("exposes the React docs surface as a first-class route", () => {
    const reactRoute = fileURLToPath(new URL("../routes/react/+page.svelte", import.meta.url));

    expect(DOCS_FOUNDATION_NAV).toContainEqual({ label: "React", href: "/react" });
    expect(resolveBreadcrumb("/react").map((item) => item.label)).toEqual([
      "Catalogue",
      "React"
    ]);
    expect(readFileSync(reactRoute, "utf8")).toContain("React package");
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
