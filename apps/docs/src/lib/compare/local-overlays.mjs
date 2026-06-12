// apps/docs/src/lib/compare/local-overlays.mjs
//
// Charge les overlays privés locaux (thèmes gitignorés, ex. Airbus) de façon
// OPTIONNELLE. Les fichiers *.local.mjs sont absents par défaut → des stubs
// vides sont créés par scripts/ensure-compare-local-overlays.mjs avant chaque
// build/dev (predev + prebuild dans apps/docs/package.json).
//
// Stratégie retenue : import STATIQUE sur des stubs garantis :
//   + Vite/SSR/prerender ne voit jamais un module absent → pas de build cassé.
//   + Sans overlay réel, COMPARE_MANIFEST_LOCAL = {} et REFERENCE_THEMES_LOCAL = {}
//     → comportement strictement identique à aujourd'hui.
//   + Avec un overlay réel (fichier local non commis), les nouvelles clés sont
//     mergées en shallow par thème dans getCompareManifest/getReferenceThemes.

import { COMPARE_MANIFEST_LOCAL } from "./manifest.local.mjs";
import { REFERENCE_THEMES_LOCAL } from "./reference-themes.local.mjs";

export { COMPARE_MANIFEST_LOCAL, REFERENCE_THEMES_LOCAL };

/**
 * Merge shallow par thème : les clés de l'overlay local écrasent / complètent
 * les clés du manifest de base, sans muter l'original.
 *
 * Exemple :
 *   mergeManifestOverlay(
 *     { dsfr: { Button: {...} } },
 *     { airbus: { Button: {...}, Input: {...} } }
 *   )
 *   → { dsfr: { Button: {...} }, airbus: { Button: {...}, Input: {...} } }
 *
 * @param {Record<string, Record<string, unknown>>} base
 * @param {Record<string, Record<string, unknown>>} overlay
 * @returns {Record<string, Record<string, unknown>>}
 */
export function mergeManifestOverlay(base, overlay) {
  if (!overlay || Object.keys(overlay).length === 0) return base;
  const result = { ...base };
  for (const [theme, entries] of Object.entries(overlay)) {
    result[theme] = { ...(result[theme] ?? {}), ...entries };
  }
  return result;
}

/**
 * Merge shallow des thèmes de référence : les clés de l'overlay local
 * complètent / remplacent celles de la base.
 *
 * @param {Record<string, unknown>} base
 * @param {Record<string, unknown>} overlay
 * @returns {Record<string, unknown>}
 */
export function mergeReferenceThemesOverlay(base, overlay) {
  if (!overlay || Object.keys(overlay).length === 0) return base;
  return { ...base, ...overlay };
}
