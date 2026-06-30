// Ensure every buildable library package under packages/ has an up-to-date dist/.
//
// Replaces the old hardcoded predev/prebuild chain in apps/docs (which rebuilt
// the 3 component packages + ~126 themes unconditionally, every dev start and
// every CI build — and had to be hand-edited each time a theme was added).
//
// Two properties matter:
//  - Auto-discovery: the list comes from the workspace graph, so adding a theme
//    needs no script edit (kills the documented two-chain footgun).
//  - Incremental: a package is rebuilt only when its sources are newer than its
//    dist/. In CI, `npm run build` already builds every package, so by the time
//    the docs build runs this prebuild every dist/ is fresh -> instant no-op.
//    Cold local dev (no prior build) still builds everything once.
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { getOrderedWorkspaces } from "./run-workspaces.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packagesDir = join(root, "packages") + sep;

function newestMtime(dir, skip) {
  let newest = 0;
  const walk = (d) => {
    let entries;
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (skip.has(e.name)) continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else {
        const m = statSync(p).mtimeMs;
        if (m > newest) newest = m;
      }
    }
  };
  walk(dir);
  return newest;
}

// Newest mtime across the package, excluding build output and deps.
// `css` is the themes package's generated stylesheet output (build:css writes
// there, after tsc populates dist/), so it must be treated as output too —
// otherwise that package looks perpetually stale and rebuilds every run.
function sourceMtime(pkgDir) {
  return newestMtime(pkgDir, new Set(["node_modules", "dist", "css", ".turbo", ".svelte-kit"]));
}

// Newest mtime within dist/; 0 if dist is missing or empty.
function distMtime(pkgDir) {
  const distDir = join(pkgDir, "dist");
  if (!existsSync(distDir)) return 0;
  return newestMtime(distDir, new Set());
}

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: false });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

// 1) Preserve the overlay step the old prebuild ran first.
run(process.execPath, [join(root, "scripts", "ensure-compare-local-overlays.mjs")], root);

// 2) Build only stale/missing library packages, in dependency order.
const targets = getOrderedWorkspaces(root).filter(
  (w) =>
    (w.dir + sep).startsWith(packagesDir) &&
    w.manifest.scripts?.build &&
    existsSync(join(w.dir, "src")),
);

let built = 0;
let skipped = 0;
for (const w of targets) {
  const distM = distMtime(w.dir);
  if (distM !== 0 && distM >= sourceMtime(w.dir)) {
    skipped += 1;
    continue;
  }
  console.log(`[ensure-theme-dists] build ${w.name}`);
  run("npm", ["run", "build"], w.dir);
  built += 1;
}

console.log(`[ensure-theme-dists] ${built} built, ${skipped} up-to-date (of ${targets.length} packages)`);
