# Dataviz Vue template conversion bench

Apply the mechanical conversion procedure and worked examples in [the shared recipe](../../components-vue/bench/RECIPE.md), with these package-specific paths and rules.

- Product modules are in `packages/dataviz-vue/src/lib/<Name>.ts`. Replace them with `src/lib/<Name>.vue`; keep pure calculations in TypeScript. The public barrel is `src/index.ts`: route both the default-as-named component and all original types to `./lib/<Name>.vue`. Update direct internal imports and test imports of the removed module to the SFC. No shadow .ts shim.
- Read the original, its DS presenter, helpers, defaults, callbacks, attrs and state subscriptions first. Preserve optional Boolean defaults of undefined explicitly.
- Create `bench/fixtures/<Name>.fixtures.ts` with 4–8 unique fixtures, default first. Cover populated, empty/invalid, configured, attrs and state-dependent variants. Fixtures can import the core store; use a fresh store per fixture. Keep every callback/scalar prop and existing slot unless documenting a migration.
- BEFORE conversion run `node packages/dataviz-vue/bench/generate-goldens.mjs <Name>`. It refuses converted targets and existing golden files, and renders all selected originals before writing. Commit fixtures and goldens together. Never regenerate a golden to pass a conversion. Capture dependencies before changing them if their markup is needed for parity.
- Convert to typed script setup plus template; no h, render closures, JSX, Options API, runtime compilation, instance internals or VDOM interop. Keep exported Props and auxiliary types. For VNode props use named/scoped slots and record a contract migration in CONTRACT-CHANGES.md. Function props returning scalars, event callbacks and numeric formatters remain callbacks.
- An inline `<script lang="ts">` may accompany script setup for type declarations/exports and named const/function exports. G1 checks both blocks with the TypeScript AST; runtime imports, mutable declarations, top-level statements, default exports and render code in the companion block are rejected. Type-only imports are allowed.
- Put every store-dependent calculation in a computed that reads `state.value` from `useDashboard` before deriving rows/model. A setup-only read freezes filters. Preserve selection and drill behavior and subscription cleanup.
- DS runtime imports stay `@sentropic/design-system-vue` in authored source. Both the shared build and bench compiler route them to `@sentropic/design-system-vue/vapor` in Vapor mode. A legacy child is a real G5 blocker: port a matching local template presenter or wait for that child's native SFC; never enable interop or hide a render function in a helper. Unsupported components are omitted from the built Vapor barrel.
- Run `node packages/dataviz-vue/bench/check.mjs <Name> [--json]` and fix failures. All six gates are required. Preserve the frozen fixture bytes. Record results and any contract changes. A successful target gate does not replace a package build/export check.

## Six gates and shared implementation

| Gate | Check | Boundary |
| --- | --- | --- |
| G1 | Typed inline script setup/template; old .ts absent; render/JSX/Options API scan | Target source only |
| G2 | Classic and Vapor compilation with build options and SHA-256 drift guard | In-memory compile, no package emission |
| G3 | Real scoped vue-tsc with strict inherited settings | Target + transitive imports |
| G4 | Classic SSR equals every frozen original fixture | HTML/teleports, no interactions |
| G5 | Native createVaporApp mount/flush/unmount in Node jsdom, no interop | Default fixture only; no layout engine |
| G6 | All frozen public exports/kinds/destinations and typed import probe | Selected barrel entries, no exhaustive Props structural diff |

The wrappers in this directory use `scripts/vue-conversion-bench`; components-vue has its own bench. G2 hashes the package build wrapper concatenated with `scripts/vue-sfc-build.mjs`; reconcile compiler changes before updating the pin. Source and fixture SHA-256 plus source revision are recorded in each golden. Fixture hashes are checked at G4. G4 applies the current HTML normalizer to both frozen and candidate HTML/teleports without rewriting goldens. It masks generated control and SVG gradient/clip IDs with relationships and cell suffixes preserved; classes, style strings, SVG geometry and child order stay significant.

Use Node 22.15+ and the lockfile. Build only required workspaces (tokens, themes, diagram-core, diagram-canvas, graph, components-vue and dataviz-core) before package checks. Never run the root test script or launch a browser. Existing `node --test packages/components-vue/bench/normalize.test.mjs` checks the DS normalizer. Capture names are discovered from fixture files; multiple names may be passed in one call. Already converted targets never prevent another original's capture.

Run `node --test scripts/vue-conversion-bench/selftest.mjs scripts/vue-conversion-bench/capture.test.mjs` for the dataviz harness selftest and capture safeguards. The selftest accepts helper exports through both compilers, rejects forbidden companion/setup/template code, and checks generated-ID equivalence and reference mismatches. It works with the integrated converted tree.

`node --test scripts/vue-conversion-bench/capture.test.mjs` verifies capture safeguards in disposable directories. After building dataviz-vue, `node packages/dataviz-vue/bench/check-package.mjs` checks the three proof charts through the published Vapor export, updates/selection/drill and subscription cleanup. `node packages/dataviz-vue/bench/check-rich.mjs` mounts every FieldPane/PalettePicker fixture through the same export and checks reactive branch/content changes. These are additional package witnesses; G1–G6 retain their original boundaries.

## Multiple exports in one module

ObjectLayers.ts exports WebFrame, DataImage and ObjectLayerPanel. Split its runtime components into same-named SFCs and retain pure helper exports separately; capture fixtures/goldens for each public component from the original module before removing it. The bench factory supports a `modules` name-to-original-path mapping for this case. Keep every original public type and helper export.
