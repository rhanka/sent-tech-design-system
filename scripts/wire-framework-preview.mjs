#!/usr/bin/env node
// Câble <FrameworkPreview> dans les pages /components/<slug> dont l'exemple
// existe dans EXAMPLES (parité Svelte/React/Vue garantie par l'arbre NodeSpec).
// DRY_RUN=1 -> rapport seulement, aucune écriture.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.env.DRY_RUN === "1";

// 1) clés EXAMPLES
const examplesSrc = readFileSync(
  join(ROOT, "apps/docs/src/lib/framework/examples.ts"),
  "utf8"
);
const body = examplesSrc.slice(examplesSrc.indexOf("EXAMPLES: Record"));
const KEYS = new Set(
  [...body.matchAll(/\n {2}([a-zA-Z][a-zA-Z0-9]*):\s*\{\s*\n/g)].map((m) => m[1])
);

// 2) pages composant
const compDir = join(ROOT, "apps/docs/src/routes/components");
const slugs = readdirSync(compDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("["))
  .map((d) => d.name)
  .sort();

const IMPORT_LINE =
  '  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";';

const wired = [];
const skipped = [];

for (const slug of slugs) {
  const file = join(compDir, slug, "+page.svelte");
  if (!existsSync(file)) continue;
  let src = readFileSync(file, "utf8");

  if (src.includes("FrameworkPreview")) {
    skipped.push([slug, "déjà câblée"]);
    continue;
  }
  const key = slug.replace(/-/g, "");
  if (!KEYS.has(key)) {
    skipped.push([slug, "pas d'exemple"]);
    continue;
  }

  // 2a) insertion de l'import
  let out = src;
  const localeImport = '  import { locale } from "$lib/locale.svelte";';
  if (out.includes(localeImport)) {
    out = out.replace(localeImport, `${localeImport}\n${IMPORT_LINE}`);
  } else {
    // fallback : avant </script>, après le dernier import du bloc script
    const scriptEnd = out.indexOf("</script>");
    const head = out.slice(0, scriptEnd);
    const lastImport = head.lastIndexOf("\n  import ");
    if (lastImport === -1) {
      skipped.push([slug, "ancrage import introuvable"]);
      continue;
    }
    const eol = head.indexOf("\n", lastImport + 1);
    out = out.slice(0, eol) + "\n" + IMPORT_LINE + out.slice(eol);
  }

  // 2b) insertion du tag après le </section> du docs-hero
  const tag = `\n  <FrameworkPreview example="${key}" title="Aperçu live" />\n`;
  const heroIdx = out.indexOf('<section class="docs-hero">');
  let insertAt = -1;
  if (heroIdx !== -1) {
    insertAt = out.indexOf("</section>", heroIdx);
    if (insertAt !== -1) insertAt += "</section>".length;
  }
  if (insertAt === -1) {
    // fallback : juste après <div class="docs-page">
    const pageIdx = out.indexOf('<div class="docs-page">');
    if (pageIdx !== -1) insertAt = pageIdx + '<div class="docs-page">'.length;
  }
  if (insertAt === -1) {
    skipped.push([slug, "ancrage tag introuvable"]);
    continue;
  }
  out = out.slice(0, insertAt) + tag + out.slice(insertAt);

  if (!DRY) writeFileSync(file, out);
  wired.push([slug, key]);
}

console.log(`\n=== ${DRY ? "DRY-RUN" : "ÉCRIT"} : ${wired.length} câblées ===`);
for (const [s, k] of wired) console.log(`  + ${s}  (example="${k}")`);
console.log(`\n=== ignorées : ${skipped.length} ===`);
const byReason = {};
for (const [s, r] of skipped) (byReason[r] ??= []).push(s);
for (const r of Object.keys(byReason))
  console.log(`  [${r}] ${byReason[r].join(", ")}`);
