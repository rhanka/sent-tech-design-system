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
});
