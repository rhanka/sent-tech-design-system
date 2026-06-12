// ─────────────────────────────────────────────────────────────────────────────
// Index de recherche du contenu docs : contrat + builder + moteur lexical.
//
// Premier étage du module « DocsSearch » (recherche propulsée chat-ui) :
//   1. Index LEXICAL statique (ce fichier) : construit au build à partir des
//      sources déclaratives existantes (components-catalog, docs-navigation).
//      Zéro réseau, zéro coût : répond instantanément aux requêtes naviguées
//      (« button », « modal », « tokens »).
//   2. Escalade CONVERSATIONNELLE (DocsSearch.svelte) : si l'index ne suffit
//      pas, la requête + les meilleurs résultats sont envoyés au même endpoint
//      que le ChatWidget (contrat `sendChatMessage` de chat-config.ts) pour une
//      réponse rédigée, ancrée dans le contenu indexé.
//
// EXTRACTABILITÉ (voir docs/docs-template-extraction.md) : seul `buildDocsSearchIndex`
// connaît le contenu du DS. Le contrat `DocsSearchDocument` + `searchDocs` sont
// génériques et destinés au package template (un client comme dataviz fournit
// ses propres documents via sa registry).
// ─────────────────────────────────────────────────────────────────────────────

import type { Locale } from "$lib/i18n";
import {
  CATEGORY_LABELS,
  COMPONENTS,
  componentHref
} from "$lib/components-catalog";
import { DOCS_FOUNDATION_NAV } from "$lib/docs-navigation";

/** Nature de la page indexée (pilote le libellé de groupe dans les résultats). */
export type DocsSearchKind = "component" | "guide" | "view";

/**
 * CONTRAT D'INDEXATION : un document = une cible navigable de la doc.
 * Le template impose ce contrat ; chaque client (DS, dataviz, ...) fournit
 * son tableau de documents depuis sa source déclarative (catalog, registry).
 */
export interface DocsSearchDocument {
  /** Identifiant stable (slug unique dans l'index). */
  id: string;
  /** URL interne de la page (theme/framework sont ré-estampillés au routage). */
  url: string;
  kind: DocsSearchKind;
  /** Titre localisé affiché dans les résultats. */
  title: { fr: string; en: string };
  /** Extrait localisé (description courte de la page). */
  excerpt: { fr: string; en: string };
  /** Termes additionnels (synonymes, catégorie, alias) pesés dans le score. */
  keywords: string[];
}

export interface DocsSearchResult {
  doc: DocsSearchDocument;
  /** Score lexical relatif (plus haut = plus pertinent). */
  score: number;
}

/** Normalise pour la comparaison : minuscules + accents retirés. */
export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Construit l'index par défaut du site docs DS :
 * - 1 document par composant du catalogue (nom, description FR/EN, catégorie) ;
 * - 1 document par page de fondations (nav existante).
 * Pur et déterministe : appelable au build comme au runtime (site statique).
 */
export function buildDocsSearchIndex(): DocsSearchDocument[] {
  const componentDocs: DocsSearchDocument[] = COMPONENTS.map((entry) => ({
    id: `component:${entry.slug}`,
    url: componentHref(entry),
    kind: "component",
    title: { fr: entry.name, en: entry.name },
    excerpt: entry.description,
    keywords: [
      entry.slug,
      CATEGORY_LABELS[entry.category].fr,
      CATEGORY_LABELS[entry.category].en
    ]
  }));

  const guideDocs: DocsSearchDocument[] = DOCS_FOUNDATION_NAV.map((item) => ({
    id: `guide:${item.href}`,
    url: item.href,
    kind: "guide",
    title: { fr: item.label, en: item.label },
    excerpt: { fr: "", en: "" },
    keywords: []
  }));

  return [...componentDocs, ...guideDocs];
}

const TITLE_EXACT = 100;
const TITLE_PREFIX = 60;
const TITLE_CONTAINS = 40;
const KEYWORD_MATCH = 25;
const EXCERPT_CONTAINS = 10;

/**
 * Recherche lexicale : score par terme (titre exact > préfixe > inclusion >
 * mots-clés > extrait), tous les termes doivent matcher au moins un champ.
 * Pure (pas d'état, pas de DOM) : testable et portable telle quelle dans le
 * package template.
 */
export function searchDocs(
  index: DocsSearchDocument[],
  query: string,
  locale: Locale,
  limit = 8
): DocsSearchResult[] {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const results: DocsSearchResult[] = [];

  for (const doc of index) {
    const title = normalizeSearchText(doc.title[locale]);
    const excerpt = normalizeSearchText(doc.excerpt[locale]);
    const keywords = doc.keywords.map(normalizeSearchText);

    let score = 0;
    let allTermsMatch = true;

    for (const term of terms) {
      let termScore = 0;
      if (title === term) termScore = TITLE_EXACT;
      else if (title.startsWith(term)) termScore = TITLE_PREFIX;
      else if (title.includes(term)) termScore = TITLE_CONTAINS;
      else if (keywords.some((k) => k.includes(term))) termScore = KEYWORD_MATCH;
      else if (excerpt.includes(term)) termScore = EXCERPT_CONTAINS;

      if (termScore === 0) {
        allTermsMatch = false;
        break;
      }
      score += termScore;
    }

    if (allTermsMatch) {
      results.push({ doc, score });
    }
  }

  return results
    .sort(
      (a, b) =>
        b.score - a.score || a.doc.title[locale].localeCompare(b.doc.title[locale])
    )
    .slice(0, limit);
}

/**
 * Construit le message utilisateur envoyé à l'endpoint chat lors de l'escalade
 * conversationnelle : la question + le contexte des meilleurs résultats, pour
 * une réponse ancrée dans le contenu de la doc (pattern RAG côté client).
 */
export function buildAssistantPrompt(
  query: string,
  results: DocsSearchResult[],
  locale: Locale
): string {
  const intro =
    locale === "fr"
      ? `Question sur la documentation : ${query}`
      : `Documentation question: ${query}`;

  if (results.length === 0) return intro;

  const contextLabel =
    locale === "fr" ? "Pages pertinentes :" : "Relevant pages:";
  const lines = results
    .slice(0, 5)
    .map(
      (r) =>
        `- ${r.doc.title[locale]} (${r.doc.url})${
          r.doc.excerpt[locale] ? ` : ${r.doc.excerpt[locale]}` : ""
        }`
    );

  return [intro, "", contextLabel, ...lines].join("\n");
}
