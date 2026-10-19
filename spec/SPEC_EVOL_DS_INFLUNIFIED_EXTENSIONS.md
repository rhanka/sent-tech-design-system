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

`Notification` (`packages/components-svelte/src/lib/Notification.svelte`): `tone` (`info|success|warning|error`), required `title`, `message`, `dismissible`, `dismissLabel`, `locale`, `onDismiss`, `actions` snippet, children. Dismiss renders only when `dismissible && onDismiss` are both supplied (`canDismiss`). Role is `alert` for `error`, `status` otherwise. Width is capped (`width: min(100%, 32rem)`); no full-width banner variant exists (gap #23). React, Vue and Angular mirror the props (`actions` as node/slot/projection).

`AppShell` (`packages/components-svelte/src/lib/AppShell.svelte`) exposes snippet regions `topChrome`, `primaryRail`, `navigationPanel`, `main`, `contextPanel`, `utilityPanel`, `bottomPanel`. `topChrome` renders in a `st-appShell__topChrome` div above `st-appShell__body`. There is no dedicated banner region; panels scroll independently (`.st-appShell__*` overflow rules), so pinning is a per-region CSS property, not a shell-wide behaviour. `measured`

### 2.5 `Icon` and icon rendering in components

- `Icon` (`packages/components-svelte/src/lib/Icon.svelte`, `icons.ts`): `name: IconName` is required; the canonical set has eight DS-owned names over lucide glyphs (`settings`, `eye`, `eye-off`, `layers`, `target`, `close`, `chevron-down`, `chevron-right`). `size` defaults to 18, `strokeWidth` falls back to the token `--st-component-icon-strokeWidth` (2.25). Accessible rule today: `title` set → `role="img"` plus `aria-label`; omitted → `aria-hidden="true"`. No host glyph can be supplied (gap #28). React re-exports the same contract from `catalog.tsx`; Vue and Angular mirror the `name`/`title` inputs (Angular renders internal SVG nodes, `ICON_NODES`).
- `NavItem` (`packages/components-svelte/src/lib/NavItem.svelte`) already has host slots: `leading` and `trailing` snippets, which take precedence over `swatch` and `count`; its contract already states the head MUST NOT be interactive inside an option. React mirrors `leading`/`trailing` as nodes.
- `Tag` (`Tag.svelte`) and `Badge` (`Badge.svelte`): tone (`neutral|success|warning|error|info`), children as label; the only icon is Tag's internal dismiss `X`. No leading icon slot exists.
- `Button` (`Button.svelte`) and `IconButton` (`IconButton.svelte`) render host children; `IconButton` already requires `aria-label` in its type. A host glyph can already be placed inside both.
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
- Announcements use a dedicated visually hidden `aria-live="polite"` region (the `DataTable` footer precedent), never a region that contains focusable controls.
- Focus never moves on its own except the single documented return: when a region that contains the focus is collapsed or removed, focus returns to its controlling button (§4.4).
- Each lot names its ARIA pattern explicitly. Where two patterns compete, the lot states the rejected one and why (IF-1: table plus disclosure, not treegrid).

### 3.3 i18n — no hard-coded language

- No lot introduces a hard-coded sentence in any language. Every new visible or announced string comes from a host-supplied label prop.
- Where the DS already derives a default from `locale` (previous/next in `DataTable`, dismiss in `Notification`), the new labels follow the same mechanism: a `locale`-derived default (French/English, matching the existing pairs) that the host can override per label. Function labels follow the `rangeLabel` precedent: `selectionLabel?: (selection: { count: number; total: number }) => string` (IF-2).
- Numbers are formatted with `Intl.NumberFormat(locale)` (the `KpiCard` precedent); hosts may pre-format and pass strings wherever a value accepts `string | number`.
- Docs examples pass labels explicitly in both documentation locales (the `apps/docs` FR/EN copy pattern), so no example relies on a DS default sentence.

### 3.4 Component tokens

- Each lot lists its new `--st-component-*` tokens. Every token falls back to the literal that reproduces the current render, or to the semantic/feedback token already used by the sibling rule it extends. A theme that emits none of the new tokens changes nothing.
- Tints reuse the feedback recipe `color-mix(in srgb, var(--st-semantic-feedback-<tone>) 14%, white)` with full-token text colour (Badge/Tag/cell precedent). No lot introduces a hex value, a new semantic token, or a theme file change. Theme packages (including the future Influnified theme) consume the new component tokens through the existing `createComponent` mechanism without DS changes.

### 3.5 Framework parity — Svelte first, staged

Per DS practice (§2.6), each lot lands in this order, and parity is claimed only for stages whose gate passed:

| Stage | Delivers | Claim allowed |
| --- | --- | --- |
| S1 | Svelte implementation plus its RED witnesses (§ per lot) | "Available in `@sentropic/design-system-svelte` 0.37.0; other frameworks not delivered." |
| S2 | React and Vue ports of the same contract | Adds React 0.39.0 and Vue 0.39.0 to the claim. |
| S3 | Angular port of the same contract | Adds Angular 0.39.0; full parity claim. |

- The semantic contract (prop names, label props, keyboard, ARIA wiring, token names) is identical across frameworks; only the idiom changes (snippet/render prop/slot/projection, bindable/prop-plus-callback/input-plus-output) following §2.6.
- Docs framework tabs show a lot's example only for delivered stages (the `TabbedExample` NodeSpec freezes the common subset today; a lot extends the subset only when its port lands).
- A lot is not done at S1. The minor of a framework is bumped when its stage lands (§3.8); a slipped stage ships in the following minor of that framework, announced as not delivered until then.

### 3.6 Docs

- Each lot extends the existing component page under `apps/docs/src/routes/components/` (`data-table`, `kpi-card`, `select`, `notification`, `icon`, plus `nav-item`, `tag`, `badge`, `button`, `icon-button` and the AppShell layout pages for IF-5/IF-7 as named per lot). No new top-level docs section is created.
- Each addition is a `TabbedExample` with FR/EN copy, an API-table row per new prop (type, default, description in both locales, following the existing tables), and a usage note where the lot has a MUST/MUST NOT rule.
- Examples use neutral placeholder content. IF-7 examples MUST NOT display a real brand logo (§9).

### 3.7 RED witnesses and gates

- RED first: each lot's tests are written and observed failing for the stated reason before implementation. `[N]` marks a new file.
- Targeted gate per package (real scripts, §2.6): `npm --workspace <package> exec -- vitest run <exact test files>`, then the full package suite `npm --workspace <package> run test` once as regression, plus `npm --workspace <package> run check`. Angular's test script already builds first.
- Release gate for each framework minor: root `npm run verify` (build, check, tests, `pack:smoke`) on the integration branch before tagging. A failing witness is a lot failure, never a waiver.

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

Data model (all frameworks; Svelte shown):

```ts
export interface DataTableRow {
  id: string;
  /** Nested sub-rows, rendered under this row while it is expanded. Recursive. */
  children?: DataTableRow[];
  [key: string]: unknown;
}
```

The `children` field is already admitted by the index signature; naming it makes the sub-row contract typed and documented. No other model change.

New props (all optional; defaults reproduce the current render):

| Prop | Svelte | React | Vue | Angular | Default |
| --- | --- | --- | --- | --- | --- |
| `expandable` | `expandable?: boolean` | same | same | `@Input() expandable?: boolean` | `false` |
| Expanded ids | `expandedIds?: string[]` (`$bindable`, default `[]`) | `expandedIds?: string[]` + `onExpandedChange?: (ids: string[]) => void` (uncontrolled internal state when the prop is absent, selection precedent) | same as React, plus the `expandedChange` emit carrying the same payload | `@Input() expandedIds?: string[]`, `@Input() onExpandedChange?`, `@Output() expandedChange` (WP20 D4 split) | uncontrolled, empty |
| Detail content | `rowDetail?: Snippet<[DataTableRow]>` | `rowDetail?: (row: R) => ReactNode` | `rowDetail` scoped slot (`{ row }`) | row-detail template through the same template mechanism `DataTable` already uses for cell content, context = the row | none |
| Labels | `expandRowLabel?: string`, `collapseRowLabel?: string` | same | same | same inputs | `locale`-derived (§3.3) |

Rules:

- `expandable={false}` (or absent): no expand column, no detail row, no sub-row rendering; `children` data is ignored. Byte-identical to today.
- A row is expandable when `expandable` is true AND (it has a non-empty `children` array OR `rowDetail` content is supplied). Rows failing this test render no expand control (the cell stays empty, keeping column alignment).
- Expansion state is keyed by row `id` at every depth and survives sorting and paging (sorting and paging operate on top-level rows only, as today). Sub-rows never consume page slots and are excluded from `rangeLabel` totals, which keep counting top-level rows.
- Sorting keeps a parent and its sub-rows together; sub-rows keep host order (they are not sorted in v1).

### 4.2 Rendering

- A leading expand column is added before the selection column. Header cell is empty (no expand-all control in v1; hosts drive `expandedIds` for that). Column counts (empty-state and detail `colspan`) include the expand column whenever `expandable` is true.
- Each expandable row renders a native `<button type="button">` in the expand cell showing the DS chevron (`chevron-right` collapsed, `chevron-down` expanded, through `Icon`), with `aria-expanded`, `aria-controls` naming the detail region when `rowDetail` exists, an `id` per row, and the accessible name `expandRowLabel`/`collapseRowLabel` plus the row id (the `selectRowLabel` concatenation precedent).
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

- Expanding never moves focus. Collapsing a row whose detail region contains the focus returns focus to that row's expand button (the single focus move of §3.2).
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

- [N] `packages/components-svelte/src/lib/DataTable.expandable.test.ts`: collapsed render is byte-identical in structure (no expand column when `expandable` absent); expand button carries `aria-expanded`/`aria-controls`; ArrowRight expands and ArrowLeft collapses with focus retained; collapsing with focus inside the detail returns focus to the button; controlled `expandedIds` never mutates without the host, uncontrolled state toggles internally; sub-rows render only while expanded, keep parent grouping under sort, and do not change `rangeLabel` totals or page slicing.
- Ports: [N] `packages/components-react/src/DataTable.expandable.test.tsx`, [N] `packages/components-vue/src/DataTable.expandable.test.ts`, [N] `packages/components-angular/src/DataTable.expandable.test.ts` asserting the same contract in each idiom (callback/emit/output payloads equal the new id list).

### 4.8 Docs changes

`apps/docs/src/routes/components/data-table/+page.svelte`: an "Expandable rows" `TabbedExample` (sub-rows plus a detail region, labels passed explicitly in both locales), API rows for `expandable`, `expandedIds`, `onExpandedChange`, `rowDetail`, `expandRowLabel`, `collapseRowLabel` and the `children` field, and a usage note stating the table-plus-disclosure pattern and the no-focus-move rule.

### 4.9 Gate

S1 gate: the Svelte witness passes targeted, then full Svelte package test and check (§3.7). S2/S3 gates repeat per framework. The lot closes only at S3 (full parity) or is announced per-stage under §3.5.

## 5. IF-2 — `DataTable`: bulk action bar (pattern #15)

`accord`: build, inside `DataTable`, not as a separate component. It interacts with the existing `selectable` machinery and reuses its state; no selection model change.

### 5.1 Additive API

New props (all optional):

| Prop | Svelte | React | Vue | Angular | Default |
| --- | --- | --- | --- | --- | --- |
| Actions content | `bulkActions?: Snippet<[{ count: number; selectedIds: string[] }]>` | `bulkActions?: ReactNode` | `bulkActions` slot (`{ count, selectedIds }`) | bulk-actions template, context = `{ count, selectedIds }` | none (bar disabled) |
| Count/announcement text | `selectionLabel?: (selection: { count: number; total: number }) => string` | same | same | same input | `locale`-derived (§3.3) |
| Bar label | `bulkBarLabel?: string` | same | same | same input | `locale`-derived (§3.3) |

Rules:

- The bar is enabled by supplying `bulkActions` content. Without it, nothing renders and the table is byte-identical to today, whatever the selection.
- The bar renders only while `selectable === "multiple"` AND `selectedIds.length > 0`. Under `single` or `none` it never renders.
- `count` is the total selection size (`selectedIds.length`, across pages, as selection already persists over paging); `total` passed to `selectionLabel` is the top-level row count.
- Host actions are opaque host controls (for example "Add to list" in pattern #15). The DS never interprets, disables or reorders them, and never clears the selection on their behalf; clearing stays the host's act through `selectedIds`, or the user's act through the checkboxes.

### 5.2 Rendering and selection interaction

- The bar renders inside `.st-dataTable-wrap`, directly above the table: a `role="region"` landmark labelled by `bulkBarLabel`, containing, in order: a select-all checkbox, the visible count text, then the `bulkActions` content aligned to the end.
- The bar checkbox mirrors the header checkbox state over the same rendered-row set (checked when all rendered rows are selected, indeterminate when some are — the existing `allVisibleSelected`/`someVisibleSelected` computation, extended by IF-1 to expanded sub-rows) and shares its toggle (`toggleAllVisible` semantics) and its `selectAllLabel` accessible name. Header and bar checkboxes are two views of one state; toggling either updates both.
- Select-all scope (rendered rows versus the whole dataset under pagination) is open question Q1 (§11); the implementation follows the ratified answer, and the RED witness pins whichever scope is ratified.
- Showing or hiding the bar never moves focus and never changes table layout below it beyond its own height.

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

- [N] `packages/components-svelte/src/lib/DataTable.bulkBar.test.ts`: no bar without `bulkActions`; no bar at count 0; bar appears at count 1 with the `selectionLabel` text visible and announced in the live region; bar and header checkboxes stay in sync (checked and indeterminate) in both directions; bar never renders under `selectable="single"`; pagination keeps the total count; host action activation does not clear the selection.
- Ports: [N] `packages/components-react/src/DataTable.bulkBar.test.tsx`, [N] `packages/components-vue/src/DataTable.bulkBar.test.ts`, [N] `packages/components-angular/src/DataTable.bulkBar.test.ts` with the same assertions.

### 5.7 Docs changes

`data-table` page: a "Bulk actions" `TabbedExample` (`selectable="multiple"`, two host actions, explicit `selectionLabel`/`bulkBarLabel` in both locales), API rows for `bulkActions`, `selectionLabel`, `bulkBarLabel`, and a usage note: the bar is selection-driven, actions are host-owned, and select-all scope follows §11 Q1 once ratified.

### 5.8 Gate and sequencing

IF-2 SHALL NOT start before IF-1 closes its S1 gate: both lots rewrite the `DataTable` header/body rendering (expand column and tri-state set versus bar and checkbox sync), and parallel edits to the same files are excluded. IF-2 then follows the same S1 → S2 → S3 staging and release gate as IF-1 (§3.7, §4.9).

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
- Tone is never the only signal: the label and value text are always present (§3.2). A non-neutral tone colours the dot and the value text with the full feedback token; the 14% tint is not used here (small text on the card surface keeps the full-token colour, as the delta does today).
- The items are ordinary DOM text inside the `role="group"` card, so assistive technology reads them in order; the composed root `aria-label` is unchanged (label, value, delta only) to avoid double reading. `measured` basis: the current `ariaLabel` derivation in `KpiCard.svelte`.

### 6.3 i18n

Labels and string values are host content; numeric values go through `locale`. No new DS string exists in this lot.

### 6.4 Component tokens

| Token | Fallback | Use |
| --- | --- | --- |
| `--st-component-kpiCard-breakdownGap` | `var(--st-spacing-1, 0.25rem)` | Vertical gap between breakdown items. |
| `--st-component-kpiCard-breakdownLabelText` | `var(--st-semantic-text-secondary)` | Item label colour. |
| `--st-component-kpiCard-breakdownBorder` | `var(--st-semantic-border-subtle)` | Optional separator above the list. |

Tone colours read `--st-semantic-feedback-*` directly (no per-tone component token), matching the delta colour rule today.

### 6.5 RED witnesses

- [N] `packages/components-svelte/src/lib/KpiCard.breakdown.test.ts`: absent/empty `breakdown` renders no list; three items render in host order with label and value; numeric values follow `Intl.NumberFormat(locale)`; a toned item exposes dot plus text (tone class on the item, dot `aria-hidden`); the root `aria-label` is unchanged by the breakdown.
- Ports: [N] `packages/components-react/src/KpiCard.breakdown.test.tsx`, [N] `packages/components-vue/src/KpiCard.breakdown.test.ts`, [N] `packages/components-angular/src/KpiCard.breakdown.test.ts` with the same assertions.

### 6.6 Docs changes

`apps/docs/src/routes/components/kpi-card/+page.svelte`: a "Breakdown" `TabbedExample` (one KPI ventilated by status with tones), API rows for `breakdown` and the `KpiCardBreakdownItem` type, and a usage note: host order is kept, tone never replaces text.

### 6.7 Gate

S1 → S2 → S3 staging and release gate as §3.7. Independent of IF-1/IF-2 (no shared file) and may proceed in parallel with them.

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
- The resolved tone is `tones[String(value)]`, falling back to `"neutral"` (no feedback tint; the pill keeps its neutral chrome). The host owns the value-to-tone mapping (status semantics stay host-side, as with decorations).
- `size` stays orthogonal; the documented cell combination is `variant="pill"` with `size="sm"`. Pill density comes from `size`, not from a second density prop.
- Options stay native `<option>` elements (children in Svelte/React, `options` in React/Vue/Angular) with unchanged values and disabled handling. The value binding (`value`/`modelValue`) is unchanged.

### 7.2 Rendering, keyboard, accessible name

- `variant="pill"` adds `st-select--pill` on the control and `st-field--pill` on the wrapper: fully rounded control (`--st-radius-pill` fallback chain of Tag/Badge), tint background `color-mix` 14% of the resolved feedback token with full-token text for non-neutral tones (Tag/Badge recipe), and a wrapper that imposes no field max-width and no label grid gap, so the control fits a table cell.
- The control remains a native `<select>`: keyboard is the platform contract (Tab to reach it, ArrowUp/ArrowDown and type-ahead to change, Enter/Space behaviour of the platform). No custom key handling is added, so inside a `DataTable` cell the arrows never conflict with IF-1's expand-button arrows (different focused elements).
- Accessible name inside a grid cell: when `label` is supplied it names the control as today. In a cell the host SHALL pass an accessible name that carries the row context through `aria-label` (forwarded to the `<select>` by `...rest` in Svelte and React, an explicit input in Angular; Vue forwards attrs the same way). The docs example uses a per-row name (status of the named row). A pill select with neither `label` nor `aria-label` is a host error, stated in the docs, on the same rule as `IconButton`'s required `aria-label`.
- Platform limit, stated in the docs: browsers render the open option list; per-option tinting inside the open list is not available on a native select. The tone applies to the closed control only. Replacing the native select with a custom listbox is out of scope (§12).

### 7.3 i18n

No new DS string. Option labels and the `aria-label` are host content.

### 7.4 Component tokens

| Token | Fallback | Use |
| --- | --- | --- |
| `--st-component-select-pillRadius` | `var(--st-radius-pill, 999px)` | Pill corner radius. |
| `--st-component-select-pillPaddingInline` | `0.625rem` | Pill inline padding (chevron gutter still reserved by the existing select padding rule). |

Tone tints read `--st-semantic-feedback-*` through the Tag/Badge `color-mix` recipe; neutral reads the existing control background tokens. No other token changes; the field anatomy tokens keep applying.

### 7.5 RED witnesses

- [N] `packages/components-svelte/src/lib/Select.pill.test.ts`: default variant renders byte-identically (no pill classes); `variant="pill"` with `tones` tints the closed control per current value and follows value changes; an unmapped value falls back to neutral chrome; `aria-label` reaches the `<select>`; keyboard value change through the native control still emits the bound value.
- Ports: [N] `packages/components-react/src/Select.pill.test.tsx`, [N] `packages/components-vue/src/Select.pill.test.ts`, [N] `packages/components-angular/src/Select.pill.test.ts` with the same assertions.

### 7.6 Docs changes

`apps/docs/src/routes/components/select/+page.svelte`: a "Pill in a table cell" `TabbedExample` (a `DataTable` whose status column renders the pill select through `column.cell`, with per-row `aria-label` in both locales), API rows for `variant` and `tones`, and usage notes covering the closed-control-only tint limit and the accessible-name rule. The `data-table` page gains a cross-link from its cell-content section once IF-1 closes (cell rendering is already documented there).

### 7.7 Gate

S1 → S2 → S3 staging and release gate as §3.7. Independent of the other lots (no shared file except docs cross-links).

## 8. IF-5 — `Notification`: app-level banner variant (pattern #23)

`accord`: build. A full-width banner pinned to the top of the shell, typically `tone="warning"` with actions (impersonation banner: "View as…", "Exit Preview").

### 8.1 Additive API

`Notification` gains one prop on all four frameworks:

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `variant` | `"inline" \| "banner"` | `"inline"` | `"banner"` renders the app-level full-width form. |

`AppShell` gains one optional region on all four frameworks: `banner` (Svelte snippet, React node prop, Vue slot, Angular through the shell's existing projection mechanism), rendered in a `st-appShell__banner` container above `topChrome`, spanning the full shell width. Supplying no `banner` renders nothing there (byte-identical shell).

Rules:

- `variant="inline"` (or absent): byte-identical to today, including the capped width.
- `variant="banner"`: class `st-notification--banner`; width is 100% with no cap, corner radius 0, the tone accent keeps applying (left accent or top accent per theme tokens), and the banner sticks to the top of its scroll container (`position: sticky` with the §8.4 tokens). Placement is host choice: inside the AppShell `banner` region (recommended), inside `topChrome`, or standalone at the top of a host layout. The DS does not move or portal the node.
- Existing props compose unchanged: `title` (required), `message`, `actions` (host controls, for example an "Exit Preview" button), children. The impersonation case is `tone="warning"` plus one host action; no new action API is added.

### 8.2 Dismiss rule and announcements

- Not dismissible unless the host allows it: the current rule is kept exactly — the close control renders only when the host supplies both `dismissible` and `onDismiss` (`canDismiss`, §2.4). `variant="banner"` never adds a close control on its own, and the DS never hides a banner by itself.
- Role mapping is unchanged (`alert` for `error`, `status` otherwise), so a warning banner is announced politely on mount through `role="status"` and never traps or steals focus. Hosts that need a named landmark pass `aria-label` through the existing attribute passthrough.
- Dismissal, exit actions and any persistence (for example remembering a closed banner) are host behaviour.

### 8.3 i18n

No new DS string. `title`, `message`, action labels and `dismissLabel` (existing, `locale`-derived with host override) carry all language.

### 8.4 Component tokens

| Token | Fallback | Use |
| --- | --- | --- |
| `--st-component-notification-bannerBackground` | `var(--st-component-notification-background, var(--st-semantic-surface-raised))` | Banner background. |
| `--st-component-notification-bannerTop` | `0` | Sticky top offset inside the scroll container. |
| `--st-component-notification-bannerZIndex` | `10` | Sticky stacking above scrolling content. |

The AppShell `banner` container itself introduces no token (full-width block, no padding of its own; the banner component owns its padding as today).

### 8.5 RED witnesses

- [N] `packages/components-svelte/src/lib/Notification.banner.test.ts`: inline default renders byte-identically; `variant="banner"` carries the banner class and full-width rule; a warning banner with actions renders the host action; no close control without `dismissible` plus `onDismiss`, and exactly one with both.
- [N] `packages/components-svelte/src/lib/AppShell.banner.test.ts`: no `banner` region content when the slot is absent; supplied banner content renders above `topChrome` at full width.
- Ports with the same assertions: [N] `packages/components-react/src/Notification.banner.test.tsx`, [N] `packages/components-react/src/AppShell.banner.test.tsx`, [N] `packages/components-vue/src/Notification.banner.test.ts`, [N] `packages/components-vue/src/AppShell.banner.test.ts`, [N] `packages/components-angular/src/Notification.banner.test.ts`, [N] `packages/components-angular/src/AppShell.banner.test.ts`.

### 8.6 Docs changes

`apps/docs/src/routes/components/notification/+page.svelte`: an "App banner" `TabbedExample` (warning banner with an exit action, undismissable, copy in both locales), an API row for `variant`, and usage notes (pinning placement, dismiss rule). The AppShell layout pages (`apps/docs/src/routes/layouts/`) gain one banner example showing the `banner` region above `topChrome`.

### 8.7 Gate

S1 → S2 → S3 staging and release gate as §3.7 (Notification and AppShell witnesses together per framework). Independent of the DataTable lots.

## 9. IF-7 — Host-supplied icon slot (pattern #28)

`accord`: documented host-supplied icon slot only. The DS ships no brand logo; no `IconName` is added for any brand or platform.

### 9.1 `Icon`: host glyph

`Icon` gains one optional prop and its `name` becomes optional (additive widening, §3.1):

| Framework | API |
| --- | --- |
| Svelte | `glyph?: Component<IconGlyphProps>` alongside `name?: IconName` (`IconGlyphProps` already exported by `icons.ts`) |
| React | `glyph?: ComponentType<IconGlyphProps>` alongside `name?: IconName` |
| Vue | `glyph?: Component` alongside `name?: IconName` |
| Angular | `glyph` template input (`TemplateRef`) rendered inside the `st-icon` wrapper, alongside `name?: IconName` |

Rules:

- Exactly one source renders: when `glyph` is supplied it wins and `name` is ignored; when only `name` is supplied the current rendering is byte-identical; with neither, nothing renders (the current unknown-name behaviour).
- The host glyph receives the same presentation contract as a DS glyph: `size` (default 18), the stroke resolution of §2.5 (explicit `strokeWidth` wins over `--st-component-icon-strokeWidth`), and the `st-icon` class. It MUST render a single `<svg>` root, forward `class` and ARIA attributes, and use `currentColor` so the existing `--st-component-icon-color` rule applies.
- Accessible-label rule (documented, normative for hosts): the existing `title` rule applies unchanged to host glyphs — `title` set exposes `role="img"` with that label; omitted renders the glyph decorative (`aria-hidden="true"`, `focusable="false"`). A host glyph MUST NOT set its own `aria-label` or title inside itself; the label lives on the `Icon` call site. A meaningful glyph used alone (for example a platform glyph that is the only content of a cell or control) SHALL carry a `title`, or its parent control SHALL carry the accessible name (the `IconButton` rule of §9.2). Colour or shape of a brand glyph never counts as a name (§3.2).
- The DS does not validate, sanitise or recolour host glyph internals beyond this contract; glyph artwork, licensing and brand-guideline compliance are host responsibility (the gap analysis records why brand marks stay out of the DS set).

### 9.2 Components that render icons

| Component | Current state (`measured`) | IF-7 disposition |
| --- | --- | --- |
| `NavItem` | `leading`/`trailing` host snippets (or nodes) already take precedence over `swatch`/`count`; head MUST NOT be interactive | No API change. Document `leading` as the host-icon slot with an `Icon glyph` example; the non-interactive rule already covers glyph buttons (a glyph inside `leading` is presentational). |
| `Tag` | Children label plus internal dismiss icon; no leading slot | Add `icon` slot: Svelte `icon?: Snippet`, React `icon?: ReactNode`, Vue `icon` slot, Angular icon projection. Rendered before the label in an `aria-hidden="true"` wrapper sized by `size` (12px `sm`, 14px `md`, token-overridable). |
| `Badge` | Children only; no leading slot | Same `icon` slot addition as `Tag`, same wrapper and rule. |
| `DataTable` cells | `column.cell` and IF-1 `rowDetail` already render arbitrary host content | No API change. Document rendering `Icon` with a host `glyph` inside `cell` content. `CellDecoration.icon` stays a DS-owned string name (data-only API) and is not extended to host components. |
| `Button` | Host children already accept any glyph | No API change. Document the pattern (glyph plus visible text label). |
| `IconButton` | Host children; `aria-label` already required by type | No API change. Document the rule: the glyph inside is decorative (`Icon` without `title`); the button's `aria-label` is the name. |

For `Tag`/`Badge`, the icon is decorative by construction (wrapper `aria-hidden`): status meaning stays in the visible label text. A host that needs the icon itself named uses `Icon title` outside these components instead — stated in the docs rather than adding a second labelling path.

i18n: this lot introduces no DS string. The only text is the host-supplied `title` (accessible name) and host label content; the DS composes and translates nothing.

### 9.3 Tokens

No new token. Host glyphs consume the existing `Icon` tokens (`--st-component-icon-strokeWidth`, `--st-component-icon-color`) through the `st-icon` class, and the `Tag`/`Badge` icon wrapper size falls back to the literals above with per-component overrides `--st-component-tag-iconSize` and `--st-component-badge-iconSize` (fallbacks 14px; `sm` 12px through the existing size classes).

### 9.4 RED witnesses

- [N] `packages/components-svelte/src/lib/Icon.hostGlyph.test.ts`: `name`-only rendering byte-identical; a host glyph renders at the requested `size` with the `st-icon` class; `glyph` wins over `name`; `title` on a host glyph yields `role="img"` plus `aria-label`, absence yields `aria-hidden`; neither prop renders nothing.
- [N] `packages/components-svelte/src/lib/Tag.icon.test.ts` and [N] `Badge.icon.test.ts`: no wrapper without the slot; slot content renders before the label inside an `aria-hidden` wrapper; dismiss behaviour of `Tag` is unchanged.
- Ports: [N] `packages/components-react/src/Icon.hostGlyph.test.tsx` (plus `Tag.icon.test.tsx`, `Badge.icon.test.tsx`), [N] `packages/components-vue/src/Icon.hostGlyph.test.ts` (plus `Tag.icon.test.ts`, `Badge.icon.test.ts`), [N] `packages/components-angular/src/Icon.hostGlyph.test.ts` (plus `Tag.icon.test.ts`, `Badge.icon.test.ts`) with the same assertions in each idiom.
- Regression: the existing `Icon.test.ts` suites (all frameworks) pass unmodified, proving the canonical set contract is untouched.

### 9.5 Docs changes

`apps/docs/src/routes/components/icon/+page.svelte`: a "Host-supplied icons" section — the `glyph` contract, the accessible-label rule with one correct and one incorrect example, and a neutral placeholder glyph in the example artwork (a generic geometric mark drawn for the docs, explicitly not a brand logo). Cross-links and short examples on the `nav-item`, `tag`, `badge`, `button`, `icon-button` and `data-table` pages per §9.2. The docs MUST state that the DS ships no brand logos and that brand artwork and licence checks belong to the host.

### 9.6 Gate

S1 → S2 → S3 staging and release gate as §3.7. IF-7 lands last (§10): its docs examples reference the IF-1 detail region and IF-4 cell patterns, and its slot contract is independent of them in code.

## 10. Lot order and dependencies

Accord order: the Influnified theme package first (separate delivery, outside this spec), then IF-1 to IF-5, then IF-7. `accord`

| Order | Lot | Depends on | Files principally touched |
| --- | --- | --- | --- |
| 1 | IF-1 `DataTable` expandable rows | — (first; sets the `DataTable` row-rendering and id-list state pattern) | `DataTable` in four frameworks, data-table docs |
| 2 | IF-2 `DataTable` bulk action bar | IF-1 S1 gate closed (§5.8); reuses the rendered-row tri-state including sub-rows | Same `DataTable` files as IF-1 (sequenced, never parallel), data-table docs |
| 3 | IF-3 `KpiCard` `breakdown` | — (independent; may run parallel to 1–2) | `KpiCard` in four frameworks, kpi-card docs |
| 4 | IF-4 `Select` pill variant | — (independent) | `Select` in four frameworks, select docs |
| 5 | IF-5 `Notification` banner + `AppShell` region | — (independent) | `Notification`, `AppShell` in four frameworks, notification and layout docs |
| 6 | IF-7 Host-supplied icon slot | Lots 1–5 for docs cross-references only; no code dependency | `Icon`, `Tag`, `Badge` in four frameworks, icon and component docs |

Within each lot, stages run S1 (Svelte) → S2 (React, Vue) → S3 (Angular) under §3.5; a lot's stage for one framework never waits for another lot's stage, except the IF-1 → IF-2 file sequencing above, which applies per framework (IF-2's S2 starts only after IF-1's S2 gate in React/Vue, and likewise for S3).

## 11. Open questions

Only questions the DS cannot settle from its sources. Each is answerable as "Qn A" or "Qn B"; implementation of the affected lot waits for the answer, other lots proceed.

- Q1 — IF-2 select-all scope under pagination. A (recommended): rendered rows only — the visible page plus expanded sub-rows — identical in the header and the bar, matching the current `toggleAllVisible` semantics and keeping both checkboxes as one state. B: the whole dataset (`rows` across pages), which makes select-all a dataset operation and needs a second, distinct tri-state when only one page is rendered. Recommendation A: it changes no existing behaviour, and hosts that need dataset-wide selection drive `selectedIds` directly.
- Q2 — IF-5 banner pinning. A (recommended): `position: sticky` inside the shell scroll container (tokens of §8.4), so the banner pins without the host managing layout. B: static full-width block in flow; pinning, if wanted, is built by the host around the shell. Recommendation A: pattern #23 requires the banner to stay visible at the top of the shell; B pushes the same work to every host. The choice depends on host scroll containers the DS cannot enumerate, so it is put to the owner rather than assumed.

No other open question is recorded: the treegrid alternative (IF-1), the closed-control tint limit (IF-4), the Angular template idiom (IF-1, IF-2, IF-7) and the breakdown tone union (IF-3) are settled above as `ds-proposition` decisions with their rationale, open to ratification with the lot.

## 12. NOT covered

- IF-6 (`Tile` checkbox and metrics zone, pattern #14) — refused; `Card` + `Checkbox` composition. `accord`
- Any brand or platform logo, icon font or brand icon package in the DS, and any new canonical `IconName` for a brand (IF-7 is the slot only). `accord`
- Full treegrid semantics for `DataTable` (row `aria-level`/roving tabindex grid keyboard model); IF-1 v1 is table plus disclosure (§4.3). Hosts needing a tree use `TreeView`-family components.
- Expand-all/collapse-all control in the `DataTable` header (hosts drive `expandedIds`); sorting of sub-rows; virtualised or remote (server-driven) expansion, sorting and paging.
- A standalone bulk-action component outside `DataTable`, dataset-wide select-all beyond the Q1 decision, and any DS-side effect of bulk actions (the DS never mutates host data or clears selection on action).
- Custom listbox/dropdown replacement for `Select`, per-option styling inside the open native list, and multi-select pill behaviour (`MultiSelect` is untouched).
- Banner queueing, stacking, scheduling or persistence; multiple simultaneous app banners are host composition.
- `KpiCard` breakdown aggregation, sorting, overflow ("show more") and chart rendering; sparkline and delta behaviour are unchanged.
- The Influnified theme package (`packages/theme-influnified`), its tokens and its non-public publication (separate delivery, accord order step 1).
- New semantic tokens, theme file changes, and any change to `cellDecoration` intent semantics or to the canonical eight-name icon set.
- Angular, React or Vue availability claims before the corresponding stage gate of §3.5 has passed.

## Appendix A — Source map

- Agreed scope: `scratchpad/influnified/accord.md`; gap analysis and pattern numbering: `scratchpad/influnified/inventaire-composants.md` (patterns #4, #8, #15, #16, #18, #23, #28; IF-6 refusal and IF-7 slot-only ruling in its recommendations table).
- Measured components (this worktree, `origin/main` `5acca644`): `packages/components-svelte/src/lib/DataTable.svelte`, `KpiCard.svelte`, `Select.svelte`, `Notification.svelte`, `AppShell.svelte`, `Icon.svelte`, `icons.ts`, `NavItem.svelte`, `Tag.svelte`, `Badge.svelte`, `Button.svelte`, `IconButton.svelte`, `cellDecoration.ts`, `Collapsible.svelte`; counterparts `packages/components-react/src/DataTable.tsx`, `KpiCard.tsx`, `Notification.tsx`, `catalog.tsx` (`Select`, `Icon`), `packages/components-vue/src/DataTable.ts`, `KpiCard.ts`, `Select.ts`, `Notification.ts`, `Icon.ts`, `packages/components-angular/src/DataTable.ts`, `KpiCard.ts`, `Select.ts`, `Notification.ts`, `Icon.ts`.
- Docs measured: `apps/docs/src/routes/components/data-table/+page.svelte`, `kpi-card/+page.svelte`, `select/+page.svelte`, `notification/+page.svelte`, and the `icon`, `nav-item`, `tag`, `badge`, `button`, `icon-button` pages plus `apps/docs/src/routes/layouts/` for the shell.
- Conventions: additive-variant precedents in `Badge.svelte`, `NavItem.svelte`, `Collapsible.svelte`; staged parity in `SPEC_EVOL_WP20_DATAVIZ_FR.md` (D4, D5) and `SPEC_EVOL_DS_RICH_TEXT_EDITOR.md` (§4.3); audit rule precedent `navsystem-color-state-only` in `SPEC_EVOL_WP23_NAVSYSTEM_GUARDRAILS.md`.
- Versions measured in `packages/components-svelte/package.json` (0.36.0) and `packages/components-react/package.json`, `packages/components-vue/package.json`, `packages/components-angular/package.json` (0.38.0 each).



