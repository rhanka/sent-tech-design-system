// AC-L2 guard: W4 — no watermark license value and no license reference
// value is ever committed (spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md §13.4
// W4, §15 AC-L2).
//
// THE RULE, AS W4 SPECIFIES IT: the guard fails when a TRACKED file sets
// `hidden: true` together with a literal non-placeholder `license` string.
// Allowed placeholders: "<your license reference>" — the one the
// bpmn-canvas README documents (`BC:README.md:369`). A license value read
// from an environment variable is not a literal, so it never trips the
// guard; a quoted ENVIRONMENT NAME (e.g. the string
// "SENTROPIC_BPMN_WATERMARK_REFERENCE" naming where the value lives) and a
// template interpolation are also accepted, since they name the channel,
// never the value.
//
// WHAT IT SCANS: every file `git ls-files` reports at the repository root
// (tracked only — untracked scratch cannot ship). Binary files (a NUL byte
// in the first 8 192 bytes) are skipped.
//
// RED HISTORY (observed 2026-11-05, before the L2 implementation existed):
// the repo scan was GREEN for the wrong reason — no tracked file sets
// `hidden: true` with a literal license simply because the element layer
// that would carry hostConfig.bpmn.watermark did not exist, so W4 had
// nothing to guard yet. The detector's own negative witnesses (a literal
// license is caught in JS and in JSON form; the placeholder, env reads and
// env names clear) were the only meaningful assertions, and they passed from
// the start — the guard's RED is the absence of anything to guard, closed
// by the L2 implementation, whose fixtures then rely on the placeholder
// form.
//
// 0 Python. Node only. Run by scripts/run-script-guards.mjs.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

/** The only literal license strings W4 allows (bpmn-canvas README's). */
export const W4_PLACEHOLDERS = ["<your license reference>"];

/** A license value that names the channel, not the value: an env name or interpolation. */
function namesChannelOnly(value) {
  if (value.includes("process.env") || value.includes("${")) return true;
  return /^[A-Z][A-Z0-9_]*$/.test(value);
}

/**
 * The W4 detector over one file's text. Returns one finding per literal
 * license string that rides along a `hidden: true` in the same object.
 * The window is deliberately generous (300 characters either side): the
 * hidden flag and the license key are one option object, minifiers keep
 * them adjacent, hand-written fixtures may not.
 */
export function watermarkFindings(text) {
  const findings = [];
  const hiddenRe = /["']?hidden["']?\s*[:=]\s*(?:true|["']true["'])/g;
  for (const hidden of text.matchAll(hiddenRe)) {
    const windowStart = Math.max(0, hidden.index - 300);
    const window = text.slice(windowStart, hidden.index + hidden[0].length + 300);
    const licenseRe = /["']?license["']?\s*[:=]\s*(["'`])([^"'`]*)\1/g;
    for (const license of window.matchAll(licenseRe)) {
      const value = license[2];
      if (W4_PLACEHOLDERS.includes(value)) continue;
      if (namesChannelOnly(value)) continue;
      const line = text.slice(0, windowStart + license.index).split("\n").length;
      findings.push({ line, value });
    }
  }
  return findings;
}

/** Tracked files at the repository root, as `git ls-files` reports them. */
export function trackedFiles() {
  const run = spawnSync("git", ["ls-files"], { cwd: repoRoot, encoding: "utf8" });
  if (run.status !== 0) throw new Error(`git ls-files failed (${run.status}): ${run.stderr}`);
  return run.stdout.split("\n").filter((line) => line.length > 0);
}

test("AC-L2 (W4): no tracked file commits a watermark license or reference value", () => {
  // This guard file itself carries the detector's negative fixtures
  // (synthetic values, e.g. "SENTROPIC-PROD-12345", that exist only to prove
  // the detector fires); scanning it would be self-referential noise.
  const selfPath = "scripts/elements-watermark-w4.test.mjs";
  const findings = [];
  for (const file of trackedFiles()) {
    if (file === selfPath) continue;
    let text;
    try {
      const raw = readFileSync(join(repoRoot, file));
      if (raw.subarray(0, 8192).includes(0)) continue;
      text = raw.toString("utf8");
    } catch {
      continue;
    }
    for (const finding of watermarkFindings(text)) {
      findings.push(`${file}:${finding.line}: hidden:true with a literal license value (${finding.value.slice(0, 24)}) — W4`);
    }
  }
  assert.deepStrictEqual(findings, [], `W4 violation(s):\n${findings.join("\n")}`);
});

// --- negative witnesses: the detector really detects ---

test("the W4 detector catches a literal license, and clears the legal forms", () => {
  const literal = `createBpmnCanvas(host, { watermark: { hidden: true, license: "SENTROPIC-PROD-12345" } });`;
  assert.deepStrictEqual(watermarkFindings(literal), [{ line: 1, value: "SENTROPIC-PROD-12345" }]);

  const jsonLiteral = `{"watermark":{"hidden":true,"license":"owner-secret-42"}}`;
  assert.strictEqual(watermarkFindings(jsonLiteral).length, 1);

  const clean = [
    `createBpmnCanvas(host, { watermark: { hidden: true, license: "<your license reference>" } });`,
    `createBpmnCanvas(host, { watermark: { hidden: true, license: process.env.SENTROPIC_BPMN_WATERMARK_REFERENCE } });`,
    `createBpmnCanvas(host, { watermark: { hidden: true, license: SENTROPIC_BPMN_WATERMARK_REFERENCE } });`,
    `createBpmnCanvas(host, { watermark: { hidden: true, license: "SENTROPIC_BPMN_WATERMARK_REFERENCE" } });`,
    `createBpmnCanvas(host, { watermark: { hidden: true, license: \`\${env.reference}\` } });`,
    `const hidden = true; const license = readLicense();`,
    `{"hidden":false,"license":"anything"}`,
  ];
  for (const text of clean) {
    assert.deepStrictEqual(watermarkFindings(text), [], `must be clean: ${text}`);
  }
});
