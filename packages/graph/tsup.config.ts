import { defineConfig } from "tsup";

// TWO builds, because the two halves cannot share an output format.
//
// The root entry and the DOM-free computation subpath ship dual ESM + CJS, as
// they have since M1. The GD-M2-WORKERS subpaths cannot: `layout-client.ts`
// resolves its worker with `new URL("./worker.js", import.meta.url)`, the one
// form every bundler rewrites, and `import.meta` does not exist in CommonJS.
// MEASURED rather than assumed: esbuild emits the warning `"import.meta" is not
// available with the "cjs" output format and will be empty`, writes
// `var import_meta = {}`, and the built `require()`-able module then fails at
// `new URL("./worker.js", undefined)` with `TypeError [ERR_INVALID_URL]`. So the
// CJS build would not be silently wrong, it would be loudly broken at the one
// call that matters — and shipping a `require` condition that throws is worse
// than shipping none. Publishing ESM-only makes the limit explicit at RESOLUTION
// time: a `require()` consumer never reaches this module and uses the
// computation subpath synchronously, which needs no URL. Both entries land at
// the dist root so `./worker.js` resolves next to `layout-client.js` inside the
// tarball.
export default defineConfig([
  {
    entry: { index: "src/index.ts", "processing/index": "src/processing/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "es2022",
    splitting: false,
    outDir: "dist",
    tsconfig: "tsconfig.json",
  },
  {
    entry: { worker: "src/worker.ts", "layout-client": "src/layout-client.ts" },
    format: ["esm"],
    dts: true,
    sourcemap: true,
    // NEVER clean here: this config runs after the one above and would wipe it.
    clean: false,
    target: "es2022",
    splitting: false,
    outDir: "dist",
    tsconfig: "tsconfig.json",
  },
]);
