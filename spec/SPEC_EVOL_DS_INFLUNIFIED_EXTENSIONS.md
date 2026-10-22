# SPEC EVOL — DS Influnified extensions: DataTable expansion and bulk actions, KpiCard breakdown, Select pill, Notification banner, host-supplied icons (lots IF-1 to IF-5 and IF-7)

| Field | Value |
| --- | --- |
| Status | Specification only. No implementation, no test execution is claimed by this document. |
| Date | 2026-10-19 |
| Branch | `spec/influnified-extensions`, cut from `origin/main` `5acca644` |
| Base measured | This worktree at `5acca644`: `@sentropic/design-system-svelte` 0.36.0, `@sentropic/design-system-react` 0.38.0, `@sentropic/design-system-vue` 0.38.0, `@sentropic/design-system-angular` 0.38.0 (each `packages/components-*/package.json`). |
| Agreed scope | `scratchpad/influnified/accord.md` (19/10): IF-1 to IF-5 to build, IF-2 inside `DataTable`, IF-6 refused, IF-7 host-supplied icon slot only with no brand logo package. Gap analysis: `scratchpad/influnified/inventaire-composants.md` against `@sentropic/design-system-svelte` 0.36.0 (patterns #4, #8, #15, #16, #18, #23, #28). |
| Lots | IF-1 `DataTable` expandable rows; IF-2 `DataTable` bulk action bar; IF-3 `KpiCard` `breakdown`; IF-4 `Select` compact pill variant; IF-5 `Notification` app-level banner variant; IF-7 host-supplied icon slot. |
| Target versions | Next minor per framework: Svelte 0.36.0 → 0.37.0; React, Vue and Angular 0.38.0 → 0.39.0 (§3.8). |
| Related | [WP20 dataviz FR](SPEC_EVOL_WP20_DATAVIZ_FR.md) for the four-framework callback/output convention; [rich text editor](SPEC_EVOL_DS_RICH_TEXT_EDITOR.md) §4.3 for staged parity gating. The Influnified theme package (`packages/theme-influnified`, accord order step 1) is a separate delivery and is not specified here. |

## 0. How to read this specification

Every normative statement carries one primary source tag.

| Tag | Meaning |
| --- | --- |
| `accord` | Statement taken from the agreed scope in `scratchpad/influnified/accord.md` or from the gap analysis it validates (`inventaire-composants.md`, pattern number cited). |
| `measured` | Fact read in the current code on `origin/main` at `5acca644`; the file is named inline. |
| `ds-proposition` | Design choice made by this specification. It requires DS owner ratification where §11 states so and must never be reported as an agreed requirement. |

`SHALL` / `MUST NOT` below state the proposed contract. They acquire force only at ratification of the corresponding lot.

## 1. Goal, scope, non-goals

### 1.1 Goal

Close the six additive gaps that the Influnified gap analysis classes as variant (V) or missing (M) against the current DS, without breaking any existing consumer: patterns #8 and #18 (IF-1), #15 (IF-2), #4 (IF-3), #16 (IF-4), #23 (IF-5) and #28 (IF-7, slot only). `accord`

### 1.2 In scope (this specification)

- The additive public API of each lot in Svelte, React, Vue and Angular, with the per-framework event and slot shapes (§4 to §9).
- Accessibility (ARIA pattern, keyboard, announcements), i18n, component tokens, framework parity staging, RED witnesses, docs page changes and the gate of each lot.
- Lot order and dependencies (§10). IF-1 and IF-2 both touch `DataTable` and are sequenced, never parallel. `accord`

### 1.3 Out of scope

- IF-6 (`Tile` visible checkbox and metrics zone, pattern #14): refused; the `Card` + `Checkbox` composition is sufficient. `accord`
- Any brand or platform logo shipped by the DS, and any separate brand icon package (IF-7 is the slot only, §9). `accord`
- The Influnified theme package and its publication (accord order step 1, separate delivery).
- Host behaviour: data fetching, CSV export (pattern #16, host button), business rules that compute decorations, breakdowns or tones. The DS renders host-supplied data only, as with `cellDecoration` today (`packages/components-svelte/src/lib/cellDecoration.ts`: the rule engine lives outside the DS). `measured`

## 2. Starting point (measured)

All facts below are read on this worktree at `5acca644`. Svelte is the reference implementation; the other frameworks mirror it.

### 2.1 `DataTable` (`packages/components-svelte/src/lib/DataTable.svelte`)

- Data model: `DataTableColumn<R>` (`key`, `label`, `sortable`, `align`, `width`, `cell?: Snippet<[R, column]>`, `cellDecoration`), `DataTableRow` (`id: string` plus index signature), `DataTableSelectMode = "none" | "single" | "multiple"`, `DataTableSort`. No sub-row or detail concept exists.
- Selection: `selectable` (default `"none"`), `selectedIds` bindable (default `[]`). The header checkbox (multiple mode) covers the visible page only (`allVisibleSelected`, `someVisibleSelected`, `toggleAllVisible` over `visibleRows`) and already carries the indeterminate state (`indeterminate={someVisibleSelected}`). There is no bulk action bar and no selection count display (gap #15).
- Sorting is local over `rows` (`sortedRows`); pagination slices the sorted rows (`visibleRows`, `pageSize`, bindable `page`); `rangeLabel?: (range: {start, end, total}) => string` is the existing function-label precedent. Footer range and pager status already use `aria-live="polite"`.
- Labels are props with English defaults (`selectAllLabel = "Select all rows"`, `selectRowLabel`, sort labels, `emptyLabel`); previous/next labels derive from the `locale` prop (`fr-FR` default) with host override. This locale-plus-override pattern is the i18n baseline every lot extends (§3.3).
- Cell conditional formatting: `decorations` map (rowId → colId → `CellDecoration {intent, icon?}`) wins over `column.cellDecoration`; intent resolves to the feedback tint (`color-mix` 14%) plus `CellDecorationIcon` from a fixed lucide subset (`cellDecoration.ts`, `cellDecorationIconNodes`). The icon there is a DS-owned string name, never host content.
- React (`packages/components-react/src/DataTable.tsx`), Vue (`packages/components-vue/src/DataTable.ts`) and Angular (`packages/components-angular/src/DataTable.ts`) carry the same column/row/selection/sort model; React and Vue expose `selectedIds` plus `onSelectionChange`, Angular `selectedIds` plus `onSelectionChange` input. The docs page freezes the common subset for the framework tabs (`apps/docs/src/routes/components/data-table/+page.svelte`).

### 2.2 `KpiCard` (`packages/components-svelte/src/lib/KpiCard.svelte`)

Props: `value` (number|string), `label`, `delta`, `deltaFormat`, `trend`, `format`, `unit`, `currency`, `locale`, `sparkline`, `size`, categorical `tone` (left accent), `decoration?: CellDecoration`. Rendering order: label, value row, footer (delta + sparkline). The root is `role="group"` with a composed `aria-label` (label, formatted value, unit, delta, decoration label). Number formatting uses `Intl.NumberFormat(locale)`. No breakdown list exists (gap #4). React, Vue and Angular mirror this surface (`packages/components-react/src/KpiCard.tsx`, `packages/components-vue/src/KpiCard.ts`, `packages/components-angular/src/KpiCard.ts`).

### 2.3 `Select` (`packages/components-svelte/src/lib/Select.svelte`)

A styled native `<select>`: `label`, `helperText`, `errorText`, `invalid`, `size` (`sm|md|lg`), bindable `value`, options as children `<option>` elements; `...rest` lands on the `<select>` element, so `aria-label` already reaches the control. The field wrapper caps width (`--st-component-field-maxWidth`, 28rem in the component fallback chain) and always renders the label layout. No variant and no per-value tone exist (gap #16). React exposes the same surface through `catalog.tsx` (`SelectProps` with `options?: OptionItem[]` or children), Vue and Angular through `options?: SelectOption[]` plus `modelValue`/`value` (Angular also has an explicit `aria-label` input).

### 2.4 `Notification` and `AppShell`

`Notification` (`packages/components-svelte/src/lib/Notification.svelte`): `tone` (`info|success|warning|error`), required `title`, `message`, `dismissible`, `dismissLabel`, `locale`, `onDismiss`, `actions` snippet, children. Role is `alert` for `error`, `status` otherwise, on the root `<section>` that also wraps the actions and the close control. Width is capped (`width: min(100%, 32rem)`); no full-width banner variant exists (gap #23). The dismissal contract is not uniform today and this specification preserves each framework's contract (§8.2): Svelte (`Notification.svelte:38`, `canDismiss`) and React (`packages/components-react/src/Notification.tsx:36`) render the close control only when `dismissible && onDismiss` are both supplied; Vue renders it whenever `dismissible` is true and emits `dismiss` (`packages/components-vue/src/Notification.ts:48`); Angular renders it whenever `dismissible` is true and emits `dismiss`, with no `onDismiss` input (`packages/components-angular/src/Notification.ts:37`). `actions` is a snippet (Svelte), node (React), slot (Vue) or `[slot='actions']` projection (Angular).

`AppShell` (`packages/components-svelte/src/lib/AppShell.svelte`) exposes snippet regions `topChrome`, `primaryRail`, `navigationPanel`, `main`, `contextPanel`, `utilityPanel`, `bottomPanel`. `topChrome` renders in a `st-appShell__topChrome` div above `st-appShell__body`. There is no dedicated banner region; panels scroll independently (`.st-appShell__*` overflow rules), so pinning is a per-region CSS property, not a shell-wide behaviour. `measured`

### 2.5 `Icon` and icon rendering in components

- `Icon` (`packages/components-svelte/src/lib/Icon.svelte`, `icons.ts`): `name: IconName` is required; the canonical set has eight DS-owned names over lucide glyphs (`settings`, `eye`, `eye-off`, `layers`, `target`, `close`, `chevron-down`, `chevron-right`). `size` defaults to 18, `strokeWidth` falls back to the token `--st-component-icon-strokeWidth` (2.25). Accessible rule today: `title` set → `role="img"` plus `aria-label`; omitted → `aria-hidden="true"`. No host glyph can be supplied (gap #28). React re-exports the same contract from `catalog.tsx`; Vue and Angular mirror the `name`/`title` inputs (Angular renders internal SVG nodes, `ICON_NODES`).
- `NavItem` (`packages/components-svelte/src/lib/NavItem.svelte`) already has host slots: `leading` and `trailing` snippets, which take precedence over `swatch` and `count`; its contract already states the head MUST NOT be interactive inside an option. React mirrors `leading`/`trailing` as nodes and Vue as slots. Angular has no leading projection or template: its leading area renders only `ColorSwatch` (when `swatch.color`) or `StatusDot` (otherwise) (`packages/components-angular/src/NavItem.ts:68`), so IF-7 needs an additive Angular API there (§9.2), not documentation alone.
- `Tag` (`Tag.svelte`) and `Badge` (`Badge.svelte`): tone (`neutral|success|warning|error|info`), children as label; the only icon is Tag's internal dismiss `X`. No leading icon slot exists.
- `Button` (`Button.svelte`) and `IconButton` (`IconButton.svelte`) render host children; a host glyph can already be placed inside both. `aria-label` enforcement on `IconButton` is not uniform: Svelte requires it in the type (`IconButton.svelte:5`, `"aria-label": string`), React inherits the optional native button attributes (`catalog.tsx:3390`, `IconButtonProps = ButtonHTMLAttributes & {…}`), Vue declares no label prop at all (`packages/components-vue/src/IconButton.ts`, attrs fall through), and Angular's `aria-label` input is optional (`packages/components-angular/src/IconButton.ts:14`). IF-7 states the accessible-name rule as a usage requirement for hosts in every framework and adds no new required prop (§9.2).
- `DataTable` cells already render host content through `column.cell` (and decorations for data-only intents).

### 2.6 Conventions every lot reuses

- Component tokens: `--st-component-<component>-*` custom properties, each falling back to a base literal or a semantic token, so a theme that emits nothing renders byte-identically (for example `DataTable.svelte` `--st-component-dataTable-*`, `Tag.svelte` `--st-component-tag-*`). Feedback tints use `color-mix(in srgb, var(--st-semantic-feedback-*) 14%, white)` (Badge, Tag, cell intents). No local hex is introduced by any lot.
- Controlled/uncontrolled: Svelte uses `$bindable` props (selection, page, sort); React and Vue pair an optional value prop with internal state and a change callback (`selectedIds`/`onSelectionChange` in `DataTable`); Angular pairs an `@Input()` value with an optional `@Input()` callback and an `@Output()` change event (WP20 D4 convention). New state in IF-1 and IF-2 follows exactly this split.
- Disclosure precedent: `Collapsible.svelte` uses a native `<button>` with `aria-expanded`, `aria-controls`, `id` on the trigger and `role="region"` plus `aria-labelledby` on the region, mounting the region only when open. IF-1 reuses this wiring inside the table.
- Parity history: features land Svelte first, then align (for example `feat(panelstack)` Svelte unexported → contract alignment → all four frameworks; `git log` on this worktree). Parity is staged and never pre-claimed (§3.5).
- Tests live beside the component: Svelte `*.test.ts` with `@testing-library/svelte` and Vitest (for example `Icon.test.ts`), React `*.test.tsx`, Vue and Angular `*.test.ts`. Package test scripts are `vitest run src` (Svelte, React, Vue) and `npm run build && vitest run --config vitest.config.ts src` (Angular); checks are `svelte-check` (Svelte) and `tsc --noEmit` (React, Vue), `ngc` for Angular.

## 3. Cross-cutting contract (applies to every lot)

### 3.1 Additivity — no breaking change

- Every new prop, slot and token is optional. With no new prop supplied, each component SHALL render byte-identically to its current output (same DOM, same classes, same defaults). `ds-proposition`, from the measured additive precedents (`Badge shape/size`, `NavItem depth`, `Collapsible size`: unset means the former render).
- No existing prop changes type, default or meaning. Widening a required prop to optional (IF-7 `Icon name`) is additive only because every existing call site keeps compiling and rendering identically.
- New public types are exported from each framework index next to the existing ones (`packages/components-svelte/src/lib/index.ts` pattern: component plus its `*Props`/model types).
- New CSS classes are additive (`st-<component>__*` or `st-<component>--<variant>`); no existing class is renamed or removed.

### 3.2 Accessibility baseline

- Every interactive addition uses a native element (`<button>`, `<input type="checkbox">`, native `<select>`) so focus, Enter/Space activation and visible focus rings come from the platform and existing DS focus tokens.
- State is never carried by colour alone: each tone or tint is paired with text, an icon plus a screen-reader label, or an `aria-label`, following the cell-decoration rule (tint + icon + SR label) and the audit rule precedent `navsystem-color-state-only` (WP23 spec).
- Announcements for new state (IF-2 selection count) use a dedicated visually hidden `aria-live="polite"` region (the `DataTable` footer precedent), never a region that contains focusable controls. The existing `Notification` root is the single preserved exception: its `role="status"`/`role="alert"` already wraps title, message, actions and the close control in every framework (§2.4); IF-5 inline rendering keeps that wiring byte-identically and only the new banner variant adds a separate announcer (§8.2).
- Focus never moves on its own except the documented returns to a surviving control: detail-region collapse returns to its expand button, collapse of a parent returns focus held by a removed descendant control to the ancestor expand button, and disappearance of the bulk bar returns focus held inside the bar to the header select-all checkbox (§4.4, §5.2).
- Each lot names its ARIA pattern explicitly. Where two patterns compete, the lot states the rejected one and why (IF-1: table plus disclosure, not treegrid).

### 3.3 i18n — no hard-coded language

- No lot introduces a hard-coded sentence in any language. Every new visible or announced string comes from a host-supplied label prop.
- Where the DS already derives a default from `locale` (previous/next in `DataTable`, dismiss in `Notification`), the new labels follow the same mechanism: a `locale`-derived default (French/English, matching the existing pairs) that the host can override per label. Function labels follow the `rangeLabel` precedent: `selectionLabel?: (selection: { count: number; total: number }) => string` (IF-2).
- Numbers are formatted with `Intl.NumberFormat(locale)` (the `KpiCard` precedent); hosts may pre-format and pass strings wherever a value accepts `string | number`.
- Docs examples pass labels explicitly in both documentation locales (the `apps/docs` FR/EN copy pattern), so no example relies on a DS default sentence.

### 3.4 Component tokens

- Each lot lists its new `--st-component-*` tokens. Every token falls back to the literal that reproduces the current render, or to the semantic/feedback token already used by the sibling rule it extends. A theme that emits none of the new tokens changes nothing.
- Tints reuse the feedback recipe `color-mix(in srgb, var(--st-semantic-feedback-<tone>) 14%, white)` for backgrounds and dots only. Normal-size text on those tints or on the card surface never uses the full feedback token as its colour (§6.2, §7.2): the measured feedback values fail 4.5:1 for normal text. Text binds to `--st-semantic-text-primary` (or the per-lot text token falling back to it), which passes on white and on every 14% tint; tone is carried by the dot or the tint background, never by text colour alone (§3.2).
- No lot introduces a hex value or a new semantic token. New component tokens are plain CSS custom properties with fallbacks: a theme consumes them by emitting the `--st-component-*` variables directly (CSS override or token-tree CSS), with no DS change required. The `createComponent` factory in `packages/tokens/src/component.ts` is not a generic pass-through: it has explicit typed inputs and an explicit output tree (the current `dataTable` output, `component.ts:1634`, contains none of the leaves proposed here), so a theme that wants a new leaf emitted from its token tree needs an explicit factory extension (new leaf in the output tree, resolver if the leaf is derived, and a `packages/tokens` test pinning the emitted variable) — that extension is specified per lot where a lot asks for it, and is otherwise not claimed. Where this specification lists a new `--st-component-*` variable, the variable is consumable as CSS from day one; factory emission is a separate, tested step.

### 3.5 Framework parity — Svelte first, staged

Per DS practice (§2.6), each lot lands in this order, and parity is claimed only for stages whose gate passed:

| Stage | Delivers | Claim allowed |
| --- | --- | --- |
| S1 | Svelte implementation plus its RED witnesses (§ per lot) | "Available in `@sentropic/design-system-svelte` 0.37.0; other frameworks not delivered." |
| S2 | React and Vue ports of the same contract | Adds React 0.39.0 and Vue 0.39.0 to the claim. |
| S3 | Angular port of the same contract | Adds Angular 0.39.0; full parity claim. |

- The semantic contract (prop names, label props, keyboard, ARIA wiring, token names) is identical across frameworks; only the idiom changes (snippet/render prop/slot/projection, bindable/prop-plus-callback/input-plus-output) following §2.6.
- Docs framework tabs show a lot's example only for delivered stages (the `TabbedExample` NodeSpec freezes the common subset today; a lot extends the subset only when its port lands, and live fixtures are registered per delivered framework under §3.6).
- A lot is not done at S1. The minor of a framework is bumped when its stage lands (§3.8); a slipped stage ships in the following minor of that framework, announced as not delivered until then.

### 3.6 Docs

- Each lot extends the existing component page under `apps/docs/src/routes/components/` (`data-table`, `kpi-card`, `select`, `notification`, `icon`, plus `nav-item`, `tag`, `badge`, `button`, `icon-button` and the AppShell layout pages for IF-5/IF-7 as named per lot). No new top-level docs section is created.
- Declarative additions that fit the `NodeSpec` model (plain props, text children) use a `TabbedExample` with FR/EN copy, an API-table row per new prop (type, default, description in both locales, following the existing tables), and a usage note where the lot has a MUST/MUST NOT rule. The measured limits of that model bound what may be put in a `NodeSpec`: Vue's island supplies only a `default` slot (`apps/docs/src/lib/framework/vue-island.ts:43`), Angular's island supplies a single projection bucket (`angular-island.ts:62`, one `projectableNodes` array), Svelte's inline renderer has no slot channel beyond its current prop adaptation (`SvelteNode.svelte`), and the code generator serialises props with `JSON.stringify`, so a function prop such as `selectionLabel` renders as `{undefined}` for Svelte/React and throws for Vue/Angular (`nodeToCode.ts:29`; probe recorded in the first review). Any example that needs a function prop, a named/scoped slot, a snippet/render-prop, a `TemplateRef`, or a host glyph component therefore SHALL NOT be expressed as a `TabbedExample` `NodeSpec`.
- Those examples use framework-specific live fixtures through `TabbedLiveExample` (`apps/docs/src/lib/framework/TabbedLiveExample.svelte`, `live-island.ts`): one hand-written demo per framework under `apps/docs/src/lib/framework/live-demos/{svelte,react,vue,angular}/`, registered as a new `LiveDemoKey`, mounting the real package of that framework with real callbacks, slots and templates. Each fixture owns its labels in both documentation locales. Switching the container to `TabbedLiveExample` alone does not lift the Angular template limit measured in §3.6 above: the current Angular live path (`live-island.ts`, `mountAngularLiveDemo`) still builds `NodeSpec` trees (`createModalDemoNodes`/`createDrawerDemoNodes`) and mounts them through the same single-projection-bucket island (`angular-island.ts`, one `projectableNodes` array), which has no channel for a `TemplateRef`, a typed template context, or a named template outlet. An Angular fixture that needs `cellTemplate`, `rowDetailTemplate`, `bulkActionsTemplate` or `glyphTemplate` (§4.1, §5.1, §9.1) therefore SHALL NOT go through `mountAngularIsland`/`NodeSpec` at all; it uses the compiled-fixture mounting path defined next.
- Angular compiled-fixture mounting path (new docs infrastructure, part of the first lot that needs an Angular template fixture; Svelte-first staging still applies, so this path is delivered with IF-1 S3 at the latest and reused by IF-2, IF-4 and IF-7 Angular fixtures). [N] `apps/docs/src/lib/framework/live-demos/angular/<Fixture>Demo.ts` exports a standalone Angular component (not a `NodeSpec[]` factory): its inline template declares the `<ng-template #cell let-row …>` / `#detail` / `#bulk` / `#glyph` templates in markup and binds them to the DS component inputs (`[cellTemplate]="cellTpl"`, `[rowDetailTemplate]="detailTpl"`, and so on, resolved with `@ViewChild`/`viewChild` `TemplateRef` reads), imports the real `@sentropic/design-system-angular` standalone components, and owns its FR/EN labels and interaction state inside the component class. [N] `mountAngularCompiledLiveDemo(container, key, fr)` in `live-island.ts` mounts that component directly — `createApplication` (zoneless, as `angular-island.ts` already does) plus `createComponent(FixtureComponent, { environmentInjector, hostElement })` with `app.attachView`/`tick` and the same idempotent dispose guard as the Vue island — and never constructs a `NodeSpec`, never calls `mountAngularIsland`, and never serialises a template through `projectableNodes`. Build integration: the fixture component is ordinary TypeScript in the docs workspace, linked at docs build time by the existing Angular linker (`apps/docs/angular-linker.ts`, partial compilation, no `@angular/compiler` in the browser, no `unsafe-eval`), type-checked by the docs `check` (`svelte-kit sync && svelte-check`) together with a targeted `tsc`/`ngc --noEmit` pass over the fixture sources so a renamed DS template input fails the docs gate, and exercised by the docs witness below in `jsdom` through the same `createApplication` mount (the test imports the compiled docs fixture entry, not a `NodeSpec` re-statement of it). React and Vue live fixtures keep their current hand-written component paths (`createXDemo(React, ds, fr)` / `createXDemo(Vue, ds, fr)` in `live-island.ts`); Svelte fixtures stay inline `.svelte` components. A lot that only needs the Angular compiled path for a later stage registers its `LiveDemoKey` without an Angular entry until that stage lands (see stage availability below).
- `TabbedLiveExample` extensions (new, required before any lot's live fixture is registered; today the component accepts only `{ demo, title }` — `TabbedLiveExample.svelte:34` — and has neither a stage-note nor a code-view API, while `TabbedExample` already has both patterns to copy). (a) Stage note: `notes?: Partial<Record<FrameworkId, string>>`, rendered exactly as `TabbedExample` renders its `notes` (`.tex__note`, `role="note"`, between the tab bar and the stage, only for the active tab). Stage visibility follows §3.5: a lot's live fixture is registered only for frameworks whose stage has landed; for an unlanded framework the tab stays selectable, shows the stage note stating the stage and target version are not delivered, and mounts nothing — the island mount function is not invoked for that tab, and no half-wired `NodeSpec` that drops the function, slot or template is ever substituted. (b) Source display: `sources?: Partial<Record<FrameworkId, string>>` carrying one hand-written source string per landed framework (the fixture source is the code sample), rendered in the same collapsible code view as `TabbedExample` (`<details class="tex__code">`, per-active-framework source, copy button); `nodeToCode` is not run over function, slot or template props for these fixtures, and a landed framework without a `sources` entry fails the docs witness below. Each fixture owns its labels in both documentation locales inside the fixture/source pair, so the displayed code and the running demo cannot drift in wording.
- Docs witnesses are executable: [N] `apps/docs/src/lib/framework/influnified-live-demos.test.ts` mounts each new live fixture through its real mounting path (Svelte inline, React/Vue islands, Angular through `mountAngularCompiledLiveDemo` with real `TemplateRef` bindings — asserting rendered element content inside a cell/detail/bulk/glyph outlet, not text interpolation) and asserts the interactive contract the example claims (expansion toggles, bar appears, pill tone follows the value, banner action is reachable), plus: a stage-availability assertion (an unlanded tab renders its `notes` entry and creates no island host content), a source-display assertion (every landed framework has a non-empty `sources` entry and the code view shows the active framework's string), and a generator guard asserting no new `NodeSpec` example carries a function-valued prop or a `TemplateRef`-typed prop. The docs gate runs that file with the docs package tests, after the fresh package builds of §3.7 (the fixtures import the package entry points, which resolve to `dist`, so the gate never witnesses against a missing or stale build).
- Examples use neutral placeholder content. IF-7 examples MUST NOT display a real brand logo (§9).

### 3.7 RED witnesses and gates

- RED first: each lot's tests are written and observed failing for the stated reason before implementation. `[N]` marks a new file.
- Targeted gate per package (real scripts, §2.6). Svelte, React, Vue: `npm --workspace <package> exec -- vitest run <exact test files>`, then the full package suite `npm --workspace <package> run test` once as regression, plus `npm --workspace <package> run check`. Angular targeted runs SHALL NOT use the bare Vitest command: existing Angular tests import the compiled output (for example `packages/components-angular/src/Icon.test.ts:4` imports `../dist/Icon.js`) and this worktree may have no `dist`, so a bare run fails on a missing module or, worse, passes against stale code. The Angular targeted sequence is a fresh build first, then the targeted files, from the worktree root: `npm --workspace @sentropic/design-system-angular run build` followed by `npm --workspace @sentropic/design-system-angular exec -- vitest run --config vitest.config.ts <exact test files>`; the full regression remains `npm --workspace @sentropic/design-system-angular run test` (which itself builds first).
- Angular keyboard, focus and ARIA witnesses SHALL run in a DOM harness, not by constructing the component class directly (the `new Icon()` unit pattern asserts class fields only and cannot observe focus, `aria-expanded`, or live-region behaviour). The harness is Angular TestBed with the standalone component imported and rendered into `jsdom` (the repo's Vitest `jsdom` environment), driving real `click`/`keydown` events and asserting `document.activeElement`, attributes and live-region text. A class-instantiation witness may supplement a DOM witness for pure derivations, never replace it.
- Type-check fixture gate (every port; closes the excluded-test gap). The runtime compat witnesses of §4.1 live in `*.test.*` files, which React, Vue and Angular exclude from their `tsconfig` (`exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"]` / `["src/**/*.test.ts"]`) and which Vitest transpiles without semantic type checking, so a witness file alone cannot prove the row-type contract (§4.1, finding on line 180 of the second review). Each port therefore carries an explicit type-check fixture that its normal `check` gate actually type-checks: [N] `packages/components-svelte/src/lib/DataTable.compat.fixture.ts`, [N] `packages/components-react/src/DataTable.compat.fixture.ts`, [N] `packages/components-vue/src/DataTable.compat.fixture.ts`, [N] `packages/components-angular/src/DataTable.compat.fixture.ts` — plain fixture modules (not `*.test.*`) containing the legacy assignments of §4.1 (`const legacyNumber: DataTableRow = { id: "r1", children: 3 }` and the string/array counterparts, plus a `DataTable` usage with no `expandable`/`getSubRows`), included by a dedicated fixture tsconfig per port ([N] `tsconfig.compat.json` extending the port tsconfig with `include` covering the fixture and the component sources, `noEmit: true`; Svelte uses the equivalent `svelte-check` fixture inclusion, Angular uses `ngc -p tsconfig.compat.json --noEmit` with `strictTemplates`). Each port's `check` script (or a `check:compat` script chained from `check`, named per port following its existing `check` naming) SHALL run that fixture config, so `npm --workspace <package> run check` fails if the fixture stops compiling. The gate is demonstrated, not merely asserted: before a lot relying on §4.1 closes, the implementer temporarily restores the narrowed declaration (`children?: DataTableRow[]` on `DataTableRow`) in that port, re-runs the port's `check`, and records the expected failure (`children: 3` not assignable) in the lot's gate log, then reverts the mutation; a `check` that still passes under the mutation means the fixture is not wired into the gate and the lot does not close. The runtime `DataTable.compat.test.*` witnesses remain (rendering as ordinary cell data), but they no longer carry the compile-time proof alone.
- Three gates are separated. (a) The offline lot gate is the only gate a lot needs to close a stage, and it runs with no network: with dependencies already installed from the committed `package-lock.json` (prerequisite: `node_modules` present from a prior `npm ci`, the committed lockfile unchanged, and any package the gate builds already resolvable from the local workspace), run, per touched package, the targeted sequence above, then `npm --workspace <package> run check` (including the type-check fixture gate above), then the full package test script; for Angular the build inside those scripts is the local `ngc` build and needs no download. The gate SHALL be run with downloads disabled — environment `npm_config_offline=true` and `npm_config_prefer_offline=true`, and no `npm install`, `npm ci`, `npx` fetch or `pack:smoke` step inside it — so an implicit download fails the gate instead of passing silently; committed fixtures (test data, token snapshots) are the only inputs beyond the lockfile-installed tree. If `node_modules` is absent the gate stops and reports the missing prerequisite; it never installs. When the lot touches docs fixtures (§3.6), the offline gate additionally runs the docs sequence of the next bullet, still offline. (b) The pre-publication local-tarball gate is separate, runs before any framework minor is published, and explicitly allows network: root `npm run verify` (licensing, build, check, tests, `pack:smoke`) as the publish workflows already run it in their `verify` job before the `publish` job (for example `.github/workflows/react-publish.yml`, `verify` → `pack:smoke` → `release-guard` → `publish`). `pack:smoke` (`scripts/smoke-pack.mjs`) packs the local workspaces with `npm pack` into local tarballs (`packWorkspace`/`ensureTarball`), installs those tarballs plus external peer specifications into a fresh throwaway project (`installProject`, `npm install` with no offline flag), checks each tarball's file list (`verifyTarball`) and runs the installed-package verify script. It therefore verifies that the locally built tarballs install and load; it does not fetch or verify artifacts retrieved from the published registry, and the spec never describes it as a registry check. It is never part of the offline lot gate and never a lot-closing requirement; a failure here blocks publication of that minor. (c) The post-publication registry check is separate again and runs only after publication, with network allowed: the publish workflow's post-publish job polls the registry until the new version resolves (`npm view <package>@<version>` in `react-publish.yml` `post-publish-check`, and the equivalents in the other publish workflows) and may install the published artifact into a throwaway project; only this gate speaks about the registry. A failing offline witness is a lot failure, never a waiver; a pre-publication failure blocks the release; a post-publication failure is handled as a publication incident, not retroactively as a spec change.
- Docs gate — fresh package builds first (offline). New live fixtures import the package entry points (`@sentropic/design-system-svelte` / `-react` / `-vue` / `-angular`), which resolve to each package's `dist`; running the docs tests or `svelte-check` against a missing or stale `dist` witnesses the wrong code even when the package's own tests pass. The docs part of the offline lot gate therefore builds before it witnesses, in dependency order and with the same offline environment as gate (a): first the local dependencies the fixtures need (`@sentropic/design-system-tokens` and `@sentropic/design-system-themes` builds, which the Angular `build`/`check` scripts already chain), then a fresh build of every framework package whose stage the lot has delivered and whose fixtures are registered (Svelte `npm --workspace @sentropic/design-system-svelte run build` (`svelte-package`), React and Vue `run build` (`tsc -p tsconfig.json && node scripts/copy-styles.mjs`; their `check` is `tsc --noEmit` only and never refreshes `dist`, so `check` is not a substitute for this build), Angular `run build` (tokens/themes chain plus `ngc` and style copy)), then `npm --workspace @sentropic/design-system-docs run check`, then the docs witnesses (`npm --workspace @sentropic/design-system-docs exec -- vitest run src/lib/framework/influnified-live-demos.test.ts` and the docs package `run test`). The incremental helper `scripts/ensure-theme-dists.mjs` (content-hash skip, wired as docs `prebuild`/`predev`) may satisfy the theme/dist part when it reports the touched packages as rebuilt or up-to-date by hash, but a hash-skip is accepted only for packages the lot did not touch; a package whose sources the lot changed is built explicitly by the commands above regardless of the helper's cache. If a required `dist` cannot be built offline, the docs gate stops and reports the build failure; it never falls back to a stale `dist` and never installs.

### 3.8 Target versions

| Package | Current (measured) | Target |
| --- | --- | --- |
| `@sentropic/design-system-svelte` | 0.36.0 | 0.37.0 |
| `@sentropic/design-system-react` | 0.38.0 | 0.39.0 |
| `@sentropic/design-system-vue` | 0.38.0 | 0.39.0 |
| `@sentropic/design-system-angular` | 0.38.0 | 0.39.0 |

Each framework version bumps once, when its S-stage (§3.5) containing these lots lands. The six lots share the train: Svelte 0.37.0 carries the S1 stages; 0.39.0 of each other framework carries its port. `accord` (next minor) plus `measured` (current versions).

## 4. IF-1 — `DataTable`: expandable rows with detail region (patterns #8, #18)

`accord`: build. The extension is generic (report tables with nested sub-rows, expandable record rows) and serves hosts beyond Influnified.

### 4.1 Additive API

Data model — unchanged. The row type is preserved exactly as measured in all four frameworks (`packages/components-svelte/src/lib/DataTable.svelte:21`, `packages/components-react/src/DataTable.tsx:26`, `packages/components-vue/src/DataTable.ts:26`, `packages/components-angular/src/DataTable.ts:33`):

```ts
export interface DataTableRow {
  id: string;
  [key: string]: unknown;
}
```

Naming a `children?: DataTableRow[]` field on this interface is a breaking change, not an additive one: the index signature admits any field today, so an existing row such as `{ id: "r1", children: 3 }` (a numeric `children` column) compiles against every current interface and would fail against the narrowed declaration, even with expansion disabled. Sub-rows are therefore not a row field at all. They are reached through a new opt-in accessor on the component, whose name lives on `DataTable` props — a namespace no row field can collide with:

```ts
// New optional prop on DataTable (all frameworks); the row type does not change.
getSubRows?: (row: R) => readonly R[] | undefined;
```

A row's sub-rows are `getSubRows(row)` when the host supplies the accessor; `undefined` or an empty array means the row is a leaf. Recursion re-applies the same accessor to each sub-row. A host whose data happens to nest under a `children` key passes `getSubRows={(row) => row.children as DataTableRow[] | undefined}` explicitly — the DS never reads `row.children` (or any other row key) on its own, so an uninvolved `children: 3` column, a `children: string` label, or any other existing field keeps its current meaning and rendering. Because the accessor is absent by default, the proof obligation is compile-time as well as runtime, and the two halves are witnessed by different files (§3.7 type-check fixture gate): the compile-time half lives in the non-test fixture ([N] `DataTable.compat.fixture.ts` per port, §3.7) assigning `const legacy: DataTableRow = { id: "r1", children: 3 }` (plus the string/array counterparts) and type-checked by the port's `check`, so restoring a narrowed `children?: DataTableRow[]` field makes that `check` command fail; the runtime half lives in [N] `packages/components-svelte/src/lib/DataTable.compat.test.ts` (and the React/Vue/Angular counterparts, Angular's in the DOM harness after a fresh build, §3.7), which passes rows carrying `children` as number, string and array to a `DataTable` with no `expandable`/`getSubRows` and asserts the values render as ordinary cell data with no expand column. A `*.test.*` file alone no longer counts as the compile-time witness, because the React/Vue/Angular tsconfigs exclude `*.test.*` and Vitest transpiles without semantic checking (§3.7).

New props (all optional; defaults reproduce the current render):

| Prop | Svelte | React | Vue | Angular | Default |
| --- | --- | --- | --- | --- | --- |
| `expandable` | `expandable?: boolean` | same | same | `@Input() expandable?: boolean` | `false` |
| Sub-row accessor | `getSubRows?: (row: R) => readonly R[] \| undefined` | same | same | `@Input() getSubRows?: (row: DataTableRow) => readonly DataTableRow[] \| undefined` | none (no sub-rows) |
| Expanded ids | `expandedIds?: string[]` (`$bindable`, default `[]`) | `expandedIds?: string[]` + `onExpandedChange?: (ids: string[]) => void` (uncontrolled internal state when the prop is absent, selection precedent) | same as React, plus the `expandedChange` emit carrying the same payload | `@Input() expandedIds?: string[]`, `@Input() onExpandedChange?`, `@Output() expandedChange` (WP20 D4 split) | uncontrolled, empty |
| Detail content | `rowDetail?: Snippet<[DataTableRow]>` | `rowDetail?: (row: R) => ReactNode` | `rowDetail` scoped slot (`{ row }`) | `rowDetailTemplate?: TemplateRef<DataTableDetailContext>` (§4.1 Angular templates) | none |
| Cell content (Angular only, additive) | existing `column.cell` snippet | existing `column.cell` callback returning `ReactNode` | existing `column.cell` callback returning `VNodeChild` | `cellTemplate?: TemplateRef<DataTableCellContext>` (§4.1 Angular templates); the existing `column.cell` callback is preserved | none |
| Labels | `expandRowLabel?: string`, `collapseRowLabel?: string` | same | same | same inputs | `locale`-derived (§3.3) |

Angular template APIs (additive; the assumed mechanism does not exist today). Angular's current `cell` is a callback returning `unknown` whose result is interpolated as text (`packages/components-angular/src/DataTable.ts:25`, rendered `{{ cellContent(row, column) }}` at `:182`): it cannot render a pill `Select`, a host glyph, or any element. IF-1 therefore adds typed `TemplateRef` inputs to Angular `DataTable` and preserves the callback as the text fallback:

```ts
export interface DataTableCellContext<R extends DataTableRow = DataTableRow> {
  /** The row, for `let-row` shorthand. */
  $implicit: R;
  row: R;
  column: DataTableColumn<R>;
  /** `row[column.key]`, the value the text fallback would have shown. */
  value: unknown;
}
export interface DataTableDetailContext<R extends DataTableRow = DataTableRow> {
  $implicit: R;
  row: R;
}
```

- `@Input() cellTemplate?: TemplateRef<DataTableCellContext>` — when supplied, each cell renders `ngTemplateOutlet(cellTemplate, { $implicit: row, row, column, value: row[column.key] })` instead of the text interpolation. When absent, `column.cell` (callback → text), `cellDecoration` and `cellValue` behave exactly as today. Per-column templates, if a host needs different rendering per column, branch on `column.key` inside the one template; no per-column map is added in v1.
- `@Input() rowDetailTemplate?: TemplateRef<DataTableDetailContext>` — the detail region renders `ngTemplateOutlet(rowDetailTemplate, { $implicit: row, row })`. Presence of this input is Angular's equivalent of supplying `rowDetail` in the other frameworks.
- Both inputs are additive and typed; neither changes the meaning, type or rendering of `column.cell`. The IF-4 pill-in-cell example and the IF-7 host-glyph-in-cell example for Angular depend on `cellTemplate` (§7.6, §9.2): their Angular stages cannot land before IF-1 S3 delivers it, which §10 records as a dependency. Svelte, React and Vue need no equivalent — their `column.cell` already returns renderable content.

Rules:

- `expandable={false}` (or absent): no expand column, no detail row, no sub-row rendering; `getSubRows` is never called — for rendering, for the expandability test, and for the IF-2 counting traversal alike (single traversal rule, §5.1). Byte-identical to today. A `getSubRows` prop supplied while `expandable` is false is inert: it is stored as a prop and never invoked, and the IF-2 population stays the top-level rows (§5.1).
- A row is expandable when `expandable` is true AND (`getSubRows` returns a non-empty array for it OR detail content is supplied: `rowDetail` in Svelte/React/Vue, `rowDetailTemplate` in Angular). Rows failing this test render no expand control (the cell stays empty, keeping column alignment).
- Expansion state is keyed by row `id` at every depth and survives sorting and paging (sorting and paging operate on top-level rows only, as today). Sub-rows never consume page slots and are excluded from `rangeLabel` totals, which keep counting top-level rows.
- Sorting keeps a parent and its sub-rows together; sub-rows keep host order (they are not sorted in v1).

### 4.2 Rendering

- A leading expand column is added before the selection column. Header cell is empty (no expand-all control in v1; hosts drive `expandedIds` for that). Column counts (empty-state and detail `colspan`) include the expand column whenever `expandable` is true.
- Each expandable row renders a native `<button type="button">` in the expand cell showing the DS chevron (`chevron-right` collapsed, `chevron-down` expanded, through `Icon`), with `aria-expanded`, `aria-controls` naming the detail region when detail content exists, an `id` per row, and the accessible name `expandRowLabel`/`collapseRowLabel` plus the row id (the `selectRowLabel` concatenation precedent). Activation is isolated from the row: the button's `click` handler calls `stopPropagation()` (and the `keydown` handler for ArrowRight/ArrowLeft calls `stopPropagation()` and `preventDefault()`) so neither a mouse click, nor the synthetic `click` fired by Enter/Space on the button, nor the arrow keys ever reach the `<tr>` `onRowClick` handler — the same isolation the selection controls already apply (`DataTable.svelte:327`, `onclick={(e) => e.stopPropagation()}`). Toggling expansion never invokes `onRowClick`; row navigation, if the host wants it on disclosure, is the host's explicit act through `expandedIds`/`onExpandedChange`, not a bubbling side effect.
- While a row is expanded: its sub-rows render directly beneath it as normal data rows (same columns, same `column.cell` and decoration resolution), classed `st-dataTable__row--sub` with `data-depth` starting at 1; the first data cell is indented by depth (§4.6 tokens). Sub-rows carry the same selection control as top-level rows under the active `selectable` mode, and the header tri-state of IF-2 is computed over rendered rows (top-level visible rows plus expanded sub-rows).
- When `rowDetail` exists, one detail row renders after the sub-rows: a single cell spanning all columns containing `<div role="region" id="…" aria-labelledby="<expand button id>">` rendering the detail content. Collapsed detail content is unmounted (not hidden), so its focusable descendants leave the tab order.
- The parent row itself keeps its current semantics and classes; `st-dataTable__row--expanded` is added while expanded for styling.

### 4.3 ARIA pattern

Native table semantics plus a disclosure button (the `Collapsible` wiring of §2.6 transposed into the grid). The treegrid pattern is rejected for v1: `DataTable` is a sortable, selectable, paginated data table, not a tree; switching to `role="treegrid"` would impose roving-tabindex grid keyboard semantics on every existing consumer and break the current native table contract. Sub-row hierarchy is conveyed by DOM order, depth indentation, and the expand control state — and is listed as a residual limit in §12 for hosts that need full tree semantics.

### 4.4 Keyboard and focus

| Key | Context | Effect |
| --- | --- | --- |
| Enter / Space | Expand button focused | Toggle expansion (native button activation). |
| ArrowRight | Expand button focused, row collapsed | Expand; focus stays on the button. |
| ArrowLeft | Expand button focused, row expanded | Collapse; focus stays on the button. |
| Tab / Shift+Tab | Anywhere | Natural order: expand button, selection control, cell content, detail content (only while expanded). |

- Expanding never moves focus. Collapsing a row whose detail region contains the focus returns focus to that row's expand button. Collapsing a parent likewise removes every rendered descendant row — sub-row selection checkboxes, pill selects (`DataTable.svelte:323`-style native focusable inputs already exist in selectable rows) and any other descendant control leave the DOM together, not only the detail region: if the focused element is inside a descendant row or the detail region of the collapsed subtree, focus returns to the collapsed row's own expand button (the nearest surviving ancestor disclosure), never to `<body>`. Programmatic collapse through `expandedIds` applies the same rule, detected by checking whether `document.activeElement` is inside the subtree being removed before it is unmounted.
- Arrow keys are handled on the expand button only; they never hijack arrows elsewhere in the table (cell editors, the IF-4 pill select keep native arrow behaviour).

### 4.5 i18n

`expandRowLabel` and `collapseRowLabel` are host-overridable; defaults derive from `locale` exactly like `resolvedPreviousLabel`/`resolvedNextLabel` do today. No other new string exists; sub-row and detail content is host content.

### 4.6 Component tokens

| Token | Fallback | Use |
| --- | --- | --- |
| `--st-component-dataTable-expandColumnWidth` | `2.5rem` (the selection column width) | Expand column width. |
| `--st-component-dataTable-subRowIndent` | `1.25rem` | Indent step per sub-row depth, applied to the first data cell. |
| `--st-component-dataTable-detailBackground` | `var(--st-semantic-surface-subtle)` | Detail region cell background. |
| `--st-component-dataTable-detailPadding` | `0.75rem` (the cell padding) | Detail region padding. |

### 4.7 RED witnesses

- [N] `packages/components-svelte/src/lib/DataTable.expandable.test.ts`: collapsed render is byte-identical in structure (no expand column when `expandable` absent); expand button carries `aria-expanded`/`aria-controls`; ArrowRight expands and ArrowLeft collapses with focus retained; collapsing with focus inside the detail returns focus to the button; collapsing a parent whose expanded descendant row holds focus on its selection checkbox (and, in a second scenario, on a pill select rendered through `column.cell`) returns focus to the parent's expand button, not to `<body>`; disclosure activation by mouse click and by Enter/Space (synthetic click) toggles expansion without invoking `onRowClick`, and ArrowRight/ArrowLeft on the button do not invoke it either; controlled `expandedIds` never mutates without the host, uncontrolled state toggles internally; sub-rows render only while expanded, keep parent grouping under sort, and do not change `rangeLabel` totals or page slicing.
- [N] `packages/components-svelte/src/lib/DataTable.compat.test.ts`: the runtime half of the §4.1 compatibility witness (`children` as number/string/array renders as ordinary cell data). The compile-time half is the §3.7 fixture, not this file: [N] `DataTable.compat.fixture.ts` per port, type-checked by the port's `check` (§3.7), failing that command when a narrowed `children?: DataTableRow[]` field is restored.
- Ports: [N] `packages/components-react/src/DataTable.expandable.test.tsx`, [N] `packages/components-vue/src/DataTable.expandable.test.ts`, [N] `packages/components-angular/src/DataTable.expandable.test.ts` asserting the same contract in each idiom (callback/emit/output payloads equal the new id list), each with its own runtime `DataTable.compat` witness and its §3.7 type-check fixture; Angular witnesses run in the DOM harness after the fresh-build sequence of §3.7 and additionally assert `cellTemplate` renders element content for a cell while the preserved `column.cell` callback still renders text when no template is supplied, and `rowDetailTemplate` renders the detail region.

### 4.8 Docs changes

`apps/docs/src/routes/components/data-table/+page.svelte`: an "Expandable rows" live fixture per §3.6 (`TabbedLiveExample` with `notes`/`sources` and the §3.6 Angular compiled-fixture path for the Angular tab, one hand-written demo per framework under `live-demos/`, because `rowDetail`/scoped slots and the Angular templates cannot be expressed as a `NodeSpec`), API rows for `expandable`, `getSubRows`, `expandedIds`, `onExpandedChange`, `rowDetail`/`rowDetailTemplate`, `cellTemplate` (Angular), `expandRowLabel`, `collapseRowLabel`, and a usage note stating the table-plus-disclosure pattern, the accessor rule (the DS never reads a row key for nesting) and the focus-return rules. No API row documents a row `children` field, because none is added.

### 4.9 Gate

S1 gate: the Svelte witness passes targeted, then full Svelte package test and check (§3.7). S2/S3 gates repeat per framework. The lot closes only at S3 (full parity) or is announced per-stage under §3.5.

## 5. IF-2 — `DataTable`: bulk action bar (pattern #15)

`accord`: build, inside `DataTable`, not as a separate component. It interacts with the existing `selectable` machinery and reuses its state; no selection model change.

### 5.1 Additive API

New props (all optional):

| Prop | Svelte | React | Vue | Angular | Default |
| --- | --- | --- | --- | --- | --- |
| Actions content | `bulkActions?: Snippet<[{ count: number; total: number; selectedIds: string[] }]>` | `bulkActions?: ReactNode` (the host reads the same values from its own selection state; the snippet context is the Svelte/Vue/Angular shape) | `bulkActions` scoped slot (`{ count, total, selectedIds }`) | `bulkActionsTemplate?: TemplateRef<DataTableBulkActionsContext>` (below) | none (bar disabled) |
| Count/announcement text | `selectionLabel?: (selection: { count: number; total: number }) => string` | same | same | same input | `locale`-derived (§3.3) |
| Bar label | `bulkBarLabel?: string` | same | same | same input | `locale`-derived (§3.3) |

Angular bulk-actions template (additive, typed; extends the §4.1 template family):

```ts
export interface DataTableBulkActionsContext {
  $implicit: { count: number; total: number; selectedIds: string[] };
  count: number;
  /** Selectable-row total for the current `expandable` value (§5.1 single traversal rule). */
  total: number;
  selectedIds: string[];
}
```

`@Input() bulkActionsTemplate?: TemplateRef<DataTableBulkActionsContext>` renders through `ngTemplateOutlet` with that context; its presence is Angular's equivalent of supplying `bulkActions`. The existing Angular callback inputs are untouched.

Rules:

- The bar is enabled by supplying `bulkActions` content. Without it, nothing renders and the table is byte-identical to today, whatever the selection.
- The bar renders only while `selectable === "multiple"` AND the effective selection count (§5.1 denominator rule) is greater than 0. Under `single` or `none` it never renders.
- Denominator rule — single traversal and counting rule (one rule governs rendering, the expandability test and counting; §4.1 states the same rule from the IF-1 side). The counting population is defined by `expandable`, not by the mere presence of the accessor: (i) when `expandable` is true AND `getSubRows` is supplied, the population is every distinct row id reachable from `rows` by recursively applying `getSubRows` (the same traversal that renders sub-rows and tests expandability; collapsed subtrees are still traversed for counting, so collapse never changes the population); (ii) when `expandable` is true with detail content but no `getSubRows`, or whenever `expandable` is false or absent — including the combined case `bulkActions` + `getSubRows` supplied + expansion disabled — the population is the top-level `rows` only (`rows.length`), and `getSubRows` is not invoked for counting (or for anything else, §4.1), so a supplied-but-inert accessor has no observable effect. `total` is the size of that population; it is never the pagination `rangeLabel` total, which keeps counting top-level rows for the footer (`DataTable.svelte:141` range derivation stays unchanged) even in case (i). `count` is the number of `selectedIds` that belong to the current population, so `count <= total` always holds within a fixed `expandable` value: with expansion enabled, one parent with its two sub-rows all selected yields `{ count: 3, total: 3 }`, never `{ count: 3, total: 1 }`; with expansion disabled the same host state yields `{ count: 1, total: 1 }` (only the top-level id belongs, the two sub-row ids are outside the population). Selection ids outside the current population — ids that no longer resolve, and sub-row ids while `expandable` is false — are excluded from `count` (they still round-trip through the controlled `selectedIds` prop untouched; the DS never prunes host state). Changing `expandable` at runtime recomputes `total` and `count` immediately against the new population and re-evaluates bar visibility and the §5.3 announcement from the recomputed pair, without mutating `selectedIds`, `expandedIds`, or any rendered expansion state beyond what the new `expandable` value itself dictates; toggling `expandable` back restores the previous pair. Selection persists across collapse and paging exactly as today — collapsing a parent (while `expandable` stays true) or changing page hides rows without changing `count`, and expanding or returning to the page restores their rendered checkboxes in sync.
- Host actions are opaque host controls (for example "Add to list" in pattern #15). The DS never interprets, disables or reorders them, and never clears the selection on their behalf; clearing stays the host's act through `selectedIds`, or the user's act through the checkboxes.

### 5.2 Rendering and selection interaction

- The bar renders inside `.st-dataTable-wrap`, directly above the table: a `role="region"` landmark labelled by `bulkBarLabel`, containing, in order: a select-all checkbox, the visible count text, then the `bulkActions` content aligned to the end.
- The bar checkbox mirrors the header checkbox state over the same rendered-row set (checked when all rendered rows are selected, indeterminate when some are — the existing `allVisibleSelected`/`someVisibleSelected` computation, extended by IF-1 to expanded sub-rows) and shares its toggle (`toggleAllVisible` semantics) and its `selectAllLabel` accessible name. Header and bar checkboxes are two views of one state; toggling either updates both.
- Select-all scope is settled here, not left open: it covers the rendered rows only — the visible page plus the expanded sub-rows currently rendered — identical in the header and in the bar, exactly matching the current `toggleAllVisible` behaviour over `visibleRows` (`DataTable.svelte:193`). Widening the existing header checkbox to the whole dataset would change the meaning of an existing control and violate §3.1, so it is not the default and not an open question. A dataset-wide operation, if a future lot needs one, requires a separate explicit opt-in prop (for example a `selectAllScope` addition proposed and ratified on its own); IF-2 ships no such prop, and hosts that need dataset-wide selection today drive `selectedIds` directly. This settles former Q1 (§11).
- Showing the bar never moves focus and never changes table layout below it beyond its own height. Hiding the bar can remove the focused element: clearing the last selected row through the bar's own select-all checkbox (or through a host action that clears the selection) unmounts that checkbox together with the bar. In that case focus returns to the surviving header select-all checkbox before the bar is removed — the header checkbox is the same control in its other view and is always rendered while `selectable === "multiple"`; if focus is on any other control inside the bar when the bar disappears, it returns to the header checkbox as well. Focus never falls to `<body>` because the bar hid.

### 5.3 Announcements

- A visually hidden `aria-live="polite"` span (separate from the bar, which contains focusable actions) announces `selectionLabel({count, total})` whenever the count changes, including the appearance at count 1 and the return to 0. The visible count text shows the same string.
- No announcement fires on first mount with an empty selection.

### 5.4 i18n

The count sentence, the bar label and the select-all name are host-supplied or `locale`-derived (§3.3); the DS composes no sentence of its own. Action labels belong to the host controls.

### 5.5 Component tokens

| Token | Fallback | Use |
| --- | --- | --- |
| `--st-component-dataTable-bulkBarBackground` | `var(--st-semantic-surface-subtle)` | Bar background. |
| `--st-component-dataTable-bulkBarBorder` | `var(--st-semantic-border-subtle)` | Bar border. |
| `--st-component-dataTable-bulkBarRadius` | `var(--st-component-dataTable-radius, 0.5rem)` | Bar corner radius. |
| `--st-component-dataTable-bulkBarPadding` | `0.5rem 0.75rem` | Bar padding. |

### 5.6 RED witnesses

- [N] `packages/components-svelte/src/lib/DataTable.bulkBar.test.ts`: no bar without `bulkActions`; no bar at count 0; bar appears at count 1 with the `selectionLabel` text visible and announced in the live region; bar and header checkboxes stay in sync (checked and indeterminate) in both directions; bar never renders under `selectable="single"`; pagination keeps the total count; host action activation does not clear the selection; select-all from either checkbox affects the rendered page only and leaves an off-page selection intact (the settled scope of §5.2); with `expandable` true and `getSubRows` supplied, selecting a parent and its two sub-rows reports `{ count: 3, total: 3 }` to `selectionLabel`, the count survives collapsing the parent and paging away and back, and `rangeLabel` totals still count top-level rows only; clearing the last selection through the focused bar checkbox returns focus to the header checkbox, and clearing it through a focused host action inside the bar does the same. Combined-traversal witness (same file, the §5.1 single rule): a table with `bulkActions`, a spied `getSubRows` (parent → two sub-rows) and `expandable={false}` reports `{ count: 1, total: 1 }` when the parent and both sub-row ids are in `selectedIds`, the spy records zero calls, and no sub-row renders; toggling `expandable` to true (same rows, same `selectedIds`, same accessor) reports `{ count: 3, total: 3 }` without any `selectedIds` mutation, and toggling back to false returns to `{ count: 1, total: 1 }` with the spy again uncalled for the disabled render/count pass.
- Ports: [N] `packages/components-react/src/DataTable.bulkBar.test.tsx`, [N] `packages/components-vue/src/DataTable.bulkBar.test.ts`, [N] `packages/components-angular/src/DataTable.bulkBar.test.ts` with the same assertions, including the combined-traversal witness in each idiom; Angular runs in the DOM harness after the fresh-build sequence (§3.7) and additionally asserts `bulkActionsTemplate` receives `{ count, total, selectedIds }` with the §5.1 population for the current `expandable` value.

### 5.7 Docs changes

`data-table` page: a "Bulk actions" live fixture per §3.6 (`TabbedLiveExample` with the §3.6 Angular compiled-fixture path for the `bulkActionsTemplate` tab, one demo per framework, because `selectionLabel` is a function prop and `bulkActions` is a snippet/scoped slot/template that no `NodeSpec` can carry), API rows for `bulkActions`/`bulkActionsTemplate`, `selectionLabel`, `bulkBarLabel`, and a usage note: the bar is selection-driven, actions are host-owned, select-all covers the rendered rows only (§5.2, settled), and `count`/`total` share the §5.1 population for the current `expandable` value (flattened only while expansion is enabled).

### 5.8 Gate and sequencing

IF-2 SHALL NOT start before IF-1 closes its S1 gate: both lots rewrite the `DataTable` header/body rendering (expand column and tri-state set versus bar and checkbox sync), and parallel edits to the same files are excluded. IF-2 then follows the same S1 → S2 → S3 staging and offline gate as IF-1 (§3.7, §4.9).

## 6. IF-3 — `KpiCard`: `breakdown` (pattern #4)

`accord`: build, additive extension. A list of `{label, value, tone?}` under the main value (status ventilation of the KPI).

### 6.1 Additive API

```ts
export type KpiCardBreakdownTone = "neutral" | "success" | "warning" | "error" | "info";

export interface KpiCardBreakdownItem {
  label: string;
  value: string | number;
  tone?: KpiCardBreakdownTone;
}
```

New prop on all four frameworks: `breakdown?: KpiCardBreakdownItem[]` (Angular: `@Input() breakdown?: KpiCardBreakdownItem[]`). The tone union reuses the Tag/Badge feedback set, not the categorical `KpiCardTone` (which stays the left-accent palette) and not `CellDecorationIntent` (which stays the conditional-formatting API).

Rules:

- `breakdown` absent or empty: nothing renders; the card is byte-identical to today.
- Item order is host order; the DS never sorts, aggregates or deduplicates. Duplicate labels are host responsibility.
- A numeric `value` is formatted with `Intl.NumberFormat(locale)` (plain number style, the `KpiCard` precedent); a string `value` renders as supplied (host pre-formatting, including units and percents).

### 6.2 Rendering and accessibility

- The list renders after the value row and before the delta/sparkline footer: `<ul class="st-kpiCard__breakdown">` with one `<li>` per item containing an optional tone dot (`aria-hidden="true"`), the label, and the value aligned to the end.
- Tone is never the only signal: the label and value text are always present (§3.2). A non-neutral tone colours the dot only; the label and the value text keep the contrast-safe text tokens (§6.4) and never take the full feedback token as a text colour. Contrast calculation policy (applies to every ratio quoted in §6 and §7): a 14% tint is the `color-mix(in srgb, <feedback> 14%, white)` result computed per sRGB channel without intermediate 8-bit rounding (channel = 0.14 × feedback channel + 0.86 × white channel, kept as a real number), WCAG relative luminance is computed from those unrounded channels after sRGB linearisation, the ratio is `(L1 + 0.05) / (L2 + 0.05)`, and rounding to two decimals happens only when a ratio is displayed. Fixtures compare computed ratios with a tolerance of ±0.05 (a renderer that quantises the tint to 8-bit integers before the luminance step lands inside that band; no pass/fail conclusion in §6 or §7 flips within it, the tightest margin being the warning dot at 3.19:1 against the 3:1 floor). Under that policy the measured feedback values (`packages/tokens/src/foundation.ts`, `--st-semantic-feedback-success` `#16a34a`, `--st-semantic-feedback-warning` `#d97706`) give 3.30:1 and 3.19:1 on white — below the 4.5:1 floor for the breakdown's normal-size text — and 2.82:1 / 2.74:1 on their own 14% tints, so full-token text is not a conforming option here even though the existing delta arrow uses it beside a larger value. The dot is a non-text graphic: the same values give 3.30:1 (success), 3.19:1 (warning), 4.83:1 (error `#dc2626`), 5.17:1 (info `#2563eb`) against the card surface, each at or above the 3:1 non-text floor, and the label text beside it carries the meaning anyway. This lot does not restyle the existing delta; it only binds its own new text safely.
- The items are ordinary DOM text inside the `role="group"` card, so assistive technology reads them in order; the composed root `aria-label` is unchanged (label, value, delta only) to avoid double reading. `measured` basis: the current `ariaLabel` derivation in `KpiCard.svelte`.

### 6.3 i18n

Labels and string values are host content; numeric values go through `locale`. No new DS string exists in this lot.

### 6.4 Component tokens

| Token | Fallback | Use |
| --- | --- | --- |
| `--st-component-kpiCard-breakdownGap` | `var(--st-spacing-1, 0.25rem)` | Vertical gap between breakdown items. |
| `--st-component-kpiCard-breakdownLabelText` | `var(--st-semantic-text-secondary)` | Item label colour: `#475569` on white is 7.58:1 (computed by WCAG relative luminance), passing 4.5:1 for normal text. |
| `--st-component-kpiCard-breakdownValueText` | `var(--st-semantic-text-primary)` | Item value colour for every tone: `#0f172a` on the card surface (white) is 17.85:1, passing 4.5:1 for normal text. Tone never recolours this text. |
| `--st-component-kpiCard-breakdownBorder` | `var(--st-semantic-border-subtle)` | Optional separator above the list. |

Tone for the dot reads `--st-semantic-feedback-*` directly (no per-tone component token): the dot background is the feedback value itself, a non-text graphic at 3.30:1 (success), 3.19:1 (warning), 4.83:1 (error), 5.17:1 (info) on white. No breakdown text token falls back to a feedback token.

### 6.5 RED witnesses

- [N] `packages/components-svelte/src/lib/KpiCard.breakdown.test.ts`: absent/empty `breakdown` renders no list; three items render in host order with label and value; numeric values follow `Intl.NumberFormat(locale)`; a toned item exposes dot plus text (tone class on the item, dot `aria-hidden`); the root `aria-label` is unchanged by the breakdown; the value element's resolved colour is the `--st-component-kpiCard-breakdownValueText` fallback (text-primary), not the tone's feedback token, for each of success/warning/error/info, and a committed contrast fixture pins the computed ratios of §6.2/§6.4 under the §6.2 calculation policy (unrounded tint channels, display rounding only) with ±0.05 tolerance (label 7.58:1 on white, value 17.85:1 on white, dots at or above 3:1) so a future token change that drops a text colour below 4.5:1 fails the witness.
- Ports: [N] `packages/components-react/src/KpiCard.breakdown.test.tsx`, [N] `packages/components-vue/src/KpiCard.breakdown.test.ts`, [N] `packages/components-angular/src/KpiCard.breakdown.test.ts` with the same assertions.

### 6.6 Docs changes

`apps/docs/src/routes/components/kpi-card/+page.svelte`: a "Breakdown" `TabbedExample` (one KPI ventilated by status with tones), API rows for `breakdown` and the `KpiCardBreakdownItem` type, and a usage note: host order is kept, tone never replaces text.

### 6.7 Gate

S1 → S2 → S3 staging and the offline gate as §3.7. Independent of IF-1/IF-2 (no shared file) and may proceed in parallel with them.

## 7. IF-4 — `Select`: compact pill variant for table cells (pattern #16)

`accord`: build. An editable status pill inside a `DataTable` cell, with a tone per value.

### 7.1 Additive API

```ts
export type SelectVariant = "default" | "pill";
export type SelectTone = "neutral" | "success" | "warning" | "error" | "info";
```

New props on all four frameworks:

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `variant` | `SelectVariant` | `"default"` | `"pill"` renders the compact fully-rounded control for grid cells. |
| `tones` | `Record<string, SelectTone>` | none | Tone keyed by option value; the tone of the current value tints the closed control. |

Rules:

- `variant="default"` (or absent), with or without `tones`: byte-identical to today. `tones` without `variant="pill"` has no visual effect (documented, not an error).
- Effective selected value (the value the tone resolves from, in every framework) is derived from the actual native selection, never from a prop snapshot alone: the controlled value when the host controls the select, otherwise the `<select>` element's current selected value (`select.value`, equivalently the selected `<option>`'s value) read from the DOM. Concretely — Svelte: the bindable `value`, which the native binding keeps equal to the DOM selection. React: `value` when it is supplied (controlled); when it is absent the component is uncontrolled and the effective value is the DOM selection, held in an internal tracker that is seeded and re-synced from the DOM element itself (a ref read after mount), not computed from props: the seed is the native initial selection — `defaultValue` when supplied, otherwise the first non-disabled option (the native element skips a disabled first option when choosing its initial selection, so a literal "first option" seed is wrong whenever that option is disabled) — and the tracker is updated on every native `change` before the host's `onChange` (passed through `...rest` today, `packages/components-react/src/catalog.tsx` `Select`) is forwarded unchanged — resolving solely from a `value` prop would leave every uncontrolled pill neutral, which is the defect this rule closes. Vue: `modelValue` when supplied (controlled, the existing `value: props.modelValue` binding); when `modelValue` is `undefined` the component is uncontrolled and the effective value is likewise read from the DOM select after mount and on `change`, seeded by the native initial selection over `options`/children (first non-disabled option). Angular: `modelValue ?? value` (the existing `currentValue` derivation, `packages/components-angular/src/Select.ts`) when either input is supplied; when both are absent the effective value is read from the rendered `<select>` element after view init and on `(change)`, seeded by the native initial selection (the placeholder branch and disabled options follow the native rule). In every framework the resolved tone is `tones[String(effectiveValue)]`, falling back to `"neutral"` (no feedback tint; the pill keeps its neutral chrome). The host owns the value-to-tone mapping (status semantics stay host-side, as with decorations).
- Native change and reset behaviour is preserved, and the tracker follows the native element through reset, which emits no `change`: no framework gains a new change event, swallows the native one, or converts an uncontrolled select into a controlled one. In the uncontrolled case each framework re-reads the DOM selection after a form reset restores the default — by listening for the form's `reset` event (on the owner `<form>`, observed from the select through a form-scoped listener or the framework's reset hook) and re-reading `select.value` once the reset has applied (next microtask/frame, after the browser has restored `defaultValue`/initial selection), and equivalently after a reset button (`<button type="reset">` / `<input type="reset">`) activation, which reaches the component through the same form `reset` event. A `form.reset()` call, a reset-button click, a user `change`, and a host remount therefore all converge on the same rule: the tone reflects whatever the native element currently shows. In React the internal tracker is state the component already needs for the tone; it never writes back into `value`/`defaultValue`, a host remount (or changing `defaultValue` on a remounted control) re-seeds it from the new DOM selection, and a controlled `value` witness covers the same transitions without internal state. A tracker updated only on `change` does not satisfy this rule: after `draft → ready` by user change followed by `form.reset()`, the native value returns to `draft` with no `change` event, and the pill tone SHALL return with it.
- `size` stays orthogonal; the documented cell combination is `variant="pill"` with `size="sm"`. Pill density comes from `size`, not from a second density prop.
- Options stay native `<option>` elements (children in Svelte/React, `options` in React/Vue/Angular) with unchanged values and disabled handling. The value binding (`value`/`modelValue`) is unchanged.

### 7.2 Rendering, keyboard, accessible name

- `variant="pill"` adds `st-select--pill` on the control and `st-field--pill` on the wrapper: fully rounded control (`--st-radius-pill` fallback chain of Tag/Badge), tint background `color-mix` 14% of the resolved feedback token, text in the contrast-safe pill text token (§7.4) for every tone, and a wrapper that imposes no field max-width and no label grid gap, so the control fits a table cell. Tone is carried by the tint background (and the chevron keeps the text colour); the text itself is never the full feedback token, because that pairing fails under the §6.2 calculation policy: full-token text on its own 14% tint computes to 2.82:1 (success), 2.74:1 (warning), 3.88:1 (error), 4.25:1 (info) — each below 4.5:1 for the pill's normal-size text. The Tag/Badge recipe (tint plus full-token text) is therefore not reused for this control's text; §6.2 makes the same correction for `KpiCard`.
- The control remains a native `<select>`: keyboard is the platform contract (Tab to reach it, ArrowUp/ArrowDown and type-ahead to change, Enter/Space behaviour of the platform). No custom key handling is added, so inside a `DataTable` cell the arrows never conflict with IF-1's expand-button arrows (different focused elements).
- Accessible name inside a grid cell: when `label` is supplied it names the control as today. In a cell the host SHALL pass an accessible name that carries the row context through `aria-label` (forwarded to the `<select>` by `...rest` in Svelte and React, an explicit input in Angular; Vue forwards attrs the same way). The docs example uses a per-row name (status of the named row). A pill select with neither `label` nor `aria-label` is a host error, stated in the docs as a usage requirement (the same status as the `IconButton` name rule of §9.2: a documented MUST for hosts, not a new type-level requirement).
- Platform limit, stated in the docs: browsers render the open option list; per-option tinting inside the open list is not available on a native select. The tone applies to the closed control only. Replacing the native select with a custom listbox is out of scope (§12).

### 7.3 i18n

No new DS string. Option labels and the `aria-label` are host content.

### 7.4 Component tokens

| Token | Fallback | Use |
| --- | --- | --- |
| `--st-component-select-pillRadius` | `var(--st-radius-pill, 999px)` | Pill corner radius. |
| `--st-component-select-pillPaddingInline` | `0.625rem` | Pill inline padding (chevron gutter still reserved by the existing select padding rule). |
| `--st-component-select-pillText` | `var(--st-semantic-text-primary)` | Closed-control text for every tone. Computed on the 14% tints under the §6.2 policy (unrounded sRGB mix, WCAG relative luminance, display rounding only): 15.28:1 on the success tint, 15.37:1 on warning, 14.35:1 on error, 14.68:1 on info, 17.85:1 on white for the neutral chrome — each passing 4.5:1 for normal text. Fixture tolerance ±0.05 (§6.2). |

Tone tints read `--st-semantic-feedback-*` through the `color-mix` recipe for the background only; neutral reads the existing control background tokens, and the text token above applies on all of them. No other token changes; the field anatomy tokens keep applying.

### 7.5 RED witnesses

- [N] `packages/components-svelte/src/lib/Select.pill.test.ts`: default variant renders byte-identically (no pill classes); `variant="pill"` with `tones` tints the closed control per current value and follows value changes; an unmapped value falls back to neutral chrome; `aria-label` reaches the `<select>`; keyboard value change through the native control still emits the bound value; the closed control's text colour resolves through `--st-component-select-pillText` (text-primary) on every tone, and a committed contrast fixture pins the §7.4 ratios under the §6.2 policy with ±0.05 tolerance (15.28:1 / 15.37:1 / 14.35:1 / 14.68:1 on the tints) against the full-token pairings that fail (2.82:1 / 2.74:1 / 3.88:1 / 4.25:1).
- Ports: [N] `packages/components-react/src/Select.pill.test.tsx`, [N] `packages/components-vue/src/Select.pill.test.ts`, [N] `packages/components-angular/src/Select.pill.test.ts` with the same assertions. The React witness additionally covers the uncontrolled contract of §7.1: an initial `defaultValue` tints the pill on first render, a user change through the native control moves the tone and still delivers the host `onChange`, and a host remount (remount with a different `defaultValue`) re-tints from the new seed; the controlled `value` witness covers the same transitions without internal state. Uncontrolled native-selection witnesses (React file above; the same three scenarios in the Svelte, Vue and Angular ports, Angular in the DOM harness after the fresh-build sequence, §3.7): (1) `form.reset()` — a pill inside a `<form>` with `defaultValue="draft"` (tones for `draft` and `ready`), changed by the user to `ready` (tone follows, host `onChange` delivered), then `form.reset()` restores the native value to `draft` with no `change` event and the pill tone returns to the `draft` tone without a remount; (2) reset button — the same transition driven by activating a `<button type="reset">` (and, where the harness supports it, `<input type="reset">`) inside the form, with the same tone restoration; (3) disabled first option — an uncontrolled pill whose first `<option>` is `disabled` (no `defaultValue`, no controlled value) tints on first render from the first non-disabled option's tone (the native initial selection), not from the disabled option's value and not neutral-by-first-option. A change-only tracker fails witnesses (1) and (2); a literal first-option seed fails witness (3).

### 7.6 Docs changes

`apps/docs/src/routes/components/select/+page.svelte`: a "Pill in a table cell" live fixture per §3.6 (`TabbedLiveExample` with the §3.6 Angular compiled-fixture path for the Angular tab, one demo per framework — the example renders the pill through `column.cell` in Svelte/React/Vue and through `cellTemplate` in Angular, so it depends on IF-1 S3 for its Angular tab, §10), API rows for `variant` and `tones`, and usage notes covering the closed-control-only tint limit, the contrast-safe text rule, the native-selection/reset behaviour of §7.1 and the accessible-name rule. The `data-table` page gains a cross-link from its cell-content section once IF-1 closes (cell rendering is already documented there).

### 7.7 Gate

S1 → S2 → S3 staging and the offline gate as §3.7. The `Select` component itself is independent of the other lots; only its Angular in-cell documentation (and any Angular host rendering a pill inside a `DataTable` cell) depends on IF-1 S3 `cellTemplate` (§4.1, §10).

## 8. IF-5 — `Notification`: app-level banner variant (pattern #23)

`accord`: build. A full-width banner pinned to the top of the shell, typically `tone="warning"` with actions (impersonation banner: "View as…", "Exit Preview").

### 8.1 Additive API

`Notification` gains one prop on all four frameworks:

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `variant` | `"inline" \| "banner"` | `"inline"` | `"banner"` renders the app-level full-width form. |

`Notification` also gains one optional label prop for the banner landmark (§8.2): `bannerLabel?: string` (Angular: `@Input() bannerLabel?: string`), default none. It names the banner region only; it is ignored by the inline variant.

`AppShell` gains one optional region on all four frameworks: `banner` (Svelte snippet, React node prop, Vue slot, Angular through the shell's existing projection mechanism — a `[slot=banner]` projection beside the existing `[slot=topChrome]`), rendered in a `st-appShell__banner` container above `topChrome`, spanning the full shell width. Supplying no `banner` renders nothing there (byte-identical shell). Placement and pinning are defined by the grid contract below, not by a sticky rule inside a same-height wrapper.

Rules:

- `variant="inline"` (or absent): byte-identical to today, including the capped width and the §8.2 dismissal and role wiring.
- `variant="banner"` inside the AppShell `banner` region (the recommended placement, and the one pattern #23 requires pinning for): class `st-notification--banner`; width is 100% with no cap, corner radius 0, the tone accent keeps applying (left accent or top accent per theme tokens). Pinning is structural, and grid rows alone do not provide it: the shell today is unbounded (`min-block-size: 100%` in Svelte `AppShell.svelte`, `min-block-size: 100vh` in the ports' shared `styles.css`), so a four-row template by itself still grows with its content — in an 800px viewport a tall `main` produced a 2054px shell whose document scrolled while `main.scrollTop` stayed at zero, carrying the banner off screen. The banner-present shell therefore carries an explicit sizing and overflow contract, in Svelte and in the shared CSS of the three ports alike. Sizing: when (and only when) banner content is supplied, the shell root gains `data-has-banner` (or the equivalent class) and, in that state only, `block-size: 100vh` with `block-size: 100dvh` as the progressive value, `max-block-size: 100vh` / `100dvh` on the same lines, and `overflow: hidden` on the shell root, so the shell's height is bounded to the viewport height and can never grow with `main` content; a host that embeds the shell in a height-constrained ancestor keeps that ancestor as the outer bound because the shell never exceeds the viewport either way, and the DS adds no second height mechanism. Grid: in the same `data-has-banner` state the template becomes `grid-template-rows: auto auto minmax(0, 1fr) auto`, `.st-appShell__banner` is assigned `grid-row: 1`, `topChrome` moves to row 2, `__body` to row 3 and the bottom panel to row 4 (today: three rows `auto minmax(0, 1fr) auto`, `topChrome` row 1, `__body` row 2, bottom panel row 3 — `AppShell.svelte` grid rules; the React/Vue/Angular shared CSS fixes the same rows, `styles.css` `.st-appShell__topChrome { grid-row: 1 }`, `__body { grid-row: 2 }`, `__bottomPanel { grid-row: 3 }`); the `minmax(0, 1fr)` body row is what the bounded height constrains, so tall content shrinks the body row instead of stretching the shell. Overflow and scroll ownership: `.st-appShell__main` (`overflow: auto`, flex child of `__body` with `min-block-size: 0`) is the sole vertical scroll owner for workspace content in the banner-present shell — `main` scrolls, side panels keep their current `overflow: hidden`, the shell root clips, and the document (`html`/`body`/window) does not scroll because of shell content; the banner row sits outside every scroll container, so the banner stays at the top of the shell while `main` scrolls under the grid. Absent-banner behaviour is preserved exactly: when no banner is supplied there is no `data-has-banner`, no `block-size`/`max-block-size` bound and no root `overflow` change, the three-row template and every current row assignment are byte-identical, and document scrolling behaves exactly as today in all four frameworks (hosts that rely on an unbounded, document-scrolling shell without a banner see no change; the bound is a banner-present contract, not a shell-wide one). No `position: sticky` is involved in the shell placement, and none could substitute for the bound: a sticky element inside a wrapper of its own height (the banner inside `.st-appShell__banner`, or a notification inside its section) has no taller scroll ancestor to travel within and cannot pin against document scroll. The pinning owner for the shell placement is therefore the bounded shell grid plus `main` as scroll owner.
- `variant="banner"` standalone (host layout, no AppShell) — settled, option A (§11 records the settlement; this clause is normative, not provisional): the DS renders the full-width block in flow and does not move, portal or stick the node. If the host wants it to remain visible while the page or a host scroll region scrolls, the host wraps it in its own sticky container (an ancestor taller than the banner, with the host's scroll ownership); the §8.4 `bannerTop`/`bannerZIndex` tokens are provided for that host wrapper to consume, and the DS claims no pinning for the standalone placement. The DS itself applying `position: sticky` to the standalone root (former option B) is rejected: it pins only when an ancestor happens to be a taller scroll container and silently does nothing otherwise, so the DS would claim a behaviour it cannot guarantee; the AppShell placement that pattern #23 names is already pinned by the bounded grid above, and a host that needs document-scroll pinning owns exactly the ancestor that makes sticky work.
- Existing props compose unchanged: `title` (required), `message`, `actions` (host controls, for example an "Exit Preview" button), children. The impersonation case is `tone="warning"` plus one host action; no new action API is added.

### 8.2 Dismiss rule and announcements

- Not dismissible unless the host allows it, under each framework's existing contract, preserved by default (§2.4): Svelte and React render the close control only when `dismissible && onDismiss` are both supplied (`canDismiss`); Vue renders it whenever `dismissible` is true and emits `dismiss`; Angular renders it whenever `dismissible` is true and emits `dismiss`, with no `onDismiss` input to supply. `variant="banner"` changes none of these conditions, adds no close control on its own in any framework, and never requires an existing event-based Vue or Angular consumer to migrate to a callback prop: a Vue banner closes through `@dismiss`, an Angular banner through `(dismiss)`, a Svelte/React banner through `onDismiss`, each exactly as the inline variant does today. The DS never hides a banner by itself.
- Announcement and landmark are separate concerns, and neither is claimed from the inline wiring. The inline variant keeps its current root exactly: `role="alert"` for `error`, `role="status"` otherwise, wrapping title, message, children, actions and the close control (§2.4, §3.2 preserved exception) — a populated `role="status"` element inserted with its content does not guarantee an announcement of that initial content, and this specification does not claim one for inline. For the banner variant: (a) Landmark — when the host supplies `bannerLabel`, the banner root is a named region, `role="region"` with `aria-label={bannerLabel}` (adding `aria-label` to a `role="status"` element does not create a landmark, so the banner does not reuse that role for this purpose); without `bannerLabel` the banner carries no landmark role and is found by its heading in reading order. (b) Announcement lifecycle, with an explicit initial-versus-dynamic discriminator (a deferred fill on every mount does not discriminate: hydration and initial client mounts run the same mount callbacks as a later insertion, so an unconditional fill would announce initial banners too). The discriminator is presence in the initial commit, defined as the first committed render of the tree that contains the banner: server-rendered HTML adopted by hydration is an initial commit, and so is the first client render of the root/shell; any banner whose node is created by a later update (an absent → present transition, a new banner instance, a route change) after that first commit has been presented (first frame) is dynamic. Mechanism per placement, identical semantics in all four frameworks: in the `AppShell` placement the shell owns the discriminator — it records whether the `banner` region was populated in its own first commit and stamps the `.st-appShell__banner` container `data-banner-presentation="initial" | "dynamic"` (recomputed only when the region transitions absent → present: a region populated at first commit stays `initial` for that banner instance, a region populated later is stamped `dynamic` at insertion), and the `Notification` inside reads that stamp from its shell container (framework context/prop drilling inside `AppShell`, or the DOM attribute, at the implementer's choice, as long as the stamp is set before the banner's deferred-fill decision runs). Standalone (no shell), the banner uses the document initial window: a per-document flag, registered once by the first banner-capable mount, that starts open and closes at the end of the first frame after the initial commit (post-mount task/`requestAnimationFrame`); a standalone banner mounted while the window is open is `initial`, one mounted after it closed is `dynamic` — a standalone banner inserted in the same initial task/frame as the first paint is therefore `initial` by definition, which the docs state as the boundary. Behaviour from the discriminator: an `initial` banner's dedicated visually hidden `aria-live="polite"` announcer is rendered empty and is never populated for its initial `title` (no fill is scheduled), so it is not announced on load and is instead discoverable as a region/heading, which the docs state explicitly; a `dynamic` banner's announcer is likewise rendered empty with the banner and is populated with the banner's `title` text only after mount (next frame/task, the standard deferred-fill pattern), so it is announced once. In both cases the banner never relies on its insertion node itself being announced, subsequent host-driven changes to `title` after the initial presentation re-populate the announcer (an `initial` banner whose title later changes announces the new title, because the change, not the load, is the event), and actions and the close control stay outside the announcer, as §3.2 requires for new regions. The banner never traps or steals focus. An `error` banner populates the same polite announcer under the same discriminator: a persistent app banner is a standing region, not an interruption, and the docs direct hosts that need an assertive interruption to the existing inline `alert` or `Toast` mechanisms.
- Dismissal, exit actions and any persistence (for example remembering a closed banner) are host behaviour.

### 8.3 i18n

No new DS string. `title`, `message`, action labels and `dismissLabel` (existing, `locale`-derived with host override) carry all language.

### 8.4 Component tokens

| Token | Fallback | Use |
| --- | --- | --- |
| `--st-component-notification-bannerBackground` | `var(--st-component-notification-background, var(--st-semantic-surface-raised))` | Banner background. |
| `--st-component-notification-bannerTop` | `0` | Top offset for a host-owned sticky wrapper around a standalone banner (§8.1); not used by the AppShell grid placement. |
| `--st-component-notification-bannerZIndex` | `10` | Stacking for that host-owned sticky wrapper; not used by the AppShell grid placement. |

The AppShell `banner` container itself introduces no token (full-width block, no padding of its own; the banner component owns its padding as today). Its row assignment and the banner-present bounded height live in the shell grid rules of §8.1, in Svelte and in the shared port CSS alike; no token overrides the viewport bound, because a theme-redefinable bound would reopen the unbounded-shell failure of §8.1.

### 8.5 RED witnesses

- [N] `packages/components-svelte/src/lib/Notification.banner.test.ts`: inline default renders byte-identically; `variant="banner"` carries the banner class and full-width rule; a warning banner with actions renders the host action; no close control without `dismissible` plus `onDismiss`, and exactly one with both (the Svelte contract); with `bannerLabel` the banner root is `role="region"` with that name and carries no `status` role, and without it no landmark role; the announcer contains no focusable element. Announcement discriminator witnesses (the §8.2 initial-commit rule; DOM text alone is not the assertion — each scenario asserts the announcer's mutation sequence, empty at the insertion commit and filled only in a later task where a fill is due, which is the observable deferred-fill pattern the announcement claim rests on; an automated gate does not claim a screen-reader utterance itself): (i) hydration — server-render the shell with the banner, hydrate it, advance frames/tasks, and assert the announcer is still empty and the container stamp is `initial`; (ii) initial client render — mount the shell with the banner in the first client commit (no server HTML), advance frames/tasks, and assert the same silence and `initial` stamp; (iii) later insertion — mount the shell without a banner, let the first commit present, then insert the banner and assert the announcer is empty synchronously at insertion, carries the `title` text after the deferred fill, and the stamp is `dynamic`; in scenarios (i) and (ii) a subsequent `title` change re-populates the announcer, and in scenario (iii) a further `title` change does the same.
- [N] `packages/components-svelte/src/lib/AppShell.banner.test.ts`: no `banner` region content, no `data-has-banner`, no bounded-height rule, and the three-row grid unchanged when the slot is absent; supplied banner content renders above `topChrome` at full width with the four-row assignment and bounded shell of §8.1. Browser scroll/layout witnesses ([N] `packages/components-svelte/src/lib/AppShell.banner.browser.test.ts`, run in a real Chromium harness — the docs/browser harness with an 800px viewport — not `jsdom`, which has no layout or scroll): (a) sizing — a banner-present shell with ~2000px of `main` content measures one viewport tall (shell height equals the viewport height within the harness tolerance), not content-tall; (b) document scrolling — attempting to scroll the document (`window.scrollTo`/`scrollBy`, wheel over the shell outside `main`) does not move the banner (its viewport rect is unchanged), does not scroll the document (scroll position stays at the origin because shell content creates no document overflow), and leaves `main.scrollTop` untouched by that attempt; (c) `main` scrolling — setting `main.scrollTop` (and a wheel scroll over `main`) moves the `main` content while the banner's viewport rect stays fixed at the top of the shell; (d) absent-banner regression — the same tall-content shell without a banner keeps its current unbounded, document-scrolling behaviour (no height bound is applied); (e) the standalone banner (no shell) does not claim sticky positioning.
- Ports with the same assertions, each under its own dismissal contract and with the browser witnesses run against that framework's real rendering (for React/Vue/Angular, against the shared `styles.css` shell rules): [N] `packages/components-react/src/Notification.banner.test.tsx` and `AppShell.banner.browser.test.tsx` (close only with `dismissible && onDismiss`), [N] `packages/components-vue/src/Notification.banner.test.ts` and `AppShell.banner.browser.test.ts` (close with `dismissible` alone, `dismiss` emitted, no callback required), [N] `packages/components-angular/src/Notification.banner.test.ts` and `AppShell.banner.browser.test.ts` (close with `dismissible` alone, `dismiss` emitted, no `onDismiss` input involved; DOM harness after the fresh build, §3.7, browser harness for the scroll witnesses), each port covering the hydration (where the framework supports SSR/hydration in the harness; otherwise the server-render-plus-hydrate equivalent the port's test stack provides), initial-client-render and later-insertion announcer scenarios, and the sizing, document-scroll, `main`-scroll and absent-banner browser scenarios above.

### 8.6 Docs changes

`apps/docs/src/routes/components/notification/+page.svelte`: an "App banner" live fixture per §3.6 (`TabbedLiveExample` with the §3.6 Angular compiled-fixture path for the Angular tab; the banner carries host actions and, on the Vue/Angular tabs, event-based dismissal that a `NodeSpec` cannot wire), API rows for `variant` and `bannerLabel`, and usage notes (AppShell bounded-grid pinning as the pinned placement with `main` as scroll owner, standalone pinning as host-owned under settled option A, the per-framework dismiss contracts, and the announcement lifecycle — silent and discoverable when present in the initial commit including hydration, announced once when inserted later, with the standalone same-frame boundary of §8.2 stated). The AppShell layout pages (`apps/docs/src/routes/layouts/`) gain one banner example showing the `banner` region above `topChrome` in a bounded shell with tall `main` content.

### 8.7 Gate

S1 → S2 → S3 staging and the offline gate as §3.7 (Notification and AppShell witnesses together per framework). Independent of the DataTable lots.

## 9. IF-7 — Host-supplied icon slot (pattern #28)

`accord`: documented host-supplied icon slot only. The DS ships no brand logo; no `IconName` is added for any brand or platform.

### 9.1 `Icon`: host glyph

`Icon` gains one optional prop and its `name` becomes optional (additive widening, §3.1):

| Framework | API |
| --- | --- |
| Svelte | `glyph?: Component<IconGlyphProps>` alongside `name?: IconName` (`IconGlyphProps` already exported by `icons.ts`; the class channel is `class`) |
| React | `glyph?: ComponentType<ReactIconGlyphProps>` alongside `name?: IconName`, where `ReactIconGlyphProps` is the React glyph prop type whose class channel is `className` (not `class`): `{ size?: number; strokeWidth?: number; className?: string; [key: string]: unknown }` — lucide-react glyphs and the current `Icon` implementation (`packages/components-react/src/catalog.tsx`, `Icon` passing `className={classNames("st-icon", className)}` to the glyph) both speak `className`, so a React host glyph typed or read with `class` would miss the composed `st-icon` class. The `Icon` component's own class prop likewise stays `className` in React. |
| Vue | `glyph?: Component` alongside `name?: IconName` (the class channel is `class`, as in `packages/components-vue/src/Icon.ts`) |
| Angular | `glyphTemplate?: TemplateRef<IconGlyphContext>` alongside `name?: IconName` (typed context below; a bare untyped `TemplateRef` receives none of the presentation attributes automatically) |

Angular glyph context (additive, typed):

```ts
export interface IconGlyphContext {
  /** Presentation bundle, for `let-p` shorthand. */
  $implicit: {
    size: number;
    strokeWidth: number | undefined;
    /** `'prop'` when an explicit `strokeWidth` was supplied, else `undefined` — the `data-st-icon-stroke` marker. */
    strokeMarker: "prop" | undefined;
    /** The composed `st-icon` class including any host `class`. */
    hostClass: string;
    title: string | undefined;
    ariaHidden: "true" | undefined;
    role: "img" | undefined;
  };
  size: number;
  strokeWidth: number | undefined;
  strokeMarker: "prop" | undefined;
  hostClass: string;
  title: string | undefined;
}
```

Rules:

- Exactly one source renders: when `glyph`/`glyphTemplate` is supplied it wins and `name` is ignored; when only `name` is supplied the current rendering is byte-identical; with neither, nothing renders (the current unknown-name behaviour).
- Presentation contract, per framework. The DS glyph today receives its presentation directly: Angular builds the `<svg>` itself with width/height from `size`, `stroke-width` from `strokeWidth ?? 2.25`, the `data-st-icon-stroke` marker, the `st-icon` host class and the `role`/`aria-label`/`aria-hidden`/`focusable` attributes (`packages/components-angular/src/Icon.ts:111`); Svelte, React and Vue pass the same values to the glyph component (`Icon.svelte:41`, `catalog.tsx` Icon, `packages/components-vue/src/Icon.ts`). A host glyph receives exactly those values and must apply them to its single `<svg>` root:
  - Svelte/React/Vue: the glyph component is invoked with the framework's glyph props — `size`, `strokeWidth` (already resolved: the explicit prop, else `2.25` as the presentation attribute the token rule may override), the composed `st-icon` class under the framework's class channel (`class` in Svelte and Vue, `className` in React — the React `Icon` forwards `className={classNames("st-icon", hostClassName)}` exactly as the built-in glyph receives it today, and the React glyph type declares `className`, never `class`), `role`, `aria-label`, `aria-hidden`, `focusable`, `data-st-icon-stroke`, plus any `...rest` the `Icon` call site received. The component MUST forward that class value (through whichever channel its framework uses) and every ARIA/data attribute it receives onto its `<svg>` root and set `width`/`height` (or the framework's size mechanism) from `size`. A glyph that hard-codes its own size, class or label does not satisfy the contract; a React glyph that reads a `class` prop instead of `className` does not either, because the composed class never reaches it under that name.
  - Angular: `Icon` renders `ngTemplateOutlet(glyphTemplate, { $implicit: presentation, size, strokeWidth, strokeMarker, hostClass, title })` inside no extra element (the component host is already `display: contents`). The template's `<svg>` MUST bind `[attr.width]`/`[attr.height]` to `size`, `[attr.stroke-width]` to `strokeWidth ?? 2.25`, `[attr.data-st-icon-stroke]` to `strokeMarker`, `[class]` to `hostClass`, and the ARIA attributes from `title` exactly as the built-in template does (`role="img"` plus `aria-label` when a title is present, `aria-hidden="true"` and `focusable="false"` otherwise). Nothing is applied to a `TemplateRef` automatically — a template that ignores the context renders unstyled and unlabelled, and the witness of §9.4 fails it.
  - Colour, filled versus stroked: the existing token rule recolours stroke, not fill — `@layer st-icon { :where(.st-icon[stroke="currentColor"]) { stroke: var(--st-component-icon-color, currentColor) } }` (`Icon.svelte:72`, shared `styles.css`). A stroked host glyph therefore declares `fill="none"` and `stroke="currentColor"` on its root and is recoloured by that rule through the forwarded `stroke` presentation path. A filled host glyph (the usual brand-mark shape) declares `fill="currentColor"` and `stroke="none"`; `currentColor` there resolves from the CSS `color` property, which the token rule does not set, so `fill="currentColor"` alone does not establish the promised token behaviour. For filled glyphs the `Icon` wrapper therefore also sets `color: var(--st-component-icon-color, currentColor)` on the `st-icon` root (additive: the built-in stroked glyphs keep resolving through the existing stroke rule, and an explicit host colour on the call site still wins by cascade order as today). The host MUST declare which of the two shapes its glyph is by those root attributes; a glyph that mixes `fill` and `stroke` values per-path keeps full responsibility for its internal colours, and the DS recolour promise covers only the root-declared channel.
- Accessible-label rule (documented, normative for hosts): the existing `title` rule applies unchanged to host glyphs — `title` set exposes `role="img"` with that label; omitted renders the glyph decorative (`aria-hidden="true"`, `focusable="false"`). A host glyph MUST NOT set its own `aria-label` or title inside itself; the label lives on the `Icon` call site. A meaningful glyph used alone (for example a platform glyph that is the only content of a cell or control) SHALL carry a `title`, or its parent control SHALL carry the accessible name (the `IconButton` rule of §9.2). Colour or shape of a brand glyph never counts as a name (§3.2).
- The DS does not validate, sanitise or recolour host glyph internals beyond this contract; glyph artwork, licensing and brand-guideline compliance are host responsibility (the gap analysis records why brand marks stay out of the DS set).

### 9.2 Components that render icons

| Component | Current state (`measured`) | IF-7 disposition |
| --- | --- | --- |
| `NavItem` | Svelte/React/Vue: `leading`/`trailing` host snippets (or nodes/slots) already take precedence over `swatch`/`count`; head MUST NOT be interactive. Angular: no leading projection exists — the leading area renders only `ColorSwatch` or `StatusDot` (`NavItem.ts:68`) | Svelte/React/Vue: no API change; document `leading` as the host-icon slot with an `Icon glyph` example; the non-interactive rule already covers glyph buttons (a glyph inside `leading` is presentational). Angular: additive API required — a `leading` projection `<ng-content select="[slot=leading]"></ng-content>` rendered inside the existing `st-selectableRow__leading` span, taking precedence over `swatch`: when projected leading content is present the `ColorSwatch`/`StatusDot` branch does not render, and when it is absent the current branch renders byte-identically (presence detected without changing the public inputs — the projected nodes are queried and the swatch branch is suppressed only when the projection is non-empty). The trailing/count side gains no equivalent in this lot. The non-interactive rule applies identically: projected leading content MUST NOT contain a focusable or clickable element. |
| `Tag` | Children label plus internal dismiss icon; no leading slot | Add `icon` slot: Svelte `icon?: Snippet`, React `icon?: ReactNode`, Vue `icon` slot, Angular icon projection (`<ng-content select="[slot=icon]"></ng-content>`). Rendered before the label in an `aria-hidden="true"` wrapper sized by `size` (12px `sm`, 14px `md`, token-overridable, §9.3). |
| `Badge` | Children only; no leading slot | Same `icon` slot addition as `Tag`, same wrapper and rule (Angular: `[slot=icon]` projection). |
| `DataTable` cells | Svelte/React/Vue `column.cell` and IF-1 `rowDetail`/`rowDetailTemplate` already render arbitrary host content. Angular `column.cell` renders text only (§4.1) | Svelte/React/Vue: no API change; document rendering `Icon` with a host `glyph` inside `cell` content. Angular: rendering a host glyph (or a pill `Select`) inside a cell requires the IF-1 `cellTemplate` (§4.1) — inside the template the host places `<st-icon glyphTemplate>` or `<st-select variant="pill">` with the cell context; without `cellTemplate` only the text callback exists and the docs make no Angular in-cell glyph claim. `CellDecoration.icon` stays a DS-owned string name (data-only API) and is not extended to host components. |
| `Button` | Host children already accept any glyph | No API change. Document the pattern (glyph plus visible text label). |
| `IconButton` | Host children. `aria-label` is required by type in Svelte only; optional (React native attributes, Angular input) or undeclared as a prop (Vue attrs) elsewhere (§2.5) | No API change and no new required prop in any framework (making it required in React/Vue/Angular would break existing consumers that label the button by other means, and §3.1 forbids it). Document the usage rule, normative for hosts in every framework: the glyph inside is decorative (`Icon` without `title`); the button SHALL carry an accessible name — `aria-label` on the `IconButton` call site — and a host that omits it has an unnamed control, stated in the docs as a host error and covered by the docs example, not by a type error outside Svelte. |

For `Tag`/`Badge`, the icon is decorative by construction (wrapper `aria-hidden`): status meaning stays in the visible label text. A host that needs the icon itself named uses `Icon title` outside these components instead — stated in the docs rather than adding a second labelling path.

i18n: this lot introduces no DS string. The only text is the host-supplied `title` (accessible name) and host label content; the DS composes and translates nothing.

### 9.3 Tokens

Host glyphs consume the existing `Icon` tokens (`--st-component-icon-strokeWidth`, `--st-component-icon-color`) through the `st-icon` class and the §9.1 colour rules; no new `Icon` token is added. Two new component tokens are added by this lot (the earlier "no new token" statement was incorrect — these variables did not exist before):

| Token | Fallback | Use |
| --- | --- | --- |
| `--st-component-tag-iconSize` | `14px` (`12px` at `size="sm"`) | `Tag` leading-icon wrapper size. |
| `--st-component-badge-iconSize` | `14px` (`12px` at `size="sm"`) | `Badge` leading-icon wrapper size. |

Both are plain CSS variables with literal fallbacks (§3.4): consumable as CSS immediately, and emitted from a theme's token tree only through an explicit `createComponent` extension with its own test, which this lot does not require.

### 9.4 RED witnesses

- [N] `packages/components-svelte/src/lib/Icon.hostGlyph.test.ts`: `name`-only rendering byte-identical; a host glyph renders at the requested `size` with the `st-icon` class; `glyph` wins over `name`; `title` on a host glyph yields `role="img"` plus `aria-label`, absence yields `aria-hidden`; neither prop renders nothing; a stroked fixture glyph (`fill="none" stroke="currentColor"`) resolves its stroke through `--st-component-icon-color`, and a filled fixture glyph (`fill="currentColor" stroke="none"`) resolves its fill through the wrapper `color` rule of §9.1 — two separate witnesses, because the token reaches the two shapes through different channels; explicit `strokeWidth` marks `data-st-icon-stroke` and is not overridden by the token.
- [N] `packages/components-svelte/src/lib/Tag.icon.test.ts` and [N] `Badge.icon.test.ts`: no wrapper without the slot; slot content renders before the label inside an `aria-hidden` wrapper at the §9.3 token size; dismiss behaviour of `Tag` is unchanged.
- [N] `packages/components-svelte/src/lib/NavItem.icon.test.ts`: Svelte documents the existing `leading` precedence (a glyph in `leading` suppresses `swatch`); the Angular counterpart below is the API witness for that framework.
- Ports: [N] `packages/components-react/src/Icon.hostGlyph.test.tsx` (plus `Tag.icon.test.tsx`, `Badge.icon.test.tsx`, `NavItem.icon.test.tsx`), [N] `packages/components-vue/src/Icon.hostGlyph.test.ts` (plus `Tag.icon.test.ts`, `Badge.icon.test.ts`, `NavItem.icon.test.ts`) with the same assertions in each idiom. Class-forwarding witness, per framework: the fixture host glyph records the props it receives and renders them onto its `<svg>` root, and the witness asserts the composed `st-icon` class (plus any host class supplied at the `Icon` call site) arrives under the framework's channel and lands on the rendered `<svg>` — `className` in React (a fixture glyph reading only `class` renders without `st-icon` and fails this witness), `class` in Svelte and Vue. Angular, in the DOM harness after the fresh-build sequence (§3.7): [N] `packages/components-angular/src/Icon.hostGlyph.test.ts` asserts the `glyphTemplate` context carries `size`, `strokeWidth`, `strokeMarker`, `hostClass` and `title`, that a template binding them renders at the requested size with the `st-icon` class and the correct ARIA for the titled and untitled cases, and that filled and stroked fixture glyphs resolve colour through their respective channels; [N] `packages/components-angular/src/NavItem.icon.test.ts` asserts projected `[slot=leading]` content renders in the leading span and suppresses the `ColorSwatch`/`StatusDot` branch, that with no projection the swatch branch renders byte-identically, and that the projected glyph is presentational (no new tab stop); [N] `Tag.icon.test.ts` and `Badge.icon.test.ts` assert the `[slot=icon]` projection with the same wrapper rule.
- Regression: the existing `Icon.test.ts` suites (all frameworks) pass unmodified, proving the canonical set contract is untouched.

### 9.5 Docs changes

`apps/docs/src/routes/components/icon/+page.svelte`: a "Host-supplied icons" section — the `glyph`/`glyphTemplate` contract and its per-framework forwarding rules (`className` in React, `class` in Svelte/Vue, the typed context in Angular), the accessible-label rule with one correct and one incorrect example, and a neutral placeholder glyph in the example artwork (a generic geometric mark drawn for the docs, explicitly not a brand logo), shown in both a stroked and a filled fixture so the two colour channels are visible. Because the example passes a component/template rather than plain props, it is a live fixture per §3.6 for the frameworks that need one (the Angular tab through the §3.6 compiled-fixture path with a real `glyphTemplate`), with plain `TabbedExample` used only where a named glyph suffices. Cross-links and short examples on the `nav-item` (including the Angular `[slot=leading]` form), `tag`, `badge`, `button`, `icon-button` and `data-table` pages per §9.2. The docs MUST state that the DS ships no brand logos and that brand artwork and licence checks belong to the host.

### 9.6 Gate

S1 → S2 → S3 staging and the offline gate as §3.7. IF-7 lands last (§10): its docs examples reference the IF-1 detail region and IF-4 cell patterns; its `Icon`/`Tag`/`Badge` slot contract is independent of them in code, but its Angular in-cell example depends on IF-1 S3 `cellTemplate` (§9.2, §10).

## 10. Lot order and dependencies

Accord order: the Influnified theme package first (separate delivery, outside this spec), then IF-1 to IF-5, then IF-7. `accord`

| Order | Lot | Depends on | Files principally touched |
| --- | --- | --- | --- |
| 1 | IF-1 `DataTable` expandable rows (incl. Angular `cellTemplate`/`rowDetailTemplate`) | — (first; sets the `DataTable` row-rendering, `getSubRows` accessor and id-list state pattern) | `DataTable` in four frameworks, data-table docs |
| 2 | IF-2 `DataTable` bulk action bar (incl. Angular `bulkActionsTemplate`) | IF-1 S1 gate closed (§5.8) per framework; reuses the rendered-row tri-state including sub-rows and the §5.1 population for the current `expandable` value | Same `DataTable` files as IF-1 (sequenced, never parallel), data-table docs |
| 3 | IF-3 `KpiCard` `breakdown` | — (independent; may run parallel to 1–2) | `KpiCard` in four frameworks, kpi-card docs |
| 4 | IF-4 `Select` pill variant | The `Select` component: — (independent). Its Angular in-cell use and docs tab: IF-1 S3 `cellTemplate` | `Select` in four frameworks, select docs; Angular cell rendering via IF-1 |
| 5 | IF-5 `Notification` banner + `AppShell` region | — (independent) | `Notification`, `AppShell` in four frameworks, notification and layout docs |
| 6 | IF-7 Host-supplied icon slot (`Icon`, `Tag`, `Badge`, Angular `NavItem` leading) | Lots 1–5 for docs cross-references; code dependency only for the Angular in-cell glyph example, which needs IF-1 S3 `cellTemplate`. The Angular `NavItem` leading projection is part of this lot, not a dependency on another lot | `Icon`, `Tag`, `Badge`, `NavItem` (Angular leading) in four frameworks, icon and component docs |

Within each lot, stages run S1 (Svelte) → S2 (React, Vue) → S3 (Angular) under §3.5; a lot's stage for one framework never waits for another lot's stage, except the IF-1 → IF-2 file sequencing above, which applies per framework (IF-2's S2 starts only after IF-1's S2 gate in React/Vue, and likewise for S3).

## 11. Open questions

No open question is recorded. Every former question is settled in its lot as a `ds-proposition` decision with its rationale, open to ratification with the lot; implementation of no part waits for a further answer.

Settled and removed from this section:

- Former Q1 (IF-2 select-all scope): additivity settles it in §5.2 (rendered rows only, matching the current `toggleAllVisible` over `visibleRows`; a dataset-wide operation would need its own explicit opt-in prop), recorded there and in §12.
- Q1 A — IF-5 standalone banner anchoring (settled: A). §8.1 already mandated A; the question is now removed and that clause stands as normative, not provisional: the DS ships the standalone banner as a static full-width block and provides the `bannerTop`/`bannerZIndex` tokens (§8.4) for a host-owned sticky wrapper; pinning outside a shell is host layout, documented as such. Option B (the DS itself applying `position: sticky` to the standalone banner root) is rejected in §8.1: it pins only when an ancestor happens to be a taller scroll container and silently does nothing otherwise. The AppShell placement that pattern #23 names is pinned by the bounded grid of §8.1, and a host that needs document-scroll pinning owns exactly the ancestor that makes sticky work.

Also settled above, not questions: the treegrid alternative (IF-1, §4.3), the closed-control tint limit (IF-4, §7.2), the Angular template idiom (IF-1, IF-2, IF-7), the breakdown tone union (IF-3, §6.1), the select-all scope (IF-2, §5.2), the AppShell banner bounded-grid placement (IF-5, §8.1), the transition of the announcement discriminator boundary for standalone banners inserted in the initial frame (IF-5, §8.2), and the traversal/counting population for bulk actions with disabled expansion (IF-2, §5.1).

## 12. NOT covered

- IF-6 (`Tile` checkbox and metrics zone, pattern #14) — refused; `Card` + `Checkbox` composition. `accord`
- Any brand or platform logo, icon font or brand icon package in the DS, and any new canonical `IconName` for a brand (IF-7 is the slot only). `accord`
- Full treegrid semantics for `DataTable` (row `aria-level`/roving tabindex grid keyboard model); IF-1 v1 is table plus disclosure (§4.3). Hosts needing a tree use `TreeView`-family components.
- Expand-all/collapse-all control in the `DataTable` header (hosts drive `expandedIds`); sorting of sub-rows; virtualised or remote (server-driven) expansion, sorting and paging.
- A standalone bulk-action component outside `DataTable`, dataset-wide select-all as a built-in behaviour (select-all covers the rendered rows only, §5.2; a dataset-wide opt-in prop is a future lot of its own), and any DS-side effect of bulk actions (the DS never mutates host data or clears selection on action).
- Custom listbox/dropdown replacement for `Select`, per-option styling inside the open native list, and multi-select pill behaviour (`MultiSelect` is untouched).
- Banner queueing, stacking, scheduling or persistence; multiple simultaneous app banners are host composition.
- `KpiCard` breakdown aggregation, sorting, overflow ("show more") and chart rendering; sparkline and delta behaviour are unchanged.
- The Influnified theme package (`packages/theme-influnified`), its tokens and its non-public publication (separate delivery, accord order step 1).
- New semantic tokens, theme file changes, and any change to `cellDecoration` intent semantics or to the canonical eight-name icon set.
- Angular, React or Vue availability claims before the corresponding stage gate of §3.5 has passed.

## Appendix A — Source map

- Agreed scope: `scratchpad/influnified/accord.md`; gap analysis and pattern numbering: `scratchpad/influnified/inventaire-composants.md` (patterns #4, #8, #15, #16, #18, #23, #28; IF-6 refusal and IF-7 slot-only ruling in its recommendations table).
- Measured components (this worktree, `origin/main` `5acca644`): `packages/components-svelte/src/lib/DataTable.svelte`, `KpiCard.svelte`, `Select.svelte`, `Notification.svelte`, `AppShell.svelte`, `Icon.svelte`, `icons.ts`, `NavItem.svelte`, `Tag.svelte`, `Badge.svelte`, `Button.svelte`, `IconButton.svelte`, `cellDecoration.ts`, `Collapsible.svelte`; counterparts `packages/components-react/src/DataTable.tsx`, `KpiCard.tsx`, `Notification.tsx`, `catalog.tsx` (`Select`, `Icon`), `packages/components-vue/src/DataTable.ts`, `KpiCard.ts`, `Select.ts`, `Notification.ts`, `Icon.ts`, `packages/components-angular/src/DataTable.ts`, `KpiCard.ts`, `Select.ts`, `Notification.ts`, `Icon.ts`.
- Docs measured: `apps/docs/src/routes/components/data-table/+page.svelte`, `kpi-card/+page.svelte`, `select/+page.svelte`, `notification/+page.svelte`, and the `icon`, `nav-item`, `tag`, `badge`, `button`, `icon-button` pages plus `apps/docs/src/routes/layouts/` for the shell. Docs infrastructure measured for §3.6: `apps/docs/src/lib/framework/TabbedExample.svelte`, `TabbedLiveExample.svelte`, `live-island.ts` and `live-demos/` (`ModalDemo`/`DrawerDemo` per framework), `vue-island.ts`, `angular-island.ts`, `react-island.ts`, `SvelteNode.svelte`, `nodeToCode.ts`, `examples.ts`.
- Revision sources (first review): row types in `packages/components-svelte/src/lib/DataTable.svelte:21`, `packages/components-react/src/DataTable.tsx:26`, `packages/components-vue/src/DataTable.ts:26`, `packages/components-angular/src/DataTable.ts:33` and its text-only cell at `:25`/`:182`; dismissal contracts in `packages/components-vue/src/Notification.ts:48`, `packages/components-angular/src/Notification.ts:37`, `packages/components-react/src/Notification.tsx:36`; `scripts/smoke-pack.mjs:487` and the root `verify` script; Angular leading area in `packages/components-angular/src/NavItem.ts:68`; shell grid in `packages/components-svelte/src/lib/AppShell.svelte:634` and the shared `styles.css` grid rows; feedback values in `packages/tokens/src/foundation.ts:30` (contrast computed by WCAG relative luminance, §6.2/§6.4/§7.4); `createComponent` output in `packages/tokens/src/component.ts:1634`; `IconButton` label types in `packages/components-react/src/catalog.tsx:3390`, `packages/components-vue/src/IconButton.ts`, `packages/components-angular/src/IconButton.ts:14`; React uncontrolled select surface in `packages/components-react/src/catalog.tsx:4669`; Angular compiled-test import in `packages/components-angular/src/Icon.test.ts:4`.
- Revision sources (second review, re-measured for this revision): unbounded shell sizing in `packages/components-svelte/src/lib/AppShell.svelte` (`.st-appShell { min-block-size: 100% }`, three-row grid) and the ports' shared `styles.css` (`.st-appShell { min-block-size: 100vh }`, `.st-appShell--workspace` grid, `__main { overflow: auto }`), with the Chromium sizing/scroll reproduction recorded in the review (2054px shell in an 800px viewport); Angular live-fixture limits in `apps/docs/src/lib/framework/live-island.ts` (`mountAngularLiveDemo` building `NodeSpec` trees via `live-demos/angular/ModalDemo.ts` `createModalDemoNodes`) and `angular-island.ts` (single `projectableNodes` bucket, `createApplication`/`createComponent` runtime reused by §3.6), `TabbedLiveExample.svelte` props (`{ demo, title }` only) against `TabbedExample.svelte` (`notes`, code view) and `apps/docs/angular-linker.ts`; native select behaviour in `packages/components-react/src/catalog.tsx` (`Select`), `packages/components-vue/src/Select.ts` (`modelValue` binding), `packages/components-angular/src/Select.ts` (`currentValue`), `packages/components-svelte/src/lib/Select.svelte` (bindable `value`); tsconfig test exclusion in `packages/components-react/tsconfig.json`, `packages/components-vue/tsconfig.json`, `packages/components-angular/tsconfig.json` (`exclude` of `*.test.*`) and the ports' `check` scripts (`tsc --noEmit`, `ngc --noEmit`, `svelte-check`); local-tarball flow in `scripts/smoke-pack.mjs` (`packWorkspace`/`ensureTarball`/`installProject`/`verifyTarball`) and its pre-publication position in `.github/workflows/react-publish.yml` (`verify` job with `pack:smoke` before `publish`, `post-publish-check` polling `npm view`), with the equivalents in the other publish workflows and the root `verify` script; docs `dist` resolution through the package entry points and `scripts/ensure-theme-dists.mjs` (content-hash rebuild, docs `prebuild`); React glyph class channel in `packages/components-react/src/catalog.tsx` (`Icon` forwarding `className`) against `packages/components-svelte/src/lib/icons.ts` (`IconGlyphProps.class`) and `packages/components-vue/src/Icon.ts` (`class`); feedback and text values in `packages/tokens/src/foundation.ts` recomputed under the §6.2 unrounded-mix policy.
- Conventions: additive-variant precedents in `Badge.svelte`, `NavItem.svelte`, `Collapsible.svelte`; staged parity in `SPEC_EVOL_WP20_DATAVIZ_FR.md` (D4, D5) and `SPEC_EVOL_DS_RICH_TEXT_EDITOR.md` (§4.3); audit rule precedent `navsystem-color-state-only` in `SPEC_EVOL_WP23_NAVSYSTEM_GUARDRAILS.md`.
- Versions measured in `packages/components-svelte/package.json` (0.36.0) and `packages/components-react/package.json`, `packages/components-vue/package.json`, `packages/components-angular/package.json` (0.38.0 each).



