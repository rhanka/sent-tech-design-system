# Vue render-module conversion guide (V0b)

Input: existing Vue setup logic and public types, plus the pinned Svelte
template for structure. Output: one standard `<script setup lang="ts">` SFC
with a template, compiled to classic and Vapor from the same source. Pure
calculations stay TypeScript. Keep an exported `<Name>Props` type and every
auxiliary public type. Use `ref`/`computed` for local reactive state.

This guide follows the measurement branch's
[RECIPE.md](https://github.com/rhanka/sent-tech-design-system/blob/28739d99b7805ac572db0e553db916efc4b60928/packages/components-vue/bench/RECIPE.md)
and [check.mjs](https://github.com/rhanka/sent-tech-design-system/blob/28739d99b7805ac572db0e553db916efc4b60928/packages/components-vue/bench/check.mjs).
The bench reference is `213a81f8326cb481508190991d02dc763f123955`;
the V0a/V0c foundation here is `d20ae7cc`. Frozen bench fixtures/goldens are
reference evidence. Never regenerate them from a converted implementation.

## Start a conversion

1. Select the module from [the classification CSV](vue-vapor-classification.csv).
   Read its runtime dependencies, type dependencies and lot dependencies. The
   CSV suggests ownership; L1.5 still owns the §2.9 export/reference manifest.
   Select consumer-required modules first once that manifest supplies the data.
2. Read the old module, its helpers, source barrel(s), direct importers, tests
   and reference Svelte template. Record defaults, emitted payloads/order,
   existing slots, exposed methods, every attrs destination and conditional
   wrapper. Record the starting contract before changing public types.
3. Generate a separate draft, leaving the source intact:

   ```sh
   rtk node scripts/vue-to-sfc.mjs packages/components-vue/src/Badge.ts --out=tmp/Badge.vue --report=tmp/Badge-conversion.json
   ```

   Create `tmp/` first if needed. Output files use exclusive creation. The
   skeleton never overwrites/deletes the input, edits barrels, or edits the
   legacy allow-list. Exit 2 means unsupported work remains; inspect the report
   even on exit 0. A draft is not a parity result.
4. Complete the draft, replace `<Name>.ts` with `<Name>.vue`, and point the value
   export at `export { default as Name } from './Name.vue'`. Retain the separate
   `export type { NameProps, ... }` export. Update direct `.js` imports to default
   SFC imports; do not leave a shadow TS render shim. Existing V0c compatibility
   wrappers remain supported by the extractor, but are not a conversion pattern.
   Remove the converted path from `scripts/vue-vapor-legacy.json` and regenerate
   the classification. Render-free helpers remain `.ts`.

## Translate setup and markup

Use `defineOptions({ name: 'Name' })`, adding `inheritAttrs: false` only when
explicit attrs bindings preserve all original destinations. Do not author a
`vapor` attribute or import `/vapor` in product SFC source: the build selects
the output. No Options API, JSX, runtime template compiler, render helpers or
interop plugin belongs in converted product code.

| Old surface | SFC translation | Required check |
| --- | --- | --- |
| Runtime `props` | `defineProps<NameProps>()`, with `withDefaults` | Preserve every default, requiredness and Boolean casting |
| `emits` | Typed `defineEmits<{ change: [value: string] }>()` | Preserve payloads, listener names and emission order |
| Setup refs/computed/watch | Composition API in script setup | Read props reactively; render-time calculations become computed values |
| `h('tag', bindings, text)` | Tag, bindings, interpolation | Preserve tag/order/wrappers/SVG/ARIA/key/ref and escaping |
| Arrays, maps, branches | Adjacent nodes, `v-for`, `v-if`/`v-else` | Keep stable keys; avoid extra wrappers |
| `slots.default?.()` | `<slot />` | Declare with `defineSlots`, preserve fallback/precedence |
| `slots.name?.(scope)` | `<slot name="name" ... />` | Preserve exact existing slot names and scope |
| Rich VNode prop or render-result callback | Named/scoped slot | Apply the [semantic mapping](vue-vapor-semantic-mapping.md); migrate callers |
| Notification callback | Typed event, with documented compatibility adapter | One invocation per intended notification |
| `expose(...)` | `defineExpose(...)` | Keep public ref methods and payload types |
| UID/counter | One setup `useId()` call | Preserve explicit consumer IDs and ARIA relationships |
| Parent/group instance access | Typed `provide`/`inject` | Preserve reactivity, lifecycle and missing-provider behavior |
| Lucide Vue component | DS Icon backed by neutral `lucide` node data (K7/V9) | Preserve glyph, size, stroke, class, title and decorative behavior |

Array/object defaults need factories. An optional Boolean previously defaulting
to `undefined` needs that explicit default; otherwise Boolean casting can change
`modelValue ?? checked` precedence (Checkbox witness). Keep missing, `null`,
`false`, zero and empty string distinct. Avoid nonreactive props destructuring.

Keep `classNames`, class order and style expressions on their original nodes.
`v-bind` merges class/style differently from an object spread in some cases.
Inspect both explicit attrs forwarding and automatic fallthrough. The bench's
Input/Select/Checkbox reference forwards attrs to the native control and the
outer root: preserve both destinations. Keep a declared `class` prop declared.
Preserve consumer `aria-describedby` while composing generated IDs.

Keep explicit v-model bindings during the first conversion. Input emits its
string value before `input`; Checkbox emits checked before `change`; Select
emits the selected value before `change`. Preserve focus/blur forwarding and
controlled/uncontrolled precedence. Declaring an emit consumes that listener
from `$attrs`. A matching `onChange` listener is already called by
`emit('change', ...)`; do not add a second call to that same listener. Separate
legacy lowercase callbacks such as Tabs' `onchange` remain a separate API.

`getCurrentInstance()` returns null in Vapor. `useId()` replaces identity only.
TileGroup, Toast and TreeView also inspect `vnode.props` to decide whether a
listener exists: model that capability explicitly with typed listener props or
an equivalent accepted API, then prove the old behavior. Provide/inject handles
coordination; neither it nor `useId()` reproduces listener inspection by itself.

For shared reactive state, keep the injection key in a pure TypeScript helper:

```ts
import type { InjectionKey, Ref } from 'vue';
export const groupKey: InjectionKey<Ref<string>> = Symbol('group');
// Parent script setup: const value = ref(''); provide(groupKey, value);
// Child script setup: const value = inject(groupKey);
// Handle an absent provider explicitly; preserve the existing public fallback.
```

Preserve `<Teleport>` destination, disabled/defer behavior and teardown. V0c
proves Portal/Popper on the pin; production Dropdown still needs V6/V9. Assert
destination DOM in jsdom for every converted overlay. Preserve `defineExpose`
refs, focus/keyboard behavior and cleanup. Engine-backed charts need boundary
mocks and accessible fallback markup, not just a successful compile.

## Rich content and icons

Use the existing slot if it already represents the role. New multiword names
use kebab-case; the bench requires Alert `title`/`message`/`actions` and Tabs
`tab-label` with `{ item, index }` / `panel` with `{ item }`. Keep scalar props
as compatible fallbacks where they already exist. Conditional wrappers need
both branches, for example `v-if="$slots.actions || props.actions"`. Preserve
whether a prop or an existing slot wins when both are supplied.

```vue
<script setup lang="ts">
export interface ExampleProps { title?: string }
const props = defineProps<ExampleProps>();
defineSlots<{ title?: () => unknown }>();
</script>
<template><h2 v-if="$slots.title || props.title"><slot name="title">{{ props.title }}</slot></h2></template>
```

Never stringify a VNode as its replacement or mount it as a dynamic component.
Record the type/caller migration when narrowing VNode-capable `unknown` to a
scalar fallback. Runtime VNode fixtures use the bench's `legacyProps`, paired
with equivalent template slots on the converted host. Normal fixtures keep
identical props/slots. Formatting callbacks and data-only `unknown` values do
not become slots.

K7 changes implementation and the component-valued icon escape hatch. V9 builds
DS Icon templates on `lucide` data and removes `lucide-vue-next`. Preserve the
DS-owned name registry; `glyph` and `ICONS` values must become neutral data.
NavActionStack needs data or scoped icon slots. The skeleton rewrites recognized
Lucide tags to `DSIcon` and reports the dependency; a generated name is only a
suggestion until V9 verifies the registry. Do not use `DiagramIcon` as a general
Lucide replacement or claim native compatibility while a VDOM icon remains.

## Declarations and generics

Export `<Name>Props` from the SFC and barrel even for empty props. Imported and
re-exported props types are supported. For a generic SFC, declare the generic
attribute and the exported generic props interface with matching parameters and
defaults. Declare default/named/scoped slots with `defineSlots` and public refs
with `defineExpose`. The extractor reads emitted declarations, never templates
or declaration text regex for type structure.

It follows the exported component's public constructor `$slots`/`$emit` or the
generic callable context's `slots`/`emit`; props remain authoritative from
`NameProps`. Slot optionality and parameter schemas are extracted; slot return
types are ignored. Missing expected slot names keep a contract partial. A
generic without a default records an unresolved generic instead of silently
widening to its constraint. Generic defaults are keyed by parameter symbols,
and concrete specializations get distinct schema definitions. Brand erasure
and symbol-keyed members remain explicit losses, keeping affected JSON
contracts partial. Source defaults remain outside declaration extraction.

## Verify with the measurement harness and foundation gates

The measurement harness remains on `bench/vue-vapor-conversion`; its files are
not copied into this branch. On the measurement checkout run:

```sh
rtk node packages/components-vue/bench/check.mjs Badge --json
rtk node --test packages/components-vue/bench/normalize.test.mjs
```

Before using that harness on the V0 foundation, reconcile its `lib.mjs` with
the current shared `scripts/vue-sfc-build.mjs`: compiler choice, Vapor injection,
inline-template/transpile options and runtime aliases. G2 currently pins the
old package build script's hash; verify the implementation before updating that
pin, and include the shared build script in future pins. Do not refresh fixture
hashes/goldens. Stable 3.5 is a separate foundation leg: `classic` in the pinned
bench helper resolves `vue/compiler-sfc`, which now resolves the 3.6 pin here.

| Bench gate | Meaning | Additional production obligation |
| --- | --- | --- |
| G1 | Template source, no render/Options API/shadow TS | Repository K25 lint and shrinking allow-list |
| G2 | Classic + Vapor compilation | Exact RC plus stable 3.5 compilation |
| G3 | Scoped vue-tsc | Whole-package check and emitted declarations |
| G4 | Frozen SSR fixtures, including teleport targets | Contract extraction and semantic mapping; interaction/DOM/a11y evidence |
| G5 | Default fixture mounted under createVaporApp in jsdom, no interop | All relevant interaction/portal fixtures and native dependency graph |
| G6 | Public export/type names resolve | Packed classic/Vapor consumers and extracted contract equality |

The bench's ten trial components are Button, Badge, Alert, Input, Checkbox,
Select, Tabs, Pagination, Tooltip and BarChart. Badge is the executed worked
example; Tabs is a recipe example. Its normalizer masks generated ID bases,
retaining suffixes/references; it does not prove layout or browser behavior.
Do not run bench selftest concurrently with conversions: it mutates/restores
Badge temporarily and is intended for an unconverted tree.

From this branch, use scoped commands; never the root test script:

```sh
rtk npm run lint:vue-vapor
rtk npm run check:types -w @sentropic/design-system-vue
rtk npm run check:types -w @sentropic/dataviz-vue
rtk npm run build -w @sentropic/design-system-vue
rtk npm run build -w @sentropic/dataviz-vue
rtk npm run build:classic-3.5 -w @sentropic/design-system-vue
rtk npm run build:classic-3.5 -w @sentropic/dataviz-vue
rtk npm run test -w @sentropic/design-system-vue
rtk npm run test -w @sentropic/dataviz-vue
rtk npm run test -w @sentropic/design-system-component-index
rtk node --test scripts/component-index.test.mjs scripts/vue-to-sfc.test.mjs
rtk node scripts/vue-vapor-classify.mjs --check
rtk npm run licensing:check
rtk npm run notices:generate
```

Build the index generator, inspect contract deltas, then regenerate/check the
index before its freshness guard. Use the existing packed-consumer gate for
conversion acceptance. Preserve every reference golden; document intentional
semantic mappings in the manifest and conversion evidence. Browser/print
acceptance belongs to the programme's approved environment, outside this lot.
SFC source counts and this CSV do not establish §2.9 `covered` status.

## Skeleton limits

`scripts/vue-to-sfc.mjs` uses the TypeScript AST to preserve exported types,
extract literal defaults, declare typed object-form emits, move simple setup
logic and translate literal tags, bindings, branches, arrays and slot calls.
Top-level rich props become named-slot drafts. It reports array-emits payloads,
render-block calculations, map/helpers, dynamic tags/props, scoped-slot
arguments, instance internals and validators for manual work. Direct instance
UID reads become `useId()` with an identity migration reminder; group and
listener-presence access requires the typed provide/inject or explicit-listener
design above. Unsupported
branches remain visible TODO comments and yield exit 2. It does not infer
collection slot scopes, rewrite consumers, verify DOM parity, convert all 331
modules automatically, or resolve the V9 icon dependency. Its tests compile
the Badge and event drafts in classic, Vapor and stable 3.5 modes.
