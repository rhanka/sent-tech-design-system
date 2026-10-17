#!/usr/bin/env node
// Generates one xyflow fixture + scenario per example entry of
// docs/re/xyflow-inventory.json (93 examples: 66 React + 27 Svelte).
//
// The fixture input is the NAMED EXAMPLE ITSELF: the root module of the
// pinned example (.ds-scrap/re-sources/xyflow/examples/react/src/examples/
// <Name>/index.tsx, or svelte/src/routes/examples/<name>/+page.svelte),
// MIT-licensed reference code. build-bundles.mjs compiles it, with its own
// node/edge types, connection lines, minimap nodes, layout code and CSS,
// into an oracle-side bundle (out of git); the harness mounts it and reads
// the library store after mount. Nothing is extracted from the sources by
// pattern matching, so no part of the example graph can be dropped.
//
// An example is `unknown` only when it cannot run outside its application:
// today, when it imports a package that is not installed in the oracle set
// (.ds-scrap/re-oracles/node_modules); installing it needs network access.
// The import scan follows relative imports from the root module and
// records every bare specifier; the cause names the missing packages.
//
// Every runnable example plays the shared pointer script
// fixtures/xyflow/pointer.ops.json (a click on the empty pane — which is
// how several examples add nodes —, a real mouse drag of a node, a real
// handle-to-handle connection, a real wheel zoom), driven through the
// browser's input pipeline (Playwright mouse) at client points computed
// from the library store.
//
//   node tools/re-harness/gen-xyflow-fixtures.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REPO_ROOT, WT_ROOT, resolveOraclesDir } from "./src/oracles.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const inventory = JSON.parse(fs.readFileSync(path.join(WT_ROOT, "docs", "re", "xyflow-inventory.json"), "utf8"));
const examples = (inventory.entries || []).filter((e) => e.family === "examples");
export const EXAMPLES_ROOT_REL = path.join(".ds-scrap", "re-sources", "xyflow", "examples");
const EXAMPLES_ROOT = path.join(REPO_ROOT, EXAMPLES_ROOT_REL);
const ORACLE_NM = path.join(resolveOraclesDir(), "node_modules");

// Example root directory and root module from an inventory source path.
export function exampleRoot(source) {
  const rel = String(source || "").replace(/:\d+$/, "").replace(/^\.ds-scrap\/re-sources\/xyflow\/examples\//, "");
  let m = /^(react\/src\/examples\/[^/]+)\//.exec(rel);
  if (m) return { flavour: "react", dir: m[1], entry: "index.tsx" };
  m = /^(svelte\/src\/routes\/examples\/[^/]+)\//.exec(rel);
  if (m) return { flavour: "svelte", dir: m[1], entry: "+page.svelte" };
  return null;
}

const RESOLVE_EXT = ["", ".ts", ".tsx", ".js", ".jsx", ".svelte", ".svelte.ts", ".svelte.js", "/index.ts", "/index.tsx", "/index.js"];

// Every bare import reachable from the root module through relative imports.
export function bareImports(entryFile) {
  const seen = new Set();
  const bare = new Set();
  const visit = (file) => {
    if (seen.has(file) || !fs.existsSync(file)) return;
    seen.add(file);
    const src = fs.readFileSync(file, "utf8");
    for (const m of src.matchAll(/(?:import|export)\s[^'";]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const spec = m[1] || m[2] || m[3];
      if (spec.startsWith(".")) {
        const base = path.resolve(path.dirname(file), spec);
        const hit = RESOLVE_EXT.map((e) => base + e).find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
        if (hit) visit(hit);
      } else bare.add(spec);
    }
  };
  visit(entryFile);
  return [...bare].sort();
}

function packageName(spec) {
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function main() {
  const fixtureDir = path.join(HERE, "fixtures", "xyflow");
  const scenarioDir = path.join(HERE, "fixtures", "scenarios");
  fs.mkdirSync(fixtureDir, { recursive: true });
  // The shared pointer script (no element ids: the adapter selects its
  // targets from the store after mount, mechanically).
  const opsFile = "xyflow/pointer.ops.json";
  fs.writeFileSync(path.join(HERE, "fixtures", opsFile), `${JSON.stringify({
    schemaVersion: 1,
    id: "xyflow-pointer",
    steps: [
      { op: "paneClick" },
      { op: "move", dx: 40, dy: 30 },
      { op: "connect" },
      { op: "zoom", deltaY: -240 },
    ],
  }, null, 2)}\n`);
  const written = new Set([opsFile]);
  let runnable = 0;
  let unknown = 0;
  for (const entry of examples) {
    const slug = entry.id.replace(/^examples\./, "");
    const root = exampleRoot(entry.source);
    const fixture = {
      schemaVersion: 1,
      id: `xyflow-${slug}`,
      library: "xyflow",
      kind: "xyflow-example",
      title: `pinned xyflow example ${entry.id}, mounted with its own code`,
      input: root ? { flavour: root.flavour, example: `${root.dir}/${root.entry}` } : { flavour: slug.startsWith("svelte") ? "svelte" : "react", example: "" },
      pixelThreshold: { maxMismatchRatio: 0.01, perChannelDelta: 8 },
    };
    let cause = null;
    let missing = [];
    if (!root) cause = `inventory source ${entry.source} is not under an example root`;
    else {
      const entryFile = path.join(EXAMPLES_ROOT, root.dir, root.entry);
      if (!fs.existsSync(entryFile)) cause = `example root module missing: ${EXAMPLES_ROOT_REL}/${root.dir}/${root.entry}`;
      else {
        const imports = bareImports(entryFile);
        missing = [...new Set(imports.map(packageName))].filter((p) => !fs.existsSync(path.join(ORACLE_NM, p, "package.json")));
        if (missing.length) cause = `imports ${missing.join(", ")}, not installed in the oracle set (.ds-scrap/re-oracles); installing needs network, out of scope`;
      }
    }
    if (cause) {
      unknown += 1;
      fixture.runnable = { status: "unknown", cause };
      if (missing.length) fixture.runnable.missing = missing;
    } else {
      runnable += 1;
      fixture.runnable = { status: "runnable" };
    }
    const fixtureFile = `xyflow/${slug}.json`;
    fs.writeFileSync(path.join(HERE, "fixtures", fixtureFile), `${JSON.stringify(fixture, null, 2)}\n`);
    written.add(fixtureFile);
    const scenario = {
      schemaVersion: 1,
      id: `xyflow-${slug}-selfparity`,
      library: "xyflow",
      fixtures: [fixtureFile],
      ops: opsFile,
      exercises: [entry.id],
      comparators: ["model", "events", "geometry", "pixels"],
    };
    fs.writeFileSync(path.join(scenarioDir, `xyflow-${slug}.json`), `${JSON.stringify(scenario)}\n`);
    console.log(`${cause ? "UNKNOWN " : "RUNNABLE"} ${slug}${cause ? ` cause=${cause}` : ""}`);
  }
  for (const name of fs.readdirSync(fixtureDir)) {
    if (!written.has(`xyflow/${name}`)) {
      fs.unlinkSync(path.join(fixtureDir, name));
      console.log(`removed stale xyflow/${name}`);
    }
  }
  console.log(`xyflow fixtures generated: ${examples.length} (runnable=${runnable} unknown=${unknown})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
