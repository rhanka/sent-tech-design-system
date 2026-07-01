// Ensure every buildable library package under packages/ has an up-to-date dist/.
//
// Replaces the old hardcoded predev/prebuild chain in apps/docs (which rebuilt
// the 3 component packages + ~126 themes unconditionally, every dev start and
// every CI build — and had to be hand-edited each time a theme was added).
//
// Two properties matter:
//  - Auto-discovery: the list comes from the workspace graph, so adding a theme
//    needs no script edit.
//  - Incremental, by CONTENT HASH: a package is rebuilt only when the hash of
//    its sources changed since its dist was built (the hash is stored in
//    dist/.srchash). Content-based (not mtime) so it stays correct after a CI
//    `actions/cache` restore — restored files get fresh mtimes that would fool
//    an mtime check, but their content hash is unchanged, so cached dists are
//    correctly skipped and only genuinely-changed packages rebuild.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { getOrderedWorkspaces } from "./run-workspaces.mjs";

const dependencyFields = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packagesDir = join(root, "packages") + sep;

// Build outputs / deps to exclude from the source hash. `css` is the themes
// package's generated stylesheet output (build:css writes there).
const SKIP = new Set(["node_modules", "dist", "css", ".turbo", ".svelte-kit"]);

// Deterministic hash of every source file (path + content) in the package,
// excluding build outputs and deps.
function sourceHash(pkgDir) {
  const files = [];
  const walk = (d) => {
    let entries;
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (SKIP.has(e.name)) continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else files.push(p);
    }
  };
  walk(pkgDir);
  files.sort();
  const h = createHash("sha256");
  for (const f of files) {
    h.update(f.slice(pkgDir.length));
    h.update("\0");
    h.update(readFileSync(f));
    h.update("\0");
  }
  return h.digest("hex");
}

function storedHash(pkgDir) {
  const f = join(pkgDir, "dist", ".srchash");
  try {
    return readFileSync(f, "utf8").trim();
  } catch {
    return null;
  }
}

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: false });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

// 1) Preserve the overlay step the old prebuild ran first.
run(process.execPath, [join(root, "scripts", "ensure-compare-local-overlays.mjs")], root);

function localDeps(manifest, localNames) {
  const deps = new Set();
  for (const field of dependencyFields) {
    for (const name of Object.keys(manifest[field] ?? {})) {
      if (localNames.has(name)) deps.add(name);
    }
  }
  return deps;
}

function dependencyClosure(seedNames, workspaces) {
  if (!seedNames) return null;
  const byName = new Map(workspaces.map((workspace) => [workspace.name, workspace]));
  const localNames = new Set(byName.keys());
  const result = new Set();

  function visit(name) {
    if (result.has(name)) return;
    const workspace = byName.get(name);
    if (!workspace) return;
    for (const dep of localDeps(workspace.manifest, localNames)) visit(dep);
    result.add(name);
  }

  for (const name of seedNames) visit(name);
  return result;
}

const workspacesArg = process.argv.find((value) => value.startsWith("--workspaces="));
const selectedNames = workspacesArg
  ? new Set(workspacesArg.slice("--workspaces=".length).split(",").map((value) => value.trim()).filter(Boolean))
  : null;

// 2) Build only packages whose source hash changed (or that have no dist), in
//    dependency order. With --workspaces, include local dependencies of the
//    selected workspaces so each shard can build/test independently.
const orderedWorkspaces = getOrderedWorkspaces(root);
const buildNames = dependencyClosure(selectedNames, orderedWorkspaces);
const targets = orderedWorkspaces.filter(
  (w) =>
    (!buildNames || buildNames.has(w.name)) &&
    (w.dir + sep).startsWith(packagesDir) &&
    w.manifest.scripts?.build &&
    existsSync(join(w.dir, "src")),
);

let built = 0;
let skipped = 0;
for (const w of targets) {
  const hash = sourceHash(w.dir);
  const distDir = join(w.dir, "dist");
  if (existsSync(distDir) && storedHash(w.dir) === hash) {
    skipped += 1;
    continue;
  }
  console.log(`[ensure-theme-dists] build ${w.name}`);
  run("npm", ["run", "build"], w.dir);
  writeFileSync(join(w.dir, "dist", ".srchash"), hash + "\n");
  built += 1;
}

console.log(`[ensure-theme-dists] ${built} built, ${skipped} up-to-date (of ${targets.length} packages)`);
