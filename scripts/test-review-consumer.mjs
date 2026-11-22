import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const lane = join(root, ".vite", "review-consumer");
const npmCache = join(lane, "npm-cache");
mkdirSync(npmCache, { recursive: true });
const host = mkdtempSync(join(lane, "host-"));
const tmp = join(host, "tmp");
const runtime = join(host, "runtime");
mkdirSync(tmp);
mkdirSync(runtime, { mode: 0o700 });

const env = { ...process.env, TMPDIR: tmp, XDG_RUNTIME_DIR: runtime, npm_config_cache: npmCache };
delete env.NODE_PATH;
const run = (command, args, stdio = "inherit") => execFileSync(command, args, { cwd: host, env, stdio, encoding: "utf8" });
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const core = "@sentropic/design-system-review-core";
const components = "@sentropic/design-system-svelte";
const packages = {
  [core]: {
    version: "0.1.1",
    integrity: "sha512-xYtYGLZ097IzeShk0+J1Q27qJWHYPNTaui+ZPHNTif7bTxLFePly6RCjmr3BGxWPCwz7NNwf/GRqEp1S40Spiw==",
    gitHead: "4e02910aac9626ea2b84190f69e5777e3b6b120a",
  },
  [components]: {
    version: "0.43.0",
    integrity: "sha512-23Me3nVhtkv6/ojuCYPVvsxfbFUPpD+4WnCvW9cuO+07w5yWvQoPxf8kjL8Q5lLjKG8MKucpjxHHbSxDcHqOag==",
    gitHead: "d2312d6f5293892fec748d3529b6c03d4426c13a",
  },
};

console.log(`Review consumer host: ${host}`);
const checkout = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, env, encoding: "utf8" }).trim();
console.log(`DS checkout: ${checkout}`);
const lock = readJson(join(root, "package-lock.json"));
const tools = ["svelte", "vite", "@sveltejs/vite-plugin-svelte", "jsdom", "typescript"];
const dependencies = Object.fromEntries(tools.map((name) => [name, lock.packages[`node_modules/${name}`].version]));
for (const [name, expected] of Object.entries(packages)) {
  const spec = `${name}@${expected.version}`;
  const metadata = JSON.parse(run("npm", ["view", spec, "gitHead", "dist.integrity", "--json"], "pipe"));
  assert.equal(metadata.gitHead, expected.gitHead, `${spec} gitHead`);
  assert.equal(metadata["dist.integrity"], expected.integrity, `${spec} registry integrity`);

  const [archive] = JSON.parse(run("npm", ["pack", spec, "--json", "--ignore-scripts"], "pipe"));
  const digest = createHash("sha512").update(readFileSync(join(host, archive.filename))).digest("base64");
  assert.equal(`sha512-${digest}`, expected.integrity, `${spec} archive integrity`);
  dependencies[name] = `file:./${archive.filename}`;
  console.log(`${spec} ${expected.integrity} ${expected.gitHead}`);
}

writeFileSync(join(host, "package.json"), JSON.stringify({ private: true, type: "module", dependencies }, null, 2));
run("npm", ["install", "--workspaces=false", "--ignore-scripts", "--no-audit", "--no-fund"]);
const installed = readJson(join(host, "package-lock.json")).packages;
for (const [name, expected] of Object.entries(packages)) {
  const pkg = installed[`node_modules/${name}`];
  assert.equal(pkg.version, expected.version);
  assert.equal(pkg.integrity, expected.integrity);
  assert.ok(!pkg.link, `${name} must be installed from its archive`);
}
assert.equal(installed[`node_modules/${components}/node_modules/${core}`]?.version, "0.1.0");

const fixture = fileURLToPath(new URL("./fixtures/review-consumer/", import.meta.url));
cpSync(fixture, host, { recursive: true });
run(process.execPath, ["check-exports.mjs"]);
run(process.execPath, ["verify.mjs"]);
