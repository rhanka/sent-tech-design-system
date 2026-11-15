# Spike S1 — single JSX source to Preact + React

Lot S1 of the DS programme plan (workstream W1), gate of decision K2 and input
of lot P0 and workstream W3. Branch `feat/preact-s1-spike`, from `origin/main`
`81083403`. Measured on 2026-11-14, Node 22.22.1, jsdom only: no browser was
run, locally or by this spike's own checks.

Every count and every hour of this document is printed by a script of
`packages/components-preact` and committed as raw output under
`packages/components-preact/measurements/` (section 10). A figure that no
committed input supports is marked `not measured`, `unverified` or
`missing source`.

## 1. Verdict

**K2 is a go.** One JSX tree, authored for Preact, compiles to a Preact package
and to a React tree by rewriting three import specifiers and swapping three
adapter files. For the eight modules ported:

- the React emission changes **17 lines out of 818** (import specifiers only);
- **13 unmodified test files of `components-react` (325 tests) pass** against
  the emitted modules, together with hand-written React components that depend
  on them;
- the emitted React prop types, component types (parameters, return type and
  static members) and exported values are **type-identical** to the ones
  `@sentropic/design-system-react` publishes (checked by the compiler);
- the Preact build passes 59 tests on Preact core, with `preact/compat`
  reached by one module, for portals only.

The opt-out budget of K2 (10 hand-kept twins) is untouched: 0 of 8 modules
needed a twin. The conditions attached to the go are the open items of
section 9; the largest is the SVG attribute casing of the chart modules.

**Measured port rate, one builder session (n = 1): 611 s for the eight modules
by file times, i.e. 76 s per module (mean 79 lines) and 0.97 s per React source
line**, Preact tests included, review and CI excluded. The session's own step
log gave 559 s (70 s per module, 0.89 s per line); that log was not retained
(section 8.1).

**Revised W3 estimate derivable from S1: about 134 h instead of 157 h (range
131–136 h).** Only the component-index categories in which the spike ported a
module are revised: action (P1), form (P2), navigation and overlay (P3), chat
and `other` (P4c) go from a 28.1 h plan share to 4.6 h (range 2.2–6.8 h). The
categories of those lots with no ported module (layout and feedback in P1, the
modules without a catalogue entry in P4c) keep their share of the plan hours
(15.9 h). The data modules (P4a, P4b: 24 h), `dataviz-react` (P6: 20 h) and the
hard set as a lot (P5: 10 h) are **not measured** and keep their plan hours, as
do the lots S1 does not address (P0, P7–P12: 59 h). The first version of this
document announced about 93 h by applying the leaf rate to the lots that were
not sampled, and the second about 121 h by revising whole lots from one ported
module; both figures are withdrawn (section 8.3).

## 2. What was built

`packages/components-preact` (`@sentropic/design-system-preact`, `private`,
not published):

| Module | Witness for | Source in `components-react` |
|---|---|---|
| `Button` | `forwardRef` | `Button.tsx` |
| `Input` (the DS text field) | controlled value, `forwardRef`, `useId` | `Input.tsx` |
| `Modal` (the DS dialog) | overlay, focus trap, scroll lock, Escape | `catalog.tsx` |
| `Tabs` | keyboard roving (arrows, Home, End, disabled, wrap) | `catalog.tsx` |
| `SelectableRow` | `forwardRef` + two contexts, focus inside a row | `SelectableRow.tsx` |
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
`lucide-preact` (ISC) plus first-party `@sentropic/design-system-themes`.

**Manifest.** The package is `"private": true` with no `publishConfig`: npm
refuses to publish it, by a workflow or by a manual `npm publish --workspaces`.
The repository gates that follow publishable packages therefore skip it:
`npm run licensing:check` and `npm run notices:generate` run on 22 publishable
packages, as on `main`, and the package carries no generated
`LICENSE.THIRD-PARTY.md`. Removing the flag, with the notices, the licensing
count and the publish workflow, belongs to P0 (section 9). `sideEffects` lists
`dist/runtime.js` (it installs a Preact `options` hook when loaded) and
`dist/signals.js` (it imports `@preact/signals`, which installs its own): a
bundler must keep both even when none of their exports is used.

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
| Emission is a specifier rewrite | 17 rewritten lines over 818 emitted lines in 11 modules; 3 adapters swapped |
| Existing React tests pass on the emission | 13 files, 325 tests: `behavior`, `catalog`, `index`, `svelte-api-parity`, `SelectableRow`, `SelectableList`, `Positioning`, `GroupsIdentity`, `NavActionStack`, `NavItem`, `TimeRangePicker`, `TimeRangePicker.states`, `MenuPopover` |
| The adapter paths no existing React test reaches are exercised on the emission | 3 files of this package, 14 tests: `react/provenance.test.ts` (9), `react/ChatComposer.react.test.tsx` (3: typing through the React `textInput` twin, submit enabled, `onSubmit({ value })`), `react/SelectableRow.react.test.tsx` (2: focus of a child moves the roving tab stop of the hand-written `SelectableList`) |
| React public API unchanged | `react/api-parity.ts`: strict type equality against `@sentropic/design-system-react` of the 13 exported types, of the 8 components as whole types (`typeof`: parameters, return type, static members) and of the 2 other exported values (`SelectableListContext`, `resolvePortalTarget`), plus a check that the emitted barrel exports no value the hand-written package does not. The check fails when a type is swapped (verified). The first version compared `Parameters<>` for five components; the whole-type comparison is what the return type of `Portal` needed: inferred, it was `React.JSX.Element \| null` (`ReactElement<any, any>`) against the published `React.ReactElement \| null`. `Portal` is now annotated `ComponentElement \| null`, an alias of the runtime adapter (`VNode` in Preact, `ReactElement` in React). `SelectableListVersionContext`, internal to `SelectableRow` in the React package, is no longer in the barrel |
| Tests are type-checked | `npm run check` compiles the 10 test files of `src/` (`tsconfig.test.json`) and the 3 of `react/`; they were excluded from every `tsc` project before, which hid two errors (a `Tabs` test, below, and a store test whose cleanup returned a number) |
| Preact build behaves | 59 tests: DS class contract, a11y attributes, keyboard, focus, scroll lock, refs, context, portal, signals, adapters, runtime probes |
| Tarball holds the build only | `npm pack --dry-run`: 59 entries = `dist/` plus `LICENSE`, `README.md`, `package.json` (the package stays `private`) |
| Source stays close to React | 170 of 3,521 code tokens of the React sources touched (4.8 %, comments excluded): `React.x` → named imports, `React.ReactNode` → `ComponentChildren`, event type names, three adapter calls |

**API parity.** Props, callbacks and a11y attributes are those of
`components-react`. Against the Vue SFCs the mapping is the existing one
(callback prop ↔ emitted event, `ReactNode` prop ↔ slot), unchanged by the port:

| Component | Props kept | Callback ↔ Vue event |
|---|---|---|
| `Button` | `variant`, `size`, `type`, native button attributes | native |
| `Input` | `label`, `helperText`, `errorText`, `invalid`, `size`, `id`, native input attributes | `value` + per-keystroke handler ↔ `modelValue` + `update:modelValue`. The handler is `onInput` on Preact and `onChange` in the React emission; on Preact `onChange` is the native commit event, which is what the Vue `change` event is |
| `Modal` | `open`, `title`, `description`, `footer`, `closeLabel` | `onClose` ↔ `close`; `footer` ↔ slot |
| `Tabs` | `items`, `activeValue`, `activeId`, `label` | `onChange` / `onchange` ↔ `change` |
| `SelectableRow` | `selected`, `disabled`, `value`, `href`, `role`, `accentBar`, `leading`, `trailing`, `caption` | `onSelect` ↔ `select`; `leading`, `trailing`, `caption` ↔ slots |
| `ChatComposer` | `value`, `placeholder`, `submitLabel` | `onSubmit` ↔ `submit`; `submitLabel` ↔ prop or `submit-label` slot |

**Divergences between the React sources and the Vue SFCs.** Found by reading
both trees at `81083403`. All of them exist on `main`, none comes from the
port, and all are left as found: the Preact port follows React, whose tests
assert its behaviour. None is exercised by a Vue test of this spike
(`unverified` on the Vue side beyond the source). Each is a row for the
semantic-mapping manifest (PLAN 2.9):

| Component | React and the Preact port | Vue SFC |
|---|---|---|
| `SelectableRow` | standalone `role` defaults to `"button"` (`aria-pressed`) | defaults to `"option"` (`aria-selected`) |
| `SelectableRow` | the focus of a focusable child in `leading` / `trailing` reaches the row and moves the roving tab stop (React `onFocus` bubbles; Preact through `focusWithin`, section 5.2) | `@focus` on the row is the native event, which does not bubble: a child's focus does not move the tab stop |
| `Modal` | `aria-label` is always written after the rest props as `text(title) \|\| "Modal"`: a consumer `aria-label` is discarded, `aria-label="Modal"` is written even with a consumer `aria-labelledby`, and a JSX `title` yields `aria-label="[object Object]"` | `title`, else nothing when `aria-labelledby` is set, else the consumer's `aria-label`, else `"Modal"` |
| `Modal` | focuses the close button on open and keeps Tab / Shift+Tab inside the dialog | no initial focus and no focus trap: Escape and scroll lock only |
| `Modal` | `title` and `description` are renderable nodes | strings, with no slot |
| `Tabs` | uncontrolled default is `idFrom(first ?? {}, 0, "tab")`: index 0 whatever the position of the first enabled item. When that item is not at index 0 and has neither `id` nor `value`, the default does not designate it and the panel of the leading disabled tab is shown | uses the real index of the first enabled item |
| `Tabs` | `TabItem.label` is required; `label` and `content` are renderable nodes | `label` is optional; both are `string \| number`, with `tab-label` and `panel` slots |
| `Input` | when the field is not invalid, a consumer `aria-invalid` passes through | `aria-invalid` is written as `undefined` after the attributes: a consumer value is dropped |
| `Input` | `label`, `helperText`, `errorText` are renderable nodes; `placeholder`, `disabled`, `readOnly` are native attributes | strings plus `label`, `helper-text`, `error-text` slots; `placeholder`, `disabled`, `readonly` are declared props; `input`, `change`, `focus`, `blur` are declared events |
| `Button`, `Input`, `SelectableRow` | the ref is forwarded to the DOM element | a template ref gives the component instance |
| `ChatComposer` | send icon drawn with stroke width 2 | `Icon` default stroke width 2.25 (rendering, relevant to the normalised-DOM comparison of W3) |

**Defect carried over from `components-react`: `TabsProps["onChange"]`.**
`TabsProps` is `HTMLAttributes<HTMLElement> & { onChange?: (value: string) =>
void; … }` (`catalog.tsx` at `81083403`, kept as is in `src/Tabs.tsx`), without
the `Omit<…, "onChange">` that `SelectableRowProps` and `ChatComposerProps`
apply to `onSelect` and `onSubmit`. The property is therefore the intersection
of the DOM handler and the value callback: a callback typed `(value: string)
=> void` is rejected by `tsc` in both runtimes, and an untyped one receives
`string | Event`. Runtime behaviour is unaffected (the value callback is the
one called). It exists on `main`; it is not fixed here because the fix changes
a published type of `@sentropic/design-system-react` and the type-parity check
would then have to diverge from the published package. `src/Tabs.test.tsx`
casts its callback, with a comment. The fix (`Omit` in both trees at once)
is handed to P0 (section 9).

`Button` has no other divergence. The two witnesses differ in behaviour, not
in props: the Vue `Portal` is a `Teleport` (no in-place first render, no
fallback to `<body>` when the selector matches nothing, events follow the DOM),
and the Vue `ThemeProvider` removes the stylesheet on unmount even when another
provider of the same theme created it, where React removes only what it
created.

## 5. What breaks or differs

### 5.1 The five questions of the lot

| Topic | Result | Detail |
|---|---|---|
| **`forwardRef`** | works, on Preact core | Preact 10 strips `ref` from the props of a function component. `runtime.ts` restores it through the `options.__b` hook, the mechanism `preact/compat` uses and the hook `@preact/signals` already relies on. 29 files of `components-react` use `forwardRef`; with the adapter they are ordinary modules. Object and callback refs, a merged inner ref (`SelectableRow`) and release on unmount are tested |
| **Portals** | work, need `preact/compat` | `createPortal` is built on Preact internals and is the one API kept in `compat.ts`. Context, state and unmount cleanup cross the portal. **Difference:** Preact events follow the DOM tree, so a click inside a portal does not reach a handler of the component-tree parent; React bubbles it. One module uses `createPortal` (`Portal.tsx`); its dependents must not rely on that bubbling |
| **Context** | works unchanged | `createContext` / `useContext` have the same names in both runtimes. Constraint for a partial emission: a module that defines a context must be switched for all its dependents at once, which the module-level switch does (`SelectableList`, hand-written, drives the emitted `SelectableRow` through its two contexts in the React leg) |
| **External stores** | adapter ready, no user today | `useSyncExternalStore` appears in 0 non-test file at `81083403` (the plan counted 1 at `a91b59de7`). `runtime.ts` carries a core-only implementation with React's three-parameter signature (`subscribe`, `getSnapshot`, optional `getServerSnapshot`) and the structure of the `preact/compat` one: the subscription depends on `subscribe` only, the rendered value and the current `getSnapshot` live in a ref, and the store is re-read in the layout phase of every render and when the subscription starts. Tested: one subscription across four renders with an inline `getSnapshot`, no re-render on a notification without a change, a store written between render and subscription, a `subscribe` swap, unsubscription on unmount, and `getServerSnapshot` read only where there is no `document`. **Difference:** `getServerSnapshot` is read on the server render only; Preact core gives a hook no hydration flag, so the first client render reads `getSnapshot`, where React reads the server snapshot while hydrating |
| **Insertion effects** | work, with a timing difference | 1 user (`ThemeProvider`). Preact has no insertion phase; the adapter maps it to the layout phase, as `preact/compat` does. **Difference:** a child layout effect runs before the provider's effect, so it does not see the injected stylesheet on first mount; in React it does. Recorded by a test; to be looked at in browser acceptance for components that measure layout on mount under a `ThemeProvider` |

### 5.2 Found on the way

Each row is an executable fact (`src/runtime-gaps.probe.test.tsx` or a
component test) and a count over the 226 non-test modules of
`packages/components-react/src` at `81083403`, printed by
`scripts/port-metrics.mjs` from the TypeScript syntax tree
(`measurements/port-metrics.txt`, section "Reach").

| Finding | Reach | Treatment |
|---|---|---|
| **SVG attribute casing.** Preact core writes `strokeWidth`, `textAnchor`, `clipPath` verbatim on an element; SVG attribute names are case-sensitive, so a browser ignores them | **78 files, 396 uses on elements**: 75 of the 92 `data` modules (23,038 lines) and 2 of the 128 `dataviz-react` files. The same names occur 45 more times in 5 files as props of components (Lucide icons such as `<X strokeWidth>`, which Lucide maps itself); a component prop is handed over untouched and is not affected | Not needed by the eight modules. A core-only `options.vnode` hook of 12 lines translates the presentation attributes and keeps the genuine camelCase ones (`viewBox`, `textLength`, `clipPathUnits`): verified by a probe test, **not** part of the package. P0 decides between that hook and `preact/compat` (section 6) |
| **Text input events.** `onChange` on a text control fires on the native change event in Preact, on every keystroke in React; React also requires `onChange` on a controlled field | `onChange` on `<input>` / `<textarea>`: 3 files, 12 uses (25 `onChange` attributes in 6 files once other elements and component props are included) | `textInput(handler)` in the runtime adapter returns `{ onInput }` for Preact and `{ onChange }` for React. Both twins are exercised: `ChatComposer.test.tsx` on Preact, `react/ChatComposer.react.test.tsx` on the emission. Select, checkbox and radio need nothing |
| **Focus events.** `onFocus` / `onBlur` on a container do not see a child's focus in Preact; React bubbles them | 10 files, 18 uses: 13 attributes on elements (8 files), 2 props of a component (1 file), 3 object keys handed to `createElement` or spread (`SelectableRow.tsx`, `catalog.tsx`) | **Needed by one of the eight modules.** `SelectableRow` hands `onFocus: handleFocus` to `createElement`: in React the focus of a focusable child placed in `leading` / `trailing` (consumer content, forwarded by `NavItem`) bubbles to the row, which calls `list.focusRow(row)` and becomes the roving tab stop. On Preact core the row did not hear it. `focusWithin(handler)` in the runtime adapter returns `{ onFocusIn }` for Preact and `{ onFocus }` for React; `SelectableRow` uses it. Tests on both legs focus a button inside `trailing` and expect the tab stop to move (`SelectableRow.test.tsx`, `react/SelectableRow.react.test.tsx`); the Preact test fails on the previous `onFocus` binding. The first version of this document counted 9 files with a search for `onFocus=`, which misses object keys, and stated that no ported module was concerned. Remaining difference: a consumer `onFocus` is replaced by the row's handler in React and stays attached beside `onFocusIn` in Preact. The other nine files are reviewed in their lot; a `blurWithin` twin (`onFocusOut`) is added with its first user |
| **`React.` namespace.** Every module is written `React.useState`, `React.ReactNode` | 135 files, 1,234 uses | Mechanical: named imports. Candidate for a codemod in P0 |
| **Type names.** `ReactNode`, event types, `ElementType` differ; `*HTMLAttributes`, `CSSProperties`, `Ref`, `Context` have the same name in both | `ReactNode` 226, `PointerEvent` 75, `KeyboardEvent` 30, `MouseEvent` 8, `ElementType` 8 | Aliases in `runtime.ts` (three event aliases today; about five more to add) |
| **Signal-typed attributes.** Preact types every DOM attribute as "value or signal", so a destructured `className` is not a plain string | every module that reads `className` | `classNames` accepts a `{ value }` holder and reads its current value during render; one neutral module, no adapter. The component follows a later change of the signal only when `@preact/signals` is loaded in the page (its import installs the render hook that subscribes a component to the signals it reads); `classNames` and the components without a `MaybeSignal` prop do not import it, the consumer that holds a signal does. Where a module declares `className` itself (`SelectableRow`, `Portal`) it is typed `MaybeSignal<string>`, so a signal is accepted there as on the other components (tested), and the React emission keeps `string` |
| **`class`.** Preact consumers write `class`; the port keeps the React spelling `className`. A consumer `class` travels in the rest props and is replaced by the computed `className` (probe test) | every module that computes `className` | Open: accepting `class` is a semantic-mapping row for P0 |
| **Signal bindings are asynchronous.** `@preact/signals` 2.x flushes DOM bindings and signal-driven re-renders after the write | tests only | Tests wait (`waitFor`); no component change |
| **Two Preact majors.** The workspace already hoists `preact` 10.29.8 for `@bpmn-io/diagram-js-ui`. Preact 11 nested under the package while `@preact/signals`, `lucide-preact` and the testing library bound to the hoisted 10: two instances | workspace | Pinned to 10.29.8, the version already in the lockfile, paired with `lucide-preact` 0.562.0 = the `lucide-react` version, so both outputs draw the same glyphs |
| **Preact 11.2.0.** Same source in an isolated project outside the repository, the pins of this package with `preact` 11.2.0 forced, one Preact instance. Recipe: `npm run probe:preact` (`scripts/probe-preact-major.mjs`); recorded output: `measurements/preact-major-probe.txt` | 49 of 56 tests pass; 1 type error | The adapters (`forwardRef`, `focusWithin`, `textInput`) and all eight modules run. Differences: `useEffect` cleanups have not run when `unmount()` returns, layout-effect cleanups have (6 tests: scroll-lock restore, list unregistration, three store unsubscriptions and the probe of that fact); unitless numeric styles no longer get `px` (1 test; 67 files set an inline style object on an element); `InputHTMLAttributes` is stricter (1 type error in `Input.tsx`). Version decision for P0 |
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
| Six components, core-only adapter | 31,277 | 11,792 |
| Six components, `forwardRef` from `preact/compat` | 36,646 | 13,650 |
| Six components + `Portal` (compat for `createPortal`) | 37,825 | 14,070 |

**Decision taken in the spike:** K3 is kept and tightened. `compat.ts` exports
`createPortal` only; `forwardRef`, `useInsertionEffect`, `useSyncExternalStore`,
`textInput` and `focusWithin` live in `runtime.ts` on Preact core. Routing
`forwardRef` through compat would add 5.4–5.5 kB (1.9–2.0 kB gzip, +37 % on a
`Button` island) to every island, since 29 basic modules use it. With the
split, compat is paid only by an island that mounts a portal (+2.3 kB gzip,
measured).

Cost of the decision: `runtime.ts` depends on one mangled Preact hook
(`options.__b`), which works on 10.29.8 (this package's tests) and on 11.2.0
(the `forwardRef` tests pass in the recorded probe). If P0 chooses compat for
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

`npm run measure:port` (`scripts/port-metrics.mjs`) prints sections 8.1 and 8.3
and the reach counts of section 5.2, and writes them to
`measurements/port-metrics.txt` and `.json`. It reads the React trees with
`git show 81083403:<path>`, the Preact tree in the working directory and the
raw timing log `measurements/port-timing.json`.
`npm run measure:port:check` fails when the committed output differs from what
the repository gives. It is part of `npm run test:emit`, hence of `npm test`
and of the CI `test` task of this workspace. In a shallow clone the script
fetches the base commit itself, one commit deep (only its tree is read); the
CI job also fetches it in a dedicated step, so a fetch failure is reported
under its own name.

### 8.1 Port

| Module | Index category (lot) | React lines | Preact lines | React code tokens touched | Emission rewrites | Preact tests (lines) |
|---|---|---|---|---|---|---|
| `Button` | action (P1) | 26 | 27 | 6 / 163 (3.7 %) | 1 | 5 (69) |
| `Input` | form (P2) | 55 | 58 | 19 / 289 (6.6 %) | 2 | 6 (92) |
| `Modal` | overlay (P3) | 47 | 69 | 19 / 408 (4.7 %) | 3 | 6 (98) |
| `Tabs` | navigation (P3) | 94 | 108 | 17 / 814 (2.1 %) | 2 | 5 (104) |
| `SelectableRow` | form (P2) | 252 | 249 | 57 / 1,035 (5.5 %) | 3 | 9 (251) |
| `ChatComposer` | chat (P4c) | 34 | 58 | 18 / 279 (6.5 %) | 3 | 4 (76) |
| `Portal` | other (P4c) | 88 | 77 | 22 / 304 (7.2 %) | 1 | 6 (109) |
| `ThemeProvider` | no entry (P4c) | 35 | 37 | 12 / 229 (5.2 %) | 1 | 3 (53) |
| **Total** | | **631** | **683** | **170 / 3,521 (4.8 %)** | **16** | **44 (852)** |

React lines of a module taken out of `catalog.tsx` are the lines of the
declarations its re-export module names (`Modal`, `Tabs`, `ChatComposer`). A
token is a leaf of the TypeScript syntax tree, comments excluded; "touched" is
what does not survive in the longest common subsequence with the Preact module.
The figures include the corrections made after the two reviews (the
`focusWithin` call, the return type of `Portal`, `className` typed
`MaybeSignal<string>` on `SelectableRow` and `Portal`, and three more tests).

Shared code: `internal.ts` 97 lines (helpers private to `catalog.tsx` in
React), `classNames.ts` 22, adapters 204 (Preact) / 65 (React twins),
emission script 174, React-leg config 71. The three modules taken out of
`catalog.tsx` gain lines because their one-line signatures were wrapped.

**Wall time**, one builder agent session, each step covering source, Preact
tests and both legs green. Two sources, of unequal standing:

- **File times** (`measurements/port-timing.json`): creation and last
  modification time of every authored file, read with `stat` in the builder
  worktree after the session. A step runs from the first write of its files to
  the first write of the next step. This is the record the repository holds.
- **Reported**: the durations the session wrote in the first version of this
  document, from timestamps it read between tool calls. Those timestamps were
  not retained: `missing source`. Shown for comparison.

| Step | Modules | React lines | File times (s) | s per module | s per line | Reported (s) |
|---|---|---|---|---|---|---|
| Adapters, emission script, both test harnesses | 0 | — | 204 | — | — | 162 |
| `Button` (first port: includes harness fixes — scanner offsets, barrel redirect, working directory, asynchronous signal flush) | 1 | 26 | 189 | 189 | 7.27 | 209 |
| `Input` + `Modal` + `internal.ts` | 2 | 102 | 100 | 50 | 0.98 | 100 |
| `Tabs` | 1 | 94 | 60 | 60 | 0.64 | 62 |
| `SelectableRow` + `ChatComposer` + `Portal` | 3 | 374 | 247 | 82 | 0.66 | 139 |
| `ThemeProvider` + adapter tests | 1 | 35 | ≥ 15 | ≥ 15 | ≥ 0.43 | 49 |
| **Eight modules** | **8** | **631** | **611** | **76** | **0.97** | **559** |

Rate used below: **0.968 s per React source line, 76 s per module** (611 s,
file times). The reported log gives 0.886 s per line and 70 s per module
(559 s), 8.5 % lower. Over the seven modules that followed the first port:
60 s per module by file times, 50 s reported.

Limits of this measurement, stated because the rate is the acceptance item of
S1:

- **n = 1**: one session, one builder, eight modules in five grouped steps.
  Per step the rate spans 50–189 s per module and 0.64–7.27 s per line (the
  last step excluded, its end not being marked); the first port carries the
  harness fixes.
- File times bound the steps, they do not split them: reading the React
  source, running tests and idle time between two writes are not separated.
  The two sources are equal or close on three steps (100 / 100, 60 / 62,
  189 / 209 s) and far apart on `SelectableRow` + `ChatComposer` + `Portal`
  (247 s by file times, 139 s reported): 154 s separate the last file of that
  step from the first file of the next, and nothing committed says what they
  contain.
- The last step has no following write: 15 s is a lower bound, 49 s is the
  reported figure. `src/Portal.tsx` was modified once more 334 s after the
  last module test file was created; that correction is outside the 611 s.
- 1.3 lines of Preact test were written per React source line. All eight
  modules passed the existing React tests on their first run; every correction
  of the session was in the harness or in a new Preact test. Review then found
  one behavioural gap (focus inside a row, section 5.2) that neither leg
  tested: "green on first run" measures the tests that exist.

### 8.2 Bundles

Six requested components, minified by Vite 8, `preact` 10.29.8 vs `react` 19.3.0:

| Bundle | Preact | React |
|---|---|---|
| Component code only (runtime external) | 8,171 B / 3,074 gzip | 7,814 B / 2,920 gzip |
| Full island (runtime, icons, one render call) | **31,277 B / 11,792 gzip** | **228,528 B / 70,647 gzip** |
| `Button` island | 12,689 B / 5,253 gzip | 219,157 B / 67,544 gzip |

Component code is the same within 6 %: the Preact figure carries the adapter
(`forwardRef`, `textInput`, `focusWithin`) and the signals read, which React
gets from its runtime. The island is 7.3 times smaller in bytes and 6.0 times
in gzip. `npm run build && npm run measure` reproduces the table.

### 8.3 Extrapolation to W3, per module class

The eight modules average 79 lines; the 226 non-test modules of
`components-react` hold 40,146 lines (178 per module; 80 modules are
re-exports of `catalog.tsx`, which holds 8,451 lines). The projection is
therefore by **lines per lot**, not by module count.

**Lines per lot.** The script takes the category of each catalogue entry of
the component index at `81083403` and the React module its `delivery` points
to (207 entries, 3 modules shared by two entries and owned once). `catalog.tsx`
is split declaration by declaration: 6,895 lines belong to the 80 modules that
re-export them, and the residual 1,556 lines (imports, private helpers) stay
with `catalog.tsx` in P4c, like the 22 modules no entry points to. The lots add
up to the tree exactly. The first version of this table spread `catalog.tsx`
evenly over its re-export modules and left 161 lines unassigned.

| Lot | Index category | Modules | Lines | Module ported by S1 (React lines) |
|---|---|---|---|---|
| P1 | layout | 18 | 961 | none |
| P1 | feedback | 14 | 840 | none |
| P1 | action | 5 | 179 | `Button` (26) |
| P2 | form | 27 | 3,491 | `Input` (55), `SelectableRow` (252) |
| P3 | navigation | 24 | 3,007 | `Tabs` (94) |
| P3 | overlay | 7 | 897 | `Modal` (47) |
| P4a + P4b | data | 92 | 24,676 | none |
| P4c | chat | 6 | 195 | `ChatComposer` (34) |
| P4c | other | 11 | 757 | `Portal` (88) |
| P4c | no entry: shells, helpers, barrels, `catalog.tsx` residual | 22 | 5,143 | `ThemeProvider` (35) |
| P6 | `dataviz-react` tree | 128 | 9,562 | none |

**Rule of the estimate.** Hours are revised **per component-index category**,
not per lot. A category is *revised* when the spike ported at least one of its
modules: its hours are lines × 0.968 s × a factor for what the sample did not
exercise (modules larger than the 79-line mean, stateful modules, fast-gate
integration). The factor is a judgment, not a measurement: **2** as the
central value, **1 to 3** as the range. A category with no ported module is
**not measured**: no hours are derived for it and it keeps its share of the
lot's plan hours, in proportion to its lines. The modules without a catalogue
entry (22 in P4c: shells, helpers, barrels, the `catalog.tsx` residual) are
not a category: `ThemeProvider` is one of them, but one 35-line module says
nothing about the other 5,108 lines, so that bucket keeps its plan share too.
The second version of this document revised a whole lot as soon as one of its
modules was ported, which revised 91 % of P1 and 84 % of P4c from categories
that had no witness.

| Lot | Status | Lines | Revised categories (lines) | Plan kept (lines) | Plan (h) | Plan share kept (h) | Revised categories: plan share → revised (h) | Lot revised (h) | Range (h) |
|---|---|---|---|---|---|---|---|---|---|
| P1 | partly measured, n = 1 | 1,980 | action (179) | layout, feedback (1,801) | 10 | 9.1 | 0.9 → 0.1 | 9.2 | 9.1–9.2 |
| P2 | measured, n = 2 | 3,491 | form (3,491) | — | 12 | 0 | 12 → 1.9 | 1.9 | 0.9–2.8 |
| P3 | measured, n = 2 | 3,904 | navigation, overlay (3,904) | — | 14 | 0 | 14 → 2.1 | 2.1 | 1.0–3.1 |
| P4c | partly measured, n = 2 (+ `ThemeProvider`) | 6,095 | chat, other (952) | no catalogue entry (5,143) | 8 | 6.8 | 1.2 → 0.5 | 7.3 | 7.0–7.5 |
| **Sampled lots** | | **15,470** | **8,526** | **6,944** | **44** | **15.9** | **28.1 → 4.6** | **20.5** | **18.0–22.6** |
| P4a + P4b | **not measured** | 24,676 | — | data (24,676) | 24 | 24 | — | 24, plan kept | — |
| P6 | **not measured** | 9,562 | — | all (9,562) | 20 | 20 | — | 20, plan kept | — |
| P5 | **not measured** as a lot | in the lots above | — | — | 10 | 10 | — | 10, plan kept | — |
| P0, P7–P12 | outside S1 | | | | 59 | 59 | — | 59, plan kept | — |
| **W3** | | | | | **157** | **128.9** | | **≈ 134** | **131–136** |

Hours are rounded to 0.1 h per row and the totals add the rounded rows, as the
script does (133.5 h, range 131.0–135.6 h).

Reading the table:

- **What S1 supports is 134 h** (131–136 h): 113 h of plan hours kept for the
  lots not measured, 15.9 h of plan hours kept for the unsampled categories of
  P1 and P4c, plus 4.6 h (2.2–6.8 h) for the six revised categories, whose
  plan share was 28.1 h. With the reported rate instead of the file-time rate
  the revised categories give 4.2 h; the difference is inside the range.
- **P1 is revised for its action modules only** (5 modules, 179 lines, one
  26-line witness). Its layout and feedback categories (32 of its 37 modules,
  91 % of its lines) have no ported module and keep 9.1 h of the lot's 10 h.
  They are leaf modules like `Button`, so the rate may well hold for them, but
  S1 has no witness of it.
- **P4c is revised for chat and `other` only** (17 modules, 952 lines). The
  22 modules without a catalogue entry (84 % of the lot's lines) keep 6.8 h of
  its 8 h.
- **P5** is the hard set: `Portal`, `ThemeProvider`, the adapters, the 29
  `forwardRef` modules, and the external-store and insertion-effect users. At
  `81083403` that is 31 modules and 2,091 lines, all counted in their category
  lots, because the manifest that removes them from the batches (L1.5) does
  not exist yet. The spike delivered its mechanisms (`Portal`, `ThemeProvider`,
  the adapters, three of the 29 `forwardRef` modules), but nothing measured
  converts into hours for the lot: the plan's 10 h is kept, although part of
  it now overlaps lines the category lots already carry.
- **Not measured, and why it matters.** P4a + P4b and P6 are 34,238 of the
  49,708 conversion lines (69 %). 75 of the 92 data modules write SVG
  presentation attributes on elements, the pattern Preact core handles
  differently and for which P0 has a decision to take; `dataviz-react` is a
  separate tree that was not opened. At the leaf rate these lots would cost
  6.6 h and 2.6 h before any factor, and **if** that rate and the same factors
  held for them W3 would land at about 96 h (82–109 h). That is a hypothesis,
  not a result of S1: it needs a chart witness and a `dataviz-react` witness
  (section 9).

Plan rates versus measured: the plan counts 15–16 min per module for Preact
from React; the spike measured 1.3 min per module of 79 lines, i.e. 2.9 min
for the average module of 178 lines and 5.7–8.6 min with a factor of 2 to 3,
in the six revised categories only. The plan's 9 min per `dataviz-react` file is
neither confirmed nor contradicted.

For L1.4:

- **Grade.** The rate is demonstrated on one action module, two form modules,
  one navigation and one overlay module, one chat module and two
  infrastructure modules. Under the plan's grade rule that makes P2 and P3
  candidates for M, P4c for its chat and `other` modules (its shell components
  are represented by `ThemeProvider` only), and P1 for its action modules
  only. It is **not** demonstrated for charts, for `dataviz-react` or for the
  largest stateful modules (`DataTable`, `TimeRangePicker`): P4a, P4b and P6
  stay H.
- **Batching.** At 1.9 and 2.1 build hours (up to 2.8 and 3.1 at the top of
  the range), P2 and P3 are close to the 2 h per-lot overhead of the schedule
  model; the revised parts of P1 and P4c are below it (0.1 h and 0.5 h).
  Merging them is worth evaluating against the PR-size limit once the
  unsampled categories of P1 and P4c have a witness.
- **Not in these hours:** review, CI and integration (the per-lot overhead of
  PLAN 5.3), the fast-gate harness itself (L1.2) and browser acceptance.

## 9. Handed to P0

1. **Witnesses for the two classes S1 did not measure**: port one chart of the
   `data` category and one `dataviz-react` file, with the timing log kept, so
   P4a, P4b and P6 can be sized. The chart needs the **SVG casing** decision
   first: the core-only hook or `preact/compat`. Likewise one layout module,
   one feedback module and one shell without a catalogue entry, so the plan
   share kept for the unsampled categories of P1 and P4c (15.9 h) can be
   revised.
2. **Preact major**: 10.29.8 (this package's tests, shared with the BPMN
   canvas) or 11 (49 of 56 tests on the same source in the recorded probe;
   numeric styles and passive-effect cleanup timing to convert). A second major
   cannot be hoisted beside the first in this workspace.
3. **Codemod** for the `React.` namespace and type names (4.8 % of code
   tokens, mostly of that kind in the sample).
4. **Runtime adapter**: remaining event-type aliases, `ElementType`, a
   `blurWithin` twin of `focusWithin`, a decision on `class`, and a review of
   the nine other files that bind `onFocus` / `onBlur`.
5. **Semantic-mapping manifest (PLAN 2.9)**: the React / Vue divergences of
   section 4 as rows, each with a decision (align React, align Vue, or record
   the difference).
6. **Icons**: the `lucide-preact` ↔ `lucide-react` rewrite needs the two
   packages on the same version; decision K7 (one DS `Icon` on neutral `lucide`
   data) would remove the pair and the third specifier.
7. **Preact-side verification**: the spike wrote unit tests (1.4 lines per
   source line). Whether W3 does the same or relies on the fast gates changes
   the rate and is not decided here.
8. **Packaging**: remove `"private": true` and restore `publishConfig`
   together with the generated third-party notices, the publishable-package
   count of the licensing gate, the packed import-closure check
   (`scripts/dist-import-closure.mjs` skips a private package) and a publish
   workflow; `styles.css` copy and byte-identity check (K8), parity key
   `preact` in the component index, contract extraction, peer ranges. The
   emitted tree currently lives in `.react-emit/`; moving it into
   `packages/components-react` is the switch of P8.
9. **`TabsProps["onChange"]`** (section 4): `Omit<HTMLAttributes<HTMLElement>,
   "onChange">` in `components-react` and in the Preact source at once, so the
   two published types stay identical; then drop the cast of
   `src/Tabs.test.tsx`.
10. **Not covered by S1**: any browser rendering, SSR and hydration, charts,
   the largest stateful modules (`DataTable`, `TimeRangePicker`),
   `dataviz-react`, and the Vue side of the divergences of section 4.

## 10. Reproduce

```bash
cd packages/components-preact
npm run check               # both type-checks, the test files, React API parity
npm test                    # 22 script cases + the port-metrics staleness gate, 59 Preact tests, 339 on the React emission
npm run build && npm run measure   # bundle sizes (sections 6 and 8.2)
npm run measure:port        # sections 5.2, 8.1, 8.3 -> measurements/port-metrics.{txt,json}
npm run measure:port:check  # fails when the committed output is stale (run by npm test)
npm run probe:preact        # Preact 11.2.0 in an isolated project (network) -> measurements/preact-major-probe.txt
```

| File in `packages/components-preact/measurements/` | Content |
|---|---|
| `port-timing.json` | raw input: file creation and modification times of the builder session, the step grouping, the reported durations and their status |
| `port-metrics.txt`, `port-metrics.json` | raw output of `scripts/port-metrics.mjs`: trees, port table, rate, lines per lot and category, projection, reach counts |
| `preact-major-probe.txt` | raw output of `scripts/probe-preact-major.mjs`: installed versions, failing tests, type errors |

`measure:port` reads the base commit `81083403`. When the clone does not hold
it, the script runs `git fetch --no-tags origin
81083403e58dd1810bd1bd4f639882d226375d97` itself (with `--depth=1` in a shallow
clone, never in a full one) and fails with the git error when that fetch does.
