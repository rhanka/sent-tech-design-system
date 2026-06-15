// Synchronisation bidirectionnelle des paramètres d'URL pour le thème et le framework.
// Toutes les opérations nécessitent le contexte browser (jamais appelées en SSR).

import type { FrameworkId } from "./framework.svelte";
import { FRAMEWORKS, DEFAULT_FRAMEWORK } from "./framework.svelte";

// ── Thèmes valides ────────────────────────────────────────────────────────────
export type ThemeId = "sent-tech" | "dsfr" | "carbon" | "airbus" | "canada" | "quebec" | "ssense" | "lightspeed" | "desjardins" | "national-bank" | "cirque-du-soleil" | "ubisoft" | "bombardier" | "cae" | "saq" | "cgi" | "stm" | "nuvei" | "coveo" | "circle-k" | "aldo" | "brp" | "mirego" | "ellio" | "air-canada" | "cascades" | "hopper" | "dialogue" | "moment-factory" | "lion-electric" | "genetec" | "videotron" | "saputo" | "metro" | "workleap" | "frank-and-oak" | "sid-lee";
export const VALID_THEME_IDS: readonly ThemeId[] = ["sent-tech", "dsfr", "carbon", "airbus", "canada", "quebec", "ssense", "lightspeed", "desjardins", "national-bank", "cirque-du-soleil", "ubisoft", "bombardier", "cae", "saq", "cgi", "stm", "nuvei", "coveo", "circle-k", "aldo", "brp", "mirego", "ellio", "air-canada", "cascades", "hopper", "dialogue", "moment-factory", "lion-electric", "genetec", "videotron", "saputo", "metro", "workleap", "frank-and-oak", "sid-lee"];
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

// ── Réconciliation URL -> store (URL = SOURCE DE VÉRITÉ) ──────────────────────
//
// Architecture : le thème (couleur) ET le framework vivent dans l'URL. L'URL fait
// foi ; le store MIROIR l'URL (jamais l'inverse). localStorage ne sert qu'à
// AMORCER le tout premier chargement (URL sans param) — l'amorce est faite par le
// script anti-FOUC de app.html qui réécrit l'URL AVANT l'hydratation, puis par
// `afterNavigate` qui ré-inscrit l'état courant dans l'URL après chaque navigation
// interne. Ainsi page.url porte toujours ?theme/?framework.
//
// Règle : le param d'URL fait autorité dès qu'il est PRÉSENT (deep-link, partage,
// back/forward, ou URL ré-estampillée par afterNavigate). Quand il est ABSENT
// (instant fugace entre un clic de lien interne « nu » et la ré-estampille
// afterNavigate), on CONSERVE l'état courant pour éviter tout flash au défaut ;
// la ré-estampille remet aussitôt le param dans l'URL. Le store ne diverge donc
// jamais durablement de l'URL.

export function reconcileTheme(urlValue: ThemeId | null, current: ThemeId): ThemeId {
  return urlValue !== null ? urlValue : current;
}

export function reconcileFramework(
  urlValue: FrameworkId | null,
  current: FrameworkId
): FrameworkId {
  return urlValue !== null ? urlValue : current;
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
