/**
 * `@sentropic/diagram-canvas` - the headless scene and its hit test.
 *
 * The package is PRIVATE until its own publication lot: it has no publish
 * workflow and no tag line in `docs/release.md` yet. Since L7b-a that is a
 * standalone state, not a consequence: its only dependency,
 * `@sentropic/diagram-core`, is itself public (`publishConfig.access:
 * "public"`, no `private` flag, tag `diagram-core-v<version>`). See README,
 * "Why this package is private".
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
export * from "./layout/index.js";
