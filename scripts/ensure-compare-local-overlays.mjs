#!/usr/bin/env node
/**
 * scripts/ensure-compare-local-overlays.mjs
 *
 * Crée des stubs vides pour les overlays privés locaux s'ils sont absents.
 * Ces fichiers sont gitignorés (*.local.mjs) et représentent des surcharges
 * optionnelles : thèmes privés (ex. Airbus) branchés localement sans rien
 * committer.
 *
 * Stratégie retenue :
 *   - import STATIQUE dans local-overlays.mjs (safe au build Vite/SSR/prerender)
 *   - les stubs garantissent que les fichiers existent toujours au moment du build
 *   - ce script est appelé en predev / prebuild dans apps/docs/package.json
 *   - sans overlay réel → comportement 100 % identique à aujourd'hui
 */

import { existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPARE_DIR = join(__dirname, "..", "apps", "docs", "src", "lib", "compare");

const stubs = [
  {
    path: join(COMPARE_DIR, "manifest.local.mjs"),
    content:
      "// Stub généré automatiquement — remplacez par votre overlay privé local.\n" +
      "// Ce fichier est gitignorés (*.local.mjs) — ne jamais committer.\n" +
      "export const COMPARE_MANIFEST_LOCAL = {};\n",
  },
  {
    path: join(COMPARE_DIR, "reference-themes.local.mjs"),
    content:
      "// Stub généré automatiquement — remplacez par votre overlay privé local.\n" +
      "// Ce fichier est gitignorés (*.local.mjs) — ne jamais committer.\n" +
      "export const REFERENCE_THEMES_LOCAL = {};\n",
  },
];

let created = 0;
for (const { path, content } of stubs) {
  if (!existsSync(path)) {
    writeFileSync(path, content, "utf8");
    console.log(`[ensure-compare-local-overlays] créé : ${path}`);
    created++;
  }
}

if (created === 0) {
  console.log("[ensure-compare-local-overlays] stubs déjà présents, rien à faire.");
}
