# Vue Vapor foundation (V0a / V0c)

Workstream `01M77Q9N3MZ4TJMH6Y2KN5EYR1`. Source remains SFC templates and
Composition API, with `ref`/`computed` for local state. No new render functions.

## Exact matrix

| Layer | Vapor / development | Classic consumer |
| --- | --- | --- |
| `vue` | `3.6.0-rc.15` | `3.5.45` |
| `@vue/compiler-sfc` | `3.6.0-rc.15` | `3.5.45` (alias `vue-compiler-sfc-classic`) |
| `@vue/server-renderer` | `3.6.0-rc.15` | `3.5.45` |
| `@vitejs/plugin-vue` | `6.0.11` | Same plugin; stable SFC compilation uses the compiler alias |
| `vue-tsc` | `3.3.14` | Packed declaration check against the consumer's Vue types |

Registry re-read on 2026-11-12: `vue` dist-tags `rc=3.6.0-rc.15`,
`latest=3.5.45`. The plugin's peers explicitly accept the RC and Vite 8;
`features.vapor: true` is exercised by `scripts/vue-vapor-toolchain.mjs`.
Keep the RC pin until the owner changes it; the intended next line is 3.6.x
stable. No package version, tag or publication is part of these lots.

## Build and consumer gates

Both packages run K25 before `vue-tsc` emits TypeScript modules and SFC
declarations. `scripts/vue-sfc-build.mjs` then compiles every production SFC in
classic and Vapor modes. `build:classic-3.5` recompiles the same SFC source with
the stable compiler into a verification tree under `dist/classic-3.5`.
A regular dual build removes that verification tree before rebuilding.

The Vapor barrel includes native SFCs and render-free helpers. SFCs that still
import legacy children or `lucide-vue-next` stay out of that barrel. Dataviz's
Vapor entry currently exposes its adapter and pure helpers; its 115 component
modules await V7a/V7b. This is infrastructure, not full export parity.

`scripts/vue-vapor-packed.mjs` packs both packages and their first-party runtime
dependencies, then installs them in independent projects outside the workspace:

- Vue 3.5.45: strict declaration check (`skipLibCheck: false`), complete Vite
  dependency graph, and a real classic diagram mount in Vitest/jsdom. The same
  mount is repeated with the stable compiler output shipped in the tarball.
- Vue 3.6.0-rc.15: strict declaration check, Vite build, and a real `./vapor`
  diagram mount using `createVaporApp`, with no interop plugin.

The declaration gate rejects workspace/symlink resolution. The classic graph
rejects Vapor paths and Vapor-only APIs, including dependencies visited before
tree shaking. Test resolution explicitly selects Vue's ESM runtime: the RC's
Node entry omits Vapor APIs.

K25's `scripts/vue-vapor-legacy.json` enumerates existing render-function files.
New modules fail the build; converted/deleted files must be removed. CI also
compares the allow-list with the base commit and rejects additions. The first
V0a adoption seeds the baseline because the base has no allow-list yet.

`.github/workflows/vue-vapor.yml` runs the exact matrix, builds, type checks,
Vitest/jsdom suites, packed consumers and a JSON conversion-progress artifact.
Repository component-index and licensing checks remain in the existing Verify
workflow. No browser is required by the Vue foundation workflow.

## Conversion indicator

`node scripts/vue-vapor-coverage.mjs` reproduces the supplied shell indicator's
per-package counts. `--json` emits machine-readable data;
`--output=<path>` writes it while retaining the text output. `--ref=<git-ref>`
reads a committed tree without fetching or changing it.

This measures source conversion only. An SFC count does not prove native child
compatibility, contract equality or the behavioural/browser evidence required
by programme §2.9. Full completion still requires zero native-Vapor exceptions.

At the V0a starting point: components 14/232 (6%), 218 render-function modules;
dataviz 0/115 (0%), 115 render-function modules; total 14/347 (4%), 333 remaining.

## Fan-out boundaries

V0b still owns SFC contract extraction (including slots), exported props,
generic declarations, the VNode classification and semantic mappings. Existing
menu SFCs depend on legacy children/Lucide; being an SFC does not make them
native. V1–V9 remain subject to V0b/V0c and the plan's manifest/reference gates.
No full fan-out clearance is inferred from this foundation alone.
