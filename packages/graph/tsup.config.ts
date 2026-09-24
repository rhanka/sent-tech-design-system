import { defineConfig } from "tsup";

// TWO builds, because the two halves cannot share an output format.
//
// The root entry and the DOM-free computation subpath ship dual ESM + CJS, as
// they have since M1. The GD-M2-WORKERS subpaths cannot: `layout-client.ts`
// resolves its worker with `new URL("./worker.js", import.meta.url)`, the one
// form every bundler rewrites, and `import.meta` does not exist in CommonJS —
// esbuild would emit it as an empty object and the resolution would silently
// produce a wrong URL at runtime. Publishing them ESM-only makes the limit
// explicit at resolution time instead: a `require()` consumer gets no
// `layout-client` at all and uses the computation subpath synchronously, which
// needs no URL. Both entries are emitted UNBUNDLED-SIBLING style at the dist
// root so `./worker.js` resolves next to `layout-client.js` inside the tarball.
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
