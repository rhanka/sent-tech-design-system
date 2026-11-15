// Renders the page on the server (Svelte SSR, no browser) and asserts that the
// generic content is there: title band, option cards, diagram scene, chart.
import { mkdir, writeFile } from "node:fs/promises";
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
const file = resolve(root, "dist/ssr/entry.mjs");
await mkdir(dirname(file), { recursive: true });
await writeFile(file, chunk.code);
const { renderApp } = (await import(pathToFileURL(file).href)) as { renderApp: () => string };
const body = renderApp();

const count = (pattern: RegExp) => (body.match(pattern) ?? []).length;
const checks: [string, number, number][] = [
  ["title band (h1)", count(/<h1[\s>]/g), 1],
  ["option cards", count(/class="st-card[ "]/g), 3],
  ["diagram scene figure", count(/st-diagramSceneFigure-viewport/g), 1],
  ["diagram nodes (4 containers + 7 cards)", count(/data-scene-occurrence=/g), 11],
  ["diagram links", count(/data-scene-edge=/g), 6],
  ["bar chart", count(/class="st-barChart[ "]/g), 1],
  ["bars", count(/class="st-barChart__bar[ "]/g), 3],
];
const labels = ["sends request", "forwards", "enqueues", "delivers", "writes", "archives"];
let failed = 0;
for (const [name, actual, minimum] of checks) {
  const ok = actual >= minimum;
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: ${actual} (expected at least ${minimum})`);
}
for (const label of labels) {
  const ok = body.includes(label);
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  link label "${label}"`);
}
if (failed > 0) {
  console.error(`${failed} smoke check(s) failed`);
  process.exit(1);
}
console.log("Server render smoke check passed");
