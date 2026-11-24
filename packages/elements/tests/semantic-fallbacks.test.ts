/**
 * Every `var(--st-semantic-*)` in the Focus static kit CSS carries the
 * design-system light-theme literal as its fallback, so a page renders styled
 * without a themed host (owner feedback 24/11, track 01M85JMWB3YWBM69DAKPMZ9KX8).
 *
 * RED HISTORY: the kit rendered unstyled on a page without `--st-semantic-*`
 * variables — `dossier-page.css`, `engines/dossier.css` and
 * `time-series-chart.svelte` referenced the tokens without fallbacks.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(packageDir, "src");

function kitStyleFiles(dir: string): readonly string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return kitStyleFiles(path);
    return /\.(css|svelte)$/.test(entry.name) ? [path] : [];
  });
}

/** A `var(--st-semantic-*)` reference with no fallback: closed parenthesis right after the name. */
const UNFALLBACKED = /var\(\s*--st-semantic-[\w-]+\s*\)/g;

describe("semantic fallbacks in the Focus static kit", () => {
  it("leaves no `var(--st-semantic-...)` without a literal fallback in src CSS", () => {
    const offenders: string[] = [];
    for (const file of kitStyleFiles(srcDir)) {
      const css = readFileSync(file, "utf8");
      for (const match of css.matchAll(UNFALLBACKED)) {
        offenders.push(`${relative(packageDir, file)}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("every remaining `var(--st-semantic-...)` carries a non-empty fallback", () => {
    const files = kitStyleFiles(srcDir);
    expect(files.length).toBeGreaterThan(0);
    const withSemantic = files.filter((file) => readFileSync(file, "utf8").includes("--st-semantic-"));
    // Positive control: the kit really exercises the rule (the three known files).
    expect(withSemantic.map((file) => relative(packageDir, file))).toEqual(
      expect.arrayContaining([
        join("src", "element", "dom", "dossier-page.css"),
        join("src", "element", "dom", "engines", "dossier.css"),
        join("src", "element", "dom", "time-series-chart.svelte"),
      ]),
    );
    for (const file of withSemantic) {
      const css = readFileSync(file, "utf8");
      // Nested fallbacks are not used in this kit; each reference must close
      // with `var(--st-semantic-name, <fallback>)`.
      for (const match of css.matchAll(/var\(\s*--st-semantic-[\w-]+\s*,[^)]+\)/g)) {
        expect(match[0]).not.toMatch(/,\s*\)/);
      }
    }
  });
});
