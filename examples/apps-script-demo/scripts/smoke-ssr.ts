// Renders the page on the server (Svelte SSR, no browser), once per tab, and
// asserts that the generic content of each view is there. The server bundle is
// written under dist/ssr only for the time of the import and removed afterwards.
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { build } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const result = await build({
  configFile: false,
  envDir: false,
  root,
  logLevel: "warn",
  plugins: [svelte({ configFile: false })],
  ssr: { noExternal: true },
  build: { ssr: resolve(root, "src/ssr-entry.ts"), write: false, minify: false, rollupOptions: { output: { format: "es" } } },
});
const outputs = (Array.isArray(result) ? result : [result]).flatMap((entry) => ("output" in entry ? entry.output : []));
const chunk = outputs.find((item) => item.type === "chunk" && item.isEntry);
if (chunk === undefined || chunk.type !== "chunk") throw new Error("No server entry was produced");
type Tab = "dossier" | "evaluation";
const ssrDir = resolve(root, "dist/ssr");
const file = resolve(ssrDir, "entry.mjs");
let bodies: Record<Tab, string>;
try {
  await mkdir(ssrDir, { recursive: true });
  await writeFile(file, chunk.code);
  const { renderApp } = (await import(pathToFileURL(file).href)) as { renderApp: (initialTab: Tab) => string };
  bodies = { dossier: renderApp("dossier"), evaluation: renderApp("evaluation") };
} finally {
  await rm(ssrDir, { recursive: true, force: true });
}

// [view, name, pattern, minimum, maximum]
const checks: [Tab, string, RegExp, number, number][] = [
  ["dossier", "title band (h1)", /<h1[\s>]/g, 1, 1],
  ["dossier", "selected tab is Dossier", /aria-selected="true"[^>]*>(?:<!--[^>]*-->)*\s*Dossier/g, 1, 1],
  ["dossier", "option cards", /class="st-card[ "]/g, 3, 3],
  ["dossier", "success tag", /st-tag--success/g, 1, 1],
  ["dossier", "diagram scene figure", /st-diagramSceneFigure-viewport/g, 1, 1],
  ["dossier", "diagram nodes (4 containers + 7 cards)", /data-scene-occurrence=/g, 11, Infinity],
  ["dossier", "diagram links", /data-scene-edge=/g, 6, Infinity],
  ["dossier", "bar chart", /class="st-barChart[ "]/g, 1, 1],
  ["dossier", "bars", /class="st-barChart__bar[ "]/g, 3, 3],
  ["dossier", "no line chart in this view", /class="st-lineChart[ "]/g, 0, 0],
  ["evaluation", "title band (h1)", /<h1[\s>]/g, 1, 1],
  ["evaluation", "selected tab is Evaluation", /aria-selected="true"[^>]*>(?:<!--[^>]*-->)*\s*Evaluation/g, 1, 1],
  ["evaluation", "criteria table", /class="demo-table[ "]/g, 1, 1],
  ["evaluation", "criteria rows", /<tr><th scope="row">/g, 4, 4],
  ["evaluation", "line chart", /class="st-lineChart[ "]/g, 1, 1],
  ["evaluation", "line chart points (8 weeks)", /class="st-lineChart__dot[ "]/g, 8, Infinity],
  ["evaluation", "next steps", /<ol[\s>]/g, 1, 1],
  ["evaluation", "no diagram in this view", /st-diagramSceneFigure-viewport/g, 0, 0],
  ["evaluation", "no option card in this view", /class="st-card[ "]/g, 0, 0],
];
const labels = ["sends request", "forwards", "enqueues", "delivers", "writes", "archives"];
let failed = 0;
for (const [tab, name, pattern, minimum, maximum] of checks) {
  const actual = (bodies[tab].match(pattern) ?? []).length;
  const ok = actual >= minimum && actual <= maximum;
  if (!ok) failed += 1;
  const expected = minimum === maximum ? `${minimum}` : maximum === Infinity ? `at least ${minimum}` : `${minimum} to ${maximum}`;
  console.log(`${ok ? "PASS" : "FAIL"}  [${tab}] ${name}: ${actual} (expected ${expected})`);
}
for (const label of labels) {
  const ok = bodies.dossier.includes(label);
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  [dossier] link label "${label}"`);
}
if (failed > 0) {
  console.error(`${failed} smoke check(s) failed`);
  process.exit(1);
}
console.log("Server render smoke check passed");
