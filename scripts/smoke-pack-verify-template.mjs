// Template for the deep-verification script that smoke-pack.mjs writes into
// the throwaway install project and runs there with `node`.
//
// This file is never executed from the repo directly. smoke-pack.mjs reads
// it as text and replaces the two placeholder tokens below with real JSON
// before writing it into the throwaway project, so it is kept here as a real
// syntactically-valid module (readable, lintable) instead of being built as
// an escaped string literal inside smoke-pack.mjs.
//
// SMOKE_TARGETS placeholder -> JSON array of package names to deep-verify in
//                                 this run (a subset of the 7 packages
//                                 below, depending on which the CI shard, or
//                                 a local --workspaces= selection, packed).
// SMOKE_MIN_EXPORT_COUNTS placeholder -> JSON object mapping the react/vue/
//                                 angular package names to the minimum
//                                 number of named exports their locally
//                                 built dist/ had at pack time. Ties the
//                                 runtime import check to the same ground
//                                 truth as the tarball file-list check, so
//                                 neither can silently drift stale as
//                                 components are added.
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const targets = new Set(__SMOKE_TARGETS_JSON__);
const minExportCounts = __SMOKE_MIN_EXPORT_COUNTS_JSON__;
const failures = [];

function fail(label, message) {
  failures.push(label + ": " + message);
}

async function verifyTokens() {
  const mod = await import("@sentropic/design-system-tokens");
  if (typeof mod.flattenTokens !== "function") {
    fail("@sentropic/design-system-tokens", "missing flattenTokens export (or not a function)");
    return;
  }
  console.log("OK @sentropic/design-system-tokens: flattenTokens import verified");
}

async function verifyThemes() {
  const mod = await import("@sentropic/design-system-themes");
  if (typeof mod.compileTheme !== "function") {
    fail("@sentropic/design-system-themes", "missing compileTheme export (or not a function)");
    return;
  }
  console.log("OK @sentropic/design-system-themes: compileTheme import verified");
}

async function verifySkills() {
  const mod = await import("@sentropic/design-system-skills");
  if (typeof mod.audit !== "function") {
    fail("@sentropic/design-system-skills", "missing audit export (or not a function)");
    return;
  }
  console.log("OK @sentropic/design-system-skills: audit import verified");
}

// Compiles every *.svelte file actually shipped in the installed tarball
// (real TS-in-Svelte source, exactly as a consumer receives it) through the
// same preprocessing a SvelteKit/Vite consumer runs (vitePreprocess), then
// through the real svelte/compiler. This is the check that would have
// caught the unparseable-.svelte-file report: resolving a path or grepping
// index.js text never touches a file's actual syntax; this does.
//
// Deliberately not a full bundler build: compiling directly is faster,
// deterministic, and covers every shipped component instead of only the
// handful a demo app happens to import.
async function verifySvelte() {
  const { preprocess, compile } = await import("svelte/compiler");
  const { vitePreprocess } = await import("@sveltejs/vite-plugin-svelte");

  const entryUrl = await import.meta.resolve("@sentropic/design-system-svelte");
  const entryPath = fileURLToPath(entryUrl);
  const distDir = entryPath.replace(/index\.js$/, "");

  const svelteFiles = readdirSync(distDir).filter((file) => file.endsWith(".svelte"));
  if (svelteFiles.length === 0) {
    fail("@sentropic/design-system-svelte", "no .svelte files found under the installed dist/ - nothing was compiled");
    return;
  }

  const preprocessor = vitePreprocess();
  const compileFailures = [];
  for (const file of svelteFiles) {
    const source = readFileSync(distDir + file, "utf8");
    try {
      const preprocessed = await preprocess(source, preprocessor, { filename: file });
      compile(preprocessed.code, { filename: file, generate: "client" });
    } catch (error) {
      compileFailures.push(file + ": " + String(error.message).split("\n")[0]);
    }
  }

  if (compileFailures.length > 0) {
    fail(
      "@sentropic/design-system-svelte",
      compileFailures.length +
        "/" +
        svelteFiles.length +
        " .svelte file(s) failed to compile:\n    - " +
        compileFailures.join("\n    - "),
    );
    return;
  }

  console.log("OK @sentropic/design-system-svelte: " + svelteFiles.length + " .svelte files preprocessed + compiled");
}

// Actually `import()`s the compiled package (its peer runtime - react,
// vue, or @angular/core - installed fresh alongside it in the throwaway
// project) and inspects every named export the real module graph produced,
// instead of grepping index.js text for a hardcoded list of names. Two
// distinct defect classes are caught this way: (1) a compiled .js file that
// throws on import (syntax fine, runtime broken - e.g. a missing peer
// dependency), since Node's ESM linker fails the whole import loudly if any
// re-exported binding doesn't actually exist upstream; and (2) an export
// that resolves but is undefined, null, or an implausible type.
function assertModuleExports(label, mod, minCount) {
  const keys = Object.keys(mod);
  if (keys.length < minCount) {
    fail(label, "expected at least " + minCount + " named exports, got " + keys.length);
    return;
  }
  const broken = [];
  for (const key of keys) {
    const value = mod[key];
    if (value === undefined || value === null) {
      broken.push(key + " is " + value);
      continue;
    }
    // PascalCase (component) names start uppercase AND contain a lowercase
    // letter, which excludes SCREAMING_SNAKE_CASE constants (e.g.
    // ICON_NAMES, PANEL_STACK_MAX_SECTIONS) that legitimately export numbers
    // or arrays alongside the components in the same index.
    const looksLikeComponent = /^[A-Z]/.test(key) && /[a-z]/.test(key);
    if (looksLikeComponent && typeof value !== "function" && typeof value !== "object") {
      broken.push(key + ' has unexpected type "' + typeof value + '" (expected function or object)');
    }
  }
  if (broken.length > 0) {
    fail(label, broken.length + " export(s) broken:\n    - " + broken.join("\n    - "));
    return;
  }
  console.log("OK " + label + ": " + keys.length + " named exports imported and type-checked");
}

async function verifyReact() {
  const mod = await import("@sentropic/design-system-react");
  assertModuleExports("@sentropic/design-system-react", mod, minExportCounts["@sentropic/design-system-react"] ?? 0);
}

async function verifyVue() {
  const mod = await import("@sentropic/design-system-vue");
  assertModuleExports("@sentropic/design-system-vue", mod, minExportCounts["@sentropic/design-system-vue"] ?? 0);
}

// Angular ships "partial" (linked) compilation output (compilationMode:
// "partial" in tsconfig.lib.json): a real consumer's build (the Angular CLI
// linker, via webpack/esbuild) fully AOT-compiles it and never touches
// @angular/compiler at runtime. There is no linker in this bare-Node
// harness, so @angular/compiler is preloaded to force Node down the JIT
// fallback path instead. That proves the module graph and export shapes are
// real and resolvable; it does not exercise the actual Angular linker step
// a bundler would run (see the header comment in smoke-pack.mjs).
async function verifyAngular() {
  await import("@angular/compiler");
  const mod = await import("@sentropic/design-system-angular");
  assertModuleExports("@sentropic/design-system-angular", mod, minExportCounts["@sentropic/design-system-angular"] ?? 0);
}

const verifiers = {
  "@sentropic/design-system-tokens": verifyTokens,
  "@sentropic/design-system-themes": verifyThemes,
  "@sentropic/design-system-skills": verifySkills,
  "@sentropic/design-system-svelte": verifySvelte,
  "@sentropic/design-system-react": verifyReact,
  "@sentropic/design-system-vue": verifyVue,
  "@sentropic/design-system-angular": verifyAngular,
};

for (const name of targets) {
  const verifier = verifiers[name];
  if (!verifier) continue;
  try {
    await verifier();
  } catch (error) {
    fail(name, "import threw: " + (error && error.stack ? error.stack : String(error)));
  }
}

if (failures.length > 0) {
  console.error("FAILED package smoke checks:");
  for (const failure of failures) {
    console.error("  - " + failure);
  }
  process.exit(1);
}

console.log("Package deep-verification passed (" + targets.size + " package(s))");
