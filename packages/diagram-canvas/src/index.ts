/**
 * `@sentropic/diagram-canvas` - the headless scene and its hit test.
 *
 * The package is PUBLISHABLE since DC-2a (BF-5): the Svelte scene host
 * `DiagramSceneFigure` in `@sentropic/design-system-svelte` depends on it, and
 * a published package naming a private one installs broken for every
 * consumer. Its only dependency, `@sentropic/diagram-core`, is public. The
 * publish workflow and the tag line in `docs/release.md` are not written yet.
 * See README, "Publication".
 *
 * No DOM, no renderer, no framework, no design system package. Its ONLY bare
 * import specifier is `@sentropic/diagram-core`, which is the edge
 * `docs/graph-dataviz-architecture-dag.json` declares; a test asserts there is no
 * second one.
 *
 * Read `README.md` for the contracts this lot fixes and for what it leaves out.
 */

export * from "./transform.js";
export * from "./camera.js";
export * from "./geometry.js";
export * from "./visibility.js";
export * from "./scene.js";
export * from "./hit.js";
export * from "./layout/index.js";

export * from "./presentation/erd.js";
