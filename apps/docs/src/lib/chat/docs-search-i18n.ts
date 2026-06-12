// Copie FR/EN du module de recherche docs (même pattern que chat-i18n.ts).
import type { Locale } from "$lib/i18n";
import type { DocsSearchKind } from "./docs-search-index";

export interface DocsSearchCopy {
  label: string;
  placeholder: string;
  clearLabel: string;
  resultsLabel: string;
  noResults: (query: string) => string;
  kindLabels: Record<DocsSearchKind, string>;
  askAssistant: string;
  askAssistantHint: string;
  assistantAnswerLabel: string;
  assistantThinking: string;
  assistantUnavailable: string;
}

const fr: DocsSearchCopy = {
  label: "Rechercher dans la documentation",
  placeholder: "Rechercher un composant, un guide...",
  clearLabel: "Effacer la recherche",
  resultsLabel: "Résultats de recherche",
  noResults: (query) => `Aucun résultat pour « ${query} ».`,
  kindLabels: {
    component: "Composant",
    guide: "Guide",
    view: "Vue"
  },
  askAssistant: "Demander à l'assistant",
  askAssistantHint:
    "Pose la question telle quelle à l'assistant, avec les pages trouvées en contexte.",
  assistantAnswerLabel: "Réponse de l'assistant",
  assistantThinking: "L'assistant rédige une réponse...",
  assistantUnavailable:
    "Assistant non configuré : seule la recherche lexicale est active."
};

const en: DocsSearchCopy = {
  label: "Search the documentation",
  placeholder: "Search a component, a guide...",
  clearLabel: "Clear search",
  resultsLabel: "Search results",
  noResults: (query) => `No results for "${query}".`,
  kindLabels: {
    component: "Component",
    guide: "Guide",
    view: "View"
  },
  askAssistant: "Ask the assistant",
  askAssistantHint:
    "Sends the question as-is to the assistant, with the matched pages as context.",
  assistantAnswerLabel: "Assistant answer",
  assistantThinking: "The assistant is writing an answer...",
  assistantUnavailable:
    "Assistant not configured: only lexical search is active."
};

export function docsSearchCopy(locale: Locale): DocsSearchCopy {
  return locale === "fr" ? fr : en;
}
