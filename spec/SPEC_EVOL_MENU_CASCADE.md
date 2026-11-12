# SPEC EVOL — Menu cascade (sub-menus)

| Field | Value |
| --- | --- |
| Status | Specification only. No code, no test run claimed. |
| Card | Menu sub-menu / cascade |
| Consumer | immo signal classification, owner decision "option A": class → reason cascade (radar-immobilier PR #1044). Normative input: `READY-cascade.md` §1. Local composition `SignalClassementMenu.svelte` is deleted consumer-side once this ships. |
| Ports | Svelte (canonical), React, Vue, Angular — identical contract |
| Targets | Svelte `0.39.0`; React/Vue/Angular `0.40.0` (§9) |

SHALL = required for acceptance. Links below are repo-relative with line anchors.

## Decisions

Recorded with the tag `conductor decide-and-trace`; binding for implementation.

- `conductor decide-and-trace` D1 (Q2 closed, F3): Angular `select` emits the leaf item unchanged at any depth; additive `selectPath` emits `{item, path}` for every leaf (root leaf → `path` length 1). No heterogeneous payload on `select`.
- `conductor decide-and-trace` D2 (Q1 closed): `submenuSide` default `"auto"` prefers right.
- `conductor decide-and-trace` D3 (F1): sub-menu panel is a sibling of the root list inside the outer host / menu root element, outside the root scroll container, `position: fixed`; solver viewport output is converted with `toContainingBlockPosition` (§3.4).
- `conductor decide-and-trace` D4 (F2): Esc is handled per level on each menu level root element (`preventDefault()` + `stopPropagation()`); window-level host handlers return early when `event.defaultPrevented`.
- `conductor decide-and-trace` D5 (F4): every host relays the leaf event in every port; Svelte `OverflowMenu` is refactored to render `Menu` (no duplicated cascade).
- `conductor decide-and-trace` D6 (F7): click opens with focus unchanged on the parent line; `Enter`/`Space`/opening arrow opens and focuses the first enabled item.
- `conductor decide-and-trace` D7 (F8): key derivation per §2.3; `group` never contributes to `path`; internal open state is an index path; duplicate sibling keys warn once per instance.
- `conductor decide-and-trace` D8 (F9): in standalone `Menu`, Esc/opposite arrow always close the deepest open sub-menu; root close stays governed by `dismissOnSelect`.
- `conductor decide-and-trace` D9 (F10, conductor decision 4): safe-triangle apex is tested then refreshed on every `pointermove` (§3.3).
- `conductor decide-and-trace` D10 (F11): the host generates the root menu id and sets `aria-controls` on its trigger, including an external trigger element passed as prop; Angular `MenuTriggerButton` gains an `aria-controls` input.
- `conductor decide-and-trace` D11 (F12): Angular stays in the Node vitest environment; rendering-level verification for Angular goes to AC-24 (§7).
- `conductor decide-and-trace` D12 (F13): popover shadow applies only to cascade menus; flat menus keep the menu shadow (§5).
- `conductor decide-and-trace` D13 (F14): chevron per §5; Angular uses an inline SVG, no new dependency.
- `conductor decide-and-trace` D14 (F20): AC-24 is a dated manual check attached to L5 (§7).
- `conductor decide-and-trace` D15 (conductor decisions 3, 5, 6): versions per §9; execution order L0 + L1, then L2–L4 in parallel, L5 last (§10); AC-01 explicitly covers the unchanged Angular flat `select` payload.

## 1. Problem and consumer contract

### 1.1 Measured starting point (`spec/menu-cascade` from `origin/main`)

No cascade exists in any port.

- Items: Svelte [Menu.svelte:13](../packages/components-svelte/src/lib/Menu.svelte) `MenuActionItem {label, value, disabled?, danger?, icon?}` — no `children`/`selected`. React [catalog.tsx:44,3544](../packages/components-react/src/catalog.tsx), Vue [Menu.ts:8](../packages/components-vue/src/Menu.ts), Angular [Menu.ts:8](../packages/components-angular/src/Menu.ts) share aliases: key `value ?? id`, `danger ?? variant:"danger"`, `kind ?? type`.
- Keys/focus: Svelte [Menu.svelte:65](../packages/components-svelte/src/lib/Menu.svelte) host-wide `[role="menuitem"]:not(:disabled)` query; Up/Down/Home/End, Enter/Space; roving tabindex only in `focusAt`. No Left/Right, no hover. React [catalog.tsx:3565](../packages/components-react/src/catalog.tsx), Vue [Menu.ts:58](../packages/components-vue/src/Menu.ts) mirror it without initial roving. Angular [Menu.ts:101](../packages/components-angular/src/Menu.ts): click only, no keyboard handler (closed here for cascade).
- Panel: Svelte [MenuPopover.svelte:41](../packages/components-svelte/src/lib/MenuPopover.svelte) `GAP=4`, `VIEWPORT_MARGIN=8`, `MIN_HEIGHT=160`, vertical flip + horizontal clamp, Popover `manual` top layer set imperatively (jsdom-safe), outside via `composedPath`, Escape closes. Single panel only. React/Vue same solver; Angular [MenuPopover.ts:78](../packages/components-angular/src/MenuPopover.ts) exports pure `computeMenuPopoverPosition`/`menuPopoverIsWithin` (Node-tested) — the pattern §3.4 follows.
- Hosts: Svelte [OverflowMenu.svelte:218](../packages/components-svelte/src/lib/OverflowMenu.svelte) own trigger + absolute list ([OverflowMenu.svelte:230](../packages/components-svelte/src/lib/OverflowMenu.svelte)), outside via `host.contains` ([OverflowMenu.svelte:168](../packages/components-svelte/src/lib/OverflowMenu.svelte), not shadow-safe), no focus return. React renders `Menu` in the list ([catalog.tsx:4312](../packages/components-react/src/catalog.tsx)); Vue `mousedown` outside; Angular `localOpen` toggle, `open` input ignored (pre-existing, §11). [MenuTriggerButton.svelte:34](../packages/components-svelte/src/lib/MenuTriggerButton.svelte) presentational in all ports, no logic.
- Styles/tokens: Svelte co-located [Menu.svelte:186](../packages/components-svelte/src/lib/Menu.svelte); shared `styles.css` (`.st-menu` [styles.css:3989](../packages/components-react/src/styles.css), nested surface neutralised [styles.css:4104](../packages/components-react/src/styles.css)). Both panels read `--st-component-menu-shadow`. Tokens [component.ts:1487](../packages/tokens/src/component.ts) (`menu`, `popover`), `selectableRow` [component.ts:1718](../packages/tokens/src/component.ts). `--st-component-popover-shadow` exists, unread by Menu.
- Tests today: Svelte `PlanCompletion/OverlayFeedback/TimeRangePicker.states`; React `MenuPopover/svelte-api-parity`; Vue `behavior` batch 4; Angular `MenuPopover.test.ts`.

### 1.2 Problem

Class → reason needs one interaction: class menu stays open, chosen line shows DS selected state + chevron on the opening side, reason sub-menu attached to that line (left in consumer layout, right when flipped). Hand-composed menus duplicate positioning/focus/close logic outside the DS.

### 1.3 Contract (normative, identical in 4 ports)

1. `MenuActionItem` gains `children?: MenuItem[]` (non-empty = sub-menu) and `selected?: boolean` (parent line DS selected state while sub-menu open; chevron on opening side).
2. Opening: hover ~150 ms, click, Enter, arrow towards opening side. Parent stays open.
3. Position: attached, top aligned on parent line, side flip when short, vertical shift in viewport, internal scroll only if window too short.
4. Keyboard: Up/Down in current menu; opposite arrow/Esc closes sub-menu → focus parent line; next Esc closes all → focus trigger. APG menu pattern (§4).
5. Closing: outside click (`composedPath`, shadow-safe), Esc, leaf choice.
6. Tokens: `--st-component-popover-shadow` on cascade panels only (§5); selected via existing tokens. No new shape (D6).

Interpretation (F15): `children: []` is a leaf. READY §1 "presence = opens a sub-menu" is read as non-empty presence; an empty reason list is unusable as a panel. Consumer behaviour for a class without reasons: the class line stays a leaf and activation emits the class key (`path` length 1), so the consumer records the class with no reason.

## 2. Public API per port

### 2.1 Items

`MenuActionItem` (+ `OverflowMenuActionItem` alias) gains exactly:

```ts
children?: MenuItem[]; // length > 0 => sub-menu trigger; undefined/[] => leaf
selected?: boolean;    // default false
```

Dividers/groups ignore both fields. `children` recurses with the full union. Port spellings unchanged (Svelte `label/value: string`; React `label: ReactNode`; Vue/Angular `label: unknown`; aliases §1.1).

- Parent activation SHALL NOT emit `select` nor close anything; it opens/toggles the sub-menu (§3.2).
- Leaf emits `select` once (§2.3), then cascade closes (§3.6).
- `selected:true` renders selected style; open parent renders the same style (union). `selected` alone opens nothing, no ARIA selected semantics.
- Disabled parent never opens; skipped by roving focus. A disabled parent with `children` still renders chevron + `aria-haspopup` (§4) but never `aria-expanded="true"`.

### 2.2 Props

`Menu` gains one prop; hosts forward it in `items` mode. Nothing else changes publicly.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `submenuSide` | `"auto"\|"left"\|"right"` | `"auto"` | Preferred side; `auto` prefers right, flips left when short (§3.4). Consumer pins `"left"` (PR #1044 layout). Resolved per level; drives chevron + opening arrow. |

Delays are constants, not props: `OPEN_DELAY=150 ms`, `CLOSE_DELAY=250 ms`. Insertion points (labelled insertion points, F18): Svelte `MenuProps` type [Menu.svelte:43](../packages/components-svelte/src/lib/Menu.svelte) and `OverflowMenuProps` type [OverflowMenu.svelte:43](../packages/components-svelte/src/lib/OverflowMenu.svelte); React `MenuProps` in `catalog.tsx`; Vue `MenuProps` type [Menu.ts:46](../packages/components-vue/src/Menu.ts); Angular `@NgInput()` block [Menu.ts:105](../packages/components-angular/src/Menu.ts). Svelte `MenuPopover` renders `children` ([MenuPopover.svelte:14](../packages/components-svelte/src/lib/MenuPopover.svelte)) — consumers pass the prop to child `Menu`. Internal props (`depth`, parent element, callbacks) SHALL NOT be public; nested menus suppress window listeners (outermost host owns global close).

Root id ownership (F11): the host (`MenuPopover`, `OverflowMenu`) generates the root menu id (per-instance counter, §4) and sets `aria-controls` on its trigger. When the trigger is an external element passed as prop (e.g. `MenuPopover` `trigger`), the host SHALL set `aria-controls` on that element while open and remove it on close. Angular `MenuTriggerButton` ([MenuTriggerButton.ts:10](../packages/components-angular/src/MenuTriggerButton.ts)) gains an `aria-controls` input bound as `[attr.aria-controls]`; Svelte already accepts it ([MenuTriggerButton.svelte:12](../packages/components-svelte/src/lib/MenuTriggerButton.svelte)), React/Vue pass it through button attributes.

### 2.3 Events (names frozen, payload additive)

| Port | Rule |
| --- | --- |
| Svelte `onselect(value)` [Menu.svelte:50](../packages/components-svelte/src/lib/Menu.svelte) | → `(value, detail?: {path: string[]; item})`. One-arg handlers unaffected. `path` = keys root→leaf (consumer: `path[0]` class, leaf value reason). |
| React `onSelect(item)` [catalog.tsx:3560](../packages/components-react/src/catalog.tsx) | → `(item, path: string[])`; item unchanged. |
| Vue `select` emit [Menu.ts:66](../packages/components-vue/src/Menu.ts) | → `(item, path)`. |
| Angular `select` [Menu.ts:110](../packages/components-angular/src/Menu.ts) | Emits the leaf item unchanged at any depth (D1). Additive `selectPath` emits `{item, path}` for every leaf. |

Key derivation (F8), contractual because the consumer reads `path[0]` as the class:

| Port | Key |
| --- | --- |
| Svelte | `value` |
| React | `id ?? value`, fallback `String(label)` text, then index |
| Vue | `id ?? value`, fallback `String(label)` |
| Angular | `id ?? value`, fallback `String(label)`, then index |

Fallbacks are documented per port and SHALL NOT change for existing flat menus' first argument. `group` never contributes to `path` (a grouped deep leaf carries only ancestor action keys + leaf key). Internal open state SHALL be an index path, not keys, so duplicate keys cannot open/close together. Duplicate sibling keys SHALL trigger one dev `console.warn` per instance (not per render, not per key globally).

Host relay (F4): every host relays the leaf event in every port — first argument unchanged, `path` second; Angular hosts emit both `select` (item) and `selectPath` (`{item, path}`). Hosts close fully after a leaf and never close on a parent item. Current gaps closed by this rule: React `OverflowMenu` renders `Menu` with no relay ([catalog.tsx:4312](../packages/components-react/src/catalog.tsx)); Vue `OverflowMenu` renders `Menu` with no `select` listen ([OverflowMenu.ts:92](../packages/components-vue/src/OverflowMenu.ts)) and emits only `update:open` ([OverflowMenu.ts:30](../packages/components-vue/src/OverflowMenu.ts)); `MenuPopover` items modes render `Menu` with no relay ([catalog.tsx:3865](../packages/components-react/src/catalog.tsx), [MenuPopover.ts:288](../packages/components-vue/src/MenuPopover.ts), [MenuPopover.ts:183](../packages/components-angular/src/MenuPopover.ts)); Angular `OverflowMenu` closes and re-emits the item alone ([OverflowMenu.ts:58](../packages/components-angular/src/OverflowMenu.ts), [OverflowMenu.ts:77](../packages/components-angular/src/OverflowMenu.ts)) and SHALL additionally emit `selectPath`. Svelte `OverflowMenu`, which renders its own list without reusing `Menu` ([OverflowMenu.svelte:230](../packages/components-svelte/src/lib/OverflowMenu.svelte)), SHALL be refactored to render `Menu` (no duplicated cascade), guarded by flat-menu DOM/class regression tests (AC-37).

Leaf `onClick` (React/Vue/Angular) still precedes `select`; parent `onClick` SHALL NOT run on open. Host open events unchanged.

### 2.4 Backward compatibility

No-`children` menus: identical classes and identical first `select` argument; same Escape/outside rules. Svelte `dismissOnSelect` gating ([Menu.svelte:57](../packages/components-svelte/src/lib/Menu.svelte)) is preserved for root close. AC-01 (§6) gives the closed list of allowed deltas; anything outside that list is a regression. Angular flat `select` payload is explicitly unchanged (D15). Flat `MenuGroupItem.items` unchanged. Nothing renamed/removed.

## 3. Behaviour

### 3.1 Structure

Parent item: wrapper `.st-menu__itemWrap` (`position:relative`) with button + panel when open. The sub-menu panel SHALL be rendered as a sibling of the root list inside the outer host / menu root element, outside the root list's scroll container (D3). It is never inside `<button>` and never a DOM descendant of the scrolling root list, so the root `overflow-y: auto` ([Menu.svelte:198](../packages/components-svelte/src/lib/Menu.svelte)) cannot clip it and host `composedPath` checks work without portal. Host panel transforms ([MenuPopover.svelte:258](../packages/components-svelte/src/lib/MenuPopover.svelte), [styles.css:4116](../packages/components-react/src/styles.css)) make the nearest transformed ancestor the containing block for `fixed` descendants; §3.4 converts for that block. Panel = recursive menu `.st-menu.st-menu--submenu`, `role="menu"`, inline `top/left/max-height` (§3.4). One open sub-menu per level; open path = ordered index path (§2.3). Pointer handlers (§3.3) attach to the item+panel wrapper, not the button alone.

### 3.2 State machine

`Closed → RootOpen → SubOpen(path)`, `1≤path.length≤2`; transient `HoverPending`/`SafeTriangle` overlay any open state. `path` here is the internal index path.

| Transition | Trigger | Result |
| --- | --- | --- |
| Open | Hover 150 ms; click; Enter/Space; opening arrow | Parent selected style + `aria-expanded="true"`. Click: focus unchanged on the parent line (D6). Enter/Space/opening arrow: focus first enabled sub item; if none is enabled, focus stays on the parent line. Opening arrow on an already-open parent focuses the first enabled item without closing. |
| Toggle | Second click on an open parent | That level (and deeper) closes; focus unchanged on the parent line; no `select`. |
| Switch | Sibling parent activation | Old panel closes, old open style removed (explicit `selected` kept), new opens. |
| Close level | Opposite arrow, Esc inside (§3.6), §3.3 exit, host close | Deepest closes; focus → parent line (keyboard only). |
| Close all | Esc at root (§3.6), Tab/Shift+Tab (§4), outside, leaf, trigger toggle | Host closes; focus → trigger only for cascade and keyboard closes (§3.6). Pointer never moves focus programmatically. |

Disabled never transitions. `items` change removing the open index path closes that path and cancels all timers (§3.3).

### 3.3 Hover intent + safe triangle

Safe triangle + grace delay, not a bare timeout: a timeout fails the consumer diagonal (far reason, slow pointer); a long one stalls sibling switching. Direction is the intent signal, and triangle geometry is pure/testable. Mouse only: every pointer handler SHALL return early unless `pointerType === "mouse"`; touch/other pointers use click. All timers (150/250 ms) SHALL be cancelled on unmount and on any `items` change.

1. `pointerenter` parent: cancel close, start 150 ms (same for sibling switch).
2. `pointerenter` leaf: cancel other pending opens; arm close if another branch open — unless the safe triangle is active (step 3 priority).
3. `pointerleave` parent (sub open): record exit point P as apex. On each `pointermove`: first test the point against the triangle (previous apex, facing edge of the real panel rect from `getBoundingClientRect()`, that edge extended 4 px above and below); only then set apex = current point (test-then-update, D9). While the point stays inside, nothing closes and no sibling/leaf timer arms: the triangle has priority over `pointerenter` on leaves/siblings crossed during the diagonal.
4. Enter panel: cancel all. Leave item+panel wrapper or exit the triangle away from the panel: 250 ms close; re-entry cancels. Expiry closes that level + deeper.
5. Hover never focuses; focus inside a pointer-closed level moves to its parent line.

`pointInSafeTriangle(p,a,b,c)` inclusive-edge pure helper per port, exported for tests (module per §3.4).

### 3.4 Positioning (deterministic)

Pure solver per port (Angular precedent [MenuPopover.ts:78](../packages/components-angular/src/MenuPopover.ts)). L0 names one module per port exporting `computeSubMenuPosition`, `pointInSafeTriangle`, and `toContainingBlockPosition`: Svelte `src/lib/menu-cascade.ts`, React `src/menu-cascade.ts`, Vue `src/menu-cascade.ts`, Angular `src/menu-cascade.ts`.

`computeSubMenuPosition({parentMenuRect, parentItemRect, panelSize, viewport, preferredSide, panelPaddingTop=5}) → {side, top, left, maxHeight?}`. `panelPaddingTop=5` (1 px border + 4 px padding) aligns the first item box with the parent line (F16). `maxHeight` absent means `undefined` (unset). Reuses `VIEWPORT_MARGIN=8` ([MenuPopover.svelte:43](../packages/components-svelte/src/lib/MenuPopover.svelte)); no `MIN_HEIGHT` for sub-menus. `fits` means `space >= W` (equality fits, no flip).

1. `W = width>0 ? width : 192` (12 rem default); `H = height` (0 = unknown).
2. `spaceRight = vw-8-parentMenuRect.right`, `spaceLeft = parentMenuRect.left-8`. Side: preferred if it fits, else other if it fits, else roomier (tie → preferred).
3. `left = right ? parentMenuRect.right : parentMenuRect.left-W` (flush). Clamp `[8, vw-8-W]` if `W≤vw-16` (may overlap parent, never viewport); else `left=8` and the panel gets `min-width: 0` with `max-width: calc(100vw-16px)` so CSS `min-width` (12 rem, [Menu.svelte:194](../packages/components-svelte/src/lib/Menu.svelte), [styles.css:3996](../packages/components-react/src/styles.css)) cannot override the cap.
4. `top = parentItemRect.top - panelPaddingTop`. If `H>0` and `top+H>vh-8` → `top=vh-8-H`; `top<8` → `top=8`. If `H=0`: keep `top = parentItemRect.top - panelPaddingTop` with only the `top>=8` clamp; the bottom clamp SHALL NOT apply (it would pin the panel to the viewport bottom on the first frame).
5. Scroll only if too short: `H>vh-16` → `top=8`, `maxHeight=vh-16`; else `maxHeight` unset (`--st-menu-maxHeight,80vh` outer guard remains).
6. Recompute on open/scroll(capture)/resize per level vs its own parent rect, plus one recompute after mount per level (`requestAnimationFrame`, or `nextTick` in Vue) once the real panel size is known. `position:fixed`; no new top layer (inside the host's).

Containing-block conversion (D3): the solver returns viewport coordinates. Before applying inline `top/left`, walk ancestors of the panel to the nearest element establishing a containing block for fixed descendants (`transform`, `filter`, `perspective`, `contain`, `will-change` per computed style). If found, convert with the pure helper `toContainingBlockPosition({top, left}, cbRect | null) → {top: top - (cbRect?.top ?? 0), left: left - (cbRect?.left ?? 0)}`, where `cbRect` is that ancestor's `getBoundingClientRect()`. If none is found, viewport coordinates apply unchanged. Both host placements `top-*` (panel flipped above) and alignment `end` (`translateX(-100%)`) establish such an ancestor and SHALL be covered (AC-36, AC-24).

### 3.5 Depth

Root + 2 sub levels (3 panels). Consumer needs 1; level 2 required to prevent a fork. A depth-2 item with `children` renders as a leaf (no chevron, `children` ignored) + dev `console.warn` once per key per instance. A consumer header such as "Class — reason" is a `group` item at the head of `children`; groups/dividers in `children` render as at root (§8 shows it in the docs example).

### 3.6 Closing + focus

- Outside: host closes all iff `composedPath` has neither any panel (root or sub) nor trigger ([MenuPopover.svelte:176](../packages/components-svelte/src/lib/MenuPopover.svelte) pattern). Sibling panels (§3.1) are inside the host element, so they are never "outside". Svelte `OverflowMenu` `host.contains` ([OverflowMenu.svelte:168](../packages/components-svelte/src/lib/OverflowMenu.svelte)) is replaced by the refactored `Menu` composition (D5); no separate helper switch remains.
- Esc (D4, F2/F9): each menu level root element carries a `keydown` handler. Esc inside a level closes that level only, focuses its parent line, then calls `preventDefault()` + `stopPropagation()`. Every existing window-level host handler ([Menu.svelte:128](../packages/components-svelte/src/lib/Menu.svelte), [MenuPopover.svelte:193](../packages/components-svelte/src/lib/MenuPopover.svelte), [catalog.tsx:3828](../packages/components-react/src/catalog.tsx)) SHALL return early when `event.defaultPrevented` is true. The next Esc reaches the host and closes all. In standalone `Menu`, Esc/opposite arrow always close the deepest open sub-menu level regardless of `dismissOnSelect`; closing the ROOT stays governed by `dismissOnSelect` (flat menus unchanged). AC-14 root-close therefore applies to hosts and to standalone `Menu` with `dismissOnSelect: true`.
- Focus: host owns trigger; close-all via Esc or keyboard leaf SHALL focus the trigger (`MenuPopover` focuses its `trigger` on Esc-close; `OverflowMenu` gains the same). Focus return to the trigger applies only to cascade closes and keyboard closes; flat menus keep current behaviour. Pointer closes never move focus.

## 4. Accessibility (APG menu)

- Trigger: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` = host-generated root menu id (§2.2), set by the host on its own trigger and on an external trigger element passed as prop.
- Level: `role="menu"`, named (`label` root; sub `aria-labelledby` = parent button id). Actions `role="menuitem"` `<button type="button">`; dividers `separator`; groups `presentation`.
- Parent: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` = sub id. A disabled parent renders `aria-haspopup` + chevron but never `aria-expanded="true"`. Ids per instance (counter [Menu.svelte:33](../packages/components-svelte/src/lib/Menu.svelte)), stable per item.
- Roving per level: one enabled `tabindex="0"`, rest `-1`. Up/Down wrap in current level only — query SHALL be level-scoped (host-wide query [Menu.svelte:65](../packages/components-svelte/src/lib/Menu.svelte) would leak); Home/End; disabled skipped. Exception: a level with no enabled item has no `tabindex="0"` and focus stays on its parent line (§3.2).
- Enter/Space activate; opening arrow (Right/Left by resolved side) opens + focuses first enabled; opposite closes + refocuses parent; Esc §3.6; Tab and Shift+Tab close all and let focus leave (no trap). Chevron `aria-hidden`; selected is visual only.

Deviations (only these): D-A1 `MenuPopover` wrapper keeps `role="dialog"` ([MenuPopover.svelte:222](../packages/components-svelte/src/lib/MenuPopover.svelte)); items-mode inner `role="presentation"` ([catalog.tsx:3865](../packages/components-react/src/catalog.tsx), [MenuPopover.ts:288](../packages/components-vue/src/MenuPopover.ts), [MenuPopover.ts:183](../packages/components-angular/src/MenuPopover.ts)) SHALL become `role="menu"` when `children` present. D-A2 native `disabled` (not focusable) kept vs APG focusable `aria-disabled`. D-A3 no typeahead/PageUp/Down. D-A4 standalone `Menu` has no trigger; focus-return is host-only, standalone root close gated by `dismissOnSelect` (§3.6).

## 5. Tokens and styles

No new token/literal/shape (D6). Shadow rule (D12): when any item in the tree carries non-empty `children`, the root panel gets marker class `st-menu--hasCascade` and both root and sub-menu panels use `box-shadow: var(--st-component-popover-shadow, var(--st-component-menu-shadow, 0 8px 24px rgb(15 23 42 / 0.14)))` (literal = shipped fallback [Menu.svelte:191](../packages/components-svelte/src/lib/Menu.svelte)). Sub-menu panels always use that chain. Flat menus (no `children` anywhere) keep `var(--st-component-menu-shadow, …)` on every panel. Sources [component.ts:1487](../packages/tokens/src/component.ts).

- Surface: `--st-component-menu-background/-border/-radius/-text/-minWidth(12rem)/-maxWidth(18rem)/-fontSize` (fallbacks `--st-semantic-surface-raised`, `--st-semantic-border-subtle`). `.st-menu--submenu` sets `min-width: 0` when the solver caps width (§3.4 step 3).
- Selected: `--st-component-selectableRow-selectedBackground`, `--st-component-selectableRow-selectedText` ([component.ts:1718](../packages/tokens/src/component.ts); precedent [SelectableRow.svelte:292](../packages/components-svelte/src/lib/SelectableRow.svelte) incl. no-`color-mix` fallback). `-selectedAccent` unused (no accent bar).
- Hover/danger/disabled/group: `--st-component-control-hoverBackground` ([Menu.svelte:223](../packages/components-svelte/src/lib/Menu.svelte)), existing `menu-danger*/disabledText/groupText`.
- Geometry: `--st-spacing-1/2/3`, `--st-radius-small`, `--st-menu-maxHeight`, `z-index: var(--st-component-popover-zIndex,80)` + depth.

Classes (additive): `.st-menu__item--selected`, `--hasSubmenu`, `.st-menu__itemChevron` (`--start/--end`), `.st-menu__itemWrap`, `.st-menu--submenu`, `.st-menu--hasCascade`. Chevron 16 px, `aria-hidden`, no glyph text, per port (D13): Svelte `@lucide/svelte` `ChevronRight/Left`; React `lucide-react`; Vue `lucide-vue-next` (dependency already present); Angular inline SVG copying the Lucide `chevron-right`/`chevron-left` path at 16 px (precedent [MenuTriggerButton.ts:32](../packages/components-angular/src/MenuTriggerButton.ts)), no new dependency. Shared `styles.css`: `.st-menuPopover .st-menu--submenu` restores surface vs neutralised nesting ([styles.css:4104](../packages/components-react/src/styles.css)). Dense per level.

## 6. Acceptance criteria

jsdom/vitest (§7) except AC-24 (manual check, §7). "Menu" = any host unless stated. AC-01–AC-24 keep their numbers; AC-25+ are appended.

1. AC-01 Flat: no-`children` menus keep identical classes and identical first `select` argument in every port, Angular `select` payload explicitly included. Closed list of allowed deltas (only these): (a) initial roving `tabindex` attributes (`0`/`-1`, no visual change; current buttons carry none, [Menu.svelte:149](../packages/components-svelte/src/lib/Menu.svelte)); (b) focus return to the trigger limited to cascade and keyboard closes (§3.6). Flat menus keep the menu shadow (§5). Existing suites pass unmodified.
2. AC-02 Parent: `aria-haspopup`, `aria-expanded="false"`, chevron on preferred side, no panel yet. Disabled parent: chevron + `aria-haspopup` present, `aria-expanded` never `"true"`.
3. AC-03 `children:[]`/absent = leaf: no chevron; activation emits (class key case, §1.3).
4. AC-04 Click parent: opens, parent stays open, `aria-expanded="true"`, selected class, no `select`; focus remains on the parent line after click.
5. AC-05 Enter/Space parent = AC-04 + focus first enabled sub item.
6. AC-06 Opening arrow = AC-05; opposite in sub closes + focus parent.
7. AC-07 Hover: closed 149 ms, open 150 ms (fake timers); focus unmoved.
8. AC-08 Diagonal in triangle stays open past 250 ms; panel entry cancels; leave both closes after 250 ms; re-entry cancels.
9. AC-09 Sibling switch closes first; explicit `selected:true` keeps class.
10. AC-10 `selected:true` alone: class only, no panel/`aria-expanded` change.
11. AC-11 Deep leaf: `select` once (first argument = leaf) + full `path` (second argument / Svelte detail / Angular `selectPath` `{item, path}`); all close. Angular `select` still emits the bare leaf item.
12. AC-12 Disabled parent never opens; disabled skipped per level.
13. AC-13 Arrows/Home/End level-local; one `tabindex="0"` per open level. Documented exception: a level with no enabled item has no `tabindex="0"` (AC-31).
14. AC-14 Esc in sub closes it + refocus parent; next Esc closes all + trigger focus; root Esc closes all. Root-close applies to hosts and to standalone `Menu` with `dismissOnSelect: true`; standalone sub-menu Esc closes regardless of `dismissOnSelect` (§3.6).
15. AC-15 Outside closes all; trigger/panels never; `composedPath` panel = inside even if `target` outside.
16. AC-16 Solver flip/clamp/align per §3.4 steps 2–4, including: `space == W` fits (no flip); `panelPaddingTop=5` alignment; `maxHeight` absent = `undefined`.
17. AC-17 Solver cap: `H>vh-16` → `top=8`, `maxHeight=vh-16`; else `maxHeight` unset.
18. AC-18 Level 2 opens; its child-bearing item renders as leaf, no chevron, warns once per key per instance; a leaf at depth 2 emits with `path` length 3.
19. AC-19 Level-2 flips independently; chevron/arrow follow flipped side.
20. AC-20 `submenuSide="left"` left with room; `"auto"` right on same geometry.
21. AC-21 Groups/dividers in `children` as root; grouped deep leaf `path` written in full (ancestor action keys + leaf key, no group entry).
22. AC-22 `items` removing the open index path removes orphan panels and cancels timers.
23. AC-23 Cascade shadow chain on root (marker class) + sub-menu; selected uses selectableRow tokens (class + var assertions). Flat menu keeps menu shadow.
24. AC-24 Manual check only (D14, §7): real diagonal, top-layer, scroll/resize, shadow DOM, parent near viewport bottom. No local Chromium evidence; never run locally.
25. AC-25 Diagonal crossing a sibling leaf: triangle priority holds — crossed leaf/sibling neither opens nor arms close while inside (§3.3 step 3).
26. AC-26 Solver `H=0`: `top = parentItemRect.top - 5`, only `top>=8` clamp, no bottom clamp (§3.4 step 4).
27. AC-27 Solver at viewport 160 px wide: capped width with `min-width: 0`; no overflow past `vw-8`.
28. AC-28 Duplicate sibling keys: open state follows index path (siblings never open together); one dev warning per instance.
29. AC-29 Second click on an open parent closes that level (+ deeper); focus unchanged; no `select`.
30. AC-30 Opening arrow on an already-open (hover) parent focuses first enabled item without closing.
31. AC-31 Level with all items disabled: opens, no focus target, focus stays on parent line, no `tabindex="0"` in that level.
32. AC-32 Tab and Shift+Tab with cascade open: all levels close, focus leaves the menu, no focus trap.
33. AC-33 Trigger `aria-controls` resolves to an existing element (root menu id) while open, for host-owned and external triggers; Angular `MenuTriggerButton` `aria-controls` input binds through.
34. AC-34 Composition `MenuPopover` + `Menu` with cascade: first Esc closes the sub-menu only; second Esc closes everything (+ trigger focus).
35. AC-35 Host relay: deep leaf via `OverflowMenu` and via `MenuPopover` items mode emits first argument unchanged + `path` (Angular: `select` + `selectPath`); parent activation via hosts emits nothing and closes nothing.
36. AC-36 Geometry with host placement `top-*` and alignment `end` in 4 ports: solver + `toContainingBlockPosition` conversion correct (solver/helper level in jsdom; real layout in AC-24).
37. AC-37 Svelte `OverflowMenu` flat regression: pre-refactor DOM/classes for flat menus unchanged (guard for the D5 refactor to `Menu`).
38. AC-38 Timers: unmount during a pending hover open fires nothing; `items` change cancels pending open/close; non-mouse `pointerType` never arms hover (touch uses click).

## 7. Test plan per port

Mock rects, stub viewport, fake timers, `activeElement`. jsdom sizes 0 → pixels via solver (AC-16/17/19/26/27/36); DOM pins classes/ARIA/focus/timing.

- Svelte `src/MenuCascade.test.ts` (AC-02–15, 18, 20–22, 25, 28–38, 3 hosts) + solver/conversion/triangle + `AnatomyTokens` (AC-23). Keep `PlanCompletion/OverlayFeedback/TimeRangePicker.states/Shell` green. Environment jsdom ([vite.config.ts:8](../packages/components-svelte/vite.config.ts)).
- React `src/MenuCascade.test.tsx` + solver + one `svelte-api-parity` cascade case. Keep `MenuPopover/behavior/catalog/index` green. Environment jsdom (React `vite.config.ts`).
- Vue `src/MenuCascade.test.ts`. Keep `behavior` batch 4, `svelte-api-parity`, `TimeRangePicker.states` green. Environment jsdom (Vue `vite.config.ts`).
- Angular `src/MenuCascade.test.ts` (Node, [vitest.config.ts:5](../packages/components-angular/vitest.config.ts); no new harness, D11): AC subset closed in Node = solver + conversion helper + triangle (AC-16/17/19/26/27/36 helper level), state machine called directly and payloads (AC-11 Angular part, AC-28 warning, AC-38 timer logic), template-inspection tests on the component template string for chevron/`aria-haspopup`/`aria-expanded`/`tabindex` bindings (AC-02/13 binding level, following [MenuPopover.test.ts:305](../packages/components-angular/src/MenuPopover.test.ts) handler-level pattern). Gate `npm run build && vitest run` (`../dist` imports). Rendering-level Angular verification (focus, roving, Esc composition AC-34 Angular part) goes to AC-24.

AC-24 execution gate (F20/D14): `.github/workflows/verify.yml` browser witnesses run only for `@sentropic/design-system-artifact-shell` ([verify.yml:205](../.github/workflows/verify.yml)) — no existing browser job runs component browser tests for Menu. AC-24 is therefore classified as a dated manual check attached to L5: performed by a human or a later CI job, dated and recorded in the PR, never with local Chromium. Acceptance of L1–L4 SHALL NOT claim AC-24.

All: `check`+`test` green; depth-3 type fixture compiles.

## 8. Docs

- [menu/+page.svelte](../apps/docs/src/routes/components/menu/+page.svelte): Cascade section + `TabbedExample` (`menu-cascade` in `apps/docs/src/lib/framework/examples.ts`: 3 parents with reasons, 1 direct leaf; one sub-menu headed by a `group` item "Class — reason", §3.5); API rows `children/selected/submenuSide`; §4 keys + D-A1/D-A2; tokens += popover-shadow + selectableRow pair. FR/EN `fr()`.
- [menu-popover/+page.svelte](../apps/docs/src/routes/components/menu-popover/+page.svelte): sub-panels inside popover panel; Esc → trigger focus. Fix parity note only if facts change.
- [overflow-menu/+page.svelte](../apps/docs/src/routes/components/overflow-menu/+page.svelte): `children/selected` accepted. Frozen-open demos as today.

## 9. Versions

Minor/additive, after glyph card. No tokens/themes release. Current versions SHALL be re-read at implementation time (D15).

| Package | Current | Glyph | This card |
| --- | --- | --- | --- |
| svelte | 0.37.2 | 0.38.0 | **0.39.0** |
| react/vue/angular | 0.38.1 | 0.39.0 | **0.40.0** |

Bumps land with code, not this spec.

## 10. Lot plan (author: muse-spark)

Each lot ends `check`+`test` green. Agent-time, no browser work. Execution (D15): L0 + L1 (Svelte reference) first; L2–L4 in parallel once L1 is accepted; L5 last.

| Lot | Content | Est. |
| --- | --- | --- |
| L0 | Types ×4; `menu-cascade` modules (§3.4) + solver/conversion/triangle tests (AC-16/17/19/26/27) ×4 | 4 h |
| L1 Svelte (reference) | `Menu` cascade + `MenuPopover`/`OverflowMenu` wiring; `OverflowMenu` refactor to `Menu` (D5) + flat regression guard (AC-37); styles + tests | 8 h |
| L2 React | `catalog.tsx` + `styles.css` + tests | 5 h |
| L3 Vue | `Menu/MenuPopover/OverflowMenu` + styles + tests | 5 h |
| L4 Angular | Same + full item keyboard + `selectPath` + template-inspection tests (§7) | 7 h |
| L5 | Docs (§8), 4-port pass, AC sweep, dated manual AC-24 record, PR #1044 migration note | 4 h |

Total ≈ 33 agent-hours (serial sum). Parallel wall-clock ≈ L0 + L1 + max(L2, L3, L4) + L5 ≈ 23 h. L1 re-estimated for the `OverflowMenu` refactor; L4 for the full Angular keyboard (port starts click-only, [Menu.ts:101](../packages/components-angular/src/Menu.ts)).

## 11. Out of scope

Exported `SubMenu`; consumer migration/data; `IdentityMenu/AppChrome/AppShell/TimeRangePicker` internals; typeahead/PageUp/Down; RTL beyond resolved side; touch long-press; mobile drill-down; portal rework; `MenuPopover` side placements; Angular `OverflowMenu` `open` gap beyond §3.6; new tokens/themes/dark variants; local browser checks (AC-24 manual, §7).

## Open questions

None. Q1 and Q2 are closed (Decisions D1, D2).
