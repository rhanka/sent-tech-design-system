// apps/docs/src/lib/compare/compare-store.svelte.ts
// Utilitaires compare partagés (registry + helpers).
// L'état réactif (thème actif, compareActive, etc.) vit dans +layout.svelte
// et est passé en props aux composants compare.

import type { CompareEntry } from "./manifest.d.ts";
import { COMPARE_MANIFEST } from "./manifest.mjs";
import { REFERENCE_THEMES } from "./reference-themes.mjs";
import gapsRaw from "./compare-gaps.json";

// ── Types ──────────────────────────────────────────────────────────────────

export interface GapEntry {
  theme: string;
  component: string;
  scenario: string;
  state: string;
  property: string;
  ours: string;
  ref: string;
  delta: string;
  status: "open" | "escape" | "fixed";
  note?: string;
  source: "oracle" | "manual";
  lastSeen: string;
  manifestHash: string;
  regressed?: boolean;
}

export interface GapsRegistry {
  version: number;
  generatedAt: string;
  manifestHash: string;
  anatomyVersion?: string;
  dsVersion?: string;
  themeVersion?: Record<string, string>;
  entries: Record<string, GapEntry>;
}

// ── Registry (import statique, aucune mesure navigateur) ──────────────────

export const GAPS_REGISTRY: GapsRegistry = gapsRaw as GapsRegistry;

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Résout l'entrée manifeste pour un (theme, scenario).
 */
export function resolveManifestEntry(
  themeId: string,
  scenarioId: string
): CompareEntry | null {
  const themeEntries = COMPARE_MANIFEST[themeId];
  if (!themeEntries) return null;
  return themeEntries[scenarioId] ?? null;
}

/**
 * Liste les clés de scénarios pour un (theme, component).
 */
export function listScenarios(themeId: string, component: string): string[] {
  const themeEntries = COMPARE_MANIFEST[themeId];
  if (!themeEntries) return [];
  return Object.keys(themeEntries).filter(
    (key) => themeEntries[key].component === component
  );
}

/**
 * Liste les écarts du registre pour un (theme, component, scenario).
 * INVARIANT : aucune mesure navigateur : lecture seule du JSON statique.
 */
export function listGaps(
  themeId: string,
  component: string,
  scenario: string
): GapEntry[] {
  return Object.values(GAPS_REGISTRY.entries).filter(
    (e) => e.theme === themeId && e.component === component && e.scenario === scenario
  );
}

/**
 * Construit le deep-link ?compare=1&theme=<id>&scenario=<id>.
 */
export function buildCompareUrl(
  pathname: string,
  themeId: string,
  scenarioId: string
): string {
  const params = new URLSearchParams();
  params.set("compare", "1");
  params.set("theme", themeId);
  params.set("scenario", scenarioId);
  return `${pathname}?${params.toString()}`;
}

/**
 * Vérifie qu'un thème est un thème d'import (présent dans REFERENCE_THEMES).
 */
export function isImportTheme(themeId: string): boolean {
  return themeId in REFERENCE_THEMES;
}
