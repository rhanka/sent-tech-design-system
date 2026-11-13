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

V0b supplies SFC contract extraction (including slots), exported props,
generic declarations, the VNode classification and semantic mappings. See the
[conversion guide](vue-vapor-conversion-guide.md),
[semantic mapping](vue-vapor-semantic-mapping.md) and
[per-module CSV](vue-vapor-classification.csv). Existing
menu SFCs depend on legacy children/Lucide; being an SFC does not make them
native. V1–V9 remain subject to V0b/V0c and the plan's manifest/reference gates.
No full fan-out clearance is inferred from this foundation alone.

## V0c results on 3.6.0-rc.15

All witnesses use `createVaporApp` without the interop plugin. The custom
element uses the dedicated `defineVaporCustomElement` factory.

| API | Result | Evidence and limit |
| --- | --- | --- |
| Teleport: Portal | Works | Public SFC: HTMLElement target, default slot, move inline via `disabled`, teardown |
| Teleport: Popper | Works | Public SFC: body target, anchor geometry, reactive close, arrow, slot and cleanup |
| Teleport: Dropdown shape | Works | Native test SFC: conditional listbox, disabled option, select exactly once, close |
| Production Dropdown | Blocked for native Vapor | Existing `h()` implementation, `unknown` labels that can be VNodes, and `lucide-vue-next`. Left unchanged to preserve its public contract; V0b/V6/V9 own the mapping and conversion. This is not a covered component. |
| Custom element | Works | Published Vapor GraphLegend, initial properties, observed attribute update and unmount callback |
| Server rendering | Works with SSR compilation | Pinned compiler `templateOptions.ssr`, `__vapor` marker, `renderToString(createVaporApp(...))`, escaped output. The published Vapor output is a client build; this does not establish a packaged SSR entry or hydration. |
| `getCurrentInstance` replacement | Works | Legacy API returns null; `useId` yields unique labelled-input ids, provide/inject shares reactive state, events and exposed methods update both children |
| Diagram runtime | Works | Existing three tests execute card, zone, icon, legend, ForceGraph, GraphCanvas, scene and BPMN outputs, callbacks, exposed refs and teardown |

Portal and Popper were converted for the real-component Teleport tests. Their
props, slots, callback/event behavior and geometry exports remain available.
The classic suite and generated Popper/Portal semantic contract bodies remain
equal to the baseline. Popper keeps a typed TS compatibility export so the
current extractor can still see its events.

The context fixture also exercises a generic SFC, imported props, default and
named/scoped slots, events and `defineExpose`. A separate infrastructure test
compiles a future dataviz SFC in both modes, emits its declarations and compiles
it on 3.5. These are compiler/runtime witnesses; V0b still owns the complete
contract-equality gate, including slots and generics.

Final source indicator:

```text
components-vue  Vapor-ready   16 /  232  (  6 %)   still h(): 216
dataviz-vue     Vapor-ready    0 /  115  (  0 %)   still h(): 115
TOTAL           Vapor-ready   16 /  347  (  4 %)   still h(): 331
```

## Validation and remaining risks

- Vue classic: 110 files, 1,872 tests. Vapor API/diagram: 2 files, 8 tests.
- Dataviz Vue: 37 files, 160 tests. Component-index: 15 files, 139 tests.
- Component-index repository guard: 13 tests; workflow invariants: 21 tests;
  Vue toolchain/lint regression suite: 3 tests.
- Packed consumers: strict declarations, graph checks and 2 runtime tests per
  leg; classic also repeats on the stable compiler output. Classic graph:
  2,419 modules. Vapor graph: 380 modules. A deliberately injected Vapor import
  fails the classic graph gate; the native graph also rejects DS VDOM modules.
- K25, compiler/plugin pins, both type checks, stable compilation, licensing
  and notices pass. The component-index repository guard passes after
  regenerating the declaration/source digests. Shared compiler/lint inputs are
  part of the Vue build cache key; rebuild-then-skip behavior was verified.

V0b addresses constructor/re-export visibility, slots, generic defaults and
the VNode semantic mapping. Branded primitives now retain their JSON scalar
form with an explicit loss record, and symbol-keyed properties are omitted with
stable diagnostics. Generated contracts no longer contain TypeScript symbol
allocation ids. Declaration-only losses still keep affected contracts partial.

V1–V9 remain gated: 331 legacy modules remain, the menu SFCs have legacy
dependencies, Dropdown needs its contract mapping, and Lucide removal is V9.
The RC can still change before stable. This lot proves jsdom/runtime behavior;
browser/print acceptance, package-wide SSR/hydration and the §2.9 coverage
manifest are not claimed. Zero native-Vapor exceptions remains the target.
