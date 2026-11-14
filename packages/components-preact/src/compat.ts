/**
 * Compat shim (decision K3): this is the ONLY module of the package allowed to
 * import `preact/compat`. `scripts/emit-react.mjs` fails the build when any
 * other source file names that specifier.
 *
 * `preact/compat` is one 10 kB module with top-level side effects (it patches
 * `options`), so a bundler keeps all of it as soon as one export is used. The
 * shim therefore exposes only what cannot be written on Preact core without
 * copying compat internals: portals. Everything else that differs between the
 * two runtimes lives in `runtime.ts`, which stays on Preact core.
 *
 * React twin: `react/compat.ts` (swapped in by the React emission).
 */
export { createPortal } from "preact/compat";
