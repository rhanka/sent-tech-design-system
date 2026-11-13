# Vue template conversion bench

This directory is a measurement harness. It does not ship converted product
components. The reference is commit `213a81f8326cb481508190991d02dc763f123955`,
`packages/components-vue/src`, and PLAN.md §2.2. Use one component per trial.

The HARD lane extends the original ten trials with separately frozen fixtures
and goldens. `lib.mjs` discovers module names from fixture filenames. Capture
explicit unconverted modules with `generate-goldens.mjs <Name> ...`; existing
goldens cannot be overwritten. Portal/Popper reference their original V0c `.ts`
public entries and SFCs. The non-component `cellDecoration` uses a reference-only
host for its original render helper, then checks its pure data resolver and
`CellDecorationIcon.vue`. G2 pins both the package wrapper and shared compiler
script. The added generated-ID patterns were fixed before reference capture.
G5 compares Classic and Vapor DOM for every frozen fixture, including live control properties, verifies overlay destinations and teardown for every component, and
requires no browser or interop plugin. `hard-interactions.test.mjs` adds native
Vapor event, state, provider, keyboard and SVG-namespace witnesses. Results are
in `HARD-RESULTS.md`, `results/hard/` and `CONTRACT-CHANGES.md`.

## Mechanical procedure

1. Read `src/<Name>.ts`, its imported helpers, its two barrel exports, and
   `bench/fixtures/<Name>.fixtures.ts`. Note every prop default, event, attribute
   destination, conditional wrapper, element order and existing slot name.
2. Replace `src/<Name>.ts` with `src/<Name>.vue`. Keep pure helpers as `.ts`.
   Use `<script setup lang="ts">` and `<template>`; do not write `vapor` on the
   source script: the build injects it. Follow DiagramCard.vue / DiagramZone.vue
   / BpmnCanvas.vue for template authoring and typed setup logic.
3. Keep the exported `<Name>Props` type and **all** existing auxiliary exported
   types, including their optionality, unions and callback signatures. Export
   types inside script setup, as the existing SFCs do. Do not export a runtime
   component from script setup. Set `defineOptions({ name: '<Name>' })`.
4. Change both barrel destinations to `./<Name>.vue`. Change the component line
   to `export { default as <Name> } from './<Name>.vue';`; keep the public named
   export and the existing `export type { <Name>Props, ... }` line. Search for
   direct internal imports of `./<Name>.js`; update those importers to the SFC
   and default import if needed. Do not leave a shadow `<Name>.ts` shim.
5. Translate runtime props to `defineProps<<Name>Props>()` with `withDefaults`.
   Match **every runtime default**, even when the public type is optional.
   Required data props stay required. A rich content prop replaced by a slot must become optional, so slot-only callers need no dummy prop. Array/object defaults use factories. An
   optional Boolean that previously defaulted to `undefined` needs an explicit
   `undefined` default, or Vue Boolean casting changes precedence (Checkbox's
   `modelValue ?? checked` is a witness). Keep `null`, `false`, empty string and
   missing distinct. Keep a `props` object or use reactive destructuring;
   ordinary destructuring must not freeze reactive reads.
6. Replace `emits` with typed `defineEmits`. Example:
   `defineEmits<{ 'update:modelValue': [value: string]; change: [event: Event] }>()`.
   Keep payloads and emission order. A declared emit already calls its onX listener: never also call props.onX for that event. Retain the callback prop type for compatibility. Keep separately supported lowercase callback
   props such as Tabs' `onchange` and call them once alongside `emit('change', v)`.
   Do not accidentally declare new emits that consume formerly native listeners.
7. Move setup state and pure calculations into refs, computed values and ordinary
   functions. Code formerly inside the render closure must remain reactive:
   make derived collections/computations computed, or read them in template
   expressions. Keep focus refs, keyboard handling, controlled/uncontrolled
   precedence and public `defineExpose` methods. Render helpers such as
   BarChart's `chartDataList` are not pure calculation helpers: move their
   markup into templates or SFC children compiled in both modes too.
8. Translate each render-function child in order. `h('tag', props, text)` becomes
   a tag, bindings and `{{ text }}`; arrays/maps become adjacent children or
   `v-for` with the same key; conditionals become `v-if` / `v-else`. Preserve
   wrappers, SVG attributes/geometry, ARIA values, `tabindex`, disabled states
   and accessible fallback markup. Distinguish `false` from the string `'false'`
   on ARIA attributes. Escape with interpolation; never replace text with
   `v-html`. Do not add wrappers just to hold loops or slots.
9. Replace `slots.default?.()` with `<slot />`; named calls become
   `<slot name="existing-name" ... />`. Preserve **every existing slot name**,
   including `default`, Checkbox's `trailing`, and Select's `default` options
   override. Do not rename an existing slot to fit a new naming convention.
10. VNode-valued props/render callbacks become named slots. Use the prop name
    (kebab-case for new multiword names), or a documented scoped name for
    collection cells. Preserve existing slot names if they already cover the
    same role. Render string/number props as slot fallbacks, retaining their public
    types/defaults for compatibility. Alert uses `title`, `message`, `actions`;
    Tabs uses `tab-label` with `{ item, index }` and `panel` with `{ item }`.
    An optional wrapper must test both the slot and scalar fallback, e.g.
    `v-if="$slots.actions || props.actions"`. VNodes cannot be interpolated as
    text or mounted as dynamic components without reintroducing VDOM interop.
    Moving VNode callers to slots is a contract migration; record it in the
    conversion result. The rich-content fixtures have explicit `legacyProps`
    for the old VNode host and equivalent template slots for the new host.
    Normal fixtures use exactly the same props/slots on both implementations.
11. Keep `classNames` and the original class order. Example:
    `:class="classNames('st-badge', \`st-badge--${props.tone}\`, props.class)"`.
    Bind the original style expression at the same node. Vue merges class/style
    from `v-bind` with explicit bindings; inspect precedence rather than assuming
    an object spread and template spread overwrite in the same way. Keep `class`
    a declared prop where it was one; otherwise it changes `$attrs` behavior.
12. Every explicit `$attrs` or `useAttrs()` path requires
    `defineOptions({ name: '<Name>', inheritAttrs: false })`. Forward each
    attribute and listener once to its intended element. Native form attributes
    belong to the control; they must not also fall through onto its wrapper.
    Do not cache an attrs spread/destructure in `computed`: an initially empty
    attrs proxy may not track enumeration. Merge during rendering, e.g.
    `v-bind="{ ...$attrs, ...controlProps }"`, or call a live binding function.
    Make class/style precedence explicit in that object. Parse string styles
    before object spreading (`normalizeStyle([attrs.style])`) and preserve
    caller style when composing owned styles. Keep explicit native IDs and
    their label/ARIA references. Declared emits are filtered out of attrs.
13. Preserve v-model's `modelValue` / `update:modelValue` contract. Prefer the
    explicit binding and handler for this conversion: Input emits the string
    then `input`; Checkbox emits `checked` then `change`; Select emits the
    selected value then `change`. Keep focus/blur forwarding. `defineModel` is
    acceptable only if its defaults, Boolean casting and extra events are
    identical; do not change a controlled component into local state.
14. Replace ID-only counters and `getCurrentInstance().uid` with a single setup
    `useId()` call in setup, never a process-wide counter or an extracted counter helper, e.g. `const uid = \`st-tabs-${useId()}\``. Use an explicit
    typed provide/inject key for parent/group coordination; make injected
    reactive state explicit. Never depend on instance internals:
    `getCurrentInstance()` returns null in Vapor. Keep consumer-specified IDs.
    The normalizer masks generated bases, retaining suffixes and relationships.
15. For a Teleport, preserve the destination and disabled/defer behavior using
    `<Teleport>`. Compile in both modes; the Vapor compiler/runtime chooses its
    supported primitive. A successful compilation alone proves no portal
    behavior. Add portal fixtures and assert the destination DOM if converting
    a portal component. G4 captures SSR teleport targets separately; G5 compares every fixture mounted in Classic and Vapor, including all teleport targets, and checks complete teardown for every component. Do not
    introduce a detached mount fallback silently: that needs a separate witness.
16. Run `node packages/components-vue/bench/check.mjs <Name>` from the repo root
    (or `node bench/check.mjs <Name> --json` from this package). Fix every failing
    gate. Never refresh goldens to make a conversion pass. A review-authorized behavior correction belongs in the bounded review-corrections.mjs adapter, with a failing regression and a documented reason; keep the archived captures intact. Record elapsed time,
    model, retries, final gate results and intentional contract migrations in
    the trial's own evidence. A passing trial is not authorization to merge.

Forbidden product source: `h()`, aliases of `h`, `defineComponent` render
closures, standalone render functions, JSX/TSX and the Options API. Do not hide
these in a helper, use runtime template compilation, add `vaporInteropPlugin`,
or use `getCurrentInstance` as a shortcut. Pure TypeScript calculations stay
valid. The fixture/SSR harness may use VNodes to represent the reference API.

## Running and maintaining the harness

Use Node 22.15+ (the measured run used 22.22.1) and the repository lockfile.
Install from the root with `npm ci --ignore-scripts --workspace
packages/components-vue --include-workspace-root --no-audit --no-fund`, using
the task's `npm_config_cache`. No added dependency or package build is required.

- `node packages/components-vue/bench/check.mjs Badge [--json]`: all six gates,
  exit 0 only when all pass; invalid CLI arguments exit 2. JSON replaces the
  human PASS/FAIL table and includes the detail of every gate.
- `node --test packages/components-vue/bench/normalize.test.mjs`: focused
  normalizer invariants, including broken ID-reference detection.
- `node packages/components-vue/bench/selftest.mjs`: **exclusive use on an
  unconverted tree**. Checks all baseline components, copies the Badge worked
  example into src, runs all gates, runs eight negative controls, and restores
  Badge.ts/index.ts byte-for-byte in `finally`. Writes `results/selftest.json`.
  Do not interrupt with SIGKILL or run concurrent conversion trials.
- `node packages/components-vue/bench/generate-goldens.mjs <Name> ...`: explicit
  reference capture only. Requires each requested original `.ts` implementation
  (including existing V0c public wrappers) and refuses an existing golden;
  renders all requested fixtures before writing any golden.
  Review source changes before running it. It never runs from the checker.

## Gate boundaries

| Gate | Implementation | Limit |
| --- | --- | --- |
| G1 | SFC parse + TypeScript AST, imported aliases, JSX scan, old-file absence | Static local source check; not a transitive ban on helpers or adversarial obfuscation |
| G2 | Same parse/injection/compileScript/transpile pipeline as build-sfc.mjs, both compilers; build-script SHA-256 guards drift | In-memory target compilation, not a package/published consumer build or stable Vue 3.5 test |
| G3 | Real vue-tsc with a temporary config extending package strict settings, target and transitive imports | Unrelated package components excluded; inherited skipLibCheck remains |
| G4 | createSSRApp + @vue/server-renderer in isolated Node worker; every fixture compared with frozen JSON | Classic SSR only, no client interaction; not Vapor SSR |
| G5 | Official development ESM runtime exporting createVaporApp; compiled target must have __vapor; every fixture mounts through template slots; flush + unmount; overlay destinations and teardown | jsdom has no visual/layout/accessibility engine; no interop plugin |
| G6 | Compare all original named exports and value/type kinds with frozen manifest, check destination, type-check selected declarations and value/type import probe | No full barrel build or package declaration emission; public Props structure is preserved by recipe, not exhaustively diffed |

The Node `vue` entry on this pin omits createVaporApp. G5 aliases **all** bare
`vue` imports to `vue/dist/vue.runtime-with-vapor.esm-browser.js` inside its
worker, after installing jsdom globals. This is a Node import of the official
runtime; it launches no browser. Warnings, Vue errors, synchronous mount errors,
window errors, flush errors and unmount errors fail G5. A 60-second worker/type
check deadline fails closed; slow machines can report timeout failures.

Normalization uses the jsdom HTML parser, sorts attributes, collapses text
whitespace, ignores whitespace-only nodes and Vue's empty/fragment/v-if marker
comments, and masks only known generated ID bases inside ID/reference/ARIA
attributes. It preserves class order, style strings, explicit IDs, ID suffixes,
SVG geometry, meaningful text and child order. This intentionally ignores
formatting spaces (including whitespace-only inline separators), Vue structural
comments, entity spelling and attribute quoting. HTML parser repairs can conceal
malformed HTML. A consumer ID resembling `st-input-123` is indistinguishable from
a generated counter. Teleport targets are normalized independently, so cross-
target ID relationships are not checked. Do not expand normalization just to
accept a failed conversion. Fixtures are sampled coverage: interaction ordering,
keyboard focus, reactive updates, layout and arbitrary VNode callers need wider
tests before any production migration.

The fixture slot HTML is trusted local template input. `legacyProps` is an
explicit VNode-to-slot adapter for Alert and Tabs, not a general parity escape
hatch. Rich-content markup must match on both sides. Freeze fixtures along with
goldens during measurement. Examples below are complete; their runnable copy
sources are in `examples/` and are intended to be placed in `src/`.

## Worked examples

### Badge — before

```ts
import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type BadgeTone = "neutral" | "success" | "warning" | "error" | "info";

/**
 * Badge shape — `"pill"` (default) is the base render (radius pill, width grows
 * with content). `"circle"` renders an equal-sided round bubble (tabular-nums) —
 * best for ≤2-digit counts; 3+ digit content degrades gracefully to a
 * rounded-rect (never clipped). Additive: with `shape` unset the badge renders
 * byte-identically to before.
 */
export type BadgeShape = "pill" | "circle";

/**
 * Density — `"md"` (default) is the base render. `"sm"` shrinks the font-size
 * (the rail-bubble scale). Additive: with `size` unset the badge renders
 * byte-identically to before.
 */
export type BadgeSize = "sm" | "md";

export type BadgeProps = {
  tone?: BadgeTone;
  shape?: BadgeShape;
  size?: BadgeSize;
  class?: string;
};

export const Badge = defineComponent({
  name: "Badge",
  props: {
    tone: { type: String as () => BadgeTone, default: "neutral" },
    shape: { type: String as () => BadgeShape, default: "pill" },
    size: { type: String as () => BadgeSize, default: "md" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "span",
        {
          ...attrs,
          class: classNames(
            "st-badge",
            `st-badge--${props.tone}`,
            `st-badge--${props.shape}`,
            `st-badge--${props.size}`,
            props.class,
          ),
        },
        slots.default?.(),
      );
  },
});
```

### Badge — after

```vue
<script setup lang="ts">
import { classNames } from './classNames.js';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';
export type BadgeShape = 'pill' | 'circle';
export type BadgeSize = 'sm' | 'md';
export type BadgeProps = {
  tone?: BadgeTone;
  shape?: BadgeShape;
  size?: BadgeSize;
  class?: string;
};

defineOptions({ name: 'Badge', inheritAttrs: false });
const props = withDefaults(defineProps<BadgeProps>(), {
  tone: 'neutral', shape: 'pill', size: 'md', class: undefined,
});
</script>

<template>
  <span v-bind="$attrs" :class="classNames('st-badge', `st-badge--${props.tone}`, `st-badge--${props.shape}`, `st-badge--${props.size}`, props.class)"><slot /></span>
</template>
```

### Tabs — before

```ts
import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type TabItem = {
  id?: string;
  value?: string;
  label: unknown;
  content?: unknown;
  disabled?: boolean;
};

// In addition to the Vue-native `@change` emit (which already routes to an
// `onChange` listener), an `onchange` callback prop (Svelte-canonical,
// lowercase) is accepted and fired on change.
export type TabsProps = {
  items: TabItem[];
  activeValue?: string;
  activeId?: string;
  label?: string;
  onchange?: (value: string) => void;
  class?: string;
};

let _tabCounter = 0;
function nextTabId(): string {
  return `st-tabs-${++_tabCounter}`;
}

function idFrom(item: { id?: string; value?: string }, index: number, prefix: string): string {
  return item.id ?? item.value ?? `${prefix}-${index}`;
}

function moveIndex(index: number, max: number, delta: number): number {
  if (max <= 0) return -1;
  return (index + delta + max) % max;
}

export const Tabs = defineComponent({
  name: "Tabs",
  props: {
    items: { type: Array as () => TabItem[], required: true },
    activeValue: { type: String, default: undefined },
    activeId: { type: String, default: undefined },
    label: { type: String, default: "Tabs" },
    onchange: { type: Function as unknown as () => (value: string) => void, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["change"],
  setup(props, { emit, attrs }) {
    const instanceId = ref(nextTabId());
    const first = () => props.items.find((item) => !item.disabled) ?? props.items[0];
    const itemIds = () => props.items.map((item, index) => idFrom(item, index, "tab"));

    const getInitialValue = () => {
      const f = first();
      return (
        props.activeValue ??
        props.activeId ??
        (f ? idFrom(f, props.items.indexOf(f), "tab") : "tab-0")
      );
    };

    const localCurrent = ref(getInitialValue());

    const current = () =>
      props.activeValue ?? props.activeId ?? localCurrent.value;

    const setCurrent = (val: string) => {
      if (props.activeValue === undefined && props.activeId === undefined) {
        localCurrent.value = val;
      }
      emit("change", val);
      props.onchange?.(val);
    };

    const tabRefs = ref<Array<HTMLElement | null>>([]);

    const activateIndex = (index: number) => {
      const item = props.items[index];
      if (!item || item.disabled) return;
      const ids = itemIds();
      setCurrent(ids[index]);
      tabRefs.value[index]?.focus();
    };

    const moveTab = (index: number, delta: number) => {
      const enabled = props.items
        .map((item, itemIndex) => ({ item, itemIndex }))
        .filter(({ item }) => !item.disabled);
      const enabledIndex = enabled.findIndex(({ itemIndex }) => itemIndex === index);
      const next = enabled[moveIndex(enabledIndex, enabled.length, delta)];
      if (next) activateIndex(next.itemIndex);
    };

    return () => {
      const ids = itemIds();
      const cur = current();
      const activeIndex = Math.max(0, ids.indexOf(cur));
      const active = props.items[activeIndex] ?? first();
      const uid = instanceId.value;

      return h(
        "section",
        {
          ...attrs,
          class: classNames("st-tabs", props.class),
        },
        [
          h(
            "div",
            { class: "st-tabs__list", role: "tablist", "aria-label": props.label },
            props.items.map((item, index) => {
              const itemId = ids[index];
              const tabId = `${uid}-tab-${itemId}`;
              const panelId = `${uid}-panel-${itemId}`;
              return h(
                "button",
                {
                  key: itemId,
                  ref: (el: unknown) => {
                    tabRefs.value[index] = el as HTMLElement | null;
                  },
                  id: tabId,
                  type: "button",
                  role: "tab",
                  class: classNames(
                    "st-tabs__tab",
                    itemId === cur && "st-tabs__tab--active",
                  ),
                  "aria-selected": itemId === cur,
                  "aria-controls": panelId,
                  tabindex: itemId === cur ? 0 : -1,
                  disabled: item.disabled,
                  onClick: () => activateIndex(index),
                  onKeydown: (event: KeyboardEvent) => {
                    if (event.key === "ArrowRight") {
                      event.preventDefault();
                      moveTab(index, 1);
                    } else if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      moveTab(index, -1);
                    } else if (event.key === "Home") {
                      event.preventDefault();
                      const firstEnabled = props.items.findIndex((c) => !c.disabled);
                      activateIndex(firstEnabled >= 0 ? firstEnabled : 0);
                    } else if (event.key === "End") {
                      event.preventDefault();
                      const lastEnabled =
                        props.items
                          .map((c, ci) => ({ c, ci }))
                          .filter(({ c }) => !c.disabled)
                          .at(-1)?.ci ?? props.items.length - 1;
                      activateIndex(lastEnabled);
                    }
                  },
                },
                item.label as string,
              );
            }),
          ),
          h(
            "div",
            {
              id: `${uid}-panel-${ids[activeIndex]}`,
              class: "st-tabs__panel",
              role: "tabpanel",
              "aria-labelledby": `${uid}-tab-${ids[activeIndex]}`,
            },
            active?.content as string,
          ),
        ],
      );
    };
  },
});
```

### Tabs — after

```vue
<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { classNames } from './classNames.js';

export type TabItem = {
  id?: string;
  value?: string;
  label: unknown;
  content?: unknown;
  disabled?: boolean;
};
export type TabsProps = {
  items: TabItem[];
  activeValue?: string;
  activeId?: string;
  label?: string;
  onchange?: (value: string) => void;
  class?: string;
};
defineOptions({ name: 'Tabs', inheritAttrs: false });
const props = withDefaults(defineProps<TabsProps>(), {
  activeValue: undefined, activeId: undefined, label: 'Tabs', onchange: undefined, class: undefined,
});
const emit = defineEmits<{ change: [value: string] }>();
defineSlots<{
  'tab-label'?: (scope: { item: TabItem; index: number }) => unknown;
  panel?: (scope: { item: TabItem | undefined }) => unknown;
}>();

function idFrom(item: TabItem, index: number, prefix: string): string {
  return item.id ?? item.value ?? `${prefix}-${index}`;
}
function moveIndex(index: number, max: number, delta: number): number {
  if (max <= 0) return -1;
  return (index + delta + max) % max;
}
const uid = `st-tabs-${useId()}`;
const first = () => props.items.find(item => !item.disabled) ?? props.items[0];
const getInitialValue = () => {
  const f = first();
  return props.activeValue ?? props.activeId ?? (f ? idFrom(f, props.items.indexOf(f), 'tab') : 'tab-0');
};
const localCurrent = ref(getInitialValue());
const ids = computed(() => props.items.map((item, index) => idFrom(item, index, 'tab')));
const current = computed(() => props.activeValue ?? props.activeId ?? localCurrent.value);
const activeIndex = computed(() => Math.max(0, ids.value.indexOf(current.value)));
const active = computed(() => props.items[activeIndex.value] ?? first());
const tabRefs = ref<Array<HTMLElement | null>>([]);
function setTabRef(el: unknown, index: number) { tabRefs.value[index] = el as HTMLElement | null; }
function setCurrent(value: string) {
  if (props.activeValue === undefined && props.activeId === undefined) localCurrent.value = value;
  emit('change', value);
  props.onchange?.(value);
}
function activateIndex(index: number) {
  const item = props.items[index];
  if (!item || item.disabled) return;
  setCurrent(ids.value[index]);
  tabRefs.value[index]?.focus();
}
function moveTab(index: number, delta: number) {
  const enabled = props.items.map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => !item.disabled);
  const enabledIndex = enabled.findIndex(({ itemIndex }) => itemIndex === index);
  const next = enabled[moveIndex(enabledIndex, enabled.length, delta)];
  if (next) activateIndex(next.itemIndex);
}
function keydown(event: KeyboardEvent, index: number) {
  if (event.key === 'ArrowRight') {
    event.preventDefault(); moveTab(index, 1);
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault(); moveTab(index, -1);
  } else if (event.key === 'Home') {
    event.preventDefault();
    const firstEnabled = props.items.findIndex(item => !item.disabled);
    activateIndex(firstEnabled >= 0 ? firstEnabled : 0);
  } else if (event.key === 'End') {
    event.preventDefault();
    const lastEnabled = props.items.map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => !item.disabled).at(-1)?.itemIndex ?? props.items.length - 1;
    activateIndex(lastEnabled);
  }
}
</script>

<template>
  <section v-bind="$attrs" :class="classNames('st-tabs', props.class)">
    <div class="st-tabs__list" role="tablist" :aria-label="props.label">
      <button v-for="(item, index) in props.items" :key="ids[index]" :ref="el => setTabRef(el, index)"
        :id="`${uid}-tab-${ids[index]}`" type="button" role="tab"
        :class="classNames('st-tabs__tab', ids[index] === current && 'st-tabs__tab--active')"
        :aria-selected="ids[index] === current" :aria-controls="`${uid}-panel-${ids[index]}`"
        :tabindex="ids[index] === current ? 0 : -1" :disabled="item.disabled"
        @click="activateIndex(index)" @keydown="keydown($event, index)">
        <slot name="tab-label" :item="item" :index="index">{{ item.label }}</slot>
      </button>
    </div>
    <div :id="`${uid}-panel-${ids[activeIndex]}`" class="st-tabs__panel" role="tabpanel" :aria-labelledby="`${uid}-tab-${ids[activeIndex]}`">
      <slot name="panel" :item="active">{{ active?.content }}</slot>
    </div>
  </section>
</template>
```

Badge keeps all public types and its span, classes, slot and attrs. Tabs keeps selection precedence, disabled tabs, focus and keyboard logic, while replacing its counter with useId and adding scoped tab-label/panel slots for rich content. The scalar prop fallbacks remain. The Badge example was executed through all six gates; Tabs is a worked recipe example rather than the required proof conversion.

## Review rules shared with dataviz ports

- Native Vapor must export every runtime component in the Classic barrel. The
  build rejects a legacy dependency that would omit a component. Compare the
  built runtime namespaces and packed consumers after every conversion lane.
- New multiword slots use kebab-case. Retain pre-existing camelCase names as
  deprecated aliases when adding the canonical spelling; forward scoped slot
  payloads through every intermediate host. Record every migration in
  CONTRACT-CHANGES.md, including prop optionality and slot-over-prop precedence.
- Slot-only content must expose its wrapper and preserve related state. Include
  error-slot presence in aria-invalid decisions, accessible naming, help/error
  visibility and placeholder styling. Read dynamic slot presence in the render
  path; test slot addition/removal without changing a scalar prop.
- Exercise strings, numbers, empty strings and slot-only markup. Rich fixture
  inputs pair legacyProps VNodes with template slots, without placeholder scalar
  props. Scalar compatibility paths use scalarContent instead of serializing a
  VNode object. Keep explicit nullish/empty-string precedence when it was public.
- K25 checks attrs ownership, cached spreads/destructures, module counters,
  duplicate callback/emit paths and new slot spelling with the TypeScript AST.
  Its checks apply to all SFCs and to extracted TypeScript helpers, including
  dataviz. The legacy renderer allow-list cannot grow.
- G5 compares complete mounted DOM, including teleports and live form/media
  properties, against the independently mounted Classic fixture. It canonicalizes
  Vue markers, generated IDs, CSS declarations and class token redundancy; text,
  ARIA, structure, attributes and reference relationships remain significant.
  A changed-DOM negative control must fail. Check unmount cleanup for every fixture.
- Run all six gates on every converted component, the complete package test
  projects, both-runtime review regressions, vue-tsc, K25 with its negative cases,
  component-index, licensing and real packed consumers before calling a lane done.
