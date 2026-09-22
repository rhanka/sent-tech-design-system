// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { flushSync, tick } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FrameworkId } from "./framework.svelte";
import { DEFAULT_FRAMEWORK } from "./framework.svelte";
import { DEFAULT_THEME_ID, enforceThemePrivacy, readUrlParams, type ThemeId } from "./url-state";
import { syncUrlOutbound } from "./url-sync.svelte";

/**
 * Doublure du client SvelteKit, calquée sur `initialize()` de
 * @sveltejs/kit/src/runtime/client/client.js :
 *   1. `root = new app.root(...)` : le constructeur vide la file d'effets
 *      (`flushSync`) AVANT de rendre la main, `root` est donc encore indéfini
 *      pendant tout le premier flush ;
 *   2. `await Promise.resolve()` ;
 *   3. callbacks `afterNavigate` de la navigation initiale ;
 *   4. `started = true`.
 * Son `replaceState` fait, comme le vrai, `history.replaceState(...)` PUIS
 * `root.$set(...)` : appelé trop tôt, il lève la même TypeError qu'en
 * production. En mode « dev », il refuse en plus tout appel avant `started`,
 * comme le vrai en `vite dev`.
 */
function createKitDouble(mode: "prod" | "dev") {
  let root: { $set: (props: { page: { state: App.PageState } }) => void } | undefined;
  let started = false;
  const afterNavigateCallbacks = new Set<() => void>();
  const pageNotifications: string[] = [];

  const replaceState = vi.fn((url: string, state: App.PageState) => {
    if (mode === "dev" && !started) {
      throw new Error("Cannot call replaceState(...) before router is initialized");
    }
    history.replaceState(state, "", url);
    (root as NonNullable<typeof root>).$set({ page: { state } });
  });

  return {
    replaceState,
    afterNavigate: (callback: () => void) => {
      afterNavigateCallbacks.add(callback);
    },
    pageNotifications,
    /** Démarre le « routeur » en montant `mount` comme SvelteKit monte le layout. */
    async start(mount: () => void) {
      mount();
      flushSync(); // Svelte4Component : flushSync() dans le constructeur
      root = { $set: () => pageNotifications.push(window.location.pathname + window.location.search) };
      await Promise.resolve();
      for (const callback of afterNavigateCallbacks) callback();
      started = true;
    },
    /** Navigation interne vers un href statique, sans param. */
    navigate(url: string) {
      history.pushState({}, "", url);
      for (const callback of afterNavigateCallbacks) callback();
    }
  };
}

type Kit = ReturnType<typeof createKitDouble>;

/** Amorce l'état comme le layout (URL, puis filtre de confidentialité), et câble la sync. */
function mountLayoutLike(kit: Kit) {
  const params = readUrlParams();
  const state = $state<{ theme: ThemeId; framework: FrameworkId }>({
    theme: enforceThemePrivacy(params.theme ?? DEFAULT_THEME_ID, false),
    framework: params.framework ?? DEFAULT_FRAMEWORK
  });
  let cleanup = () => {};
  const mount = () => {
    cleanup = $effect.root(() => {
      syncUrlOutbound({
        theme: () => state.theme,
        framework: () => state.framework,
        replaceState: kit.replaceState,
        pageState: () => ({}),
        afterNavigate: kit.afterNavigate
      });
    });
  };
  return { state, mount, cleanup: () => cleanup() };
}

const here = () => window.location.pathname + window.location.search;

describe.each(["prod", "dev"] as const)("outbound URL sync (%s)", (mode) => {
  let kit: Kit;
  let layout: ReturnType<typeof mountLayoutLike> | undefined;

  beforeEach(() => {
    kit = createKitDouble(mode);
    layout = undefined;
  });

  afterEach(() => {
    layout?.cleanup();
    history.replaceState(null, "", "/");
  });

  async function load(url: string) {
    history.replaceState(null, "", url);
    layout = mountLayoutLike(kit);
    await kit.start(layout.mount);
    await tick();
    return layout;
  }

  // La régression : l'URL chargée porte un param que l'état retire. Avant la
  // correction, l'effet appelait replaceState dans le premier flush, et
  // `kit.start` rejetait avec « Cannot read properties of undefined (reading '$set') ».
  it.each([
    ["/?framework=svelte", "/"],
    ["/?theme=sent-tech", "/"],
    ["/?framework=zzz", "/"],
    ["/components/button?framework=svelte", "/components/button"],
    ["/components/panel-section?theme=sent-tech&framework=vue", "/components/panel-section?framework=vue"]
  ])("cleans %s only once the router has started", async (url, expected) => {
    await load(url);
    expect(here()).toBe(expected);
    expect(kit.replaceState).toHaveBeenCalledTimes(1);
    // …et le composant racine a bien reçu la page (store `page` notifié).
    expect(kit.pageNotifications).toEqual([expected]);
  });

  it("does not write anything when the loaded URL already matches the state", async () => {
    await load("/components/button?framework=react");
    expect(here()).toBe("/components/button?framework=react");
    expect(kit.replaceState).not.toHaveBeenCalled();
  });

  it("still rejects a private theme from the URL and cleans it (privacy filter upstream)", async () => {
    const { state } = await load("/components/button?theme=cossette&framework=vue");
    expect(state.theme).toBe(DEFAULT_THEME_ID);
    expect(here()).toBe("/components/button?framework=vue");
    expect(kit.replaceState.mock.calls.map(([url]) => url).join(" ")).not.toContain("cossette");
  });

  it("keeps the tabs live after a cleaned load: every framework change reaches the URL", async () => {
    const { state } = await load("/components/button?framework=svelte");
    for (const [fw, search] of [
      ["react", "?framework=react"],
      ["vue", "?framework=vue"],
      ["angular", "?framework=angular"],
      ["svelte", ""]
    ] as const) {
      state.framework = fw;
      await tick();
      expect(window.location.search).toBe(search);
    }
    expect(kit.replaceState).toHaveBeenCalledTimes(5);
    expect(kit.pageNotifications).toHaveLength(5);
  });

  it("re-stamps the state after a bare internal navigation, without looping", async () => {
    const { state } = await load("/?framework=svelte");
    state.framework = "react";
    await tick();
    kit.navigate("/components/alert");
    expect(here()).toBe("/components/alert?framework=react");
    const calls = kit.replaceState.mock.calls.length;
    await tick();
    await tick();
    expect(kit.replaceState.mock.calls.length).toBe(calls);
  });
});

describe("layout wiring", () => {
  it("never calls replaceState itself: every outbound write goes through the gated sync", () => {
    const layoutSource = readFileSync(resolve(__dirname, "../routes/+layout.svelte"), "utf8");
    const code = layoutSource.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/\breplaceState\s*\(/);
    expect(code).toContain("syncUrlOutbound({");
  });
});
