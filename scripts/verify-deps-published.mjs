// Fail-closed dependency gate for the Svelte publish workflow (lot DC-1,
// review item 7): before `npm publish` runs for a workspace, every exact
// `@sentropic/*` version its manifest pins must already exist on the npm
// registry. A dependent that names a version npm cannot resolve ships a
// broken install for every consumer, and a local-tarball smoke test cannot
// catch it — only the registry can.
//
// What this checks: `dependencies`, `devDependencies`, `peerDependencies` and
// `optionalDependencies` of the target manifest are scanned for `@sentropic/*`
// names whose spec is an exact version (`X.Y.Z` or `X.Y.Z-prerelease` — no
// ranges, no tags). Each is probed with `npm view <name>@<version> version
// --silent`, which exits non-zero on E404 and prints the resolved version
// otherwise; the printed value must equal the pin exactly. Any missing or
// mismatched pin fails closed with exit 1 and one line per offender, before
// any publish step runs. An empty dependency set is also a failure: the gate
// must never pass vacuously.
//
// The registry probe is witnessed in-process with a stubbed view function
// (scripts/verify-deps-published.test.mjs); CI and the publish workflow use
// the real `npm view`.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const DEFAULT_WORKSPACE = "packages/components-svelte";
const EXACT_VERSION = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const DEP_FIELDS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];

function usage() {
  return [
    "usage: node scripts/verify-deps-published.mjs [--workspace packages/components-svelte] [--runtime]",
    "example: node scripts/verify-deps-published.mjs --workspace packages/components-svelte",
    "--runtime checks all runtime dependencies and peers, including optional peers and version ranges",
  ].join("\n");
}

function parseArgs(argv) {
  const out = { workspace: DEFAULT_WORKSPACE };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--workspace") out.workspace = argv[++i];
    else if (arg === "--runtime") out.runtime = true;
    else if (arg === "--help" || arg === "-h") out.help = true;
    else throw new Error(`unknown argument: ${arg}\n${usage()}`);
  }
  if (out.help) return out;
  if (!out.workspace || out.workspace.startsWith("/") || out.workspace.includes("..")) {
    throw new Error(`invalid --workspace: ${out.workspace}\n${usage()}`);
  }
  return out;
}

// Collect the exact `@sentropic/*` pins of a manifest, sorted by name.
export function collectSentropicDeps(manifest) {
  const deps = [];
  for (const field of DEP_FIELDS) {
    const block = manifest[field];
    if (!block) continue;
    for (const [name, spec] of Object.entries(block)) {
      if (name.startsWith("@sentropic/") && typeof spec === "string" && EXACT_VERSION.test(spec)) {
        deps.push({ name, version: spec });
      }
    }
  }
  return deps.sort((a, b) => a.name.localeCompare(b.name));
}

// Publication guards check external packages and optional peers too. Exact pins
// must resolve byte-for-byte; npm resolves ranges to published exact versions.
export function collectRuntimeDeps(manifest) {
  return [...new Map(['dependencies', 'peerDependencies', 'optionalDependencies'].flatMap(field =>
    Object.entries(manifest[field] ?? {}).map(([name, version]) => [`${name}@${version}`, { name, version }]),
  )).values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function verifyRuntimeDeps(deps, viewFn) {
  return deps.flatMap(dep => {
    const seen = viewFn(dep.name, dep.version);
    const present = EXACT_VERSION.test(dep.version) ? seen === dep.version : typeof seen === 'string' && EXACT_VERSION.test(seen);
    return present ? [] : [{ ...dep, seen: seen ?? null }];
  });
}

// Pure check: viewFn(name, version) returns the version string npm resolves
// for `name@version`, or null when the registry has no such version. Returns
// the list of pins that are missing or resolve to a different version.
export function verifyDeps(deps, viewFn) {
  const missing = [];
  for (const dep of deps) {
    const seen = viewFn(dep.name, dep.version);
    if (seen !== dep.version) missing.push({ ...dep, seen: seen ?? null });
  }
  return missing;
}

function npmView(name, version) {
  const result = spawnSync("npm", ["view", `${name}@${version}`, "version", "--json", "--silent"], { encoding: "utf8", timeout: 30000 });
  if (result.status !== 0) return null;
  try {
    const seen = JSON.parse(result.stdout);
    return Array.isArray(seen) ? seen.at(-1) ?? null : typeof seen === 'string' ? seen : null;
  } catch { return null; }
}

export function main(argv = process.argv.slice(2), viewFn = npmView) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (error) {
    console.error(error.message);
    return 2;
  }
  if (args.help) {
    console.log(usage());
    return 0;
  }
  const manifestUrl = new URL(`../${args.workspace}/package.json`, import.meta.url);
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestUrl, "utf8"));
  } catch (error) {
    console.error(`cannot read manifest ${manifestUrl.pathname}: ${error.message}`);
    return 1;
  }
  const deps = args.runtime ? collectRuntimeDeps(manifest) : collectSentropicDeps(manifest);
  if (deps.length === 0 && !args.runtime) {
    console.error(`fail closed: ${args.workspace}/package.json pins no exact @sentropic/* version — the gate must not pass vacuously`);
    return 1;
  }
  const missing = (args.runtime ? verifyRuntimeDeps : verifyDeps)(deps, viewFn);
  if (missing.length > 0) {
    for (const m of missing) {
      console.error(`missing on registry: ${m.name}@${m.version} (npm view returned ${m.seen ?? "nothing"})`);
    }
    const kind = args.runtime ? 'runtime dependency/peer spec(s)' : 'pinned @sentropic dep(s)';
    console.error(`fail closed: refusing to publish ${manifest.name ?? args.workspace} while ${missing.length} ${kind} are not on npm`);
    return 1;
  }
  for (const dep of deps) console.log(`ok: ${dep.name}@${dep.version} is on npm`);
  return 0;
}

const invokedDirectly =
  process.argv[1] != null && import.meta.url.endsWith(process.argv[1].slice(process.argv[1].lastIndexOf("/")));
if (invokedDirectly) {
  process.exitCode = main();
}
