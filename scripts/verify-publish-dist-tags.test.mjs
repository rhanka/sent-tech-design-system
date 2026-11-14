import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// Execute the workflow shell bodies with npm mocked: no registry or publish calls.
function stepBody(workflow, name) {
  const step = workflow.split(`      - name: ${name}\n`)[1]?.split(/\n      - /)[0];
  assert.ok(step, `missing step ${name}`);
  const body = step.split("        run: |\n")[1];
  assert.ok(body, `missing shell body for ${name}`);
  return body.split(/\n(?= {0,9}\S)/)[0]
    .split("\n").map((line) => line.replace(/^ {10}/, "")).join("\n");
}

function runStep(body, env) {
  const directory = mkdtempSync(join(tmpdir(), "publish-dist-tags-"));
  const log = join(directory, "npm.log");
  const output = join(directory, "output");
  try {
    const result = spawnSync("bash", ["--noprofile", "--norc", "-e", "-o", "pipefail", "-c", `
      node() {
        printf '%s\\n' "$*" >> "$MOCK_NODE_LOG"
        if [ "$1" = "$MOCK_GATE_FAIL" ]; then return 1; fi
        printf '%s\\n' "$MOCK_VERSION"
      }
      npm() {
        printf '%s\\n' "$*" >> "$MOCK_LOG"
        if [ "$1" = view ]; then
          if [ "$MOCK_MODE" = publish ]; then return 1; fi
          printf '%s\\n' "$MOCK_REGISTRY_VERSION"
        fi
      }
      sleep() { exit 93; }
      mkdir() { :; }
      cd() { :; }
      ${body}
    `], {
      env: { ...process.env, ...env, MOCK_LOG: log, MOCK_NODE_LOG: join(directory, 'node.log'), GITHUB_OUTPUT: output },
      encoding: "utf8",
      timeout: 5000,
    });
    const read = (path) => {
      try { return readFileSync(path, "utf8"); }
      catch (error) { if (error.code === "ENOENT") return ""; throw error; }
    };
    return { ...result, log: read(log), nodeLog: read(join(directory, 'node.log')), output: read(output) };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

for (const [file, prefix, publishName, packageCount] of [
  ["vue-publish.yml", "vue-v", "Publish Vue package", 1],
  ["dataviz-publish.yml", "dataviz-v", "Publish Dataviz packages in dependency order", 5],
  ["dataviz-publish.yml", "dataviz-v", "Publish Dataviz packages in dependency order", 4],
  ["dataviz-publish.yml", "dataviz-vue-v", "Publish Dataviz packages in dependency order", 1],
]) {
  const workflow = readFileSync(new URL(`../.github/workflows/${file}`, import.meta.url), "utf8");
  const publish = stepBody(workflow, publishName);
  const verify = stepBody(workflow, "Wait for npm propagation");
  const install = file === 'dataviz-publish.yml' ? stepBody(workflow, 'Install published packages') : null;
  const selected = packageCount === 1 ? ['vue'] : packageCount === 4
    ? ['core', 'svelte', 'react', 'angular'] : ['core', 'svelte', 'react', 'vue', 'angular'];
  const selection = { PACKAGES: selected.map(name => `@sentropic/dataviz-${name}`).join(' ') };

  test(`${file} passes the publish step dist-tag to post-publish verification`, () => {
    assert.match(workflow, /outputs:\n      dist-tag: \$\{\{ steps\.publish\.outputs\.dist-tag \}\}/);
    assert.match(workflow.split(`      - name: ${publishName}\n`)[1], /^        id: publish\n/);
    assert.match(workflow.split("  post-publish-check:\n")[1], /DIST_TAG: \$\{\{ needs\.publish\.outputs\.dist-tag \}\}/);
  });

  for (const [version, distTag] of [
    ["0.6.0-next.0", "next"],
    ["0.41.0-next.0", "next"],
    ["0.41.0-next.1", "next"],
    ["0.41.0-beta.2", "beta"],
    ["0.41.0-rc.1+build.7", "rc"],
    ["0.41.0", "latest"],
    ["0.41.0+build-with-hyphen", "latest"],
  ]) {
    if (prefix === 'dataviz-vue-v' && distTag === 'latest') continue; // Independent Vue tags require a prerelease.
    const env = { ...selection, TAG: `${prefix}${version}`, MOCK_VERSION: version, DIST_TAG: distTag };
    test(`${file} (${prefix}, ${packageCount} packages) publishes ${version} under ${distTag}`, () => {
      const result = runStep(publish, { ...env, MOCK_MODE: "publish" });
      assert.equal(result.status, 0, result.stderr);
      const calls = result.log.trim().split("\n").filter((line) => line.startsWith("publish "));
      assert.equal(calls.length, packageCount);
      for (const call of calls) assert.ok(call.endsWith(`--access public --tag ${distTag}`), call);
      assert.equal(result.output, `dist-tag=${distTag}\n`);
      if (file === 'dataviz-publish.yml') {
        for (const packageName of selection.PACKAGES.split(' ')) {
          assert(result.nodeLog.includes(`scripts/verify-deps-published.mjs --workspace packages/${packageName.slice('@sentropic/'.length)} --runtime`));
          assert(calls.some(call => call.includes(`--workspace ${packageName} `)));
        }
        assert.equal(result.nodeLog.includes('scripts/dataviz-vue-registry-packed.mjs'), selected.includes('vue'));
        if (!selected.includes('vue')) assert(!result.log.includes('@sentropic/dataviz-vue'));
      }
    });

    test(`${file} (${prefix}, ${packageCount} packages) verifies ${distTag} resolves to ${version}`, () => {
      const result = runStep(verify, { ...env, MOCK_REGISTRY_VERSION: version });
      assert.equal(result.status, 0, result.stderr);
      const calls = result.log.trim().split("\n");
      assert.equal(calls.length, packageCount);
      for (const call of calls) assert.ok(call.endsWith(`@${distTag} version --silent`), call);
    });

    if (install) test(`${prefix} installs only the ${packageCount} selected published candidates at ${version}`, () => {
      const result = runStep(install, env);
      assert.equal(result.status, 0, result.stderr);
      for (const name of selected) assert(result.log.includes(`@sentropic/dataviz-${name}@${version}`));
      if (!selected.includes('vue')) assert(!result.log.includes('@sentropic/dataviz-vue@'));
      if (packageCount === 1) assert(!result.log.includes('@sentropic/dataviz-core@'));
    });
  }

  test(`${file} rejects a prerelease whose identifier is latest`, () => {
    const result = runStep(publish, {
      TAG: `${prefix}0.41.0-latest.0`, MOCK_VERSION: "0.41.0-latest.0", MOCK_MODE: "publish",
    });
    assert.equal(result.status, 1);
    assert.equal(result.log, "");
    assert.equal(result.output, "");
  });

  for (const registryVersion of ["0.40.0", ""]) {
    test(`${file} retries when the dist-tag returns ${registryVersion || "no version"}`, () => {
      const result = runStep(verify, {
        TAG: `${prefix}0.41.0-next.0`, DIST_TAG: "next", MOCK_REGISTRY_VERSION: registryVersion,
        ...selection,
      });
      assert.equal(result.status, 93, "verification must reach the mocked retry sleep");
    });
  }

  if (file === 'dataviz-publish.yml' && packageCount === 1) {
    for (const gate of ['scripts/verify-deps-published.mjs', 'scripts/dataviz-vue-registry-packed.mjs']) {
      test(`Vue-only publication stops before npm when ${gate} fails`, () => {
        const result = runStep(publish, { ...selection, TAG: 'dataviz-vue-v0.6.0-next.0',
          MOCK_VERSION: '0.6.0-next.0', MOCK_MODE: 'publish', MOCK_GATE_FAIL: gate });
        assert.equal(result.status, 1);
        assert.equal(result.log, '');
        assert.equal(result.output, '');
      });
    }
  }
}
