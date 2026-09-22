// GD-M1 provenance verifier: node tools/graph-dataviz-provenance/verify.mjs
//
// Recomputes the sha256 of every file covered by
// docs/graph-dataviz-m1-provenance.json and confirms each entry:
// - copied-byte-identical: destination bytes match the recorded source sha256;
// - adapted-*: destination bytes match the recorded destinationSha256;
// - generated-notices: the generated file exists and is not empty;
// - local-*: monorepo-authored file with no source (pre-existing M0 helper);
//   destination bytes match the recorded sha256.
// Also fails when a tracked file of the six packages has no provenance entry.
// No dependencies (node builtins only). Exits non-zero on any gap.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const PROVENANCE = join(root, "docs", "graph-dataviz-m1-provenance.json");
const PACKAGES = [
  "packages/graph",
  "packages/dataviz-core",
  "packages/dataviz-svelte",
  "packages/dataviz-react",
  "packages/dataviz-vue",
  "packages/dataviz-angular",
];

function sha256File(absPath) {
  return createHash("sha256").update(readFileSync(absPath)).digest("hex");
}

function isFile(absPath) {
  try {
    return statSync(absPath).isFile();
  } catch {
    return false;
  }
}

const failures = [];
const provenance = JSON.parse(readFileSync(PROVENANCE, "utf8"));
const seen = new Set();

for (const entry of provenance.files) {
  seen.add(entry.destination);
  const abs = join(root, entry.destination);
  if (!isFile(abs)) {
    failures.push(`${entry.destination}: missing on disk`);
    continue;
  }
  if (entry.status === "generated-notices") {
    if (statSync(abs).size === 0) failures.push(`${entry.destination}: generated file is empty`);
    continue;
  }
  const digest = sha256File(abs);
  if (entry.status === "copied-byte-identical") {
    if (digest !== entry.sha256) {
      failures.push(`${entry.destination}: sha256 ${digest} != recorded ${entry.sha256}`);
    }
  } else if (entry.status === "license-preserved") {
    if (digest !== entry.sha256) {
      failures.push(`${entry.destination}: sha256 ${digest} != recorded ${entry.sha256}`);
    }
  } else if (entry.status.startsWith("local-")) {
    if (digest !== entry.sha256) {
      failures.push(`${entry.destination}: sha256 ${digest} != recorded ${entry.sha256}`);
    }
  } else if (entry.status.startsWith("adapted-")) {
    if (!entry.destinationSha256) {
      failures.push(`${entry.destination}: adapted entry without destinationSha256`);
    } else if (digest !== entry.destinationSha256) {
      failures.push(`${entry.destination}: sha256 ${digest} != recorded ${entry.destinationSha256}`);
    }
  } else {
    failures.push(`${entry.destination}: unknown status ${entry.status}`);
  }
}

const tracked = execFileSync("git", ["ls-files", "--", ...PACKAGES], { cwd: root, encoding: "utf8" })
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
for (const file of tracked) {
  if (!seen.has(file)) failures.push(`${file}: tracked file without provenance entry`);
}

if (failures.length > 0) {
  console.error(`provenance verification FAILED (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`provenance OK: ${provenance.files.length} entries, ${tracked.length} tracked files covered`);
