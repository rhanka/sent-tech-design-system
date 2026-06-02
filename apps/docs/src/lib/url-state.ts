// Synchronisation bidirectionnelle des paramètres d'URL pour le thème et le framework.
// Toutes les opérations nécessitent le contexte browser (jamais appelées en SSR).

import type { FrameworkId } from "./framework.svelte";
import { FRAMEWORKS, DEFAULT_FRAMEWORK } from "./framework.svelte";

// ── Thèmes valides ────────────────────────────────────────────────────────────
export type ThemeId = "sent-tech" | "dsfr" | "carbon" | "airbus";
export const VALID_THEME_IDS: readonly ThemeId[] = ["sent-tech", "dsfr", "carbon", "airbus"];
export const DEFAULT_THEME_ID: ThemeId = "sent-tech";

function isThemeId(value: string | null): value is ThemeId {
  return VALID_THEME_IDS.includes(value as ThemeId);
}

function isFrameworkId(value: string | null): value is FrameworkId {
  return FRAMEWORKS.some((f) => f.id === value);
}

// ── Lecture initiale depuis l'URL ────────────────────────────────────────────

export interface UrlParams {
  theme: ThemeId | null;
  framework: FrameworkId | null;
}

/** Lit `?theme` et `?framework` depuis l'URL courante. Retourne null si absent ou invalide. */
export function readUrlParams(): UrlParams {
  const params = new URLSearchParams(window.location.search);
  const rawTheme = params.get("theme");
  const rawFramework = params.get("framework");
  return {
    theme: isThemeId(rawTheme) ? rawTheme : null,
    framework: isFrameworkId(rawFramework) ? rawFramework : null
  };
}

// ── Résolution avec priorité URL > localStorage > défaut ─────────────────────

export function resolveTheme(
  urlValue: ThemeId | null,
  storageKey: string
): ThemeId {
  if (urlValue !== null) return urlValue;
  const saved = localStorage.getItem(storageKey);
  if (isThemeId(saved)) return saved;
  return DEFAULT_THEME_ID;
}

export function resolveFramework(
  urlValue: FrameworkId | null,
  storageKey: string
): FrameworkId {
  if (urlValue !== null) return urlValue;
  const saved = localStorage.getItem(storageKey);
  if (isFrameworkId(saved)) return saved;
  return DEFAULT_FRAMEWORK;
}

// ── Calcul de l'URL mise à jour (sans effet de bord) ─────────────────────────

/**
 * Calcule la `search` string pour `?theme` et `?framework`.
 * Les paramètres égaux à leur valeur par défaut sont omis pour garder l'URL propre.
 * Préserve les paramètres existants non liés (ex. `?compare`, `?scenario`).
 * Cette fonction est browser-only (ne pas appeler en SSR).
 */
export function buildUpdatedSearch(themeId: ThemeId, frameworkId: FrameworkId): string {
  // Partir des paramètres actuels pour préserver les params tierces (compare, scenario…).
  const params = new URLSearchParams(window.location.search);

  if (themeId === DEFAULT_THEME_ID) {
    params.delete("theme");
  } else {
    params.set("theme", themeId);
  }

  if (frameworkId === DEFAULT_FRAMEWORK) {
    params.delete("framework");
  } else {
    params.set("framework", frameworkId);
  }

  const search = params.toString();
  return search ? `?${search}` : "";
}
