// Builds ONE self-contained offline page: dist/demo.html (+ gas/demo.html).
// Node/TypeScript only. Everything is inlined: script, styles, font, data and
// the third-party notices of what is embedded.
//
//   tsx scripts/build.ts              writes dist/ and the committed outputs
//                                     (gas/demo.html, gas/THIRD-PARTY-NOTICES.md, size-report.json)
//   tsx scripts/build.ts --dist-only  writes dist/ only, so that the self-check can
//                                     compare a fresh build with the committed outputs
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { transform } from "lightningcss";
import { build } from "vite";
import { themeDeclarations } from "./theme.js";
import { NOTICES_FILENAME, noticesComment, packageDirOf, packageRootFromEntry, renderNotices, type EmbeddedPackage } from "./notices.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const bytes = (value: string) => Buffer.byteLength(value, "utf8");
// Same title as gas/Code.gs setTitle(): Apps Script shows that one, a browser this one.
const PAGE_TITLE = "Design system demo — decision dossier";
const distOnly = process.argv.includes("--dist-only");

const result = await build({
  configFile: false,
  envDir: false,
  root,
  logLevel: "warn",
  plugins: [svelte({ configFile: false })],
  build: {
    write: false,
    minify: true,
    cssMinify: true,
    cssCodeSplit: false,
    sourcemap: false,
    modulePreload: false,
    target: "es2022",
    rollupOptions: {
      input: resolve(root, "src/main.ts"),
      output: { format: "iife", entryFileNames: "demo.js", assetFileNames: "demo[extname]" },
    },
  },
});

const outputs = (Array.isArray(result) ? result : [result]).flatMap((entry) => ("output" in entry ? entry.output : []));
const chunks = outputs.filter((item) => item.type === "chunk");
const assets = outputs.filter((item) => item.type === "asset");
const styles = assets.filter((item) => item.fileName.endsWith(".css"));
const others = assets.filter((item) => !item.fileName.endsWith(".css"));
if (chunks.length !== 1) throw new Error(`Expected one script chunk, got ${chunks.length}`);
if (others.length > 0) throw new Error(`Unexpected emitted assets: ${others.map((item) => item.fileName).join(", ")}`);

// A script element ends at the first "</script"; an HTML comment opener is escaped too.
const js = chunks[0]!.code.trim().replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");
const componentCss = styles.map((item) => String(item.source)).join("\n").trim().replace(/<\/(style)/gi, "<\\/$1");

// Inter (variable, latin subset) — SIL Open Font License 1.1, inlined as a data URI.
const fontFile = require.resolve("@fontsource-variable/inter/files/inter-latin-wght-normal.woff2");
const font = await readFile(fontFile);
const fontCss =
  "/* Inter variable font, latin subset. Copyright 2016 The Inter Project Authors. SIL Open Font License 1.1: full text in the notices comment at the top of this file. */\n" +
  `@font-face{font-family:Inter;font-style:normal;font-display:swap;font-weight:100 900;` +
  `src:url(data:font/woff2;base64,${font.toString("base64")}) format("woff2");}`;
// Neutral default theme (sent-tech), compiled from the published tokens into three
// well-formed blocks: light, automatic dark (prefers-color-scheme) and explicit
// dark (data-color-mode="dark" on the root element, set by the toggle).
// Dark blocks carry only the variables whose value differs from the light block.
const { light, dark } = themeDeclarations();
const block = (selector: string, schemeValue: string, entries: Iterable<[string, string]>) =>
  `${selector} { color-scheme: ${schemeValue}; ${[...entries].map(([name, value]) => `${name}: ${value};`).join(" ")} }`;
const darkOnly = [...dark].filter(([name, value]) => light.get(name) !== value);
const themeSource = [
  block(":root", "light", light),
  `@media (prefers-color-scheme: dark) { ${block(':root:not([data-color-mode="light"])', "dark", darkOnly)} }`,
  block(':root[data-color-mode="dark"]', "dark", darkOnly),
].join("\n");
const themeCss = transform({ filename: "theme.css", code: Buffer.from(themeSource), minify: true }).code.toString();
const css = `${fontCss}\n${themeCss}\n${componentCss}`;

// Third-party notices: every package that owns rendered code in the script chunk
// (measured from the bundle), plus the build-time inputs embedded above. The
// theme is two packages: the themes package only assembles the token VALUES,
// which come from the tokens package it depends on (resolved from the themes
// package, the way Node resolves that import).
const themesDir = packageRootFromEntry(fileURLToPath(import.meta.resolve("@sentropic/design-system-themes")));
const dependencyDirOf = (fromDir: string, name: string): string => {
  for (let dir = fromDir; ; dir = dirname(dir)) {
    const candidate = resolve(dir, "node_modules", name);
    if (existsSync(resolve(candidate, "package.json"))) return candidate.replaceAll("\\", "/");
    if (dirname(dir) === dir) throw new Error(`${name} is not installed for ${fromDir}`);
  }
};
const embedded: EmbeddedPackage[] = [
  { dir: packageRootFromEntry(fontFile), embeddedAs: "font file (latin subset, base64 data: URI)" },
  { dir: themesDir, embeddedAs: "theme definition compiled into the page styles" },
  { dir: dependencyDirOf(themesDir, "@sentropic/design-system-tokens"), embeddedAs: "theme token values compiled into the page styles" },
];
for (const [id, module] of Object.entries(chunks[0]!.modules)) {
  const dir = packageDirOf(id);
  if (dir !== null && module.renderedLength > 0) embedded.push({ dir, embeddedAs: "bundled script and styles (minified)" });
}
const notices = renderNotices(embedded);

const html = `<!doctype html>
${noticesComment(notices)}<html lang="en" data-st-theme="sent-tech">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<base target="_top">
<title>${PAGE_TITLE}</title>
<style>
${css}
</style>
</head>
<body>
<div id="app"></div>
<script>
${js}
</script>
</body>
</html>
`;

await mkdir(resolve(root, "dist"), { recursive: true });

const report = {
  file: "dist/demo.html (copied to gas/demo.html)",
  htmlBytes: bytes(html),
  jsBytes: bytes(js),
  cssBytes: bytes(css),
  cssBreakdown: { fontBytes: bytes(fontCss), themeBytes: bytes(themeCss), componentBytes: bytes(componentCss) },
  noticesBytes: bytes(noticesComment(notices)),
};
const reportJson = `${JSON.stringify(report, null, 2)}\n`;
await writeFile(resolve(root, "dist/demo.html"), html);
await writeFile(resolve(root, "dist", NOTICES_FILENAME), notices);
await writeFile(resolve(root, "dist/size-report.json"), reportJson);
if (!distOnly) {
  await writeFile(resolve(root, "gas/demo.html"), html);
  await writeFile(resolve(root, "gas", NOTICES_FILENAME), notices);
  await writeFile(resolve(root, "size-report.json"), reportJson);
}
console.log("Size report (bytes)");
console.table({ html: report.htmlBytes, js: report.jsBytes, css: report.cssBytes, "css: font": report.cssBreakdown.fontBytes, "css: theme": report.cssBreakdown.themeBytes, "css: components + page": report.cssBreakdown.componentBytes, "notices comment": report.noticesBytes });
console.log(distOnly ? "Wrote dist/ only (committed outputs untouched)" : "Wrote dist/, gas/demo.html, gas/THIRD-PARTY-NOTICES.md and size-report.json");
