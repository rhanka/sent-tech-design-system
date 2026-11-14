# Spike S1 — single JSX source to Preact + React

Lot S1 of the DS programme plan (workstream W1), gate of decision K2 and input
of lot P0 and workstream W3. Branch `feat/preact-s1-spike`, from `origin/main`
`81083403`. Measured on 2026-11-14, Node 22.22.1, jsdom only: no browser was
run, locally or by this spike's own checks.

## 1. Verdict

**K2 is a go.** One JSX tree, authored for Preact, compiles to a Preact package
and to a React tree by rewriting three import specifiers and swapping three
adapter files. For the eight modules ported:

- the React emission changes **17 lines out of 805** (import specifiers only);
- **13 unmodified test files of `components-react` (325 tests) pass** against
  the emitted modules, together with hand-written React components that depend
  on them;
- the emitted React prop and component types are **type-identical** to the
  ones `@sentropic/design-system-react` publishes (checked by the compiler);
- the Preact build passes 49 tests on Preact core, with `preact/compat`
  reached by one module, for portals only.

The opt-out budget of K2 (10 hand-kept twins) is untouched: 0 of 8 modules
needed a twin. The conditions attached to the go are the open items of
section 9; the largest is the SVG attribute casing of the chart modules.

**Measured port rate: 70 s per module (8 modules, mean 79 lines), 0.88 s per
React source line**, Preact tests included, review and CI excluded.
**Revised W3 estimate: about 93 h instead of 157 h** (section 8), the chart
class being `unverified`.

## 2. What was built

`packages/components-preact` (`@sentropic/design-system-preact`, not published):

| Module | Witness for | Source in `components-react` |
|---|---|---|
| `Button` | `forwardRef` | `Button.tsx` |
| `Input` (the DS text field) | controlled value, `forwardRef`, `useId` | `Input.tsx` |
| `Modal` (the DS dialog) | overlay, focus trap, scroll lock, Escape | `catalog.tsx` |
| `Tabs` | keyboard roving (arrows, Home, End, disabled, wrap) | `catalog.tsx` |
| `SelectableRow` | `forwardRef` + two contexts | `SelectableRow.tsx` |
| `ChatComposer` | chat primitive, per-keystroke text input | `catalog.tsx` |
| `Portal` | portal through the compat shim | `Portal.tsx` |
| `ThemeProvider` | insertion effect | `ThemeProvider.tsx` |

The first six are the components requested for the spike. `Portal` and
`ThemeProvider` were added as witnesses: the React `Modal` renders its backdrop
in place and uses no portal, and no requested component uses an insertion
effect. `components-react` has no `Dialog` or `TextField`; `Modal` and `Input`
are the DS names.

Toolchain, exact pins: `preact` 10.29.8, `@preact/signals` 2.11.4,
`lucide-preact` 0.562.0, `@preact/preset-vite` 2.10.6,
`@testing-library/preact` 3.2.6, `@babel/core` 7.29.7, `vite` 8.3.4, `vitest`
4.1.11, `jsdom` 27.4.0, `typescript` 5.9.3; React leg on `react` / `react-dom`
19.3.0, `@testing-library/react` 16.3.2, `@types/react` 19.3.0, `lucide-react`
0.562.0.

Licences: 34 packages enter `package-lock.json`, all development-only except
`lucide-preact`: MIT (25), BSD-2-Clause (7), ISC (2). No copyleft. One existing
entry moves: `@testing-library/dom` 10.4.1 → 10.4.2 (required by
`@testing-library/preact`). The runtime closure of the package is
`lucide-preact` (ISC) plus first-party `@sentropic/design-system-themes`;
`npm run notices:generate` wrote its `LICENSE.THIRD-PARTY.md` and
`npm run licensing:check` passes on 23 publishable packages.

## 3. How the emission works

`scripts/emit-react.mjs` copies `src/` to `.react-emit/src/` with two
operations:

1. **Specifier rewrite** in component modules: `preact` → `react`,
   `preact/hooks` → `react`, `lucide-preact` → `lucide-react`. Specifiers are
   located with the TypeScript scanner, so a specifier quoted in a comment is
   never touched. Nothing else in a component module changes.
2. **Adapter swap**: `compat.ts`, `runtime.ts` and `signals.ts` are replaced by
   the files of the same name in `react/`.

Two gates make the rule enforceable rather than a convention:

- the emission **fails** on a runtime-specific specifier in a component module
  (`preact/compat`, `@preact/signals`, `react`, …);
- the emitted tree is type-checked against `@types/react`, so any name imported
  from `preact` that React does not export fails `npm run check`.

`scripts/emit-react.test.mjs` pins the rewrite, the refusals and the adapter
allowances (11 cases), including an adapter other than `compat.ts` that tries
to import `preact/compat`.

**Module-level switch.** The React leg (`vitest.react.config.ts`) resolves
`./<Module>.js`, for an importer inside `components-react/src`, to the emitted
module of that name. The barrel, the tests and the hand-written dependents
(`SelectableList`, `NavItem`, `TimeRangePicker`, `Popper`, the menus) then all
share the emitted module, as they will once the hand-written file is deleted.
This is the mechanism by which lots P1–P7 can switch modules batch by batch
while the React suite keeps running; `react/provenance.test.ts` proves the
tests reach the emission and not the hand-written twin.

## 4. What works

| Claim | Evidence |
|---|---|
| Same source, both runtimes | `npm run build`: `dist/` (Preact) and `.react-emit/dist/` (React), both with declarations |
| Emission is a specifier rewrite | 17 rewritten lines over 805 emitted lines in 11 modules; 3 adapters swapped |
| Existing React tests pass on the emission | 13 files, 325 tests: `behavior`, `catalog`, `index`, `svelte-api-parity`, `SelectableRow`, `SelectableList`, `Positioning`, `GroupsIdentity`, `NavActionStack`, `NavItem`, `TimeRangePicker`, `TimeRangePicker.states`, `MenuPopover` |
| React public API unchanged | `react/api-parity.ts`: strict type equality of 10 prop types and 8 component signatures against `@sentropic/design-system-react`; the check fails when a type is swapped (verified) |
| Preact build behaves | 49 tests: DS class contract, a11y attributes, keyboard, focus, scroll lock, refs, context, portal, signals |
| Packed package imports from the registry | `node scripts/dist-import-closure.mjs --workspaces=@sentropic/design-system-preact` |
| Source stays close to React | 197 of 5,169 tokens of the React sources touched (3.8 %): `React.x` → named imports, `React.ReactNode` → `ComponentChildren`, event type names |

**API parity.** Props, callbacks and a11y attributes are those of
`components-react`. Against the Vue SFCs the mapping is the existing one
(callback prop ↔ emitted event, `ReactNode` prop ↔ slot), unchanged by the port:

| Component | Props kept | Callback ↔ Vue event |
|---|---|---|
| `Button` | `variant`, `size`, `type`, native button attributes | native |
| `Input` | `label`, `helperText`, `errorText`, `invalid`, `size`, `id`, native input attributes | `value` + `onInput` ↔ `modelValue` + `update:modelValue` |
| `Modal` | `open`, `title`, `description`, `footer`, `closeLabel` | `onClose` ↔ `close`; `footer` ↔ slot |
| `Tabs` | `items`, `activeValue`, `activeId`, `label` | `onChange` / `onchange` ↔ `change` |
| `SelectableRow` | `selected`, `disabled`, `value`, `href`, `role`, `accentBar`, `leading`, `trailing`, `caption` | `onSelect` ↔ `select` |
| `ChatComposer` | `value`, `placeholder`, `submitLabel` | `onSubmit` ↔ `submit` |

One divergence exists on `main` and is left as found: the standalone
`SelectableRow` defaults to `role="button"` in React and to `role="option"` in
Vue. The Preact port follows React, whose tests assert it.

## 5. What breaks or differs

### 5.1 The five questions of the lot

| Topic | Result | Detail |
|---|---|---|
| **`forwardRef`** | works, on Preact core | Preact 10 strips `ref` from the props of a function component. `runtime.ts` restores it through the `options.__b` hook, the mechanism `preact/compat` uses and the hook `@preact/signals` already relies on. 29 files of `components-react` use `forwardRef`; with the adapter they are ordinary modules. Object and callback refs, a merged inner ref (`SelectableRow`) and release on unmount are tested |
| **Portals** | work, need `preact/compat` | `createPortal` is built on Preact internals and is the one API kept in `compat.ts`. Context, state and unmount cleanup cross the portal. **Difference:** Preact events follow the DOM tree, so a click inside a portal does not reach a handler of the component-tree parent; React bubbles it. One module uses `createPortal` (`Portal.tsx`); its dependents must not rely on that bubbling |
| **Context** | works unchanged | `createContext` / `useContext` have the same names in both runtimes. Constraint for a partial emission: a module that defines a context must be switched for all its dependents at once, which the module-level switch does (`SelectableList`, hand-written, drives the emitted `SelectableRow` through its two contexts in the React leg) |
| **External stores** | adapter ready, no user today | `useSyncExternalStore` appears in 0 non-test file at `81083403` (the plan counted 1 at `a91b59de7`). `runtime.ts` carries a core-only implementation with React's signature, tested on subscribe, update and unsubscribe |
| **Insertion effects** | work, with a timing difference | 1 user (`ThemeProvider`). Preact has no insertion phase; the adapter maps it to the layout phase, as `preact/compat` does. **Difference:** a child layout effect runs before the provider's effect, so it does not see the injected stylesheet on first mount; in React it does. Recorded by a test; to be looked at in browser acceptance for components that measure layout on mount under a `ThemeProvider` |

### 5.2 Found on the way

Each row is an executable fact (`src/runtime-gaps.probe.test.tsx` or a
component test) and a count over the 226 non-test files of
`packages/components-react/src`.

| Finding | Reach | Treatment |
|---|---|---|
| **SVG attribute casing.** Preact core writes `strokeWidth`, `textAnchor`, `clipPath` verbatim; SVG attribute names are case-sensitive, so a browser ignores them | **81 files, 441 uses** (74 of the 92 `data` modules) | Not needed by the eight modules. A core-only `options.vnode` hook of 12 lines translates the presentation attributes and keeps the genuine camelCase ones (`viewBox`, `textLength`, `clipPathUnits`): verified by a probe test, **not** part of the package. P0 decides between that hook and `preact/compat` (section 6) |
| **Text input events.** `onChange` on a text control fires on the native change event in Preact, on every keystroke in React; React also requires `onChange` on a controlled field | `onChange=` in 6 files, 25 uses | `textInput(handler)` in the runtime adapter returns `{ onInput }` for Preact and `{ onChange }` for React. Select, checkbox and radio need nothing |
| **Focus events.** `onFocus` / `onBlur` on a container do not see a child's focus in Preact; React bubbles them | 9 files, 15 uses | Review each use in its lot; `onFocusIn` / `onFocusOut` where bubbling is relied on. Not needed by the eight modules |
| **`React.` namespace.** Every module is written `React.useState`, `React.ReactNode` | 135 files, 1,235 uses | Mechanical: named imports. Candidate for a codemod in P0 |
| **Type names.** `ReactNode`, event types, `ElementType` differ; `*HTMLAttributes`, `CSSProperties`, `Ref`, `Context` have the same name in both | `PointerEvent` 75, `KeyboardEvent` 30, `MouseEvent` 8, `ElementType` 8 | Aliases in `runtime.ts` (two event aliases today; about six more to add) |
| **Signal-typed attributes.** Preact types every DOM attribute as "value or signal", so a destructured `className` is not a plain string | every module that reads `className` | `classNames` accepts and reads a `{ value }` holder; one neutral module, no adapter |
| **`class`.** Preact consumers write `class`; the port keeps the React spelling `className` | every module | Open: accepting `class` is a semantic-mapping row for P0 |
| **Signal bindings are asynchronous.** `@preact/signals` 2.x flushes DOM bindings and signal-driven re-renders after the write | tests only | Tests wait (`waitFor`); no component change |
| **Two Preact majors.** The workspace already hoists `preact` 10.29.8 for `@bpmn-io/diagram-js-ui`. Preact 11 nested under the package while `@preact/signals`, `lucide-preact` and the testing library bound to the hoisted 10: two instances | workspace | Pinned to 10.29.8, the version already in the lockfile, paired with `lucide-preact` 0.562.0 = the `lucide-react` version, so both outputs draw the same glyphs |
| **Preact 11.2.0** (same source, isolated project, outside the repository) | 45 of 49 tests pass | The adapter and all eight modules run. Differences: unitless numeric styles no longer get `px` (**71 files** use inline styles), effect cleanup on unmount is flushed later (3 test expectations), `InputHTMLAttributes` is stricter (1 type error). Version decision for P0 |
| **Test environment.** `TimeRangePicker.states.test.tsx` reads `src/styles.css` relative to the working directory | 1 test file | The React leg runs with `components-react` as working directory |

Inline styles (`px` appended like React), `key`, callback refs, `useId`,
`createElement` with a dynamic tag and `displayName` needed nothing.

## 6. Compat-shim decision (K3)

`preact/compat` is one module with top-level side effects and no
`sideEffects: false`: a bundler keeps all of it as soon as one export is used.

| Island (minified, everything included) | Bytes | gzip |
|---|---|---|
| `Button`, core-only adapter | 12,689 | 5,253 |
| `Button`, `forwardRef` from `preact/compat` | 18,165 | 7,218 |
| Six components, core-only adapter | 31,243 | 11,782 |
| Six components, `forwardRef` from `preact/compat` | 36,742 | 13,669 |
| Six components + `Portal` (compat for `createPortal`) | 37,791 | 14,060 |

**Decision taken in the spike:** K3 is kept and tightened. `compat.ts` exports
`createPortal` only; `forwardRef`, `useInsertionEffect`, `useSyncExternalStore`
and `textInput` live in `runtime.ts` on Preact core. Routing `forwardRef`
through compat would add 5.5 kB (1.9–2.0 kB gzip, +37 % on a `Button` island) to
every island, since 29 basic modules use it. With the split, compat is paid only
by an island that mounts a portal (+2.3 kB gzip, measured).

Cost of the decision: `runtime.ts` depends on one mangled Preact hook
(`options.__b`), verified on 10.29.8 and on 11.2.0. If P0 chooses compat for
the SVG casing (section 5.2), the split loses its purpose for chart islands and
the simpler choice there is compat everywhere; the 12-line hook keeps it.

## 7. Signals at the edges (K4)

- A prop typed `MaybeSignal<T>` accepts a value or a signal. The component
  reads it once: `useValue` in the render body (tracked, the component
  re-renders), `unwrap` for a seed or a handler (untracked). Hooks inside.
  Used by `Modal.open`, `Tabs.activeValue`, `ChatComposer.value`.
- Attributes spread onto an intrinsic element take a signal with no code:
  `<Button disabled={signal}>` and `<Input value={signal}>` update the DOM
  without re-rendering the host (tested, render count 1).
- In the React emission `MaybeSignal<T>` is `T` and the adapter is the
  identity: no dependency, no run-time cost, public props unchanged. Signal
  props are therefore a Preact-port row of the semantic mapping (PLAN 2.9).
- A component that reads a signal prop imports `@preact/signals`; it is in the
  11.8 kB of the six-component island.

## 8. Measurements and revised W3 estimate

### 8.1 Port

| Module | React lines | Preact lines | React tokens touched | Emission rewrites | Preact tests (lines) |
|---|---|---|---|---|---|
| `Button` | 26 | 27 | 4 / 212 (1.9 %) | 1 | 5 (69) |
| `Input` | 55 | 58 | 10 / 341 (2.9 %) | 2 | 6 (92) |
| `Modal` | 48 | 69 | 8 / 444 (1.8 %) | 3 | 6 (98) |
| `Tabs` | 95 | 108 | 11 / 907 (1.2 %) | 2 | 5 (96) |
| `SelectableRow` | 252 | 245 | 121 / 2,122 (5.7 %) | 3 | 7 (176) |
| `ChatComposer` | 35 | 58 | 11 / 340 (3.2 %) | 3 | 4 (76) |
| `Portal` | 88 | 76 | 22 / 559 (3.9 %) | 1 | 5 (99) |
| `ThemeProvider` | 35 | 37 | 10 / 244 (4.1 %) | 1 | 3 (53) |
| **Total** | **634** | **678** | **197 / 5,169 (3.8 %)** | **16** | **41 (759)** |

Shared code: `internal.ts` 97 lines (helpers private to `catalog.tsx` in
React), `classNames.ts` 14, adapters 155 (Preact) / 50 (React twins),
emission script 174, React-leg config 69. The three modules taken out of
`catalog.tsx` gain lines because their one-line signatures were wrapped.

**Wall time**, one builder session, each figure covering source, Preact tests
and both legs green. The timestamps were taken between tool calls and do not
separate every module, so four figures cover a group:

| Step | Seconds |
|---|---|
| Adapters, emission script, both test harnesses | 162 |
| `Button` (first port: includes harness fixes — scanner offsets, barrel redirect, working directory, asynchronous signal flush) | 209 |
| `Input` + `Modal` + `internal.ts` | 100 |
| `Tabs` | 62 |
| `SelectableRow` + `ChatComposer` + `Portal` | 139 |
| `ThemeProvider` + adapter tests | 49 |
| **Eight modules** | **559** |

Rate: **70 s per module; 50 s per module over the seven that followed the
first; 0.88 s per React source line** (634 lines in 559 s), with 1.2 lines of Preact test
written per source line. All eight modules passed the existing React tests on
their first run; every correction was in the harness or in a new Preact test.

### 8.2 Bundles

Six requested components, minified by Vite 8, `preact` 10.29.8 vs `react` 19.3.0:

| Bundle | Preact | React |
|---|---|---|
| Component code only (runtime external) | 8,139 B / 3,061 gzip | 7,784 B / 2,909 gzip |
| Full island (runtime, icons, one render call) | **31,243 B / 11,782 gzip** | **228,493 B / 70,634 gzip** |
| `Button` island | 12,689 B / 5,253 gzip | 219,157 B / 67,544 gzip |

Component code is the same within 5 %: the Preact figure carries the adapter
(`forwardRef`, `textInput`) and the signals read, which React gets from its
runtime. The island is 7.3 times smaller in bytes and 6.0 times in gzip.
`npm run build && npm run measure` reproduces the table.

### 8.3 Extrapolation to W3

The eight modules average 79 lines; the 226 non-test files of
`components-react` hold 40,146 lines (178 per file; 80 files are two-line
re-exports of `catalog.tsx`, which holds 8,451 lines and 91 components). The
projection is therefore by **lines per lot**, not by module count: by module
count the rate would give 4.4 h for the tree, an under-estimate.

Lines per lot are derived from the component index categories at `81083403`,
the lines of `catalog.tsx` being spread over its 80 re-export modules.
Projected build hours = lines × 0.88 s × a factor for what the sample did not
exercise. The factor is a judgment, not a measurement: **2** for the classes
the spike sampled (larger and stateful modules, fast-gate integration), **3**
for the chart class, which the spike did not sample and which depends on the
SVG decision.

| Lot | Content | Lines | Plan (h) | At measured rate (h) | Factor | Revised (h) |
|---|---|---|---|---|---|---|
| P1 | layout + action + feedback, 37 modules | 3,045 | 10 | 0.7 | 2 | 1.5 |
| P2 | form, 27 modules | 3,612 | 12 | 0.9 | 2 | 1.8 |
| P3 | navigation + overlay, 31 modules | 4,022 | 14 | 1.0 | 2 | 2.0 |
| P4a + P4b | data, 92 modules, 74 with SVG casing | 24,249 | 24 | 5.9 | 3 | 17.8 |
| P4c | chat + other, shells, helpers | 5,057 | 8 | 1.2 | 2 | 2.5 |
| P5 | hard set | — | 10 | — | — | 4 |
| P6 | `dataviz-preact`, 128 files | 9,562 | 20 | 2.3 | 2 | 4.7 |
| **Conversion lots** | | **49,547** | **98** | **12.1 + P5** | | **34.3** |
| P0, P7–P12 | not measured by S1 | | 59 | | | 59 |
| **W3** | | | **157** | | | **≈ 93** |

P5 shrinks because the spike delivered its mechanisms (`Portal`,
`ThemeProvider`, the adapters, three of the 29 `forwardRef` modules); what
remains is the SVG, focus and `class` decisions applied to their modules.
With a factor of 1 everywhere W3 would be about 75 h; that floor is stated for
reference and is not proposed.

Plan rates versus measured: Preact from React 15–16 min per module in the plan;
measured 1.2 min per module of 79 lines, i.e. 2.6 min for the average module of
178 lines, 5–8 min with the factor. `dataviz-react` files average 75 lines and
3 of 128 carry SVG casing; the plan's 9 min per file becomes about 2 min.

For L1.4:

- **Grade.** The rate is demonstrated for leaf, form, overlay, navigation and
  chat modules: P1, P2, P3 and P4c can be considered for grade M under the
  plan's grade rule. It is **not** demonstrated for charts or for the largest
  stateful modules: P4a, P4b and P6 stay H until a chart witness exists.
- **Batching.** At 1.5–2.5 build hours, P1, P2, P3 and P4c are each smaller
  than the 2 h per-lot overhead of the schedule model. Merging them is worth
  evaluating against the PR-size limit.
- **Not in these hours:** review, CI and integration (the per-lot overhead of
  PLAN 5.3), the fast-gate harness itself (L1.2) and browser acceptance.

## 9. Handed to P0

1. **SVG casing**: choose the core-only hook or `preact/compat`; port one chart
   as the witness of the `data` class before P4 is sized.
2. **Preact major**: 10.29.8 (verified, shared with the BPMN canvas) or 11
   (45/49 on the same source; numeric styles and effect timing to convert). A
   second major cannot be hoisted beside the first in this workspace.
3. **Codemod** for the `React.` namespace and type names (3.8 % of tokens, all
   of one kind in the sample).
4. **Runtime adapter**: remaining event-type aliases, `ElementType`, a decision
   on `class`, focus-event guidance.
5. **Icons**: the `lucide-preact` ↔ `lucide-react` rewrite needs the two
   packages on the same version; decision K7 (one DS `Icon` on neutral `lucide`
   data) would remove the pair and the third specifier.
6. **Preact-side verification**: the spike wrote unit tests (1.2 lines per
   source line). Whether W3 does the same or relies on the fast gates changes
   the rate and is not decided here.
7. **Packaging**: `styles.css` copy and byte-identity check (K8), parity key
   `preact` in the component index, contract extraction, publish workflow, peer
   ranges. The emitted tree currently lives in `.react-emit/`; moving it into
   `packages/components-react` is the switch of P8.
8. **Not covered by S1**: any browser rendering, SSR and hydration, charts,
   the largest stateful modules (`DataTable`, `TimeRangePicker`),
   `dataviz-react`.

## 10. Reproduce

```bash
cd packages/components-preact
npm run check        # both type-checks + React props parity
npm test             # 11 emitter cases, 49 Preact tests, 334 on the React emission
npm run build && npm run measure
node ../../scripts/dist-import-closure.mjs --workspaces=@sentropic/design-system-preact
```
