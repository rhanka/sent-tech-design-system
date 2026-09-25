/**
 * Build `src/worker.ts` to a standalone ESM bundle a worker thread can import
 * (test/bench only).
 *
 * Why a build at test time rather than reading `dist/`: `npm test` does not run
 * `npm run build`, so a test that read `dist/worker.js` would pass or fail on
 * whether someone happened to build first — the kind of check that quietly
 * becomes a skip. This bundles with the package's own declared `tsup`
 * devDependency, so the test needs nothing that `npm ci` does not install, and a
 * worker entry that cannot be bundled standalone fails here by name.
 *
 * `node --experimental-strip-types` is not an option: this Node build reports
 * `ERR_NO_TYPESCRIPT` (measured on 22.22.1), and a resolve hook alone cannot
 * help because the sources use `./x.js` specifiers for `./x.ts` files.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Absolute, because tsup resolves entries against process.cwd() and the test
// runner's cwd is not guaranteed to be this package.
const packageDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

let built = null;

/** @returns {Promise<URL>} file: URL of the bundled worker entry. */
export async function workerBundleUrl() {
  if (built !== null) return built;
  const { build } = await import("tsup");
  const outDir = mkdtempSync(join(tmpdir(), "sent-graph-worker-"));
  await build({
    entry: { worker: join(packageDir, "src", "worker.ts") },
    outDir,
    format: ["esm"],
    dts: false,
    sourcemap: false,
    clean: false,
    target: "es2022",
    splitting: false,
    silent: true,
    tsconfig: join(packageDir, "tsconfig.json"),
    outExtension: () => ({ js: ".mjs" }),
  });
  built = pathToFileURL(join(outDir, "worker.mjs"));
  return built;
}
