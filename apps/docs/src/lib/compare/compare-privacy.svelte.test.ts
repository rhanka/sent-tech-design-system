// @vitest-environment jsdom
//
// Non-régression : un thème privé ne s'affiche en compare que derrière
// Ctrl+Shift+X, que ce soit par deep-link (triptyque du layout) ou sur le banc
// /compare. Les deux fuites d'origine montraient la marque (bandeau, panneaux,
// iframe officielle, écarts) à tout visiteur qui connaissait l'URL.
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRawSnippet, flushSync, tick } from "svelte";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import Layout from "../../routes/+layout.svelte";
import ComparePage from "../../routes/compare/+page.svelte";
import CompareInLayoutFixture from "./CompareInLayoutFixture.svelte";
import { PRIVATE_THEME_ACCESS, compareThemeFor } from "./compare-store.svelte";

// Le layout lit l'URL par `page.url` (triptyque) et par `window.location`
// (thème actif) : les deux pointent sur la même adresse.
const nav = vi.hoisted(() => ({ url: new URL("http://localhost/") }));
vi.mock("$app/state", () => ({
  page: { get url() { return nav.url; }, state: {}, data: {}, params: {} }
}));
vi.mock("$app/navigation", () => ({ replaceState: vi.fn(), afterNavigate: vi.fn(), goto: vi.fn() }));
vi.mock("$app/environment", () => ({ browser: true, dev: false, building: false, version: "test" }));

// Le mode révélé est persisté : chaque test repart d'un stockage vide.
afterEach(() => {
  cleanup();
  localStorage.clear();
});

async function openLayoutAt(path: string) {
  nav.url = new URL(`http://localhost${path}`);
  window.history.replaceState({}, "", path);
  const children = createRawSnippet(() => ({ render: () => "<p>Contenu de la page</p>" }));
  render(Layout, { props: { children } });
  await tick();
}

async function pressDemoShortcut() {
  await fireEvent.keyDown(window, { key: "X", code: "KeyX", ctrlKey: true, shiftKey: true });
  flushSync();
  await tick();
}

const triptych = () => document.querySelector(".ctrip");

describe("compare deep-link: private themes stay behind Ctrl+Shift+X", () => {
  it("opens no compare for IBM Carbon on a masked load, and names it nowhere", async () => {
    await openLayoutAt("/components/button?compare=1&theme=carbon&scenario=Button");
    expect(triptych()).toBeNull();
    expect(document.querySelector("iframe.ctrip__frame")).toBeNull();
    expect(document.body.textContent).not.toMatch(/carbon|ibm/i);
    // Le contenu normal de la page reste servi.
    expect(document.body.textContent).toContain("Contenu de la page");
  }, 120_000);

  it("does not echo a private id without a reference theme either (Cossette)", async () => {
    await openLayoutAt("/components/button?compare=1&theme=cossette&scenario=Button");
    expect(triptych()).toBeNull();
    expect(document.body.textContent).not.toMatch(/cossette/i);
  });

  it.each(["dsfr", "canada", "quebec"])("still opens the compare of the public system %s", async (id) => {
    await openLayoutAt(`/components/button?compare=1&theme=${id}&scenario=Button`);
    expect(triptych()?.textContent).toContain(`Sentropic: ${id}`);
  });

  it("opens the private compare after Ctrl+Shift+X, in the same page", async () => {
    await openLayoutAt("/components/button?compare=1&theme=carbon&scenario=Button");
    expect(triptych()).toBeNull();
    await pressDemoShortcut();
    expect(triptych()?.textContent).toContain("Carbon Design System (IBM)");
    expect(triptych()?.textContent).toContain("Sentropic: carbon");
    expect(document.querySelector("iframe.ctrip__frame")).not.toBeNull();
  });
});

describe("/compare bench: private themes stay behind Ctrl+Shift+X", () => {
  const benchThemes = () =>
    [...document.querySelectorAll<HTMLElement>(".cmp-theme")].map((section) => section.dataset.stTheme);

  it("shows only public systems when masking holds (as prerendered, or without a layout)", () => {
    render(ComparePage);
    expect(benchThemes()).toEqual(["dsfr"]);
    expect(document.body.textContent).not.toMatch(/carbon|ibm/i);
    expect(document.querySelector('[data-compare-theme="carbon"]')).toBeNull();
    expect(document.head.innerHTML).not.toContain("cmp-scope--carbon");
  });

  it("adds private systems once masking is lifted, without reloading", () => {
    let allowed = $state(false);
    render(ComparePage, { context: new Map([[PRIVATE_THEME_ACCESS, () => allowed]]) });
    expect(benchThemes()).toEqual(["dsfr"]);
    allowed = true;
    flushSync();
    expect(benchThemes()).toEqual(["dsfr", "carbon"]);
    expect(document.body.textContent).toContain("IBM Carbon officiel");
    expect(document.head.innerHTML).toContain("cmp-scope--carbon");
  });

  it("follows the layout's reveal when mounted inside the real layout", async () => {
    // Le vrai layout, la vraie page : c'est le contexte fourni par le layout,
    // et non un contexte de test, qui décide. Un layout qui fournirait
    // `() => true` montrerait Carbon dès le chargement masqué.
    nav.url = new URL("http://localhost/compare");
    window.history.replaceState({}, "", "/compare");
    render(CompareInLayoutFixture);
    await tick();
    expect(benchThemes()).toEqual(["dsfr"]);
    expect(document.querySelector('[data-compare-theme="carbon"]')).toBeNull();

    await pressDemoShortcut();
    expect(benchThemes()).toEqual(["dsfr", "carbon"]);
  });
});

describe("compareThemeFor", () => {
  it("keeps public systems, drops private and unknown ids unless masking is lifted", () => {
    for (const id of ["dsfr", "canada", "quebec", "sent-tech"]) expect(compareThemeFor(id, false)).toBe(id);
    for (const id of ["carbon", "airbus", "cossette", "marque-inconnue"]) {
      expect(compareThemeFor(id, false)).toBeNull();
      expect(compareThemeFor(id, true)).toBe(id);
    }
    expect(compareThemeFor(null, true)).toBeNull();
  });
});
