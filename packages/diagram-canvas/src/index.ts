/**
 * `@sentropic/diagram-canvas` - the headless scene and its hit test.
 *
 * The package is PRIVATE, and that is a CONSEQUENCE, not a preference: it
 * depends on `@sentropic/diagram-core`, which is itself `private: true` and
 * absent from the registry (measured: `npm view @sentropic/diagram-core version`
 * answers E404). A published package whose manifest names an unpublished
 * dependency installs broken for everyone. See README, "Why this package is
 * private".
 *
 * No DOM, no renderer, no framework, no design system package. Its ONLY bare
 * import specifier is `@sentropic/diagram-core`, which is the edge
 * `docs/graph-dataviz-architecture-dag.json` declares; a test asserts there is no
 * second one.
 *
 * Read `README.md` for the contracts this lot fixes and for what it leaves out.
 */

export * from "./transform.js";
export * from "./geometry.js";
export * from "./visibility.js";
export * from "./scene.js";
export * from "./hit.js";
