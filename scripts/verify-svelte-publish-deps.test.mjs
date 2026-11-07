// Guard for the svelte-publish.yml build-deps gap (tag svelte-v0.37.0, run
// 42364382720): the verify job built tokens/graph/themes/theme-dsfr by hand
// but never @sentropic/design-system-rich-text, so npm ci's workspace symlink
// resolved `@sentropic/design-system-rich-text` to packages/rich-text, whose
// exports point at dist/, and svelte-check failed with "Cannot find module
// '@sentropic/design-system-rich-text'". The publish job had the same gap
// (plus theme-dsfr).
//
// The fix replaces the hand-maintained lists with
// `node scripts/ensure-theme-dists.mjs --workspaces=<seeds>`, which builds the
// local dependency closure of the seeds in topological order. This guard keeps
// that true without trusting the helper: it recomputes the closure of
// packages/components-svelte from the workspace manifests (via
// getOrderedWorkspaces) and fails if any closure member is not built by
// svelte-publish.yml before the first step that builds/checks/tests/publishes
// @sentropic/design-system-svelte. A workflow may satisfy it either with
// explicit `npm --workspace <name> run build` lines or with a topological
// helper seeded so that its closure covers the required members — but a list
// that drops one (e.g. rich-text) goes red.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { getOrderedWorkspaces } from "./run-workspaces.mjs";

const SVELTE = "@sentropic/design-system-svelte";
const workflowsDir = new URL("../.github/workflows/", import.meta.url).pathname;

const dependencyFields = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];

function localDepsOf(manifest, localNames) {
  const names = new Set();
  for (const field of dependencyFields) {
    for (const name of Object.keys(manifest[field] ?? {})) {
      if (localNames.has(name)) names.add(name);
    }
  }
  return names;
}

// Transitive local @sentropic dependency closure of `seedName`, seed included.
// Recomputed here on purpose (not imported from ensure-theme-dists.mjs, which
// is a script without an import guard): an independent recomputation also
// catches a bug in the helper's own closure logic.
function closureOf(seedName, workspaces) {
  const byName = new Map(workspaces.map((workspace) => [workspace.name, workspace]));
  const localNames = new Set(byName.keys());
  const closure = new Set();
  function visit(name) {
    if (closure.has(name)) return;
    const workspace = byName.get(name);
    if (!workspace) return; // not a local workspace (registry dep): not our build
    for (const dep of localDepsOf(workspace.manifest, localNames)) visit(dep);
    closure.add(name);
  }
  visit(seedName);
  return closure;
}

// Split a workflow file into its jobs (name -> lines with their line index),
// the same lightweight structural scan scripts/verify-workflow-invariants.test.mjs
// uses: no YAML parser is available without adding a dependency.
function splitJobs(text) {
  const lines = text.split("\n");
  const jobsStart = lines.findIndex((line) => /^jobs:\s*$/.test(line));
  assert.ok(jobsStart >= 0, "workflow has no `jobs:` key");
  const jobs = [];
  let current = null;
  for (let i = jobsStart + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\S/.test(line)) break; // next top-level key ends jobs:
    const header = line.match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
    if (header) {
      current = { name: header[1], lines: [] };
      jobs.push(current);
      continue;
    }
    if (current) current.lines.push({ text: line, index: i });
  }
  return jobs;
}

const WORKSPACE_BUILD_RE = /npm (?:--workspace|-w) ([^\s]+) run build/g;
const ENSURE_DISTS_SEEDS_RE = /ensure-theme-dists\.mjs[^\n]*--workspaces=([^\s]+)/g;
const RUN_WORKSPACES_SEEDS_RE = /run-workspaces\.mjs build[^\n]*--workspaces=([^\s]+)/g;
const ROOT_BUILD_RE = /^(?:npm run (?:build|verify)\b|node scripts\/run-workspaces\.mjs build\s*$)/;

// Workspaces built by the given lines: explicit `npm --workspace X run build`,
// the closure of every ensure-theme-dists seed, the exact names of every
// run-workspaces seed (that helper does NOT add dependencies), and every
// workspace when a root-level `npm run build` / `npm run verify` appears.
function builtWorkspaces(lines, workspaces, allNames) {
  const built = new Set();
  for (const { text } of lines) {
    const trimmed = text.trim();
    for (const match of trimmed.matchAll(WORKSPACE_BUILD_RE)) built.add(match[1]);
    for (const match of trimmed.matchAll(ENSURE_DISTS_SEEDS_RE)) {
      for (const seed of match[1].split(",").map((value) => value.trim().replace(/^["']|["']$/g, "")).filter(Boolean)) {
        for (const name of closureOf(seed, workspaces)) built.add(name);
      }
    }
    for (const match of trimmed.matchAll(RUN_WORKSPACES_SEEDS_RE)) {
      for (const seed of match[1].split(",").map((value) => value.trim().replace(/^["']|["']$/g, "")).filter(Boolean)) {
        built.add(seed);
      }
    }
    if (ROOT_BUILD_RE.test(trimmed)) {
      for (const name of allNames) built.add(name);
    }
  }
  return built;
}

function triggerRe(workspaceName) {
  const escaped = workspaceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `npm (?:--workspace|-w) ${escaped} run (?:build|check|test)\\b|npm publish --workspace ${escaped}\\b`,
  );
}

// Jobs of `workflowText` that build/check/test/publish any of `triggerNames`;
// for each, the workspaces built strictly before the first such reference.
function jobsTouching(workflowText, triggerNames, workspaces, allNames) {
  const result = [];
  for (const job of splitJobs(workflowText)) {
    const triggers = triggerNames.map((name) => ({ name, re: triggerRe(name) }));
    let first = null;
    for (const line of job.lines) {
      for (const { name, re } of triggers) {
        if (re.test(line.text) && (!first || line.index < first.index)) {
          first = { index: line.index, name, isPublish: /npm publish/.test(line.text) };
        }
      }
    }
    if (!first) continue;
    const before = job.lines.filter((line) => line.index < first.index);
    result.push({ job: job.name, trigger: first, builtBefore: builtWorkspaces(before, workspaces, allNames) });
  }
  return result;
}

const workspaces = getOrderedWorkspaces();
const allNames = workspaces.map((workspace) => workspace.name);
const svelteClosure = closureOf(SVELTE, workspaces);
const svelteDeps = [...svelteClosure].filter((name) => name !== SVELTE);

test("the closure of @sentropic/design-system-svelte is recomputed from the workspace graph", () => {
  // Anti-vacuity floor: measured on the current tree, the local closure of
  // packages/components-svelte is rich-text, themes, graph, theme-dsfr and
  // tokens (themes/theme-dsfr pull in tokens). If a manifest edit shrinks it
  // to nothing, the assertions below would pass over an empty set.
  assert.ok(svelteDeps.length >= 5, `expected at least 5 local deps of ${SVELTE}, got: ${svelteDeps.join(", ")}`);
  for (const expected of [
    "@sentropic/design-system-rich-text",
    "@sentropic/design-system-themes",
    "@sentropic/graph",
    "@sentropic/design-system-theme-dsfr",
    "@sentropic/design-system-tokens",
  ]) {
    assert.ok(svelteClosure.has(expected), `expected ${expected} in the closure of ${SVELTE}`);
  }
  for (const name of svelteClosure) {
    assert.ok(allNames.includes(name), `${name} is not a workspace name — closure logic drifted`);
  }
});

test("svelte-publish.yml builds every local dependency of components-svelte before building/checking/publishing it", () => {
  const workflow = readFileSync(new URL("../.github/workflows/svelte-publish.yml", import.meta.url), "utf8");
  const jobs = jobsTouching(workflow, [SVELTE], workspaces, allNames);
  // Anti-vacuity: the verify job (build+check+test) and the publish job
  // (npm publish) must both be seen; a parser drift that sees no job would
  // pass over an empty set.
  assert.ok(jobs.length >= 2, `expected at least 2 jobs touching ${SVELTE} in svelte-publish.yml, saw: ${jobs.map((j) => j.job).join(", ")}`);
  for (const { job, trigger, builtBefore } of jobs) {
    const missing = svelteDeps.filter((name) => !builtBefore.has(name));
    assert.deepEqual(
      missing,
      [],
      `svelte-publish.yml job "${job}" reaches ${trigger.name} (${trigger.isPublish ? "publish" : "build/check/test"}) ` +
        `without building: ${missing.join(", ") || "(none)"} — build the full local closure first ` +
        `(e.g. node scripts/ensure-theme-dists.mjs --workspaces=${SVELTE})`,
    );
    if (trigger.isPublish) {
      assert.ok(
        builtBefore.has(SVELTE),
        `svelte-publish.yml job "${job}" publishes ${SVELTE} without building it first`,
      );
    }
  }
});

test("every *-publish.yml job that builds/checks/tests/publishes a workspace depending on components-svelte builds its closure first", () => {
  // Triggers: components-svelte itself, plus every workspace whose local
  // closure contains it (today: @sentropic/dataviz-svelte). This is what makes
  // dataviz-publish.yml, react-publish.yml and angular-publish.yml fail the
  // guard if they go back to building design-system-svelte (or dataviz-svelte)
  // without rich-text & co. built first.
  const triggerNames = allNames.filter((name) => closureOf(name, workspaces).has(SVELTE));
  assert.ok(triggerNames.includes(SVELTE) && triggerNames.includes("@sentropic/dataviz-svelte"), "trigger set drifted");

  const files = readdirSync(workflowsDir).filter((name) => /-publish\.ya?ml$/.test(name));
  assert.ok(files.length >= 9, "publish workflow set looks wrong");
  const offenders = [];
  for (const file of files) {
    const text = readFileSync(workflowsDir + file, "utf8");
    for (const { job, trigger, builtBefore } of jobsTouching(text, triggerNames, workspaces, allNames)) {
      const missing = svelteDeps.filter((name) => !builtBefore.has(name));
      if (missing.length > 0 || (trigger.isPublish && !builtBefore.has(SVELTE))) {
        offenders.push(`${file} job "${job}": ${missing.join(", ") || SVELTE}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `publish workflow(s) missing the components-svelte closure:\n  ${offenders.join("\n  ")}`);
});
