// Sent Tech published-package smoke test.
//
// WHAT THIS GENUINELY VERIFIES
// - Tarball shape: every package's `npm pack` output contains the files we
//   expect (dist entry points, every top-level component/module file we
//   currently ship, CSS where applicable). For react/vue/angular/svelte this
//   list is generated from the local, freshly-built dist/ at pack time (not
//   hand-maintained), so it cannot silently go stale as components are
//   added - see "found weaker than it looked" in the change report for why
//   that mattered here.
// - @sentropic/design-system-tokens / -themes / -skills: the packed tarball
//   is installed fresh in a throwaway project (no monorepo, no workspace
//   symlinks, no npm/yarn workspace resolution) and its real entry point is
//   `await import()`-ed; a documented export is asserted to be a function.
// - @sentropic/design-system-svelte: every single *.svelte file shipped in
//   the installed tarball's dist/ is run through the exact preprocessing a
//   SvelteKit/Vite consumer applies (`vitePreprocess()` from
//   `@sveltejs/vite-plugin-svelte`) and then through the real
//   `svelte/compiler` `compile()`. A file a bundler cannot parse - the
//   defect class that prompted this rewrite - fails here, by filename, with
//   the compiler's own error. This is deliberately a direct compile, not a
//   full Vite/bundler build: faster, deterministic, and it covers every
//   shipped component instead of only the handful a demo app would import.
// - @sentropic/design-system-react / -vue / -angular: the packed tarball's
//   main entry is `await import()`-ed for real, with peer runtimes
//   (react/react-dom, vue, @angular/core) installed fresh in the throwaway
//   project so resolution is genuine, not simulated. Every named export the
//   real module graph produced is asserted to be defined and, for
//   PascalCase (component) exports, of a plausible runtime shape.
//
// WHAT THIS DOES NOT COVER (say so, rather than let a check pretend)
// - No component is ever mounted/rendered in any framework. Svelte files are
//   compiled, not run; React/Vue/Angular exports are imported, not rendered.
//   A component that compiles/imports cleanly but throws once actually
//   mounted (e.g. an effect that dereferences a missing prop) is not caught
//   here - that is `apps/docs`' and each package's own component-test job.
// - Angular ships "partial" (linked) compilation output; a real consumer's
//   build runs the Angular CLI linker to fully AOT-compile it. There is no
//   bundler/linker here, so the Angular check preloads @angular/compiler to
//   force Node's JIT fallback path instead. That proves the module graph and
//   export shapes are real and resolvable, but does not exercise the actual
//   linker step a consumer's build performs.
// - No bundler build (Vite/webpack/Rollup) is run against any package.
// - Only the 13 packages listed below are covered by the tarball-shape and
//   deep-import checks. The other 4 publishable packages - theme-dsfr,
//   theme-canada, theme-quebec, codemirror - and apps/* are untested by those.
//   THE ONE EXCEPTION is the licensing gate below: it runs over all 17
//   publishable packages on every invocation, whatever --workspaces selects,
//   precisely because the package nobody selected is the one that ships
//   unlicensed.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { collectViolations as collectLicensingViolations } from "./verify-publishable-licensing.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const tmp = mkdtempSync(join(tmpdir(), "sent-tech-pack-"));
const npmCache = join(tmp, "npm-cache");
mkdirSync(npmCache);

function readJson(relPath) {
  return JSON.parse(readFileSync(join(root, relPath), "utf8"));
}

// Every *.js (or *.svelte) file directly under a built package's local
// dist/, excluding the barrel file itself and any leaked test/spec output.
// Used both as the tarball-required-files list and as the "how many exports
// should this import produce, at minimum" ground truth for the deep import
// check below - one source of truth for both, so they cannot drift apart.
// A package's `files` field may carry negation patterns ("!dist/**/*.test.js")
// that keep build output out of the tarball. Local dist/ is therefore a
// SUPERSET of what ships, and enumerating it blindly makes this script demand
// files npm was told not to publish. Read the exclusions from package.json so
// the manifest stays the single source of truth — hardcoding the patterns here
// too would just be the same drift in a second place.
function packExclusions(pkgRelDir) {
  const manifest = JSON.parse(readFileSync(join(root, pkgRelDir, "package.json"), "utf8"));
  return (manifest.files ?? [])
    .filter((entry) => entry.startsWith("!"))
    .map((entry) => {
      const rx = entry
        .slice(1)
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*\*\//g, "(?:.*/)?")
        .replace(/\*/g, "[^/]*");
      return new RegExp(`^${rx}$`);
    });
}

function distFiles(pkgRelDir, ext) {
  const dir = join(root, pkgRelDir, "dist");
  if (!existsSync(dir)) {
    throw new Error(
      `${pkgRelDir}/dist does not exist - build packages before running smoke-pack.mjs (CI does this in the ` +
        `"Build packages" step; locally run \`npm run build\`).`,
    );
  }
  const excluded = packExclusions(pkgRelDir);
  return readdirSync(dir)
    .filter((file) => file.endsWith(`.${ext}`))
    .filter((file) => file !== `index.${ext}`)
    .filter((file) => !file.includes(".test.") && !file.includes(".spec."))
    .map((file) => `dist/${file}`)
    .filter((path) => !excluded.some((rx) => rx.test(path)))
    .sort();
}

const rootManifest = readJson("package.json");
const reactManifest = readJson("packages/components-react/package.json");
const vueManifest = readJson("packages/components-vue/package.json");
const angularManifest = readJson("packages/components-angular/package.json");
const datavizSvelteManifest = readJson("packages/dataviz-svelte/package.json");
const datavizReactManifest = readJson("packages/dataviz-react/package.json");
const datavizVueManifest = readJson("packages/dataviz-vue/package.json");
const datavizAngularManifest = readJson("packages/dataviz-angular/package.json");

// LAZY, and that is load-bearing. In CI this script runs per shard, and a shard
// builds only its own workspaces — so a package outside the selection has no
// dist/ at all. Enumerating all four eagerly made the script throw
// "packages/components-vue/dist does not exist" on every shard that legitimately
// had nothing to do with Vue, long before the --workspaces= filter below could
// drop it. Memoised so the repeated reads inside one run stay free.
const distFilesMemo = new Map();
function distFilesLazy(pkgRelDir, ext) {
  const key = `${pkgRelDir}:${ext}`;
  if (!distFilesMemo.has(key)) distFilesMemo.set(key, distFiles(pkgRelDir, ext));
  return distFilesMemo.get(key);
}

const reactComponentFiles = () => distFilesLazy("packages/components-react", "js");
const vueComponentFiles = () => distFilesLazy("packages/components-vue", "js");
const angularComponentFiles = () => distFilesLazy("packages/components-angular", "js");
const svelteComponentFiles = () => distFilesLazy("packages/components-svelte", "svelte");

// Recursive variant: the dataviz adapters ship nested modules under
// dist/lib/* (and dataviz-svelte its components as nested .svelte files),
// so a top-level readdir misses most of what the tarball carries. Walks the
// whole dist/ tree, still honouring the package.json `files` negations and
// still excluding the barrel file and leaked test/spec output.
function distFilesRecursive(pkgRelDir, ext) {
  const dir = join(root, pkgRelDir, "dist");
  if (!existsSync(dir)) {
    throw new Error(
      `${pkgRelDir}/dist does not exist - build packages before running smoke-pack.mjs (CI does this in the ` +
        `"Build packages" step; locally run \`npm run build\`).`,
    );
  }
  const excluded = packExclusions(pkgRelDir);
  const found = [];
  const walk = (absolute, relative) => {
    for (const entry of readdirSync(absolute).sort()) {
      const absoluteEntry = join(absolute, entry);
      const relativeEntry = relative ? `${relative}/${entry}` : entry;
      if (statSync(absoluteEntry).isDirectory()) {
        walk(absoluteEntry, relativeEntry);
        continue;
      }
      if (!entry.endsWith(`.${ext}`)) continue;
      if (entry === `index.${ext}`) continue;
      if (entry.includes(".test.") || entry.includes(".spec.")) continue;
      const candidate = `dist/${relativeEntry}`;
      if (excluded.some((rx) => rx.test(candidate))) continue;
      found.push(candidate);
    }
  };
  walk(dir, "");
  return found;
}

function distFilesRecursiveLazy(pkgRelDir, ext) {
  const key = `${pkgRelDir}:recursive:${ext}`;
  if (!distFilesMemo.has(key)) distFilesMemo.set(key, distFilesRecursive(pkgRelDir, ext));
  return distFilesMemo.get(key);
}

const datavizCoreFiles = () => distFilesRecursiveLazy("packages/dataviz-core", "js");
const datavizSvelteComponentFiles = () => distFilesRecursiveLazy("packages/dataviz-svelte", "svelte");
const datavizReactLibFiles = () => distFilesRecursiveLazy("packages/dataviz-react", "js");
const datavizVueLibFiles = () => distFilesRecursiveLazy("packages/dataviz-vue", "js");
const datavizAngularLibFiles = () => distFilesRecursiveLazy("packages/dataviz-angular", "js");

const packages = [
  {
    name: "@sentropic/design-system-tokens",
    requiredFiles: ["dist/index.js", "dist/index.d.ts"],
  },
  {
    name: "@sentropic/design-system-themes",
    requiredFiles: [
      "dist/index.js",
      "dist/index.d.ts",
      "css/sent-tech.css",
      "css/forge.css",
      "css/entropic.css",
    ],
  },
  {
    name: "@sentropic/design-system-svelte",
    get requiredFiles() { return ["dist/index.js", "dist/index.d.ts", ...svelteComponentFiles()]; },
  },
  {
    name: "@sentropic/design-system-react",
    get requiredFiles() { return ["dist/index.js", "dist/index.d.ts", "dist/styles.css", ...reactComponentFiles()]; },
  },
  {
    name: "@sentropic/design-system-skills",
    requiredFiles: ["dist/index.js", "dist/index.d.ts", "dist/cli.js", "dist/cli.d.ts"],
  },
  {
    name: "@sentropic/design-system-vue",
    get requiredFiles() { return ["dist/index.js", "dist/index.d.ts", "dist/styles.css", ...vueComponentFiles()]; },
  },
  {
    name: "@sentropic/design-system-angular",
    get requiredFiles() { return ["dist/index.js", "dist/index.d.ts", "dist/styles.css", ...angularComponentFiles()]; },
  },
  {
    name: "@sentropic/graph",
    requiredFiles: ["dist/index.js", "dist/index.d.ts", "dist/index.cjs", "dist/index.d.cts"],
  },
  {
    name: "@sentropic/dataviz-core",
    get requiredFiles() { return ["dist/index.js", "dist/index.d.ts", ...datavizCoreFiles()]; },
  },
  {
    name: "@sentropic/dataviz-svelte",
    get requiredFiles() { return ["dist/index.js", "dist/index.d.ts", ...datavizSvelteComponentFiles()]; },
  },
  {
    name: "@sentropic/dataviz-react",
    get requiredFiles() { return ["dist/index.js", "dist/index.d.ts", ...datavizReactLibFiles()]; },
  },
  {
    name: "@sentropic/dataviz-vue",
    get requiredFiles() { return ["dist/index.js", "dist/index.d.ts", ...datavizVueLibFiles()]; },
  },
  {
    name: "@sentropic/dataviz-angular",
    get requiredFiles() { return ["dist/index.js", "dist/index.d.ts", ...datavizAngularLibFiles()]; },
  },
];

// For each deep-verifiable package: which OTHER local workspace tarballs
// must be installed alongside it for its runtime imports to resolve (e.g.
// ThemeProvider.js does `import ... from "@sentropic/design-system-themes"`
// at module scope), and which external peer packages the throwaway project
// needs installed so the import is genuine rather than simulated.
//
// closure deps are always packed from the LOCAL workspace, never pulled
// from the npm registry - this is what lets `smoke-pack.mjs --workspaces=`
// deep-verify a single package (as the CI matrix shards routinely do) even
// when its runtime dependencies were not themselves part of this shard's
// selection. Their dist/ is guaranteed already built: scripts/ensure-theme-
// dists.mjs, run before this script in CI, resolves the same --workspaces=
// selection's *local dependency closure*, so themes/tokens dist already
// exists whenever react/vue/angular/themes was selected.
const deepVerify = {
  "@sentropic/design-system-tokens": { closure: [], peers: [] },
  "@sentropic/design-system-themes": {
    closure: ["@sentropic/design-system-tokens"],
    peers: [],
  },
  "@sentropic/design-system-skills": { closure: [], peers: [] },
  "@sentropic/design-system-svelte": {
    // Compiling .svelte source needs only the svelte compiler + preprocessor
    // toolchain - compile() never resolves the component's own imports, so
    // no local closure dependency is needed here.
    closure: [],
    peers: [
      ["svelte", rootManifest.devDependencies.svelte],
      ["vite", rootManifest.devDependencies.vite],
      ["@sveltejs/vite-plugin-svelte", rootManifest.devDependencies["@sveltejs/vite-plugin-svelte"]],
    ],
  },
  "@sentropic/design-system-react": {
    closure: ["@sentropic/design-system-themes", "@sentropic/design-system-tokens"],
    peers: [
      ["react", reactManifest.devDependencies.react],
      ["react-dom", reactManifest.devDependencies["react-dom"]],
    ],
  },
  "@sentropic/design-system-vue": {
    closure: ["@sentropic/design-system-themes", "@sentropic/design-system-tokens"],
    peers: [["vue", vueManifest.devDependencies.vue]],
  },
  "@sentropic/design-system-angular": {
    closure: ["@sentropic/design-system-themes", "@sentropic/design-system-tokens"],
    peers: [
      ["@angular/core", angularManifest.devDependencies["@angular/core"]],
      // @angular/compiler is an OPTIONAL peer of @angular/core and a real
      // Angular CLI build never needs it (the linker fully AOT-compiles our
      // partially-compiled output). Installed here only so a bare `node
      // --import` can JIT-fallback-compile the component defs, since this
      // harness has no bundler/linker. See the header comment above.
      ["@angular/compiler", angularManifest.devDependencies["@angular/compiler"]],
      // FINDING: @sentropic/design-system-angular's compiled output imports
      // @angular/common directly (NgFor/NgIf-style directives, DatePipe,
      // etc. - ~20 files) but declares it in NEITHER peerDependencies NOR
      // devDependencies. In this monorepo it only "works" because
      // apps/docs depends on @angular/common and hoists it to the workspace
      // root node_modules. A real minimal consumer almost always has
      // @angular/common anyway (every `ng new` app ships it), so this is
      // unlikely to be user-visible, but the declaration gap is real.
      // Pinned to @angular/core's own version track since Angular family
      // packages are always released in lockstep.
      ["@angular/common", angularManifest.devDependencies["@angular/core"]],
      // rxjs is @angular/core's own (non-optional) peer dependency, not
      // ours - required for @angular/core itself to import, independent of
      // anything design-system-angular does.
      ["rxjs", "^7.8.0"],
    ],
  },
  // GD-M1: graph and dataviz packages. graph and dataviz-core are
  // dependency-free libraries: no local closure, no peers; their verifiers
  // import the real entry point and assert a documented export is a
  // function, exactly like tokens/themes/skills. The adapters resolve their
  // local DS dependencies from workspace tarballs (never the registry), so
  // a single-package shard still deep-verifies against real code.
  "@sentropic/graph": { closure: [], peers: [] },
  "@sentropic/dataviz-core": { closure: [], peers: [] },
  "@sentropic/dataviz-svelte": {
    // Compiling .svelte source never resolves the component's own imports
    // (same load-bearing remark as design-system-svelte above), but the
    // closure is still the real runtime closure so the installed throwaway
    // project mirrors a consumer.
    closure: [
      "@sentropic/dataviz-core",
      "@sentropic/design-system-svelte",
      "@sentropic/design-system-themes",
    ],
    peers: [
      ["svelte", datavizSvelteManifest.devDependencies.svelte],
      ["vite", datavizSvelteManifest.devDependencies.vite],
      ["@sveltejs/vite-plugin-svelte", datavizSvelteManifest.devDependencies["@sveltejs/vite-plugin-svelte"]],
    ],
  },
  "@sentropic/dataviz-react": {
    closure: [
      "@sentropic/dataviz-core",
      "@sentropic/design-system-react",
      "@sentropic/design-system-themes",
    ],
    peers: [
      ["react", datavizReactManifest.devDependencies.react],
      ["react-dom", datavizReactManifest.devDependencies["react-dom"]],
    ],
  },
  "@sentropic/dataviz-vue": {
    closure: [
      "@sentropic/dataviz-core",
      "@sentropic/design-system-vue",
      "@sentropic/design-system-themes",
    ],
    peers: [["vue", datavizVueManifest.devDependencies.vue]],
  },
  "@sentropic/dataviz-angular": {
    closure: [
      "@sentropic/dataviz-core",
      "@sentropic/design-system-angular",
      "@sentropic/design-system-themes",
    ],
    peers: [
      ["@angular/core", datavizAngularManifest.devDependencies["@angular/core"]],
      // Same JIT-fallback rationale as design-system-angular above: the
      // dataviz-angular output is partial compilation, the harness has no
      // linker.
      ["@angular/compiler", datavizAngularManifest.devDependencies["@angular/compiler"]],
      ["@angular/common", datavizAngularManifest.devDependencies["@angular/core"]],
      ["rxjs", "^7.8.0"],
    ],
  },
};

const minExportCounts = {
  "@sentropic/design-system-react": () => reactComponentFiles().length,
  "@sentropic/design-system-vue": () => vueComponentFiles().length,
  "@sentropic/design-system-angular": () => angularComponentFiles().length,
  "@sentropic/dataviz-react": () => datavizReactLibFiles().length,
  "@sentropic/dataviz-vue": () => datavizVueLibFiles().length,
  "@sentropic/dataviz-angular": () => datavizAngularLibFiles().length,
};

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    shell: false,
    env: {
      ...process.env,
      npm_config_cache: npmCache,
    },
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.status !== 0) {
    if (options.capture) {
      process.stderr.write(result.stdout);
      process.stderr.write(result.stderr);
    }
    process.exit(result.status ?? 1);
  }

  return result;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function packWorkspace(pkg) {
  const before = new Set(readdirSync(tmp).filter((entry) => entry.endsWith(".tgz")));
  run("npm", ["pack", "--workspace", pkg.name, "--pack-destination", tmp], { capture: true });

  const created = readdirSync(tmp).filter(
    (entry) => entry.endsWith(".tgz") && !before.has(entry),
  );
  assert(created.length === 1, `Expected one tarball for ${pkg.name}, found ${created.length}`);

  const tarball = join(tmp, created[0]);

  assert(existsSync(tarball), `Tarball missing for ${pkg.name}: ${tarball}`);
  return tarball;
}

const tarballCache = new Map();
function ensureTarball(pkg) {
  if (tarballCache.has(pkg.name)) return tarballCache.get(pkg.name);
  const tarball = packWorkspace(pkg);
  tarballCache.set(pkg.name, tarball);
  return tarball;
}

function listTarball(tarball) {
  const result = run("tar", ["-tf", tarball], { capture: true });
  return result.stdout.split(/\r?\n/).filter(Boolean);
}

function verifyTarball(pkg, tarball) {
  const entries = new Set(listTarball(tarball));
  const missing = pkg.requiredFiles.filter((file) => !entries.has(`package/${file}`));

  assert(
    missing.length === 0,
    `${pkg.name} tarball is missing expected files: ${missing.join(", ")}`,
  );
}

function installProject(tarballs, peerSpecs) {
  const installDir = join(tmp, "install");
  mkdirSync(installDir);
  writeFileSync(
    join(installDir, "package.json"),
    JSON.stringify({ name: "sent-tech-pack-smoke", private: true, type: "module" }, null, 2),
  );

  const peerArgs = [...peerSpecs.entries()].map(([name, version]) => `${name}@${version}`);

  run(
    "npm",
    [
      "install",
      "--no-audit",
      "--no-fund",
      "--ignore-scripts",
      "--legacy-peer-deps",
      ...tarballs,
      ...peerArgs,
    ],
    { cwd: installDir },
  );

  return installDir;
}

function writeVerifyScript(installDir, targetNames) {
  const templatePath = join(root, "scripts", "smoke-pack-verify-template.mjs");
  const template = readFileSync(templatePath, "utf8");
  // Resolve the lazy counts here, and ONLY for the packages this run actually
  // targets. Serialising the whole map would both drop the thunks (JSON.stringify
  // discards functions) and force a dist/ read for packages outside this shard's
  // selection — the exact failure the laziness above exists to avoid.
  const resolvedCounts = Object.fromEntries(
    targetNames
      .filter((name) => typeof minExportCounts[name] === "function")
      .map((name) => [name, minExportCounts[name]()]),
  );
  const content = template
    .replaceAll("__SMOKE_TARGETS_JSON__", JSON.stringify(targetNames))
    .replaceAll("__SMOKE_MIN_EXPORT_COUNTS_JSON__", JSON.stringify(resolvedCounts));

  const smokePath = join(installDir, "verify.mjs");
  writeFileSync(smokePath, content);
  return smokePath;
}

const workspacesArg = process.argv.find((value) => value.startsWith("--workspaces="));
const selectedNames = workspacesArg
  ? new Set(workspacesArg.slice("--workspaces=".length).split(",").map((value) => value.trim()).filter(Boolean))
  : null;
const selectedPackages = selectedNames
  ? packages.filter((pkg) => selectedNames.has(pkg.name))
  : packages;

// Licensing gate, run over ALL publishable packages regardless of the shard.
// Deliberately not narrowed by --workspaces: the defect it guards against is a
// package nobody thought to select. Every publish workflow in .github runs
// pack:smoke, so this is the one point every release path goes through.
// Measured at ~2s, against smoke-pack's own runtime in minutes.
function runLicensingGate() {
  const { violations, packages: publishable } = collectLicensingViolations(root);
  if (violations.length > 0) {
    console.error(`Licensing gate FAILED: ${violations.length} violation(s).`);
    for (const violation of violations) console.error(`  - ${violation}`);
    console.error("Run `npm run licensing:check` for the same report on its own.");
    process.exit(1);
  }
  console.log(`Licensing gate OK (${publishable.length} publishable packages, all shards).`);
}

try {
  console.log("Sent Tech package smoke test");
  console.log(`Temp dir: ${tmp}`);

  runLicensingGate();

  if (selectedPackages.length === 0) {
    console.log("No smoke-pack package selected; skipping.");
    process.exit(0);
  }

  const tarballs = [];
  const selectedNamesSet = new Set(selectedPackages.map((pkg) => pkg.name));
  for (const pkg of selectedPackages) {
    const tarball = ensureTarball(pkg);
    verifyTarball(pkg, tarball);
    tarballs.push(tarball);
    console.log(`OK packed ${pkg.name}`);
  }

  const deepTargets = selectedPackages.filter((pkg) => deepVerify[pkg.name]);

  if (deepTargets.length === 0) {
    console.log("No deep-verifiable package in this selection; tarball contents verified only.");
  } else {
    // Pull in whatever local closure tarballs the deep targets need to
    // resolve at runtime, even if this shard's --workspaces= selection did
    // not itself include them. Packed, but not re-verified for required
    // files here - that check belongs to the shard where the dependency
    // itself is under test.
    const installTarballs = [...tarballs];
    for (const pkg of deepTargets) {
      for (const depName of deepVerify[pkg.name].closure) {
        if (selectedNamesSet.has(depName)) continue;
        if (tarballCache.has(depName)) continue;
        const depPkg = packages.find((candidate) => candidate.name === depName);
        const tarball = ensureTarball(depPkg);
        installTarballs.push(tarball);
        selectedNamesSet.add(depName);
        console.log(`OK packed ${depName} (closure dependency for deep verification, not itself under test here)`);
      }
    }

    const peerSpecs = new Map();
    for (const pkg of deepTargets) {
      for (const [peerName, peerVersion] of deepVerify[pkg.name].peers) {
        peerSpecs.set(peerName, peerVersion);
      }
    }

    const installDir = installProject(installTarballs, peerSpecs);
    const verifyPath = writeVerifyScript(
      installDir,
      deepTargets.map((pkg) => pkg.name),
    );
    run("node", [verifyPath], { cwd: installDir });
  }

  console.log("OK package smoke test passed");
} finally {
  if (process.env.KEEP_SENT_TECH_PACK_SMOKE !== "1") {
    rmSync(tmp, { recursive: true, force: true });
  }
}
