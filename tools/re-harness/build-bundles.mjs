#!/usr/bin/env node
// Builds the real-oracle browser bundles from the pinned libraries installed
// OUTSIDE the repository in RE_ORACLES_DIR (default:
// <repoRoot>/.ds-scrap/re-oracles, see src/oracles.mjs). No network, no
// install: esbuild and every library are read from that node_modules.
//
//   node tools/re-harness/build-bundles.mjs
//   RE_ORACLES_DIR=/path/to/re-oracles node tools/re-harness/build-bundles.mjs
//
// This script is committed; the bundles under bundles/ are build artifacts
// and are git-ignored (tools/re-harness/.gitignore). Each library is built
// independently: a library that cannot be bundled is recorded `unknown`
// with the exact cause in bundles/manifest.json, and its gate stays
// `unknown` (never green). Exit code is 1 unless every bundle is built.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import {
  HARNESS_ROOT,
  BUNDLES_DIR,
  EXPECTED_VERSIONS,
  resolveOraclesDir,
  readOracleVersions,
} from "./src/oracles.mjs";

const ENTRIES = path.join(HARNESS_ROOT, "bundle-entries");
const ORACLES = resolveOraclesDir();
const ORACLE_NM = path.join(ORACLES, "node_modules");

function oraclesMissing() {
  return !fs.existsSync(path.join(ORACLE_NM, "esbuild", "package.json"));
}

async function loadEsbuild() {
  const main = path.join(ORACLE_NM, "esbuild", "lib", "main.js");
  return import(pathToFileURL(main).href);
}

// Resolve EVERY bare import from the oracles first. The harness entries
// live inside the repository worktree, whose ancestor node_modules carry
// their own react/svelte copies; without this plugin esbuild would embed
// two runtimes and the real components would break (dispatcher null /
// effect_orphan). Provenance matters here: an oracle bundle must contain
// the oracle's modules only.
function oracleFirstPlugin() {
  return {
    name: "oracle-first",
    setup(build) {
      build.onResolve({ filter: /^[^./]/ }, async (args) => {
        // Package-private "#imports" resolve against the importing
        // package itself; esbuild's default resolution handles them.
        if (args.path.startsWith("#")) return undefined;
        if (args.pluginData && args.pluginData.oracleFirst) return undefined;
        const result = await build.resolve(args.path, {
          kind: args.kind,
          resolveDir: ORACLES,
          pluginData: { oracleFirst: true },
        });
        if (result.errors.length) return { errors: result.errors };
        return { path: result.path, external: result.external };
      });
    },
  };
}

// esbuild plugin compiling .svelte components and .svelte.js rune modules
// with the pinned svelte compiler. CSS is injected at runtime so a single
// JS bundle carries the component styles of the library build.
async function sveltePlugin() {
  const compilerModule = await import(pathToFileURL(path.join(ORACLE_NM, "svelte", "compiler", "index.js")).href);
  const compiler = compilerModule.default || compilerModule;
  return {
    name: "harness-svelte",
    setup(build) {
      build.onLoad({ filter: /\.svelte$/ }, async (args) => {
        const source = await fs.promises.readFile(args.path, "utf8");
        const { js } = compiler.compile(source, {
          filename: args.path,
          generate: "client",
          css: "injected",
          dev: false,
        });
        return { contents: js.code, loader: "js" };
      });
      build.onLoad({ filter: /\.svelte\.js$/ }, async (args) => {
        const source = await fs.promises.readFile(args.path, "utf8");
        const { js } = compiler.compileModule(source, { filename: args.path, generate: "client", dev: false });
        return { contents: js.code, loader: "js" };
      });
    },
  };
}

const BUILDS = [
  {
    library: "bpmn",
    packages: ["bpmn-js", "diagram-js", "bpmn-moddle"],
    entry: path.join(ENTRIES, "bpmn.entry.mjs"),
    outfile: path.join(BUNDLES_DIR, "bpmn.js"),
  },
  {
    library: "xyflow-react",
    packages: ["@xyflow/react", "@xyflow/system", "react", "react-dom"],
    entry: path.join(ENTRIES, "xyflow-react.entry.mjs"),
    outfile: path.join(BUNDLES_DIR, "xyflow-react.js"),
  },
  {
    library: "xyflow-svelte",
    packages: ["@xyflow/svelte", "@xyflow/system", "svelte"],
    entry: path.join(ENTRIES, "xyflow-svelte.entry.mjs"),
    outfile: path.join(BUNDLES_DIR, "xyflow-svelte.js"),
    svelte: true,
  },
  {
    library: "jointjs",
    packages: ["@joint/core"],
    entry: path.join(ENTRIES, "joint.entry.mjs"),
    outfile: path.join(BUNDLES_DIR, "joint.js"),
  },
];

async function main() {
  fs.mkdirSync(BUNDLES_DIR, { recursive: true });
  const versions = readOracleVersions(ORACLES);
  const results = [];

  if (oraclesMissing()) {
    for (const b of BUILDS) {
      results.push({ library: b.library, status: "unknown", cause: `re-oracles not installed at ${ORACLES} (see tools/re-harness/README.md)`, oracleVersions: {} });
    }
  } else {
    const esbuild = await loadEsbuild();
    for (const b of BUILDS) {
      const oracleVersions = Object.fromEntries(b.packages.map((p) => [p, versions[p]]));
      const drift = b.packages.filter((p) => versions[p] !== EXPECTED_VERSIONS[p]);
      if (drift.length) {
        results.push({
          library: b.library,
          status: "unknown",
          cause: `version drift: ${drift.map((p) => `${p} expected ${EXPECTED_VERSIONS[p]}, found ${versions[p] ?? "absent"}`).join("; ")}`,
          oracleVersions,
        });
        continue;
      }
      try {
        const plugins = [oracleFirstPlugin(), ...(b.svelte ? [await sveltePlugin()] : [])];
        await esbuild.build({
          entryPoints: [b.entry],
          outfile: b.outfile,
          bundle: true,
          format: "iife",
          platform: "browser",
          target: ["es2022"],
          nodePaths: [ORACLE_NM],
          conditions: ["svelte", "browser"],
          define: { "process.env.NODE_ENV": '"production"' },
          loader: { ".svg": "dataurl", ".png": "dataurl", ".woff": "file", ".woff2": "file", ".ttf": "file", ".eot": "file" },
          plugins,
          logLevel: "warning",
        });
        const bytes = fs.statSync(b.outfile).size;
        results.push({ library: b.library, status: "built", bundle: `bundles/${path.basename(b.outfile)}`, bytes, oracleVersions });
      } catch (err) {
        results.push({ library: b.library, status: "unknown", cause: String(err?.message || err).split("\n").slice(0, 6).join(" | "), oracleVersions });
      }
    }
  }

  const manifest = { schemaVersion: 1, oraclesDir: path.basename(ORACLES), bundles: results };
  fs.writeFileSync(path.join(BUNDLES_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  for (const r of results) {
    console.log(`${r.library}: status=${r.status}${r.bundle ? ` bundle=${r.bundle} bytes=${r.bytes}` : ""}${r.cause ? ` cause=${r.cause}` : ""}`);
  }
  const failed = results.filter((r) => r.status !== "built");
  console.log(`manifest: tools/re-harness/bundles/manifest.json (bundles/ is git-ignored, not committed)`);
  process.exit(failed.length ? 1 : 0);
}

await main();
