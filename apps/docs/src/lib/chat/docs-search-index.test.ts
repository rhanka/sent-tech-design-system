import { describe, expect, it } from "vitest";

// L'index par défaut est construit depuis les sources déclaratives du site
// (components-catalog, docs-navigation) : aucun DOM, aucun réseau.
import {
  buildAssistantPrompt,
  buildDocsSearchIndex,
  normalizeSearchText,
  searchDocs,
  type DocsSearchDocument
} from "./docs-search-index";

const FIXTURE: DocsSearchDocument[] = [
  {
    id: "component:button",
    url: "/components/button",
    kind: "component",
    title: { fr: "Button", en: "Button" },
    excerpt: {
      fr: "Action primaire, secondaire, fantôme ou destructive.",
      en: "Primary, secondary, ghost, or destructive action."
    },
    keywords: ["button", "Actions", "Actions"]
  },
  {
    id: "component:copy-button",
    url: "/components/copy-button",
    kind: "component",
    title: { fr: "CopyButton", en: "CopyButton" },
    excerpt: {
      fr: "Bouton dédié à la copie d'une valeur.",
      en: "Button dedicated to copying a value."
    },
    keywords: ["copy-button", "Actions", "Actions"]
  },
  {
    id: "guide:/",
    url: "/",
    kind: "guide",
    title: { fr: "Vue d'ensemble", en: "Vue d'ensemble" },
    excerpt: { fr: "", en: "" },
    keywords: []
  }
];

describe("normalizeSearchText", () => {
  it("lowercases and strips accents", () => {
    expect(normalizeSearchText("  Évènement Été ")).toBe("evenement ete");
  });
});

describe("buildDocsSearchIndex", () => {
  it("indexes the component catalog with stable ids and urls", () => {
    const index = buildDocsSearchIndex();
    const button = index.find((doc) => doc.id === "component:button");
    expect(button).toBeDefined();
    expect(button?.url).toBe("/components/button");
    expect(button?.kind).toBe("component");
    expect(index.some((doc) => doc.kind === "guide")).toBe(true);
  });
});

describe("searchDocs", () => {
  it("returns nothing on an empty query", () => {
    expect(searchDocs(FIXTURE, "   ", "fr")).toEqual([]);
  });

  it("ranks the exact title match above prefix matches", () => {
    const results = searchDocs(FIXTURE, "button", "fr");
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].doc.id).toBe("component:button");
    expect(results[1].doc.id).toBe("component:copy-button");
  });

  it("matches accent-insensitively in excerpts", () => {
    const results = searchDocs(FIXTURE, "fantome", "fr");
    expect(results.map((r) => r.doc.id)).toContain("component:button");
  });

  it("requires every term to match (AND semantics)", () => {
    expect(searchDocs(FIXTURE, "button zzznope", "fr")).toEqual([]);
  });

  it("honors the limit", () => {
    expect(searchDocs(FIXTURE, "button", "fr", 1)).toHaveLength(1);
  });
});

describe("buildAssistantPrompt", () => {
  it("embeds the query and the top results as grounded context", () => {
    const results = searchDocs(FIXTURE, "button", "fr");
    const prompt = buildAssistantPrompt("comment utiliser button ?", results, "fr");
    expect(prompt).toContain("comment utiliser button ?");
    expect(prompt).toContain("/components/button");
    expect(prompt).toContain("Pages pertinentes");
  });

  it("falls back to the bare question without results", () => {
    const prompt = buildAssistantPrompt("hello", [], "en");
    expect(prompt).toBe("Documentation question: hello");
  });
});
