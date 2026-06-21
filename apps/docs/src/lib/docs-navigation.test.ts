import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { COMPONENTS } from "./components-catalog";
import {
  DOCS_FOUNDATION_NAV,
  DOCS_TOP_NAV,
  DOCS_VERSION,
  buildFoundationNav,
  buildComponentNavGroups,
  buildViewsNav,
  buildTopNav,
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
      // (légende du graphe, documentée avec le composant graphe) ; AppShell +
      // IdentityButton = chrome applicatif infra (ex-paquet app-shell), pas des
      // briques catalogue autonomes.
      .filter(
        (name) =>
          name !== "ThemeProvider" &&
          name !== "GraphLegend" &&
          name !== "AppShell" &&
          name !== "NavShell" &&
          name !== "NavRail" &&
          name !== "NavDrawer" &&
          name !== "ContextPanel" &&
          name !== "UtilityPanel" &&
          name !== "IdentityButton" &&
          // Gabarits d'application — documentés dans /layouts, pas dans le catalogue composants
          name !== "Dashboard" &&
          name !== "KanbanBoard" &&
          name !== "ListReportPage" &&
          name !== "MasterDetail" &&
          name !== "ObjectPage" &&
          name !== "Wizard"
      )
      .sort();
    const catalogComponents = COMPONENTS.map((component) => component.name).sort();

    expect(catalogComponents).toEqual(exportedComponents);
    expect(COMPONENTS.every((component) => component.status === "documented")).toBe(true);
  });

  it("reduces the top nav to a single aligned first level (Documentation/Composants/Vues)", () => {
    expect(DOCS_VERSION).toMatch(/^v\d+\.\d+\.\d+$/);
    expect(DOCS_TOP_NAV.map((item) => item.label)).toEqual([
      "Documentation",
      "Composants",
      "Vues",
      "Gabarits"
    ]);
    expect(DOCS_TOP_NAV.map((item) => item.href)).toEqual(["/", "/components", "/views", "/layouts"]);
  });

  it("localizes top and side navigation labels", () => {
    expect(buildTopNav("en").map((item) => item.label)).toEqual([
      "Documentation",
      "Components",
      "Views",
      "Layouts"
    ]);

    expect(buildFoundationNav("fr").map((item) => item.label)).toEqual([
      "Vue d'ensemble",
      "Démarrage rapide",
      "Fondations",
      "Tokens",
      "Thèmes"
    ]);
    expect(buildFoundationNav("en").map((item) => item.label)).toEqual([
      "Overview",
      "Getting started",
      "Foundations",
      "Tokens",
      "Themes"
    ]);
  });

  it("keeps the Documentation sub-nav to page sections (Contrats fusionné dans Thèmes, Aperçu hors menu)", () => {
    expect(buildFoundationNav("fr").map((item) => item.href)).toEqual([
      "/",
      "/getting-started",
      "/#foundations",
      "/#tokens",
      "/#themes"
    ]);
    // Aperçu multi-framework + Contrats retirés du menu latéral (demande user).
    expect(buildFoundationNav("fr").some((item) => item.href === "/preview")).toBe(false);
    expect(buildFoundationNav("fr").some((item) => item.href === "/#contracts")).toBe(false);
    expect(DOCS_FOUNDATION_NAV.map((item) => item.label)).toEqual([
      "Vue d'ensemble",
      "Démarrage rapide",
      "Fondations",
      "Tokens",
      "Thèmes"
    ]);
  });

  it("groups the views gallery by business domain, free of product citations", () => {
    const groups = buildViewsNav("fr");
    expect(groups.map((group) => group.label)).toEqual([
      "Analytics & BI",
      "CRM & Ventes",
      "ERP & Stock",
      "Comptabilité",
      "RH",
      "Projet & Support",
      "Production",
      "Fondations d'application"
    ]);

    const items = groups.flatMap((group) => group.items);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.href === `/views/${item.slug}`)).toBe(true);

    // Aucune marque/produit dans les libellés de vues (fr + en).
    const haystack = JSON.stringify(buildViewsNav("fr")) + JSON.stringify(buildViewsNav("en"));
    expect(/odoo|jira|salesforce|hubspot/i.test(haystack)).toBe(false);
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

  it("localizes component group labels and breadcrumbs", () => {
    expect(buildComponentNavGroups("en").map((group) => group.label)).toContain("Forms");
    expect(buildComponentNavGroups("fr").map((group) => group.label)).toContain("Formulaires");
    expect(resolveBreadcrumb("/preview", "en").map((item) => item.label)).toEqual([
      "Catalog",
      "Preview"
    ]);
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
