import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEMES, PUBLIC_THEMES, isPrivateTheme, filterThemes } from "./theme-catalog";
import { readUrlParams, resolveTheme, enforceThemePrivacy } from "./url-state";
import { vi } from "vitest";

describe("docs theme catalogue", () => {
  it("includes every theme workspace exactly once, plus Sentropic", () => {
    const packages = readdirSync(new URL("../../../../packages/", import.meta.url))
      .filter((name) => name.startsWith("theme-"))
      .map((name) => name.slice("theme-".length));
    expect(THEMES.map((theme) => theme.id).sort()).toEqual(["sent-tech", ...packages].sort());
  });

  it("accepts every selectable theme in URLs and saved preferences", () => {
    try {
      for (const theme of THEMES) {
        vi.stubGlobal("window", { location: { search: `?theme=${theme.id}` } });
        vi.stubGlobal("localStorage", { getItem: () => theme.id });
        expect(readUrlParams().theme).toBe(theme.id);
        expect(resolveTheme(null, "st-docs-theme")).toBe(theme.id);
      }
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("keeps measured clones of private brands out of the public picker", () => {
    // Échantillon de boîtes de la région de Montréal : elles n'existent que
    // derrière Ctrl+Shift+X, jamais dans le sélecteur du site public.
    const montreal = [
      "cossette", "gameloft", "stingray", "ubisoft", "moment-factory",
      "cirque-du-soleil", "desjardins", "videotron", "lg2", "sid-lee",
      "behaviour-interactive", "eidos-montreal", "hydro-quebec", "saq", "stm"
    ];
    const publicIds = new Set(PUBLIC_THEMES.map((theme) => theme.id));
    const allIds = new Set(THEMES.map((theme) => theme.id));

    for (const id of montreal) {
      expect(allIds.has(id), `${id} doit rester dans le catalogue complet`).toBe(true);
      expect(publicIds.has(id), `${id} ne doit pas être public`).toBe(false);
      expect(isPrivateTheme(id)).toBe(true);
    }
  });

  it("treats an unknown theme as private, so a new brand clone never leaks by omission", () => {
    expect(isPrivateTheme("une-marque-ajoutee-demain")).toBe(true);
    expect(PUBLIC_THEMES.length).toBeLessThan(THEMES.length);
  });

  it("keeps the public picker to our own theme and governmental systems, with no private brand", () => {
    expect(PUBLIC_THEMES.map((theme) => theme.id).sort()).toEqual([
      "canada", "dsfr", "quebec", "sent-tech"
    ]);
  });

  it("keeps AI and software vendor brands behind Ctrl+Shift+X too", () => {
    // Une documentation publique ne fait pas d'une marque un thème public.
    const vendors = [
      "ai21", "amazon", "anthropic", "assistant-ui", "character-ai", "cohere",
      "copilot", "databricks", "deepseek", "fireworks", "gemini", "github",
      "groq", "huggingface", "inflection", "meta", "mistral", "nous-hermes",
      "openai", "openrouter", "palantir", "perplexity", "poe", "replicate",
      "stability", "together", "vercel", "writer", "xai", "you", "carbon", "airbus"
    ];
    for (const id of vendors) {
      expect(isPrivateTheme(id), `${id} ne doit pas être public`).toBe(true);
    }
  });

  it("lists the house theme first, then every other theme alphabetically", () => {
    expect(THEMES[0].id).toBe("sent-tech");
    const rest = THEMES.slice(1).map((theme) => theme.label);
    expect(rest).toEqual([...rest].sort((a, b) => a.localeCompare(b, "fr")));
  });

  it("drops a private theme coming from outside unless masking is lifted", () => {
    expect(enforceThemePrivacy("cossette", false)).toBe("sent-tech");
    expect(enforceThemePrivacy("cossette", true)).toBe("cossette");
    expect(enforceThemePrivacy("dsfr", false)).toBe("dsfr");
    // Identifiant inconnu : traité comme privé, donc écarté.
    expect(enforceThemePrivacy("marque-inconnue", false)).toBe("sent-tech");
  });

  it("filters enterprise and startup labels and ids without case sensitivity", () => {
    expect(filterThemes(THEMES, "  DESJ  ").map((theme) => theme.id)).toEqual(["desjardins"]);
    expect(filterThemes(THEMES, "Hydro-Qué").map((theme) => theme.id)).toEqual(["hydro-quebec"]);
    expect(filterThemes(THEMES, "NATIONAL-BANK").map((theme) => theme.id)).toEqual(["national-bank"]);
    expect(filterThemes(THEMES, "openai").map((theme) => theme.id)).toEqual(["openai"]);
    expect(filterThemes(THEMES, "")).toHaveLength(THEMES.length);
    expect(filterThemes(THEMES, "no-such-theme")).toEqual([]);
  });
});
