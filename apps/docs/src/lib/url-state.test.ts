import { describe, expect, it, beforeEach, vi } from "vitest";

// url-state.ts uses window.location — mock it for unit tests.
const mockSearch = { current: "" };

vi.stubGlobal("window", {
  location: {
    get search() { return mockSearch.current; }
  }
});

// localStorage mock
const store: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; }
});

import {
  readUrlParams,
  resolveTheme,
  resolveFramework,
  reconcileTheme,
  reconcileFramework,
  buildUpdatedSearch,
  DEFAULT_THEME_ID
} from "./url-state";
import { DEFAULT_FRAMEWORK, FRAMEWORK_STORAGE_KEY } from "./framework.svelte";

describe("url-state helpers", () => {
  beforeEach(() => {
    mockSearch.current = "";
    for (const k of Object.keys(store)) delete store[k];
  });

  describe("readUrlParams", () => {
    it("returns null for absent params", () => {
      mockSearch.current = "";
      const { theme, framework } = readUrlParams();
      expect(theme).toBeNull();
      expect(framework).toBeNull();
    });

    it("reads a valid theme from the URL", () => {
      mockSearch.current = "?theme=dsfr";
      expect(readUrlParams().theme).toBe("dsfr");
    });

    it("reads a valid framework from the URL", () => {
      mockSearch.current = "?framework=react";
      expect(readUrlParams().framework).toBe("react");
    });

    it("rejects an invalid theme (returns null)", () => {
      mockSearch.current = "?theme=evil";
      expect(readUrlParams().theme).toBeNull();
    });

    it("rejects an invalid framework (returns null)", () => {
      mockSearch.current = "?framework=angular";
      expect(readUrlParams().framework).toBeNull();
    });

    it("reads both params together", () => {
      mockSearch.current = "?theme=carbon&framework=vue";
      const { theme, framework } = readUrlParams();
      expect(theme).toBe("carbon");
      expect(framework).toBe("vue");
    });
  });

  describe("resolveTheme (precedence: URL > localStorage > default)", () => {
    it("uses URL value when present", () => {
      store["st-docs-theme"] = "carbon";
      expect(resolveTheme("dsfr", "st-docs-theme")).toBe("dsfr");
    });

    it("falls back to localStorage when URL is null", () => {
      store["st-docs-theme"] = "carbon";
      expect(resolveTheme(null, "st-docs-theme")).toBe("carbon");
    });

    it("falls back to default when both are absent", () => {
      expect(resolveTheme(null, "st-docs-theme")).toBe(DEFAULT_THEME_ID);
    });
  });

  describe("resolveFramework (precedence: URL > localStorage > default)", () => {
    it("uses URL value when present", () => {
      store[FRAMEWORK_STORAGE_KEY] = "vue";
      expect(resolveFramework("react", FRAMEWORK_STORAGE_KEY)).toBe("react");
    });

    it("falls back to localStorage when URL is null", () => {
      store[FRAMEWORK_STORAGE_KEY] = "vue";
      expect(resolveFramework(null, FRAMEWORK_STORAGE_KEY)).toBe("vue");
    });

    it("falls back to default when both are absent", () => {
      expect(resolveFramework(null, FRAMEWORK_STORAGE_KEY)).toBe(DEFAULT_FRAMEWORK);
    });
  });

  describe("buildUpdatedSearch", () => {
    it("returns empty string for defaults (clean URL)", () => {
      mockSearch.current = "";
      expect(buildUpdatedSearch("sent-tech", "svelte")).toBe("");
    });

    it("adds ?theme= for a non-default theme", () => {
      mockSearch.current = "";
      expect(buildUpdatedSearch("dsfr", "svelte")).toBe("?theme=dsfr");
    });

    it("adds ?framework= for a non-default framework", () => {
      mockSearch.current = "";
      expect(buildUpdatedSearch("sent-tech", "react")).toBe("?framework=react");
    });

    it("adds both params when both are non-default", () => {
      mockSearch.current = "";
      const result = buildUpdatedSearch("carbon", "vue");
      expect(result).toContain("theme=carbon");
      expect(result).toContain("framework=vue");
    });

    it("removes ?theme when switching back to default", () => {
      mockSearch.current = "?theme=dsfr";
      expect(buildUpdatedSearch("sent-tech", "svelte")).toBe("");
    });

    it("preserves unrelated query params (compare mode)", () => {
      mockSearch.current = "?compare=1&scenario=button-default";
      const result = buildUpdatedSearch("dsfr", "svelte");
      expect(result).toContain("compare=1");
      expect(result).toContain("scenario=button-default");
      expect(result).toContain("theme=dsfr");
    });
  });

  // ── Réconciliation à la navigation : régression « thème/framework oubliés ».
  // Un lien de navigation interne (sidebar/top-nav) est un href STATIQUE sans
  // query param. Après navigation, l'URL n'a plus ?theme/?framework. La règle
  // doit alors CONSERVER l'état courant (param absent => on garde), pas retomber
  // au défaut. Si l'URL porte le param (deep-link, back/forward), il fait autorité.
  describe("reconcileTheme / reconcileFramework (navigation persists state)", () => {
    it("keeps the current theme when the URL param is absent (internal nav)", () => {
      expect(reconcileTheme(null, "dsfr")).toBe("dsfr");
      expect(reconcileTheme(null, "carbon")).toBe("carbon");
    });

    it("keeps the current framework when the URL param is absent (internal nav)", () => {
      expect(reconcileFramework(null, "react")).toBe("react");
      expect(reconcileFramework(null, "vue")).toBe("vue");
    });

    it("lets the URL param win when present (deep-link / back-forward)", () => {
      expect(reconcileTheme("airbus", "dsfr")).toBe("airbus");
      expect(reconcileFramework("vue", "react")).toBe("vue");
    });

    it("never falls back to default on internal navigation", () => {
      // Le bug d'origine : nextTheme = urlTheme ?? DEFAULT => réinit au défaut.
      // Garantie : un thème/framework non-défaut survit à une nav sans params.
      expect(reconcileTheme(null, "carbon")).not.toBe(DEFAULT_THEME_ID);
      expect(reconcileFramework(null, "vue")).not.toBe(DEFAULT_FRAMEWORK);
    });
  });

  // ── Bout-en-bout simulé : choix utilisateur -> persistance -> nav -> reload.
  // Reproduit le cycle de vie sans monter le layout : on persiste via les mêmes
  // clés que les stores, on simule une navigation interne (URL vidée de ses
  // params) puis un reload (localStorage relu au montage initial).
  describe("end-to-end: theme + framework survive navigation and reload", () => {
    it("survives an internal navigation that clears the URL params", () => {
      // 1) L'utilisateur a choisi carbon + react ; l'état est persisté.
      store["st-docs-theme"] = "carbon";
      store[FRAMEWORK_STORAGE_KEY] = "react";
      let currentTheme = "carbon" as const;
      let currentFramework = "react" as const;

      // 2) Navigation interne -> l'URL ne porte AUCUN param.
      mockSearch.current = "";
      const { theme: urlTheme, framework: urlFramework } = readUrlParams();
      expect(urlTheme).toBeNull();
      expect(urlFramework).toBeNull();

      // 3) Réconciliation : l'état doit être CONSERVÉ (pas de retour au défaut).
      const nextTheme = reconcileTheme(urlTheme, currentTheme);
      const nextFramework = reconcileFramework(urlFramework, currentFramework);
      expect(nextTheme).toBe("carbon");
      expect(nextFramework).toBe("react");

      // 4) Ré-estampille (afterNavigate, store -> URL) : l'URL REDEVIENT la
      //    source de vérité. Après une nav « nue », buildUpdatedSearch ré-inscrit
      //    l'état courant dans la search => l'URL porte de nouveau ?theme/?framework,
      //    donc partageable et deep-linkable (le store ne diverge jamais de l'URL).
      const restamped = buildUpdatedSearch(nextTheme, nextFramework);
      expect(restamped).toContain("theme=carbon");
      expect(restamped).toContain("framework=react");
    });

    it("re-stamps the URL as the source of truth after a theme/framework change", () => {
      // Un clic de sélecteur ne navigue pas : la sync sortante écrit l'URL.
      // Partir d'une URL au défaut (vide) -> choisir airbus + vue.
      mockSearch.current = "";
      const search = buildUpdatedSearch("airbus", "vue");
      expect(search).toContain("theme=airbus");
      expect(search).toContain("framework=vue");
      // Et un retour au défaut nettoie l'URL (source de vérité = défaut implicite).
      mockSearch.current = search;
      expect(buildUpdatedSearch("sent-tech", "svelte")).toBe("");
    });

    it("restores theme + framework from localStorage on reload (fresh mount, empty URL)", () => {
      // L'utilisateur avait choisi dsfr + vue.
      store["st-docs-theme"] = "dsfr";
      store[FRAMEWORK_STORAGE_KEY] = "vue";
      // Reload : montage initial, URL vide -> priorité URL > localStorage > défaut.
      mockSearch.current = "";
      const { theme: urlTheme, framework: urlFramework } = readUrlParams();
      expect(resolveTheme(urlTheme, "st-docs-theme")).toBe("dsfr");
      expect(resolveFramework(urlFramework, FRAMEWORK_STORAGE_KEY)).toBe("vue");
    });

    it("a deep-link URL still wins over a stale localStorage on reload", () => {
      store["st-docs-theme"] = "dsfr";
      store[FRAMEWORK_STORAGE_KEY] = "vue";
      mockSearch.current = "?theme=carbon&framework=react";
      const { theme: urlTheme, framework: urlFramework } = readUrlParams();
      expect(resolveTheme(urlTheme, "st-docs-theme")).toBe("carbon");
      expect(resolveFramework(urlFramework, FRAMEWORK_STORAGE_KEY)).toBe("react");
    });
  });
});
