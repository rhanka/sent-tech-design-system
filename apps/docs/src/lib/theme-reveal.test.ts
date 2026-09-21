// @vitest-environment jsdom
//
// Câblage du layout réel : Ctrl+Shift+X est un interrupteur de révélation,
// persisté, qui n'ouvre rien ; le bouton d'en-tête et le menu mobile montrent
// la liste qui correspond au mode. La logique pure vit dans theme-access.test.ts.
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRawSnippet, flushSync, tick } from "svelte";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import Layout from "../routes/+layout.svelte";
import { PUBLIC_THEMES, THEMES } from "./theme-catalog";

const nav = vi.hoisted(() => ({ url: new URL("http://localhost/") }));
vi.mock("$app/state", () => ({
  page: { get url() { return nav.url; }, state: {}, data: {}, params: {} }
}));
vi.mock("$app/navigation", () => ({ replaceState: vi.fn(), afterNavigate: vi.fn(), goto: vi.fn() }));
vi.mock("$app/environment", () => ({ browser: true, dev: false, building: false, version: "test" }));

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.removeAttribute("data-st-theme");
});

async function openLayoutAt(path: string) {
  nav.url = new URL(`http://localhost${path}`);
  window.history.replaceState({}, "", path);
  const children = createRawSnippet(() => ({ render: () => "<p>Contenu de la page</p>" }));
  render(Layout, { props: { children } });
  await tick();
}

async function settle() {
  flushSync();
  await tick();
}

async function pressRevealShortcut() {
  await fireEvent.keyDown(window, { key: "X", code: "KeyX", ctrlKey: true, shiftKey: true });
  await settle();
}

async function clickThemeButton() {
  await fireEvent.click(document.querySelector<HTMLButtonElement>(".docs-theme-trigger")!);
  await settle();
}

const picker = () => document.querySelector('[role="dialog"]');
const pickerLabels = () =>
  [...(picker()?.querySelectorAll(".st-menu__itemLabel") ?? [])].map((label) => label.textContent);
const labels = (themes: readonly { label: string }[]) => themes.map((theme) => theme.label);
const activeTheme = () => document.documentElement.getAttribute("data-st-theme");
const storedReveal = () => localStorage.getItem("st-docs-demo-mode");

describe("layout: Ctrl+Shift+X reveals private themes, it does not open the picker", () => {
  it("reveals, persists, lets the header button search all themes, then masks back to sent-tech", async () => {
    await openLayoutAt("/");
    await clickThemeButton();
    expect(pickerLabels()).toEqual(labels(PUBLIC_THEMES));
    await fireEvent.keyDown(window, { key: "Escape" });
    await settle();
    expect(picker()).toBeNull();

    await pressRevealShortcut();
    expect(picker()).toBeNull();
    expect(storedReveal()).toBe("true");

    await clickThemeButton();
    expect(pickerLabels()).toEqual(labels(THEMES));
    await fireEvent.input(picker()!.querySelector("input")!, { target: { value: "coss" } });
    await settle();
    expect(pickerLabels()).toEqual(["Cossette"]);
    await fireEvent.click(picker()!.querySelector('[role="menuitem"]')!);
    await settle();
    expect(activeTheme()).toBe("cossette");
    expect(picker()).toBeNull();

    // Quitter le mode révélé sur un thème privé ramène à sent-tech.
    await pressRevealShortcut();
    expect(storedReveal()).toBe("false");
    expect(activeTheme()).toBe("sent-tech");
    await clickThemeButton();
    expect(pickerLabels()).toEqual(labels(PUBLIC_THEMES));
  });

  it("makes an open picker's list follow the shortcut, without closing it", async () => {
    await openLayoutAt("/");
    await clickThemeButton();
    expect(pickerLabels()).toEqual(labels(PUBLIC_THEMES));

    await pressRevealShortcut();
    expect(picker()).not.toBeNull();
    expect(pickerLabels()).toEqual(labels(THEMES));

    await pressRevealShortcut();
    expect(picker()).not.toBeNull();
    expect(pickerLabels()).toEqual(labels(PUBLIC_THEMES));
  });

  it("keeps the search query when the shortcut flips the list of an open picker", async () => {
    await openLayoutAt("/");
    await clickThemeButton();
    const search = picker()!.querySelector("input")!;
    await fireEvent.input(search, { target: { value: "coss" } });
    await settle();
    expect(pickerLabels()).toEqual([]);

    // La recherche est indépendante de l'interrupteur : elle garde sa saisie
    // et s'applique à la liste révélée.
    await pressRevealShortcut();
    expect(picker()!.querySelector("input")!.value).toBe("coss");
    expect(pickerLabels()).toEqual(["Cossette"]);
  });

  it("gives the app-shell header (?shell=v2) the same list as the picker", async () => {
    await openLayoutAt("/?shell=v2");
    const shellThemeItems = async () => {
      const trigger = [...document.querySelectorAll<HTMLButtonElement>("button.st-shell__switch")]
        .find((button) => button.textContent?.includes("Sent Tech"))!;
      await fireEvent.click(trigger);
      await settle();
      const items = [...document.querySelectorAll(".st-menu__item")].map((item) => item.textContent?.trim());
      await fireEvent.keyDown(window, { key: "Escape" });
      await settle();
      return items;
    };
    expect(await shellThemeItems()).toEqual(labels(PUBLIC_THEMES));
    await pressRevealShortcut();
    expect(await shellThemeItems()).toHaveLength(THEMES.length);
  });

  it("gives the mobile menu the same list as the picker", async () => {
    await openLayoutAt("/");
    await pressRevealShortcut();
    await fireEvent.click(document.querySelector<HTMLButtonElement>(".docs-mobile-menu-trigger")!);
    await settle();
    const mobileThemes = document.querySelectorAll(".docs-mobile-theme-switcher button");
    expect(mobileThemes).toHaveLength(THEMES.length);
  });

  it("boots a private theme from the URL or storage only when the persisted reveal is on", async () => {
    localStorage.setItem("st-docs-demo-mode", "true");
    await openLayoutAt("/?theme=cossette");
    expect(activeTheme()).toBe("cossette");
    cleanup();

    localStorage.clear();
    await openLayoutAt("/?theme=cossette");
    expect(activeTheme()).toBe("sent-tech");
    cleanup();

    localStorage.setItem("st-docs-theme", "cossette");
    await openLayoutAt("/");
    expect(activeTheme()).toBe("sent-tech");
  });
});
