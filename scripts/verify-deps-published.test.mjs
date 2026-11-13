// Guards for scripts/verify-deps-published.mjs (lot DC-1, review item 7).
//
// The release case: packages/components-svelte/package.json pins
// @sentropic/design-system-themes 0.14.0, which is not on the npm registry
// yet, so publishing svelte before the core packages would ship a dependency
// npm cannot resolve. The gate must fail closed on that exact pin, and pass
// only when every exact @sentropic/* pin of the manifest resolves on the
// registry to the same version. The registry probe is stubbed in-process; the
// workflow wiring (npm-publish.yml — the trusted publisher bound to tokens
// and themes in docs/release.md — publishes tokens then themes on `core-v*`
// without svelte, and on `v*` in lockstep; svelte-publish.yml runs this gate
// before `npm publish`) is asserted against the real workflow files.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { collectSentropicDeps, main, verifyDeps } from "./verify-deps-published.mjs";

const svelteManifest = JSON.parse(
  readFileSync(new URL("../packages/components-svelte/package.json", import.meta.url), "utf8"),
);
const themesManifest = JSON.parse(
  readFileSync(new URL("../packages/themes/package.json", import.meta.url), "utf8"),
);
const npmWorkflow = readFileSync(new URL("../.github/workflows/npm-publish.yml", import.meta.url), "utf8");
const svelteWorkflow = readFileSync(new URL("../.github/workflows/svelte-publish.yml", import.meta.url), "utf8");
const canvasWorkflow = readFileSync(
  new URL("../.github/workflows/diagram-canvas-publish.yml", import.meta.url),
  "utf8",
);
const canvasManifest = JSON.parse(
  readFileSync(new URL("../packages/diagram-canvas/package.json", import.meta.url), "utf8"),
);

// The `publish:` job body of a workflow, as lines.
function publishJobLines(workflowText, label) {
  const lines = workflowText.split("\n");
  const publishAt = lines.findIndex((l) => /^ {2}publish:\s*$/.test(l));
  assert.ok(publishAt >= 0, `${label} must have a publish job`);
  const job = [];
  for (let i = publishAt + 1; i < lines.length; i++) {
    if (/^ {2}[A-Za-z0-9_-]+:\s*$/.test(lines[i])) break;
    job.push(lines[i]);
  }
  return job;
}

const PINNED_SHA = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*@[0-9a-f]{40}$/;

test("collectSentropicDeps reads every exact @sentropic/* pin of the svelte manifest", () => {
  const deps = collectSentropicDeps(svelteManifest);
  const byName = new Map(deps.map((d) => [d.name, d.version]));
  assert.equal(byName.get("@sentropic/design-system-themes"), themesManifest.version);
  assert.equal(byName.get("@sentropic/design-system-rich-text"), "0.1.0");
  assert.equal(byName.get("@sentropic/graph"), "0.3.0");
  assert.equal(byName.get("@sentropic/design-system-theme-dsfr"), "0.2.2");
  // DC-2a L4: the scene host makes diagram-canvas a runtime dependency. It
  // must stay an exact pin — a range would drop out of the gate in silence.
  assert.equal(byName.get("@sentropic/diagram-canvas"), canvasManifest.version);
  // sorted, and ranges/tags are ignored (only exact versions are gated)
  const names = deps.map((d) => d.name);
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)));
  assert.deepEqual(collectSentropicDeps({ dependencies: { "@sentropic/graph": "^0.3.0", react: "19.0.0" } }), []);
  assert.deepEqual(collectSentropicDeps({}), []);
});

test("verifyDeps reports pins the registry does not resolve to the exact version", () => {
  const deps = [
    { name: "@sentropic/design-system-themes", version: "0.14.0" },
    { name: "@sentropic/graph", version: "0.3.0" },
  ];
  const allPresent = (name, version) => version;
  assert.deepEqual(verifyDeps(deps, allPresent), []);
  const missing = verifyDeps(deps, (name) => (name === "@sentropic/design-system-themes" ? null : "0.3.0"));
  assert.deepEqual(missing, [{ name: "@sentropic/design-system-themes", version: "0.14.0", seen: null }]);
  const drifted = verifyDeps(deps, (name, version) => (name === "@sentropic/graph" ? "0.2.0" : version));
  assert.deepEqual(drifted, [{ name: "@sentropic/graph", version: "0.3.0", seen: "0.2.0" }]);
});

test("main fails closed on the release case: themes 0.14.0 not yet on npm", () => {
  // Simulated registry state before the core release: rich-text 0.1.0, graph 0.3.0 and
  // theme-dsfr 0.2.2 exist; tokens 0.14.0 and themes 0.14.0 do not (E404).
  const registry = new Map([
    ["@sentropic/design-system-rich-text@0.1.0", "0.1.0"],
    ["@sentropic/graph@0.3.0", "0.3.0"],
    ["@sentropic/design-system-theme-dsfr@0.2.2", "0.2.2"],
  ]);
  const view = (name, version) => registry.get(`${name}@${version}`) ?? null;
  const code = main(["--workspace", "packages/components-svelte"], view);
  assert.equal(code, 1, "the gate must refuse to publish while themes@0.14.0 is missing");
});

// DC-2a L4 release order: diagram-canvas → tokens (if changed) → svelte. With
// every other pin present, the svelte gate still refuses while the exact
// diagram-canvas version the manifest names is absent from the registry.
test("main fails closed while @sentropic/diagram-canvas is not yet on npm", () => {
  const view = (name, version) => (name === "@sentropic/diagram-canvas" ? null : version);
  const code = main(["--workspace", "packages/components-svelte"], view);
  assert.equal(code, 1, "the gate must refuse to publish svelte while diagram-canvas is missing");
});

// Same gate one step up the chain: diagram-canvas pins diagram-core exactly.
test("the diagram-canvas gate fails closed while @sentropic/diagram-core is not yet on npm, and is never vacuous", () => {
  const deps = collectSentropicDeps(canvasManifest);
  assert.deepEqual(
    deps.map((d) => d.name),
    ["@sentropic/diagram-core"],
    "diagram-canvas must pin @sentropic/diagram-core exactly — an empty set makes the gate exit 1 on every tag",
  );
  assert.equal(main(["--workspace", "packages/diagram-canvas"], () => null), 1);
  assert.equal(main(["--workspace", "packages/diagram-canvas"], (name, version) => version), 0);
});

test("main passes when every pinned @sentropic/* version is on npm", () => {
  const view = (name, version) => version;
  assert.equal(main(["--workspace", "packages/components-svelte"], view), 0);
});

test("npm-publish.yml publishes tokens then themes on the core-v tag (and the v lockstep), OIDC only, pinned SHAs", () => {
  // The core-v* tag is handled by the SAME workflow that is bound to tokens
  // and themes as npm trusted publisher (docs/release.md) — no second
  // publishing workflow with a different OIDC identity.
  assert.match(npmWorkflow, /tags:\s*\["v\[0-9\]\*",\s*"core-v\*"\]/, "trigger must be the v* lockstep and core-v* tags");
  assert.match(npmWorkflow, /id-token:\s*write/, "publish job must keep OIDC id-token: write");
  assert.match(npmWorkflow, /merge-base --is-ancestor/, "release-guard must keep the tag-is-ancestor guard");
  assert.match(npmWorkflow, /^permissions:\n {2}contents: read$/m, "least-privilege top-level permissions");
  assert.ok(!/NPM_TOKEN|NODE_AUTH_TOKEN|secrets\.NPM/.test(npmWorkflow), "no token secret: OIDC only");
  const usesRefs = [...npmWorkflow.matchAll(/uses:\s*(\S+)/g)].map((m) => m[1]);
  assert.ok(usesRefs.length >= 3, "expected checkout + setup-node steps");
  for (const ref of usesRefs) assert.match(ref, PINNED_SHA, `uses: must be pinned to a 40-hex SHA, got ${ref}`);
  const tokensAt = npmWorkflow.indexOf("npm publish --workspace @sentropic/design-system-tokens --access public");
  const themesAt = npmWorkflow.indexOf("npm publish --workspace @sentropic/design-system-themes --access public");
  assert.ok(tokensAt >= 0 && themesAt > tokensAt, "tokens must be published before themes (themes depends on tokens)");
  // On a core-v tag only the core pair publishes: the svelte publish line is
  // guarded by the lockstep condition, so design-system-svelte never has to
  // share the core version.
  const lockstepGuardAt = npmWorkflow.indexOf('if [ "$IS_LOCKSTEP" = "true" ]');
  const svelteAt = npmWorkflow.indexOf("npm publish --workspace @sentropic/design-system-svelte --access public");
  assert.ok(lockstepGuardAt >= 0, "the svelte publish must be conditional on the v lockstep tag");
  assert.ok(svelteAt > lockstepGuardAt, "svelte publishes only on the v<version> lockstep tag, not on core-v");
  // release-guard pins both core manifests to the core-v tag version
  assert.match(npmWorkflow, /packages\/tokens\/package\.json/);
  assert.match(npmWorkflow, /packages\/themes\/package\.json/);
  assert.match(npmWorkflow, /core-v/, "the core-v prefix must be handled (version extraction)");
});

test("svelte-publish.yml runs the fail-closed dep gate after checkout and before npm publish", () => {
  const job = publishJobLines(svelteWorkflow, "svelte-publish.yml");
  const checkoutAt = job.findIndex((l) => /actions\/checkout@/.test(l));
  const gateAt = job.findIndex((l) => /node scripts\/verify-deps-published\.mjs/.test(l));
  const publishStepAt = job.findIndex((l) => /npm publish --workspace/.test(l));
  assert.ok(checkoutAt >= 0, "publish job must check out the repository (the gate reads scripts/)");
  assert.ok(gateAt > checkoutAt, "dep gate must run after checkout");
  assert.ok(publishStepAt > gateAt, "dep gate must run before npm publish — fail closed");
});

test("diagram-canvas-publish.yml runs the fail-closed dep gate on its own manifest after checkout and before npm publish", () => {
  const job = publishJobLines(canvasWorkflow, "diagram-canvas-publish.yml");
  const checkoutAt = job.findIndex((l) => /actions\/checkout@/.test(l));
  const gateAt = job.findIndex((l) =>
    /node scripts\/verify-deps-published\.mjs --workspace packages\/diagram-canvas\s*$/.test(l),
  );
  const publishStepAt = job.findIndex((l) => /npm publish --workspace @sentropic\/diagram-canvas/.test(l));
  assert.ok(checkoutAt >= 0, "publish job must check out the repository (the gate reads scripts/)");
  assert.ok(gateAt > checkoutAt, "dep gate must run after checkout, on packages/diagram-canvas");
  assert.ok(publishStepAt > gateAt, "dep gate must run before npm publish — fail closed");
});
