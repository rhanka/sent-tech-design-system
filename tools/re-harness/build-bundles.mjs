#!/usr/bin/env node
// Builds local reference bundles from the pinned sources in
// .ds-scrap/re-sources/ (see MANIFEST.md there). No CDN, no network, no
// install. Bundles are build artifacts: this script is committed, the
// bundles under bundles/ are not (they are heavy and regenerable).
// When a library cannot be bundled offline, the status is recorded as
// `unknown` with the exact cause; the harness then runs its deferred
// (deterministic engine) runner and never claims live-reference coverage.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WT_ROOT = path.resolve(HERE, "..", "..");
const REPO_ROOT = path.resolve(WT_ROOT, "..");
const SOURCES = path.join(REPO_ROOT, ".ds-scrap", "re-sources");
const OUT = path.join(HERE, "bundles");

function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
function rootModule(name) { return exists(path.join(REPO_ROOT, "node_modules", name, "package.json")); }

const results = [];

// bpmn-js: needs didi, min-dash, min-dom, tiny-svg, ids (bpmn-js/package.json
// dependencies). None are in the repository lockfile -> bundle deferred.
{
  const deps = ["didi", "min-dash", "min-dom", "tiny-svg", "ids", "diagram-js", "bpmn-moddle"];
  const missing = deps.filter((d) => !rootModule(d));
  const srcOk = exists(path.join(SOURCES, "bpmn-js", "lib", "index.js"));
  results.push({
    library: "bpmn",
    sourcePresent: srcOk,
    status: srcOk && missing.length === 0 ? "buildable" : "deferred",
    cause: missing.length ? `missing root node_modules: ${missing.join(", ")} (no network install per L0 brief)` : null,
    liveVerdict: "unknown",
  });
}
// xyflow: TypeScript monorepo (packages/system|react|svelte src, no dist).
// Needs its own build (tsup/vite) plus react; deferred offline at L0.
{
  const srcOk = exists(path.join(SOURCES, "xyflow", "packages", "system", "src", "index.ts"));
  results.push({
    library: "xyflow",
    sourcePresent: srcOk,
    status: "deferred",
    cause: "xyflow sources ship unbuilt TypeScript (no dist in the pinned checkout); building needs the monorepo toolchain, not run offline at L0",
    liveVerdict: "unknown",
  });
}
// JointJS: @joint/core src/g is dependency-free ESM and loads directly in
// Node (verified: src/g/index.mjs). The full dia Graph needs the generated
// dist/version.mjs, absent from the checkout -> geometry usable, dia deferred.
{
  const gOk = exists(path.join(SOURCES, "joint", "packages", "joint-core", "src", "g", "index.mjs"));
  const versionOk = exists(path.join(SOURCES, "joint", "packages", "joint-core", "dist", "version.mjs"));
  results.push({
    library: "jointjs",
    sourcePresent: gOk,
    status: gOk ? "partial" : "deferred",
    cause: versionOk ? null : "full dia entry needs generated dist/version.mjs (absent); src/g geometry subset loads without a build",
    liveVerdict: "unknown",
  });
}

fs.mkdirSync(OUT, { recursive: true });
const manifest = { schemaVersion: 1, bundles: results };
fs.writeFileSync(path.join(OUT, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
for (const r of results) console.log(`${r.library}: status=${r.status} live=${r.liveVerdict}${r.cause ? ` cause=${r.cause}` : ""}`);
console.log(`manifest: ${path.relative(REPO_ROOT, path.join(OUT, "manifest.json"))} (bundles/ is a build artifact, not committed)`);
