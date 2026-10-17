// Real-oracle resolution: where the pinned reference libraries live, which
// versions they carry, and whether their browser bundles have been built.
// The libraries are installed OUTSIDE the repository (read-only) under
// .ds-scrap/re-oracles/ and are never copied into the repo; only the
// esbuild bundles produced by build-bundles.mjs enter the harness, under
// bundles/ (git-ignored). The directory is overridable with RE_ORACLES_DIR.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const HARNESS_ROOT = path.resolve(HERE, "..");
export const WT_ROOT = path.resolve(HARNESS_ROOT, "..", "..");
export const REPO_ROOT = path.resolve(WT_ROOT, "..");
export const BUNDLES_DIR = path.join(HARNESS_ROOT, "bundles");

// Pinned versions (specs: SPEC_RE_BPMN_JS_PARITY, SPEC_RE_XYFLOW_PARITY,
// SPEC_RE_JOINTJS_PARITY). The build fails loudly on any drift.
export const EXPECTED_VERSIONS = {
  "bpmn-js": "18.31.0",
  "diagram-js": "15.28.1",
  "bpmn-moddle": "10.3.1",
  "@xyflow/system": "0.0.83",
  "@xyflow/react": "12.12.0",
  "@xyflow/svelte": "1.7.0",
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "svelte": "5.56.4",
  "@joint/core": "4.3.3",
  "esbuild": "0.25.12",
};

export function resolveOraclesDir(explicit) {
  const dir = explicit || process.env.RE_ORACLES_DIR || path.join(REPO_ROOT, ".ds-scrap", "re-oracles");
  return path.resolve(dir);
}

export function packageVersion(oraclesDir, name) {
  try {
    const doc = JSON.parse(fs.readFileSync(path.join(oraclesDir, "node_modules", name, "package.json"), "utf8"));
    return typeof doc.version === "string" ? doc.version : null;
  } catch {
    return null;
  }
}

// Versions actually installed, keyed by package name (null when absent).
export function readOracleVersions(oraclesDir = resolveOraclesDir()) {
  const versions = {};
  for (const name of Object.keys(EXPECTED_VERSIONS)) versions[name] = packageVersion(oraclesDir, name);
  return versions;
}

// Per-gate oracle descriptor stamped into gate reports. libraryVersion is
// the version of the library that produced the output, read from its own
// package.json (never hard-coded in the report writer).
export function gateOracle(library, oraclesDir = resolveOraclesDir()) {
  const versions = readOracleVersions(oraclesDir);
  const byLibrary = {
    bpmn: versions["bpmn-js"],
    "xyflow-react": versions["@xyflow/react"],
    "xyflow-svelte": versions["@xyflow/svelte"],
    jointjs: versions["@joint/core"],
  };
  return { oracle: "real", library, libraryVersion: byLibrary[library] ?? null, versions };
}

export const BUNDLE_FILES = {
  bpmn: "bpmn.js",
  "xyflow-react": "xyflow-react.js",
  "xyflow-svelte": "xyflow-svelte.js",
  jointjs: "joint.js",
};

// Status of the built bundles on disk. A missing bundle means the real
// oracle cannot run: callers must report the gate `unknown`, never green.
export function bundleStatus(oraclesDir = resolveOraclesDir()) {
  const versions = readOracleVersions(oraclesDir);
  const out = {};
  for (const [library, file] of Object.entries(BUNDLE_FILES)) {
    const bundlePath = path.join(BUNDLES_DIR, file);
    const built = fs.existsSync(bundlePath) && fs.statSync(bundlePath).size > 0;
    out[library] = {
      library,
      bundle: `bundles/${file}`,
      built,
      oracleVersion: versions[
        library === "bpmn" ? "bpmn-js"
        : library === "xyflow-react" ? "@xyflow/react"
        : library === "xyflow-svelte" ? "@xyflow/svelte"
        : "@joint/core"
      ],
      cause: built ? null : `bundle bundles/${file} missing (run: node tools/re-harness/build-bundles.mjs)`,
    };
  }
  return out;
}
