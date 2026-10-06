#!/usr/bin/env node
// Asserts that a vitest JSON report describes a run that actually executed its
// tests: nothing failed, nothing was skipped, and the set is not empty.
//
// Why this exists: the packages/graph golden tests skip at RUNTIME
// (`ctx.skip()`) when Chrome does not boot or when the browser exposes no
// WebGL2 context. A skipped test exits 0, so a CI lane whose Chrome is missing
// or whose SwiftShader flags stopped working would report green having diffed
// no pixel at all. The `GOLDEN_REQUIRE_*` variables turn some of those skips
// into failures, but not all of them (the git-flow GL capture and the CDP port
// isolation test skip regardless), so the lane counts skips here instead of
// trusting each test file to opt in.
//
// Usage:
//   node scripts/assert-vitest-report.mjs --report=path/to/report.json \
//     [--min-tests=120] [--min-files=6] [--max-skipped=0]

import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";

export function parseArgs(argv) {
  const opts = { report: null, minTests: 1, minFiles: 1, maxSkipped: 0 };
  for (const arg of argv) {
    const m = arg.match(/^--([a-z-]+)=(.*)$/);
    if (!m) throw new Error(`assert-vitest-report: unexpected argument "${arg}"`);
    const [, key, value] = m;
    if (key === "report") {
      opts.report = value;
      continue;
    }
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0) {
      throw new Error(`assert-vitest-report: --${key} expects a non-negative integer, got "${value}"`);
    }
    if (key === "min-tests") opts.minTests = n;
    else if (key === "min-files") opts.minFiles = n;
    else if (key === "max-skipped") opts.maxSkipped = n;
    else throw new Error(`assert-vitest-report: unknown option --${key}`);
  }
  if (!opts.report) throw new Error("assert-vitest-report: --report=<vitest json report> is required");
  return opts;
}

// Returns the list of problems found in a parsed vitest JSON report; an empty
// list means the run is acceptable. Also returns the counts it read, so the
// caller can print them whatever the verdict.
export function checkReport(report, { minTests = 1, minFiles = 1, maxSkipped = 0 } = {}) {
  const problems = [];
  const files = Array.isArray(report?.testResults) ? report.testResults : null;
  if (!files) {
    return { problems: ["report has no testResults array — not a vitest JSON report"], counts: null };
  }

  const counts = { files: files.length, total: 0, passed: 0, failed: 0, skipped: 0 };
  const skipped = [];
  const failed = [];
  for (const file of files) {
    const assertions = Array.isArray(file.assertionResults) ? file.assertionResults : [];
    for (const a of assertions) {
      counts.total += 1;
      const label = `${basename(String(file.name ?? "?"))} > ${a.fullName ?? a.title ?? "?"}`;
      if (a.status === "passed") counts.passed += 1;
      else if (a.status === "failed") {
        counts.failed += 1;
        failed.push(label);
      } else {
        // "skipped", "pending", "todo", "disabled": none of them ran.
        counts.skipped += 1;
        skipped.push(`${label} [${a.status}]`);
      }
    }
    // A file that failed to import contributes no assertion at all.
    if (file.status === "failed" && assertions.length === 0) {
      failed.push(`${basename(String(file.name ?? "?"))} (file failed: ${file.message ?? "no message"})`);
      counts.failed += 1;
    }
  }

  if (counts.files < minFiles) {
    problems.push(`only ${counts.files} test file(s) in the report, expected at least ${minFiles}`);
  }
  if (counts.total < minTests) {
    problems.push(`only ${counts.total} test(s) in the report, expected at least ${minTests}`);
  }
  if (counts.failed > 0) {
    problems.push(`${counts.failed} failed:\n    ${failed.join("\n    ")}`);
  }
  if (counts.skipped > maxSkipped) {
    problems.push(`${counts.skipped} skipped (at most ${maxSkipped} allowed):\n    ${skipped.join("\n    ")}`);
  }
  return { problems, counts };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  let report;
  try {
    report = JSON.parse(readFileSync(opts.report, "utf8"));
  } catch (error) {
    console.error(`assert-vitest-report: cannot read ${opts.report}: ${error.message}`);
    process.exit(1);
  }
  const { problems, counts } = checkReport(report, opts);
  if (counts) {
    console.log(
      `assert-vitest-report: files=${counts.files} total=${counts.total} passed=${counts.passed} failed=${counts.failed} skipped=${counts.skipped}`,
    );
  }
  if (problems.length > 0) {
    console.error(`assert-vitest-report: ${opts.report} rejected:\n  - ${problems.join("\n  - ")}`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
