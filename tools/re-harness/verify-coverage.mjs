#!/usr/bin/env node
// Coverage gate entry point (task L0 clause 4). Thin wrapper over
// src/harness.mjs coverage, same style as tools/re-*/verify.mjs:
//   node tools/re-harness/verify-coverage.mjs           # report the gap (exit 0)
//   node tools/re-harness/verify-coverage.mjs --strict  # fail on any missing P0/P1
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = ["src/harness.mjs", "coverage", ...process.argv.slice(2)];
const r = spawnSync(process.execPath, args, { cwd: here, stdio: "inherit" });
process.exit(r.status ?? 1);
