// The browser bundle build of the elements package (§6.6, §15 AC-L2):
// ONE ESM build whose core (the entry closure — validator, error panel,
// BarChart and the default theme) renders `<st-bar-chart>`, and whose lazy
// chunks load on the first mount of the element that needs them:
//
//   chunks/bpmn-canvas-*.js   engine:bpmn-canvas  (bpmn-moddle + canvas)
//   chunks/focus-renderer-*  engine:focus        (focus port + minimal renderer)
//   chunks/forge-*            theme:forge        (non-default theme)
//   chunks/entropic-*         theme:entropic     (non-default theme)
//
// The build then writes dist/browser/sri.json: every produced file with its
// raw size, gzip size, brotli size and sha384 integrity — the same numbers
// scripts/elements-browser-artifacts.test.mjs recomputes — plus the group
// tag the §6.6 core budget is measured over. sri.json never lists itself.
//
// Chunk classification is reachability-based, not name-based: a chunk the
// ENTRY loads statically is "core" (it is page weight no matter which
// element mounts); everything the engine facades pull in at load time
// belongs to the engine's group, and the two non-default themes to theirs.
// Anything unclassified falls back to "core" — the budget stays honest to
// the pessimistic side.
//
// 0 Python. Node only. Wired as `npm run build:browser` in package.json.

import { build } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, gzipSync } from "node:zlib";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const browserDir = join(packageDir, "dist", "browser");

/** Only the three wrapper components compile as custom elements (§6.2). */
function isCustomElement(options) {
  return typeof options.filename === "string" && options.filename.endsWith("-element.svelte");
}

// --- 1. The bundle -----------------------------------------------------------

const result = await build({
  configFile: false,
  root: packageDir,
  logLevel: "warn",
  plugins: [
    svelte({
      compilerOptions: {
        customElement: isCustomElement,
        // §6.2 known risk: every component ships its styles inside the chunk
        // (no external .css), so a chunk is self-contained in the shadow DOM.
        css: "injected",
      },
    }),
  ],
  build: {
    outDir: "dist/browser",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: false,
    write: true,
    // No __vitePreload helper: its dependency URLs are resolved through
    // import.meta.resolve, which a browser anchors on the DOCUMENT base, not
    // the module URL — a host that mounts this bundle under any subpath would
    // get modulepreload links pointing at /chunks/… on the page root (404
    // console errors on every lazy load). The lazy imports themselves are
    // module-relative and correct; dropping the preload hints keeps the
    // bundle deployable at any path with zero console errors. The bundle has
    // no per-chunk CSS assets anyway (css: "injected"), so the helper's
    // stylesheet branch has nothing to carry.
    modulePreload: false,
    // The wrapper modules only DEFINE their custom element at import time —
    // an effect the bundler cannot see through the package manifest's
    // `sideEffects: false` (right for the NODE half, whose library modules
    // are pure). Rolldown honors that flag over `moduleSideEffects`, so the
    // browser build keeps the whole module graph and splits ONLY along the
    // DYNAMIC import boundaries (the lazy engines and themes, §6.6).
    rollupOptions: {
      treeshake: false,
      input: join(packageDir, "src", "element", "dom", "browser-entry.ts"),
      output: {
        format: "es",
        entryFileNames: "elements.js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});

// --- 2. Group every produced chunk (§6.6) -----------------------------------

const chunks = result.output.filter((entry) => entry.type === "chunk");
const assets = result.output.filter((entry) => entry.type === "asset");
const chunkByName = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
const entry = chunks.find((chunk) => chunk.isEntry);

if (entry === undefined) {
  throw new Error("the browser build produced no entry chunk");
}

/** Everything reachable from one set of chunks, static and/or dynamic. */
function reach(startNames, withDynamic) {
  const seen = new Set();
  const queue = [...startNames];
  while (queue.length > 0) {
    const name = queue.shift();
    if (seen.has(name)) continue;
    seen.add(name);
    // A facade BFS that reaches the entry must stop there: traversing the
    // entry's static edges would pull core into the engine group, and its
    // dynamic edges would swallow every other lazy group. The CORE BFS
    // (static only) starts AT the entry and must traverse its imports.
    if (withDynamic && name === entry.fileName) continue;
    const chunk = chunkByName.get(name);
    if (chunk !== undefined) {
      queue.push(...chunk.imports, ...(withDynamic ? chunk.dynamicImports : []));
    }
  }
  return seen;
}

// The core group: what the entry loads statically — the weight a page that
// renders only <st-bar-chart> actually pays.
const coreSet = reach([entry.fileName], false);

const facades = [
  { group: "engine:bpmn-canvas", match: (id) => /[\\/]engines[\\/]bpmn-canvas\.ts$/.test(id) },
  { group: "engine:focus", match: (id) => /[\\/]engines[\\/]focus-renderer\.ts$/.test(id) },
  { group: "theme:forge", match: (id) => /[\\/]forge\.css(\?raw)?$/.test(id) },
  { group: "theme:entropic", match: (id) => /[\\/]entropic\.css(\?raw)?$/.test(id) },
];

const groupOf = new Map();
for (const chunk of chunks) {
  if (coreSet.has(chunk.fileName)) groupOf.set(chunk.fileName, "core");
}
for (const facade of facades) {
  const facadeChunks = chunks.filter((chunk) => chunk.moduleIds.some(facade.match));
  for (const name of reach(facadeChunks.map((chunk) => chunk.fileName), true)) {
    if (!groupOf.has(name)) groupOf.set(name, facade.group);
  }
}
for (const chunk of chunks) {
  if (!groupOf.has(chunk.fileName)) groupOf.set(chunk.fileName, "core");
}
// Assets a chunk references (a lazy chunk's fonts) belong to that chunk's
// group: an asset's URL rides inside the referencing chunk, so the owner is
// the chunk whose text names it. An asset no chunk names is page weight
// whenever it loads — core, pessimistic.
for (const asset of assets) {
  const base = asset.fileName.split("/").pop() ?? asset.fileName;
  const owner = chunks.find((chunk) => {
    const text = readFileSync(join(browserDir, chunk.fileName), "utf8");
    return text.includes(asset.fileName) || text.includes(base);
  });
  groupOf.set(asset.fileName, owner !== undefined ? groupOf.get(owner.fileName) ?? "core" : "core");
}

// --- 3. sri.json ------------------------------------------------------------

function walkFiles(dir, prefix) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix.length > 0 ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...walkFiles(join(dir, entry.name), rel));
    else if (entry.isFile()) files.push(rel);
  }
  return files;
}

function sha384Integrity(bytes) {
  return `sha384-${createHash("sha384").update(bytes).digest("base64")}`;
}

const version = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8")).version;
const files = {};
for (const rel of walkFiles(browserDir, "").sort()) {
  if (rel === "sri.json") continue;
  const bytes = readFileSync(join(browserDir, rel));
  files[rel] = {
    bytes: bytes.length,
    gzip: gzipSync(bytes, { level: 9 }).length,
    brotli: brotliCompressSync(bytes, {
      params: { [Symbol.for("nodejs.constants.BROTLI_PARAM_QUALITY")]: 11 },
    }).length,
    integrity: sha384Integrity(bytes),
    group: groupOf.get(rel) ?? "core",
  };
}

writeFileSync(
  join(browserDir, "sri.json"),
  `${JSON.stringify({ version, files }, null, 2)}\n`,
);

// --- 4. The size table the lot reports --------------------------------------

const byGroup = new Map();
for (const [name, entry_] of Object.entries(files)) {
  const group = byGroup.get(entry_.group) ?? { gzip: 0, names: [] };
  group.gzip += entry_.gzip;
  group.names.push(name);
  byGroup.set(entry_.group, group);
}

const lines = [];
for (const [group, info] of [...byGroup.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  lines.push(`${group}: ${info.gzip} gzip bytes over ${info.names.length} file(s)`);
}
lines.push(`core budget (§6.6): ${(byGroup.get("core")?.gzip ?? 0)} / 153600 gzip bytes`);
console.log(lines.join("\n"));
console.log(`sri.json pins ${Object.keys(files).length} files under ${relative(packageDir, browserDir)}`);
const stats = statSync(join(browserDir, "sri.json"));
console.log(`sri.json itself: ${stats.size} raw bytes (not listed in its own manifest)`);
