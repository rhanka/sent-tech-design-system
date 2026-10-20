# SPEC EVOL — DS-COMMENT-ANNOTATE-BLOCKS: presentation and interaction blocks for the comment / annotate UX

| Field | Value |
| --- | --- |
| Status | Specification only. No implementation, no package, no test execution is claimed by this document. |
| Date | 2026-10-19 |
| Branch | `spec/comment-annotate-blocks`, cut from `origin/main` (`Your branch is up to date with 'origin/main'` at authoring; Svelte package `@sentropic/design-system-svelte` 0.36.0 measured in `packages/components-svelte/package.json`) |
| Target version | Next minor of `@sentropic/design-system-svelte`: **0.37.0**. React / Vue / Angular counterparts are at 0.38.0 measured; their parity lots are staged separately (§10) and do not change this target. |
| Owner request | The comment / annotate UX is carried by the design system (presentation and interaction) over the sentropic data model, consumed through the Focus (h2a) dossier binding — not by the consuming page inventing its own layer. The consumer uses theme `@sentropic/design-system-theme-airbus` (`packages/theme-airbus`). Vocabulary is **"comment"** and **"annotate"** throughout; no other synonym for the feature is used in DS names, props or labels. Relayed through the hrpolnav session and h-cond. Ownership per owner decision G3 (§0.2). |
| Boundary | **Decided — owner decision G3, 2026-10-19 (dossier v4): « g3 = a ok », option (a). Recorded in `/home/antoinefa/src/sentropic/.tmp/spec-review-v3/OWNER-DECISIONS-2026-10-19.md` (line 13) and in Track 01M5AFHYR4FDG8E7VNP9XYYT21.** The design system owns annotate (presentation only); sentropic owns the data model (anchors, threads, persistence; stable anchor contract per DS position); Focus / h2a is the dossier binding that consumes that model. The DS ships no comment data model and no persistence (§0.2). |
| Scope of this document | The DS side only: reuse versus new components, icons, labelled and split icon buttons, `CommentListItem`, the context menu, the element picker, framework parity plan, i18n, theming, lots with gates and RED witnesses, open questions, and the NOT-covered list. |
| Related | FE-2 rich-text editor: `spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md` on branch `feat/rich-text-core` (paragraph identity and Tiptap constraints, read via `git show feat/rich-text-core:spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md`). Diagram hit targets: `packages/diagram-canvas`, `packages/diagram-core`. |

## 0. How to read this specification

### 0.1 Source tags

Every load-bearing choice carries one primary tag. A proposition inside a settled item is tagged separately.

| Tag | Meaning |
| --- | --- |
| `owner-brief` | Wording or need stated in the commissioning brief for this specification (the four DS-side needs in §1.1, the split-button screenshot reference, the anchor-opacity instruction). |
| `measured` | Fact read on disk in this worktree at authoring: file path cited inline. |
| `h-cond-plan` | Field or behaviour of the sentropic data model (owner decision G3, §0.2) relayed by h-cond, the Focus dossier binding, as the model owner's contract. Cited as the contract the DS carries opaquely; its exact shape is sentropic's to freeze and is never a DS-owned type (§0.3, Appendix A). |
| `owner-decision G3` | Owner decision of 2026-10-19 (dossier v4), verbatim « g3 = a ok » for option (a), recorded in `/home/antoinefa/src/sentropic/.tmp/spec-review-v3/OWNER-DECISIONS-2026-10-19.md` (line 13) and in Track 01M5AFHYR4FDG8E7VNP9XYYT21: design-system owns annotate (presentation only), sentropic owns the data model, Focus / h2a is the dossier binding that consumes it (§0.2). |
| `fe2-spec` | Statement taken from FE-2, `spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md` on `feat/rich-text-core`. |
| `ds-proposition` | A design choice made by this specification for the DS. It requires ratification where §15 states so and must never be reported as an owner requirement. |

`SHALL` / `MUST NOT` state the proposed contract. They acquire force only at ratification.

### 0.2 Ownership boundary (owner decision G3, 2026-10-19; not negotiable inside this specification)

This boundary is decided, not provisional. Owner decision G3 of 2026-10-19 (dossier v4), verbatim « g3 = a ok » for option (a) — « design-system owns annotate (presentation only), sentropic owns the data model (anchors, threads, persistence; stable anchor contract per DS position) » — is recorded in `/home/antoinefa/src/sentropic/.tmp/spec-review-v3/OWNER-DECISIONS-2026-10-19.md` (line 13), and h-cond records it in Track 01M5AFHYR4FDG8E7VNP9XYYT21. The table states that decision; it is not a DS preference.

| Owner | Owns | Does not own |
| --- | --- | --- |
| Design system (this specification) | Presentation and interaction only: panels composition, icons and labelled icon buttons, the split icon button, `CommentListItem` rendering and local edit state, the context-menu surface, the element-picker overlay and its pick descriptor. | Any comment data model, any anchor semantics, any persistence, any edit-return shape, any data-model or dossier-binding type. No sentropic data-model type, no Focus dossier-binding type, no Track type, no transport or business API enters a DS package. |
| sentropic | The data model: anchors, threads, persistence; and the stable anchor contract published for the DS position (the DS carries that contract opaquely, §0.3, §13, Appendix A). | The DS widgets, their theming, their keyboard behaviour. |
| Focus / h2a (conductor h-cond) | The dossier binding that consumes the sentropic data model: mapping threads and anchors to DS props and callbacks, and surfacing dossier-level flows over it. | The data model itself, the DS widgets, their theming, their keyboard behaviour. |

Consequence: no component in §4–§9 imports a sentropic data-model or Focus dossier-binding package, names a model return field, allocates a persistent comment identity, resolves an anchor to a document position, or writes to a document, a diagram model or storage. The host — the code at the composition site, supplied by the Focus dossier binding over the sentropic data model or by the consuming application directly — supplies data and callbacks; the DS renders and reports gestures. This mirrors the FE-2 boundary (`fe2-spec` §0.2): the DS carries opaque identity attributes that a host-side adapter supplies and reads, and computes no diff.

### 0.3 The anchor is opaque to the DS — the model owner's contract, carried unchanged

The DS side is specified against an **opaque `anchor` value plus a host-supplied `label` and `kind`** (§13 gives the single amendment point):

- `anchor` carries one shared type parameter, declared once in the types themselves (§7.1): `CommentListItemProps<Anchor = unknown>`, the prop is `anchor?: Anchor`, and every callback detail in §7.1 is typed `{ anchor: Anchor | undefined, … }` from that same parameter — the payload union mirrors the prop's optionality exactly, so forwarding the prop to a callback always type-checks under the repository's strict TypeScript configuration (`tsconfig.base.json`: `strict: true`, `measured`) and no callback ever promises a narrower anchor than the prop may hold. With the default, `Anchor` is `unknown` (an opaque value the DS stores in no state, inspects in no branch, serialises in no way) and the DS passes it back unchanged, `undefined` included. The parameter exists from 0.37.0, not at amendment time: specialising it is the whole amendment (§13).
- `anchorLabel: string` and `kind: string` (with `kindLabel: string`) are display strings supplied by the host. The DS renders `kindLabel` in a badge and `anchorLabel` as the anchor link text. It never derives either from `anchor`.
- The DS never switches on `kind` and never maps a kind to a badge tone: `kindTone` is host-supplied per item (§7.1). The brief already fixes this boundary (opaque `anchor`, host-supplied `label` and `kind`, no DS branching on `kind`), so no open question reopens it (§15).

The anchor fields in Appendix A are the sentropic data model's fields (owner decision G3, §0.2), relayed through the Focus dossier binding. They are cited there as the model owner's contract that the DS carries opaquely — never as DS-owned types — so a reviewer can see what the host expects to pass, without this specification depending on, implementing or freezing their shape. Sentropic publishes the stable form of that contract (§13); until it does, the exact field shape remains the model owner's to settle and no DS contract waits on it.

### 0.4 Evidence and verification marks

- DS facts are measured on this worktree. Each claim names its file. A claim that could not be verified on disk is marked `unverified` or `source-gap` inline.
- FE-2 facts are read through `git show feat/rich-text-core:spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md`; that branch was not checked out or modified.
- The owner screenshot referenced in the brief (`…/images/3.png`, a split icon button: an icon button with an adjacent chevron dropdown) could not be opened as a DS source file from this worktree and is treated as `source-gap` for pixel values; the split-button contract in §5.3 is derived from the brief description and from measured DS menu primitives, not from pixel measurement of that image.
- No network was used. Nothing under `.track/` is written by the lots in §14. No Python is used anywhere in the lots this specification defines (implementation, tests, jobs, one-off scripts): the DS stack is Node/TypeScript and native tooling already present (`measured`: root `package.json` scripts).

## 1. Goal, scope, non-goals

### 1.1 Goal

Give the comment / annotate UX a complete DS presentation layer so that the consuming page (theme `@sentropic/design-system-theme-airbus`) and hosts consuming the sentropic data model through the Focus dossier binding compose it without inventing controls:

1. **Right side panel.** Reuse the existing side-panel component. Inside it, DS components for comment list items: editable, kind badge, anchor link (`owner-brief` need 1).
2. **Icons with a hover label or tooltip** instead of text buttons: save, delete, cancel, annotate, circle, rectangle, note, comment (`owner-brief` need 2). The DS control style in the owner screenshot is a split icon button: a primary icon action with an adjacent chevron dropdown (§5.3).
3. **A context menu (right-click)** for both a text selection and a diagram shape (`owner-brief` need 3).
4. **An element picker**, like Claude's "select element" mode. Hovering highlights any block, and a click picks it. It must stay compatible with future Tiptap editing (FE-2) (`owner-brief` need 4).

### 1.2 In scope (this specification)

§4 reuse-versus-new per need; §5 icons, the labelled icon button and the split icon button; §6 right-panel composition; §7 `CommentListItem`; §8 the context menu; §9 the element picker; §10 framework parity; §11 i18n; §12 theming; §13 the anchor amendment point; §14 lots, gates and RED witnesses; §15 open questions; §16 NOT covered.

### 1.3 Out of scope

See §16 for the exhaustive list. In particular: the comment / annotation data model, anchors, threads, persistence and edit return (sentropic, §0.2; Focus / h2a consumes that model through the dossier binding); resolving an anchor to a selection or a shape (host); any mutation of a document or a diagram by the DS; a rich-text editing surface itself (FE-2 owns it).

## 2. Starting point (measured)

### 2.1 Panels (`measured`)

- `packages/components-svelte/src/lib/ContextPanel.svelte` (`ContextPanelProps`: `title`, `subtitle`, `label`, `actions`, `footer`, `children`, `class`) renders an `<aside>` with header / scrollable body / footer grid and `--st-component-contextPanel-*` tokens. It is a content panel, not a positioning shell.
- `packages/components-svelte/src/lib/UtilityPanel.svelte` (`UtilityPanelProps`: `mode: reserve | overlay | floating`, `side: left | right | bottom`, `title`, `label`, `collapsed`, `header`, `footer`, `children`) is the side-panel shell: `side="right"` is a first-class value, `collapsed` hides body and footer, floating/overlay modes add the panel shadow token.
- `packages/components-svelte/src/lib/PanelStack.svelte` + `PanelSection.svelte` provide stacked collapsible sections inside a pane (`PANEL_STACK_MAX_SECTIONS = 4`, single scroll owner). They are available if the comment panel later needs sections (list / details), but need 1 does not require them.
- All three are exported from the Svelte barrel `packages/components-svelte/src/lib/index.ts` (`ContextPanel`, `UtilityPanel`, `PanelStack`, `PanelSection`).

### 2.2 Icons and icon buttons (`measured`)

- `packages/components-svelte/src/lib/icons.ts`: the canonical DS icon set is a closed additive map `GLYPHS` with DS-owned names — currently `settings`, `eye`, `eye-off`, `layers`, `target`, `close`, `chevron-down`, `chevron-right` — mapped to lucide glyphs from `@lucide/svelte`. `IconName = keyof typeof GLYPHS`; `ICONS` and `ICON_NAMES` are exported. The file header states the rule this specification extends: "Names are ADDITIVE: new glyphs extend this map; existing names never change meaning", and consumers address icons by DS names, never by lucide component names.
- `packages/components-svelte/src/lib/Icon.svelte` (`name: IconName`, `size` default 18, `strokeWidth` default 2.25, optional `title` as accessible name) renders the glyph decorative (`aria-hidden`) unless `title` is set.
- `packages/components-svelte/src/lib/IconButton.svelte`: a `<button>` requiring `"aria-label": string`, with `size: sm | md | lg`, `variant: ghost | secondary | danger`, and `--st-component-iconButton-*` tokens. It renders children (the glyph) only; it has **no** tooltip or visible label of its own.
- `packages/components-svelte/src/lib/Tooltip.svelte` (`content: string`, `placement: top | bottom`) shows `role="tooltip"` content on `:hover` and `:focus-within` of a wrapper span. `Toggletip.svelte` is a click-toggled bubble with its own trigger; it is not the hover-label mechanism for icon buttons.
- `MenuTriggerButton.svelte` wraps `IconButton` with `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` and a default `ChevronDownCircle` glyph. `ButtonGroup.svelte` (`attached` segmented look, `role="group"`) joins adjacent buttons with collapsed hairlines. `OverflowMenu.svelte`, `Menu.svelte`, `MenuPopover.svelte`, `Popper.svelte` and `Portal.svelte` are detailed in §2.3.
- Gap against need 2: no DS icon exists for any of the eight actions, and no labelled-icon-button composition (icon button + hover/focus tooltip with the accessible name equal to the label) exists as a named DS block. `ChatComposer.svelte` shows the injected-label prop shape (`sendLabel`, `sendAriaLabel`, …) but with hard-coded French defaults in the current source — the shape to follow, not its default values.

### 2.3 Menus and positioning (`measured`)

- `packages/components-svelte/src/lib/Menu.svelte`: `MenuItem = MenuActionItem | MenuDividerItem | MenuGroupItem`; an action item is `{ label, value, disabled?, danger?, icon? }`. It renders `role="menu"` with roving-tabindex arrow/Home/End navigation, Enter/Space selection via `onselect(value)`, and optional `dismissOnSelect` handling of Escape and outside pointer-down. It has no positioning of its own. Its `icon` is `Component<MenuIconProps> | string` (`MenuIconProps` carries only `size` / `strokeWidth` / `color` / `class`): the renderer mounts a component icon as `<Icon size={16} strokeWidth={2} />` with no other props, and renders a string icon as literal text. A host therefore cannot address a glyph by DS name through the existing field: the DS `Icon` component requires its `name: IconName` prop, which the menu renderer never passes, and a string such as `"circle"` paints the word, not the glyph. Passing a lucide component directly would work mechanically but bypasses the DS-name indirection of §2.2. §5.1 closes this with an additive extension of the `icon` field; the other item fields are unchanged.
- `packages/components-svelte/src/lib/MenuPopover.svelte`: positions a panel against a `trigger: HTMLElement` (`placement: bottom-start | bottom-end | top-start | top-end`, `align` override), recomputes on scroll/resize, clamps `max-height` to the space actually available with an 8 px viewport margin and a 160 px floor, and closes on outside pointer-down / Escape (`closeOnOutside`, `closeOnEscape`). The trigger must be an element.
- `packages/components-svelte/src/lib/OverflowMenu.svelte`: a self-contained ellipsis trigger + `role="menu"` list with the same item model, viewport-aware `max-height`, Arrow/Home/End navigation, Escape and outside-click close, and focus moving to the first item on open. Its positioning is CSS-absolute relative to its own wrapper; it is anchored to its trigger element, not to an arbitrary point or rectangle.
- `packages/components-svelte/src/lib/Popper.svelte`: the general positioning primitive. `PopperProps` takes `anchor: HTMLElement | null`, `placement` (12 values), `offset`, `flip`, `shift`, `strategy: absolute | fixed`, `portal` (renders into `document.body` via `Portal`), `trapFocus` (opt-in), `closeOnEscape` + `onClose`. The exported pure `computePosition(anchorRect, panelWidth, panelHeight, options)` performs flip (opposite side when overflowing) and shift (**cross-axis only** viewport clamp) arithmetic and is unit-testable without DOM: it never clamps the main axis, so a panel taller than the space on the chosen side can still leave the viewport (§8.4 states the complete bounding the new component must add). Focus capture/restore exists only under `trapFocus`; with `trapFocus` off, `Popper` neither moves focus into the panel nor restores it. `MenuPopover.svelte` likewise provides no focus orchestration: it positions (with its own available-space `max-height` clamp), closes on outside pointer-down / Escape by setting `open = false`, and never captures, moves or restores focus. `OverflowMenu.svelte` does move focus to the first item on open (`openAndFocus`), but its `close()` only sets `open = false` — it restores nothing. No measured primitive therefore supplies the open-focus / Escape / focus-return contract of §5.3 and §8 as an inherited behaviour; those compositions own it explicitly (§5.3, §8.4).
- `packages/components-svelte/src/lib/Portal.svelte`: teleports children to `document.body` (or a selector/element target); the container is `display: contents`. Teleporting to `body` moves the content outside any scoped theme subtree (§2.5), so §8/§9 use a portal only under the theme-conservation rule of §12; the picker highlight itself is drawn outside the **content** DOM, which the rule preserves.
- Gap against need 3: every existing menu is anchored to a trigger **element**. None opens at a host-supplied rectangle (a text-selection rect or diagram shape bounds) or at a pointer point, and none is driven by a `contextmenu` event or by Shift+F10 / ContextMenu key at such a target. The menu **list** is reusable; the **anchoring** is not covered.

### 2.4 Lists, badges, fields (`measured`)

- `Badge.svelte` (`tone: neutral | success | warning | error | info`, `shape: pill | circle`, `size: sm | md`) and `Tag.svelte` (same tones, optional dismiss) are the badge primitives. Both read `--st-component-badge-*` / `--st-component-tag-*` tokens with semantic fallbacks.
- `StructuredList.svelte` renders a `<dl>` of key/value rows; `SelectableList.svelte` / `SelectableRow.svelte` render a `role="listbox"` with roving tabindex and selection. Neither is an editable comment item: no read/edit modes, no author/time header, no anchor link, no per-item actions. `ChatMessage.svelte` / `ChatThread.svelte` are chat-shaped (composer + thread) and carry no kind badge or anchor either.
- `Textarea.svelte` is the DS multiline field (`value` bindable, `label`, `helperText`, `errorText`, `invalid`, field anatomy tokens). `Button.svelte` provides text buttons (`variant: primary | secondary | ghost | danger`, `size: sm | md | lg`).
- Gap against need 1 (list items): no existing list item covers an editable comment with kind badge, anchor link, author/time slots and icon actions. A new component is required (§4, §7); the primitives above are its building blocks.

### 2.5 Theming and the Airbus theme (`measured`)

- Component styling reads `--st-component-<name>-*` custom properties with semantic fallbacks (for example `IconButton.svelte` reads `--st-component-iconButton-radius` falling back to a literal, text from `--st-semantic-text-primary`; `ContextPanel.svelte` reads `--st-component-contextPanel-surface` falling back to `--st-semantic-surface-raised`). A theme that emits no component token for a name renders the base appearance.
- `packages/theme-airbus/src/index.ts` builds `airbusTheme` / `airbusDarkTheme` (`TenantTheme`, `id: "airbus"`) through its local `createAirbusComponent(semantic, foundation)`, which calls `createComponent` from `@sentropic/design-system-tokens` (`packages/tokens/src/component.ts`) and spreads its result, overriding only `field.maxWidth`. The factory result is therefore part of the Airbus component layer: it produces, among others, the `menu` tokens (`packages/tokens/src/component.ts`, `menu:` entry: background, border, text, item hover, danger, radius, shadow, resolved from the Airbus semantic layer) and the `tooltip` tokens (`tooltip:` entry: background, text, radius, shadow, zIndex), plus `popover`, `badge`, `tag`, `field`, `control`, `button` and the rest of the factory keys. Under Airbus, `Menu` and `Tooltip` thus render from **factory-produced component tokens resolved on Airbus semantic/foundation values**, not from their semantic fallbacks alone. What the factory does not produce is any key named `iconButton`, `contextPanel` or `utilityPanel` (no such key exists in `createComponent`'s return): the dedicated `--st-component-iconButton-*`, `--st-component-contextPanel-*` and `--st-component-utilityPanel-*` variables those components read are not emitted by any current theme, Airbus included, so they render from their per-variable fallbacks (literals and semantic roles) today. §12 keeps these two groups distinct: tokens the factory already produces for Airbus, and the new token names of this specification, which no theme emits yet.
- `packages/components-svelte/src/lib/ThemeProvider.svelte` scopes a theme by compiling it to a `<style>` in `<svelte:head>` whose selector is `[data-st-theme="<id>"]` and rendering children inside a `<div data-st-theme={theme.id}>`. The variables exist only inside that subtree: content teleported to `document.body` by `Portal.svelte` leaves the subtree and loses a locally scoped theme (a theme set on `<html>` is unaffected, which is why only the scoped case detects the loss). `MenuPopover.svelte` already avoids the issue by staying in place and using the Popover top layer; §12 makes theme conservation a rule for every portalled overlay in this specification.
- No comment/annotate token, message or icon exists in `packages/theme-airbus` or in the base themes at authoring (`source-gap` for any claim beyond this absence; §12 states the additive token names).

### 2.6 Diagram hit targets (`measured`)

- `packages/diagram-canvas/src/hit.ts` is pure arithmetic over a `SceneFrame`: `hitTest(frame, point)` / `hitTestAll` return the topmost `Hit { kind, occurrence: OccurrenceRef, paintIndex, item }`; `hitTestRegion` answers rectangle catches; `hitTestAtDevicePoint` converts CSS-pixel tolerance through the camera zoom. `packages/diagram-canvas/src/scene.ts` defines `SceneNode` / `ScenePort` / `SceneEdge` items with world `rect` / `bounds` and the occurrence → entity reference. `packages/diagram-core` holds the semantic document with no geometry (`packages/diagram-core/src/document.ts`: geometry lives in a view).
- Consequence for §8: a diagram host already can turn a pointer position into a shape and its bounds host-side. The DS context menu needs only the resulting **bounds rectangle and item list**; it must not import `diagram-canvas` / `diagram-core`, run a hit test, or mutate a scene. Both diagram packages are `private: true` (`measured` in their manifests and in `packages/diagram-canvas/src/index.ts`), so a published DS component cannot depend on them in any case.

### 2.7 FE-2 paragraph identity and Tiptap constraints (`fe2-spec`)

- FE-2 (`git show feat/rich-text-core:spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md`) defines the reusable controlled Tiptap editor. Its identity contract (§5.2 of that specification): the identity is the ProseMirror node attribute `paragraphId` on `paragraph` and `preservedBlock` nodes, rendered to the DOM as `data-paragraph-id` (and `data-preserved-block` on preserved blocks); a single opaque string, unique within the document, allocated by the host; the component never parses, derives, sorts by or displays it as content. Split keeps the leading paragraph's identity and allocates a fresh one for the tail; paste strips any incoming `data-paragraph-id` and allocates fresh identities.
- FE-2 forbids leaking ProseMirror positions or Tiptap JSON into the wire contract, forbids the DS computing a per-paragraph diff, and requires every label from injected `messages` with the `untranslated` marker `⟦untranslated:rich-text.<key>⟧` plus `data-untranslated` (§5.7 of that specification). §11 adopts the same marker discipline under its own key namespace.
- Consequence for §9: when the picked block is a paragraph of a `RichTextEditor` (FE-2), its identity is already in the DOM as `data-paragraph-id`. The picker reads that attribute and returns it; it allocates nothing and writes nothing into the ProseMirror view.

### 2.8 Framework packages (`measured`)

- `packages/components-svelte` (`@sentropic/design-system-svelte` 0.36.0), `packages/components-react` (`@sentropic/design-system-react` 0.38.0), `packages/components-vue` (`@sentropic/design-system-vue` 0.38.0), `packages/components-angular` (`@sentropic/design-system-angular` 0.38.0). React re-exports `Icon` / `IconButton` from a `catalog` module (`packages/components-react/src/Icon.tsx`, `IconButton.tsx`); the icon catalogue therefore has a per-framework counterpart to extend, not a single shared file.
- DS practice visible in FE-2 and in the package layout: Svelte is delivered first; other frameworks follow as adapters behind their own stage gates, and an adapter whose gate has not passed is reported as not delivered, never listed as available. §10 follows that practice.

## 3. Decisions

One decision per item required by the commission. Each carries its source tag; a proposition part inside a decision is tagged separately. `CA-Dn` ids are used by the lots in §14.

### CA-D1 — Reuse first; new components only where no existing block covers the need — `ds-proposition` (needs: `owner-brief` 1–4)

§4 states, per need, whether the answer is an existing component, an additive extension (new prop or variant), or a new component. Extension is preferred over a new component wherever the existing contract can carry the need without changing its meaning. Five components are new: three functional blocks — `CommentListItem` (§7), `AnnotateContextMenu` (§8) and `ElementPicker` (§9), each because the measured gap is a missing contract (editable comment item; rectangle-anchored menu; picking mode), not a missing style — and two compositions of existing primitives, `LabelledIconButton` (§5.2) and `SplitIconButton` (§5.3), which add no new menu, popover or button behaviour. The eight icon names are an additive extension, not a component (§5.1). §4 and §14 use this same count.

### CA-D2 — Eight additive DS icon names mapped to lucide glyphs — `owner-brief` need 2 (names and glyph mapping: `ds-proposition`)

`packages/components-svelte/src/lib/icons.ts` gains eight entries in `GLYPHS` (§5.1). Existing names never change meaning; `IconName`, `ICONS` and `ICON_NAMES` extend by derivation. The same eight DS names are added to the React, Vue and Angular icon catalogues at their parity stage (§10), under the identical DS names.

### CA-D3 — The labelled icon button is `IconButton` + `Tooltip` with the accessible name equal to the label — `ds-proposition`

A named composition (§5.2) wraps `IconButton` in `Tooltip` so the label appears on hover and on focus, and the button's `aria-label` is exactly that label. No icon-only control ships without it in the comment / annotate surface.

### CA-D4 — The split icon button composes existing primitives; it is one new component — `owner-brief` need 2 (screenshot shape: `source-gap` for pixels)

`SplitIconButton` (§5.3) composes a primary labelled `IconButton`, `MenuTriggerButton` (chevron), `MenuPopover` + `Menu` (or `Popper` + `Menu` where the measured primitive requires it). It adds no new menu, popover or button behaviour; it fixes the split layout over tooltip-wrapped targets, the shared disabled state and the focus contract in one place. The focus contract is the composition's own: no measured primitive returns focus on close (§2.3), so `SplitIconButton` captures, moves and restores focus itself (§5.3).

### CA-D5 — `CommentListItem` is a new component built from measured primitives — `ds-proposition`

No existing list item carries read/edit modes with kind badge, anchor link, author/time slots and icon actions (§2.4). `CommentListItem` (§7) is new and composes `Badge`, `Textarea`, `Avatar` (host may substitute its own author rendering in the slot) and the §5.2 labelled icon buttons. Its `anchor` prop is the opaque value of §0.3.

### CA-D6 — The context menu reuses the `Menu` list and gains rectangle anchoring — `ds-proposition`

`AnnotateContextMenu` (§8) renders the existing `Menu` item model inside a positioned panel anchored to a host-supplied rectangle or point — never to a DS-owned document or diagram target. Items come from the host; selection is reported by value; the DS mutates nothing. Positioning adds the complete viewport bounding that `computePosition` alone does not provide, and focus capture/move/return is the component's own responsibility (§8.4); the panel renders only under the theme-conservation rule (§12).

### CA-D7 — The element picker is a host-toggled overlay mode that returns a descriptor and mutates no content DOM — `ds-proposition` (FE-2 identity rule: `fe2-spec`)

`ElementPicker` (§9) draws its highlight in an overlay outside the content DOM (under the theme-conservation rule, §12), resolves the nearest eligible block through a host predicate or selector, and on pick returns `{ element, bounds, identity }`. Inside a ProseMirror view it performs zero DOM writes: no class, attribute, style or node is added to editor content. The pick gesture is intercepted at its initial phase (`pointerdown`, §9.5), its remaining activation is consumed, and the pick is delivered only after that consumption, so a Tiptap selection and caret survive it and an immediate host teardown inside `onPick` exposes nothing; the keyboard/screen-reader equivalent works from a trigger outside `root`, with every candidate announced from a host-supplied description (§9.5) — both from 0.37.0.

### CA-D8 — Svelte first; React, Vue and Angular parity is staged and gated — `ds-proposition` (practice: §2.8)

The 0.37.0 target ships Svelte. React, Vue and Angular follow in staged parity lots (§10, §14) and are not claimed as delivered before their gates pass.

### CA-D9 — Every label is injected; the DS ships no natural-language catalogue — `ds-proposition` (marker discipline: `fe2-spec`)

All user-visible and accessibility strings for the new blocks come from a host-supplied `messages` object (§11), under the key namespace `comment-annotate.*`, with the FE-2 marker form for a missing key. Component sources contain no hard-coded language for these strings.

### CA-D10 — Component tokens only, each with a fallback; Airbus renders from its factory-produced tokens where they exist — `measured` (§2.5)

New styling reads `--st-component-<name>-*` tokens with semantic or literal fallbacks (§12). `packages/theme-airbus` needs no change for the blocks to render under Airbus: its `createComponent` factory already produces the `menu`/`tooltip` (and related) tokens the blocks reuse, and the new token names resolve from their fallbacks, exactly as under the base theme (§12). An Airbus-specific override for the new names is an additive follow-up in that package, never a precondition. Every portalled overlay keeps the active theme's scope (§12).

## 4. Reuse versus new

| Need (`owner-brief`) | Verdict | DS block | Basis (`measured` §2) |
| --- | --- | --- | --- |
| 1. Right side panel | Existing component, no change | `UtilityPanel` with `side="right"` (shell); `ContextPanel` inside it when a titled header/footer is wanted; `PanelStack`/`PanelSection` only if sections are later required | `UtilityPanel.svelte` already carries `side`, `mode`, `collapsed`; `ContextPanel.svelte` already carries title/actions/footer and a scrollable body |
| 1. Comment list items (editable, kind badge, anchor link) | **New component** | `CommentListItem` (§7), composing `Badge`, `Textarea` and §5.2 buttons | No existing list item carries these modes or slots (§2.4) |
| 2. Eight action icons | Additive extension | Eight new `IconName` entries in `icons.ts` (§5.1) | `icons.ts` is explicitly additive; lucide source already a dependency (`@lucide/svelte`) |
| 2. Icon button with hover/focus label | Additive composition (new small component, no change to `IconButton` or `Tooltip`) | `LabelledIconButton` (§5.2): `Tooltip` wrapping `IconButton`, `aria-label` = label | `IconButton` has no label surface; `Tooltip` already shows on hover and `:focus-within` (§2.2) |
| 2. Split icon button (icon + adjacent chevron dropdown) | **New component** composing existing primitives | `SplitIconButton` (§5.3): attached split layout over the tooltip-wrapped primary `LabelledIconButton` and the tooltip-wrapped `MenuTriggerButton` chevron + `MenuPopover`/`Popper` + `Menu` | The split layout over wrapped buttons, shared disabled state and two-target focus contract exist nowhere as one block; `ButtonGroup attached` alone cannot style wrapped targets (§2.2, §2.3, §5.3) |
| 3. Context menu on a text selection | **New anchoring component**, existing list | `AnnotateContextMenu` (§8): `Menu` list in a positioned panel anchored to a host-supplied rect, rendered under the theme-conservation rule (§12) | Every existing menu anchors to a trigger element; none anchors to a rect/point (§2.3) |
| 3. Context menu on a diagram shape | Same component, same contract | `AnnotateContextMenu` with host-supplied shape bounds | The host resolves the shape via `diagram-canvas` hit testing (§2.6); the DS receives only bounds + items |
| 4. Element picker (hover highlight, click picks) | **New component** | `ElementPicker` (§9): overlay highlight under the theme-conservation rule (§12), host predicate/selector, pick descriptor | No picking mode, overlay highlight or pick descriptor exists in the DS (§2.3, §2.4) |
| Kind badge | Existing component, no change | `Badge` (`tone`, `size="sm"` where dense) | Tones and sizes already cover a kind label (§2.4); the tone is host-supplied per item and the DS maps no kind to a tone (§0.3) |
| Edit field inside a list item | Existing component, no change | `Textarea` | Bindable value, label/helper/error and field tokens already exist (§2.4) |
| Author avatar (optional) | Existing component, host may substitute | `Avatar` in the author slot | The slot (§7) accepts any host rendering; `Avatar.svelte` is the DS default |

Reading rule: "existing component, no change" means the lot adds no prop and no variant to that component. "Additive extension" means existing consumers render byte-identically when the new prop/name is unused — the same additive discipline `Badge.svelte` documents for its `shape`/`size` props and `icons.ts` documents for its name map.

## 5. Icons, the labelled icon button and the split icon button

### 5.1 The eight DS icon names (`CA-D2`)

Additive change to `packages/components-svelte/src/lib/icons.ts`: import the lucide glyphs and extend `GLYPHS`. DS names are lower-case, hyphenated where needed, and name the **action or object the owner listed**, so call sites read in the owner's vocabulary. The glyph column is the lucide component the DS name maps to at implementation; substituting an equivalent lucide glyph later is a visual change that keeps the DS name stable (the `icons.ts` header already guarantees this indirection).

| DS name (`IconName`) | Owner term | Lucide glyph | Used by |
| --- | --- | --- | --- |
| `save` | save | `Save` | `CommentListItem` save action; host save controls |
| `delete` | delete | `Trash2` | `CommentListItem` delete action (with `variant="danger"` on the button) |
| `cancel` | cancel | `CircleX` | `CommentListItem` cancel action. Distinct from the existing `close` (`X`): `close` dismisses a surface, `cancel` abandons an edit; both stay available and neither is renamed |
| `annotate` | annotate | `MessageSquarePlus` | Annotate entry points; split-button primary action where the host chooses it |
| `circle` | circle | `Circle` | Diagram annotation geometry choice (host menu item icon) |
| `rectangle` | rectangle | `RectangleHorizontal` | Diagram annotation geometry choice (host menu item icon) |
| `note` | note | `StickyNote` | Note annotation choice (host menu item icon) |
| `comment` | comment | `MessageSquare` | Comment entry points; panel affordances |

Rules:

- The change is purely additive: no existing key is renamed, removed or remapped. `ICON_NAMES` grows from 8 to 16 entries.
- Menu items address their glyph by DS name through an additive extension of the item type, because the existing `MenuItem.icon` field cannot do it (§2.3). The extension (CA-L1) widens the action-item icon in `Menu.svelte` — and, with the same shape over its own `OverflowMenuIcon` type, in `OverflowMenu.svelte` — to `icon?: MenuIcon | { name: IconName }` (respectively `OverflowMenuIcon | { name: IconName }`): when the value is an object carrying `name`, the renderer mounts the DS `Icon` with that name at the size/stroke it already passes (`size={16} strokeWidth={2}`); hosts write `icon: { name: "circle" }` and the item renders the `circle` glyph, never the text `"circle"`. The existing values keep their measured meaning for current consumers: a string icon still renders as text and a directly passed component still mounts as before — both behaviours are pinned by witness so the extension cannot silently change them. Hosts in the comment / annotate surface MUST use the `{ name }` form; passing a lucide component directly is not the DS path (§2.2 indirection).
- Sizes follow `Icon.svelte` defaults (18 px, stroke 2.25) unless a host sets `size`/`strokeWidth`. No icon carries its own colour; colour comes from the button or menu token context.

### 5.2 `LabelledIconButton`: icon button with a hover/focus label (`CA-D3`)

New small component `packages/components-svelte/src/lib/LabelledIconButton.svelte`. It composes, and does not modify, `Tooltip.svelte` and `IconButton.svelte`.

```ts
type LabelledIconButtonProps = {
  /** Hover/focus label AND accessible name. The two are the same string by contract. */
  label: string;
  /** DS icon rendered inside the button. */
  icon: IconName;
  size?: "sm" | "md" | "lg";        // forwarded to IconButton, default "sm" in dense item contexts
  variant?: "ghost" | "secondary" | "danger"; // forwarded to IconButton
  disabled?: boolean;
  tooltipPlacement?: "top" | "bottom";        // forwarded to Tooltip
  onclick?: (event: MouseEvent) => void;
  class?: string;
};
```

Contract:

- The accessible name equals the label: the component sets `IconButton`'s required `aria-label` to `label`, and `Tooltip`'s `content` to the same `label`. There is no separate `ariaLabel` prop; a host that needs a longer accessible description uses `aria-describedby` on the underlying button through a future additive prop, never a divergent name.
- The label shows on hover and on keyboard focus (`Tooltip` already keys on `:hover` and `:focus-within`, `measured`). Focus visibility keeps `IconButton`'s `:focus-visible` ring; the tooltip never replaces the focus indicator.
- The glyph is decorative inside the button (`Icon` without `title`, hence `aria-hidden`): the button name carries the meaning, the glyph never duplicates it for assistive technology.
- `disabled` forwards to the button. Its tooltip behaviour follows the measured primitives, not an assumption about disabled controls: `Tooltip.svelte` reveals its content on the wrapper's unconditional `:hover` (`.st-tooltip:hover .st-tooltip__content`, `Tooltip.svelte:62-65`, `measured`), and neither that stylesheet nor `IconButton.svelte` (whose `:disabled` rule sets colour and cursor only, `measured`) suppresses the wrapper hover for a disabled child — so **hovering a disabled button does show its tooltip**. What `disabled` removes is focusability: a disabled button cannot receive keyboard focus, so the `:focus-within` reveal cannot be reached by keyboard for that button. That keyboard gap is the stated limitation; the hover behaviour is not one, and hosts may rely on the hover tooltip of a disabled action without wrapping it in a toggletip of their own. §14 includes disabled-button hover in the browser witness.
- The component renders exactly one `<button>`. It adds no text node visible beside the icon: the "instead of text buttons" requirement (`owner-brief` need 2) is met by keeping the label in the tooltip/accessibility layer only.

### 5.3 `SplitIconButton`: primary action plus chevron menu (`CA-D4`)

New component `packages/components-svelte/src/lib/SplitIconButton.svelte`, implementing the owner screenshot shape: a primary icon button with an adjacent chevron dropdown, rendered as one attached group.

```ts
type SplitIconButtonProps = {
  /** Primary action label (tooltip + accessible name, via LabelledIconButton). */
  label: string;
  icon: IconName;
  /** Menu trigger accessible name, e.g. the host's "more options" label (§11). */
  menuLabel: string;
  /** Optional accessible name of the attached group (`role="group"`, §5.3). */
  groupLabel?: string;
  items: MenuItem[];                 // Menu.svelte item model, host-supplied
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "secondary" | "danger";
  disabled?: boolean;                // disables BOTH targets
  menuDisabled?: boolean;            // disables only the chevron target
  menuPlacement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  onPrimary?: (event: MouseEvent) => void;
  onSelect?: (value: string) => void; // Menu onselect value, host-interpreted
  class?: string;
};
```

Composition and contract:

- Layout — a structure compatible with wrapped buttons. `ButtonGroup attached` is **not** used as the layout parent: its corner and hairline rules target its direct children (`> *`, `measured` in `ButtonGroup.svelte`), and here the direct children would be `Tooltip` wrapper spans (the primary through `LabelledIconButton`, the chevron through its own `Tooltip`), so those rules would never reach the inner `<button>` elements. `SplitIconButton` therefore renders its own attached group: a `role="group"` container (`aria-label` from the host-supplied `groupLabel` where the pair needs one) whose two flex children are the two `Tooltip` wrappers, and the component's own CSS produces the segmented look on the buttons inside them — the second wrapper collapses onto the first with a −1 px inline margin, the primary button's end corners and the chevron button's start corners are squared, only the outer corners keep the `IconButton` radius token, the shared edge reads `--st-component-splitIconButton-divider`, and the hovered/focused wrapper is raised so its button's full border shows. The two targets stay separately focusable and separately named.
- Both targets carry a tooltip, with no exception: the primary through `LabelledIconButton` (tooltip text = accessible name = `label`) and the chevron wrapped in `Tooltip` with `content = menuLabel`, while `MenuTriggerButton` also receives `menuLabel` as its `aria-label`. Hovering or focusing either target shows its label; §14 verifies both targets in a browser, because CSS `:hover` tooltip behaviour is not a jsdom assertion.
- Menu: `MenuPopover` (trigger = the chevron element) containing `Menu` with `dismissOnSelect`, staying in place under the theme-conservation rule (§12). Where `MenuPopover`'s trigger-element anchoring is insufficient the implementation uses `Popper` with the same flip/shift behaviour; the choice between the two measured primitives is an implementation detail of the lot, fixed by whichever passes the §14 witnesses without changing this public contract.
- Focus is the composition's own responsibility; it is inherited from no primitive (§2.3: `MenuPopover` orchestrates no focus, `Popper` captures/restores only under `trapFocus`, `OverflowMenu.close()` restores nothing). `SplitIconButton` therefore: captures the chevron element as the return target before opening; on open, moves focus to the first enabled menu item once the panel is mounted; and keeps `Menu`'s roving-tabindex arrow/Home/End navigation and Enter/Space selection. Close paths then split by kind. **Non-selection closes** — `Escape` and outside pointer-down — return focus to the chevron, unconditionally. **Selection close is a focus handoff, not a plain return:** the reused `Menu.svelte` calls its `onselect` **before** clearing `open` (`selectItem`, `Menu.svelte:89-93`, `measured`), so the composition must not wire `Menu`'s `onselect` straight to the host. Its internal selection handler first closes the menu and restores focus to the chevron, and only then delivers `onSelect(value)` to the host. A host action that opens another surface and focuses it — an annotate/edit action focusing a textarea, a dialog focusing its first field — therefore runs after restoration and its focus stands; a host action that focuses nothing leaves focus on the chevron. No restoration may run after host delivery. `Escape` keeps its explicit restoration in all cases. The trigger carries `aria-haspopup="menu"`, `aria-expanded` and `aria-controls` naming the menu, and the list carries `role="menu"` with `aria-label = menuLabel`. §14 asserts this on the real composition — opening it, the first active item, Escape, close and focus return, and the selection handoff into a host-opened editor — not on a keyboard helper alone.
- The primary action never opens the menu; the chevron never fires the primary action. `disabled` disables both targets; `menuDisabled` disables only the chevron.
- No item, label or value is built in. In the annotate UX the host typically sets the primary to `annotate` (create with the last-used geometry) and the menu items to `circle` / `rectangle` / `note` / `comment` entries addressed by DS name (`icon: { name: "circle" }`, §5.1) — that mapping is a host choice shown here as an example, never a DS default.

## 6. Right side panel composition (need 1, shell)

No new panel component. The comment surface is composed as:

```svelte
<UtilityPanel side="right" mode="reserve" title={messages.panelTitle} label={messages.panelLabel}>
  <ContextPanel title={messages.listTitle} actions={panelActions}>
    <!-- one CommentListItem per host-supplied comment, host-ordered -->
  </ContextPanel>
</UtilityPanel>
```

- `UtilityPanel` (`side="right"`) is the shell the brief asks to reuse ("Reuse the existing side-panel component"). `mode` (`reserve` / `overlay` / `floating`) and `collapsed` stay host choices; the DS prescribes none of them.
- `ContextPanel` supplies the titled header, the actions slot (for example a `SplitIconButton` for "annotate" plus an overflow for panel-level actions) and the single scrollable body. The list scrolls inside `ContextPanel`'s body (`measured`: `overflow: auto`); `CommentListItem` never owns page scroll.
- If a host later needs a details section under the list, `PanelStack`/`PanelSection` (max 4 sections, single scroll owner, `measured`) is the prescribed composition — noted here so a host does not invent a second accordion. It is not part of the 0.37.0 lots.
- The panel is a landmark (`<aside>` with `aria-label` from `label ?? title`, `measured` in both panel components). The host supplies the accessible panel name through injected messages (§11); the DS default strings inside the existing panel components ("Context panel" / "Utility panel") are pre-existing DS strings outside this specification's new-string rule and are always overridden by the host in this UX.

## 7. `CommentListItem` (need 1, item)

New component `packages/components-svelte/src/lib/CommentListItem.svelte` (`CA-D5`). It is a controlled rendering of one comment as the host presents it; it owns only local edit-draft state while editing. It is **not** an extension of `StructuredList` or `SelectableList`: those contracts (definition rows; listbox selection) would be broken by edit modes and per-item actions, so a purpose-built item composing their neighbouring primitives is the smaller change (§4).

### 7.1 Props and slots

```ts
type CommentListItemProps<Anchor = unknown> = {
  /** Opaque anchor value (§0.3, §13). Never inspected; passed back in callbacks.
      `Anchor` is the single shared parameter of this contract: every callback
      detail below is typed from it, so specialising it specialises them all.
      The prop is optional, and that optionality is carried through every
      callback payload as `Anchor | undefined`: a consumer that omits the
      prop receives `undefined` there, and a consumer that specialises
      `Anchor` (for example to `{ id: string }`) must narrow before use.
      There is no payload typed as bare `Anchor` while the prop may be
      absent — under the repository's strict TypeScript configuration
      (`tsconfig.base.json`: `strict: true`) forwarding the prop unchanged
      must type-check, and a bare-`Anchor` payload would not (TS2322). */
  anchor?: Anchor;
  /** Host-supplied anchor link text. Rendered only when `onAnchorActivate` is set. */
  anchorLabel?: string;
  /** Host-supplied kind token (opaque to the DS) and its badge text. */
  kind: string;
  kindLabel: string;
  /** Badge tone for the kind. Host-supplied per item; the DS maps no kind to a tone (§0.3). */
  kindTone?: "neutral" | "success" | "warning" | "error" | "info";
  /** Comment body text in read mode. Plain text; no HTML is rendered. */
  body: string;
  /** The single source of truth for the mode (§7.3). Controlled when supplied,
      uncontrolled (internal state, initial "read") when omitted. There is no
      second flag: no `editing` alias exists, so the two can never contradict. */
  mode?: "read" | "edit";
  /** Draft text for edit mode. Bindable in the Svelte sense; see §7.3. */
  draft?: string;
  disabled?: boolean;
  messages: CommentAnnotateMessages; // §11 — field/save/cancel/delete/edit labels etc.
  onSave?: (detail: { anchor: Anchor | undefined; draft: string }) => void;
  onCancelEdit?: (detail: { anchor: Anchor | undefined }) => void;
  onDelete?: (detail: { anchor: Anchor | undefined }) => void;
  onStartEdit?: (detail: { anchor: Anchor | undefined }) => void;
  /** Host callback for the anchor link. The DS navigates nowhere itself. */
  onAnchorActivate?: (detail: { anchor: Anchor | undefined }) => void;
  class?: string;
  // Slots (Svelte snippets):
  author?: Snippet;   // host rendering, e.g. Avatar + name. DS default: none.
  time?: Snippet;     // host rendering, e.g. a <time> element. DS default: none.
  actions?: Snippet;  // host extra actions, appended after the DS actions (§7.1).
};
```

Anchor optionality rule: the item serves both an **anchored** consumer (always supplies `anchor`, typically with a specialised `Anchor`) and an **unanchored** consumer (omits the prop, for example a general comment with no target). Both compile against the single shared parameter above: every callback receives `Anchor | undefined`, the anchored consumer narrows once (`if (detail.anchor) …` or an equivalent check) before reading model fields, and the unanchored consumer can ignore the field entirely. No second prop, overload or per-callback generic exists for this distinction. §14 (CA-L4) pins both consumers with compile-time witnesses under the strict configuration.

Slot rules:

- `author` and `time` are **slots, not strings**: the DS prescribes no author model, no date format and no relative-time wording. The host renders name, avatar (`Avatar.svelte` is available) and timestamp; the DS only places them in the header row. When a slot is absent the header collapses to the kind badge and anchor row without empty placeholders.
- `actions` is append-only: it adds host controls **after** the DS actions and never replaces them. The DS actions of a mode (§7.2, §7.3) render exactly when their callbacks are supplied, whether or not the slot is present; a host removes a DS action only by omitting its callback, never through the slot. Host controls placed there follow §5.2 if they are icon-only; the DS cannot enforce that inside a slot and states it as a host obligation.

### 7.2 Read mode

- Header row: `author` slot, `time` slot, then the kind badge: `Badge` with `tone={kindTone ?? "neutral"}` and text `kindLabel`. `kind` itself is never displayed and appears in no callback payload (callbacks carry `anchor`, §7.1): it is the host's opaque token, interpreted only by the host that supplied it, so two hosts may use different kind vocabularies over the same component.
- Anchor row (only when `anchorLabel` and `onAnchorActivate` are both present): the anchor link. It is rendered as a `<button type="button">` styled as a link (the DS has no anchor-navigation component for an in-page jump, and a real `<a href>` would require a URL the DS must not invent). Activation (click, Enter, Space — native button behaviour) calls `onAnchorActivate({ anchor })` with the opaque value unchanged. The host scrolls, highlights or selects the target; the DS moves no focus and changes no selection. The link's accessible name is `anchorLabel`; its visible text is the same string, truncated visually with ellipsis under panel width while the full string remains the DOM text and the accessible name — the DS adds no tooltip of its own here.
- Body: `body` as plain text with preserved line breaks (`white-space: pre-wrap`). No HTML, Markdown or linkification is performed.
- Actions row (read mode): the edit action renders exactly when `onStartEdit` is supplied, as a `LabelledIconButton` (icon `annotate`, label `messages.editLabel`); activating it requests entry into edit mode under the §7.3 transition table. `onStartEdit` is an **outgoing notification** the host supplies: the component calls it, the host never enters edit mode by calling it, and invoking it from host code changes no component state. When `onStartEdit` is absent, no edit action renders; an external host surface (its own button, double-click or the §8 context menu) can then enter edit mode **only in controlled mode**, by setting `mode="edit"` (§7.3). In uncontrolled mode with no `onStartEdit` there is no entry path, by design. There is exactly one rule and no slot interaction: the append-only `actions` slot (§7.1) never suppresses this button.
- Delete in read mode: rendered only when `onDelete` is set, as `LabelledIconButton` icon `delete`, `variant="danger"`, label `messages.deleteLabel`. Activation calls `onDelete({ anchor })` immediately. The DS shows **no confirmation dialog** (Q1, §15): whether deletion needs confirmation, and what it says, is a host decision at the composition site (the dossier binding over the sentropic data model); the DS neither deletes data nor pretends to confirm it.

### 7.3 Edit mode

`mode` is the only mode state. It is **controlled** when the host supplies it and **uncontrolled** when it is omitted (internal state, initial `"read"`); both forms run the same transition table over that single state, so they can never diverge into two state machines. The table is normative — every entry, save and cancel path follows exactly one row:

| Current mode | Gesture | Controlled (`mode` supplied) | Uncontrolled (`mode` omitted) |
| --- | --- | --- | --- |
| read | Built-in edit action (§7.2; rendered only when `onStartEdit` is supplied) | The component calls `onStartEdit({ anchor })` as a notification; the item stays in read mode until the host sets `mode="edit"` | The component calls `onStartEdit({ anchor })` as a notification **and** switches its internal mode to `edit`. The switch is the component's own click handling, not an effect of the host receiving or invoking the callback |
| read | External host trigger (host button, double-click, §8 context-menu selection) | The host sets `mode="edit"`; that prop change is the entry. Listening to `onStartEdit` for bookkeeping is allowed, but no callback invocation enters edit mode | **No external entry input exists.** The host cannot switch the internal mode from outside, and invoking its own `onStartEdit` callback changes nothing. A host that needs external entry uses controlled mode |
| edit | Typing | Updates the draft only (live through the bindable `draft` when the host binds it) | Same |
| edit | Save action or `Ctrl+Enter` / `Cmd+Enter` (outside IME composition, §7.4) | Calls `onSave({ anchor, draft })`; the item **stays in edit mode** until the host sets `mode="read"` with the new `body` (the host confirms persistence first — persistence is sentropic's, §0.2) | Calls `onSave({ anchor, draft })` and switches its internal mode to `read`; the read body still shows the `body` prop until the host updates it |
| edit | Cancel action or `Escape` (§7.4, outside IME composition) | Calls `onCancelEdit({ anchor })`; the item stays in edit mode until the host sets `mode="read"` | Calls `onCancelEdit({ anchor })`, switches to `read` and discards the draft |
| any | Host sets `mode` (controlled) | The item follows the prop; entering `edit` re-seeds the draft per the next bullet | — (no prop to follow) |

No imperative entry method (`focus()`, `startEdit()`, a ref API or a synthetic event) is part of this contract in any framework port: controlled `mode` is the sole external entry input, and the built-in edit action is the sole uncontrolled entry. A future imperative entry would be a separate additive decision, not an implication of `onStartEdit`.

- `disabled` disables every DS control of the item: the anchor button, the edit/save/cancel/delete actions, and the edit field (rendered disabled). Host controls in the `actions` slot stay the host's responsibility.
- Entering edit mode replaces the body with `Textarea` bound to the draft. The initial draft is `draft ?? body`, re-seeded on each entry. The field's accessible name is `messages.editFieldLabel` (§11), passed to `Textarea` as its `label` so the rendered `<label>` names the textbox; no edit field renders without that name (§14 asserts the textbox by this name). The textarea receives focus on entry and its content is selected only if the host requests it through a future additive prop; 0.37.0 places the caret at the end, the least surprising position for appending a correction.
- Edit actions replace the read actions: save (`LabelledIconButton` icon `save`, label `messages.saveLabel`) and cancel (icon `cancel`, label `messages.cancelLabel`), plus delete (icon `delete`, `variant="danger"`, label `messages.deleteLabel`) when `onDelete` is set. All three are §5.2 buttons: tooltip on hover/focus, accessible name equal to the label, no visible text. The append-only `actions` slot (§7.1) still renders after them.
- Cancel discards the draft: no callback carries the discarded text, and the next entry re-seeds from `body` (a host that bound `draft` observes the reset through the binding).
- Empty-draft rule: save with a draft that is empty or whitespace-only is **disabled** (save button disabled) rather than an error, unless the host overrides it through a future additive `allowEmptySave` prop. Deletion, not an empty save, is the way to remove a comment. The DS shows no validation message for this case.
- The DS persists nothing, debounces nothing and autosaves nothing. Every keystroke updates only the local draft binding; the host sees the text at save time (and live through the bindable `draft` if it binds it).

### 7.4 Keyboard and focus behaviour

- Tab order inside the panel is DOM order: anchor link (read mode) → edit/delete actions → next item. In edit mode: textarea → save → cancel → delete. No roving tabindex is introduced; a long comment list stays reachable item by item, matching the panel's scroll-owner design (§6).
- `Escape` in edit mode requests the cancel transition of the §7.3 table (same as the cancel button) when the event target is the textarea or an edit action — **outside IME composition only** (next bullet). On entering edit mode the item records `document.activeElement` before moving focus to the textarea; that recorded element is the return target. When the item actually leaves edit mode — immediately in uncontrolled use, or when the host answers with `mode="read"` in controlled use — focus returns to that recorded element if it is still mounted (else the item's anchor link, else the item root made focusable only for this restore). `Escape` in read mode does nothing in the item; panel-level Escape handling stays with the host/panel.
- `Ctrl+Enter` (and `Cmd+Enter` on macOS platforms, detected via `metaKey`) in the textarea saves, matching the save button — **outside IME composition only** (next bullet). Plain `Enter` inserts a line break; the DS never repurposes it.
- **IME composition guard (normative):** while an IME composition is active in the edit textarea, neither shortcut fires. An event whose `isComposing` is `true` — or that arrives between the textarea's `compositionstart` and `compositionend` where the item tracks that session as a fallback for environments whose key events under-report `isComposing` — is left entirely to the IME: the item does not call `preventDefault()`, does not call `onSave` or `onCancelEdit`, does not discard the draft and does not leave edit mode. In particular an `Escape` that dismisses a composition candidate is the IME's key, never the item's cancel. `Textarea.svelte` supplies no such guard (`measured`: no composition handling in that file), so `CommentListItem` owns the guard in its own keydown handling around the textarea — the same distinction the repository already draws in `ChatComposer.svelte:109`, which returns early on `event.isComposing` before submitting (`measured`). The first non-composing `Escape` or `Ctrl+Enter` / `Cmd+Enter` after `compositionend` behaves as the bullets above. §14 witnesses composition keys invoking no callback and losing no draft text.
- Focus is never trapped. Leaving the item by Tab while editing keeps the draft (no auto-cancel, no auto-save); the host is notified only through the bindings it holds.
- When an item is removed by the host after delete, focus management is the host's list responsibility; the DS obligation is limited to not holding focus in a detached node: the item removes its listeners on destroy and never calls `focus()` after unmount.

### 7.5 What the item never does

It never renders `anchor` (no `JSON.stringify`, no attribute, no `data-*` echo), never derives `kindLabel` from `kind`, never formats `time`, never sorts or filters a list (there is no list component in this specification; the host maps its comments to items), and never disables the anchor link based on anchor content — a host that knows an anchor no longer resolves disables the link itself by omitting `onAnchorActivate` or by its own disabled handling (Q2 covers the unresolved-anchor presentation if the owner wants a DS state for it).

## 8. Context menu (need 3)

New component `packages/components-svelte/src/lib/AnnotateContextMenu.svelte`. One component serves both targets in the brief — a text selection and a diagram shape — because at the DS boundary both are the same thing: **a rectangle on screen plus a host-supplied item list**. The DS never learns which kind of target produced the rectangle.

### 8.1 Props

```ts
type AnnotateContextMenuProps = {
  open: boolean;                              // controlled; host opens/closes
  /** Viewport rectangle to anchor to: a selection rect or shape bounds.
      DOMRectReadOnly or the plain shape below; coordinates are client coords. */
  anchorRect: { top: number; left: number; right: number; bottom: number;
                width: number; height: number } | null;
  /** Alternative anchor: a point (pointer position). Converted to a 0×0 rect. */
  anchorPoint?: { x: number; y: number } | null;
  items: MenuItem[];                          // Menu.svelte model, host-supplied
  label: string;                              // menu accessible name (§11)
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  onSelect?: (value: string) => void;         // host interprets the value
  onClose?: () => void;                       // DS requests close; host sets open=false
  class?: string;
};
```

Exactly one of `anchorRect` / `anchorPoint` is supplied per opening; `anchorRect` wins if both are set. The host typically builds `anchorRect` from `Selection.getRangeAt(0).getBoundingClientRect()` (union of `getClientRects()` for a multi-line selection — host choice) or from a diagram shape's device-space bounds (host converts world bounds through its camera, §2.6; the DS receives client coordinates only).

### 8.2 Opening

- The DS does not attach `contextmenu` listeners to host content. The **host** listens (on its text container or diagram surface), calls `preventDefault()` where it wants to replace the native menu, computes the rectangle, sets `items`, and sets `open = true`. This keeps the DS out of the host's event policy: which elements offer the menu, and whether the native menu is suppressed, are host decisions.
- Keyboard opening is likewise host-initiated with a DS-defined contract: when the host's target has keyboard focus, `Shift+F10` or the `ContextMenu` key opens the menu with `anchorRect` set to the target's bounds (a focused shape's bounds, or the current selection rectangle; for a collapsed caret the host supplies the caret rectangle or the focused element's bounds). The lot ships a small exported helper, `isContextMenuKey(event: KeyboardEvent): boolean`, so every host implements the same key test (`event.key === "F10" && event.shiftKey || event.key === "ContextMenu"`) instead of copying it. The helper is pure and framework-free.
- On open, the component itself captures the element that had focus before opening, then moves focus to the first enabled menu item once the panel is mounted (§8.4). This orchestration is `AnnotateContextMenu`'s own: no measured primitive supplies it (`MenuPopover` moves no focus, `Popper` restores only under `trapFocus`, `OverflowMenu.close()` restores nothing; §2.3). §14 asserts it on the real opening path — a host target receiving Shift+F10 / the ContextMenu key, the menu opening, and the first item active — not on the `isContextMenuKey` helper alone.

### 8.3 Items and selection

Items use the existing `MenuItem` model (`Menu.svelte`, `measured`): action items with `label`, `value`, optional `disabled`, `danger` and `icon`, plus dividers and group labels. The annotate host typically supplies items such as comment / annotate / circle / rectangle / note with the §5.1 icons — again a host mapping, never a DS default list. Selection follows the focus-handoff order of §8.4: the component closes and restores focus to the captured element **before** delivering `onSelect(value)` (and requesting close through `onClose`), so delivery is never `Menu`'s raw `onselect` forwarded to the host. Disabled items are skipped by keyboard navigation (inherited roving-tabindex logic in `Menu.svelte`).

### 8.4 Closing, focus return, viewport collision

- Closing and focus return are the component's own, implemented in `AnnotateContextMenu` (they are inherited from no primitive, §2.3): before opening, the component captures `document.activeElement`; on open it moves focus to the first enabled menu item. Close paths then split by kind, as in §5.3. **Non-selection closes:** `Escape` requests close through `onClose`, and when `open` becomes false focus returns explicitly to the captured element (or to a host-supplied return target through a future additive prop; 0.37.0 uses the captured element, falling back to no focus call if it was removed); outside pointer-down closes without selecting, with the same return. **Selection close is a focus handoff:** because `Menu.svelte` delivers `onselect` before clearing `open` (`Menu.svelte:89-93`, `measured`), the component intercepts selection internally, requests close, restores focus to the captured element, and only then calls the host's `onSelect(value)`. An annotate/edit action that opens and focuses a textarea or a dialog therefore ends with focus inside that new surface; an action that focuses nothing ends with focus on the captured element. No focus restoration may run after `onSelect` delivery. The panel carries `role="menu"` with `aria-label = label`, its items keep `Menu`'s `role="menuitem"` rendering, and §14 asserts the whole sequence — open, first item active, navigation, Escape, close, focus back on the captured element, and the selection handoff into a host-opened editor or dialog — on the composed component.
- Viewport collision requires complete bounding, which the measured primitives do not provide on their own: `Popper.computePosition` flips sides and clamps only the cross axis, never the main axis, so a tall panel can still leave the viewport (a 480 px panel anchored at `bottom = 300` in a 600 px viewport would end at 788 px), and `MenuPopover`'s available-space `max-height` clamp (8 px margin, 160 px floor, `measured`) is internal to `MenuPopover` and is not transmitted to a `Popper` + `Menu` composition. `AnnotateContextMenu` therefore specifies its own sizing and bounding, reusing `computePosition` only as a starting point and never forking its flip arithmetic silently (§14, CA-L3): with an 8 px viewport margin on every side, (a) the side is chosen by flip first, and when neither side can hold the panel's full height the side with more available space wins; (b) the panel's `max-height` is then set to the space available on the chosen side — the 160 px floor where the viewport permits it, capped by the viewport height minus both margins, which wins when the viewport is smaller than the floor — with the item list scrolling internally, so the panel's far edge stays inside the viewport; (c) `top`/`left` are then clamped on **both** axes so the whole panel, at its bounded size, lies inside the margins whenever it fits, and a panel wider than the viewport is likewise width-clamped with internal horizontal containment rather than overflow. §14 witnesses this with long menus, including the 480 px / `bottom = 300` / 600 px case ending inside the viewport.
- Anchor tracking: `anchorRect` is a snapshot of client coordinates taken at opening; a frozen rectangle cannot follow its element. While the menu is open the **host** renews the coordinates — it recomputes the target's `getBoundingClientRect()` on scroll/resize (its own listeners, typically coalesced per animation frame) and passes a fresh `anchorRect`; the component repositions on every `anchorRect` change and additionally re-clamps on its own scroll/resize listeners using the latest rectangle it received. If a renewed rectangle lies entirely outside the viewport, the component requests close through `onClose` instead of leaving a detached panel clamped to an edge; a partially visible anchor keeps the menu open at the bounded position. §14 covers a scrolled anchor and an anchor scrolled fully off screen.

### 8.5 Non-mutation guarantee

Opening, navigating and selecting in the menu mutates no document and no diagram: the component writes only to its own overlay subtree, rendered under the theme-conservation rule (§12), reads `anchorRect` as values, and reports a `value` string. It never calls `Selection`, `Range`, `document.execCommand`, a ProseMirror view, or any diagram API. A host that maps "annotate" to creating an annotation does so in its `onSelect` handler, which the DS calls only after closure and focus restoration (§8.4); any surface that handler focuses is the final focus holder.

## 9. Element picker (need 4)

New component `packages/components-svelte/src/lib/ElementPicker.svelte`. A host-toggled picking mode over arbitrary host content: hovering highlights the nearest eligible block; a click picks it. The pattern is the "select element" mode the brief cites from Claude's tooling, specified here as a DS interaction with no tooling dependency.

### 9.1 Props and pick descriptor

```ts
type ElementPickerPick = {
  /** The picked element (live host DOM node). The DS keeps no copy. */
  element: HTMLElement;
  /** Bounding rectangle at pick time, client coordinates (DOMRect snapshot values). */
  bounds: { top: number; left: number; right: number; bottom: number;
            width: number; height: number };
  /** FE-2 paragraph identity when the element carries one (§9.4); else undefined. */
  identity?: string;
  /** Host-derived identity from the `identify` callback, when supplied. */
  hostIdentity?: unknown;
};

type ElementPickerProps = {
  active: boolean;                            // host toggles the mode
  /** Subtree the picker operates over. Defaults to document.body. */
  root?: HTMLElement | null;
  /** CSS selector for eligible blocks (see §9.2). */
  selector?: string;
  /** Predicate alternative; wins over `selector` when both are set. */
  isEligible?: (element: HTMLElement) => boolean;
  /** Optional host identity derivation, called once per pick. */
  identify?: (element: HTMLElement) => unknown;
  /** Host-supplied short description of a candidate block, read (never written)
      on every candidate change and announced for the keyboard/screen-reader
      path (§9.5). Present from 0.37.0; the host decides what names a block. */
  describe: (element: HTMLElement) => string;
  messages: CommentAnnotateMessages;          // §11 — picker instructions / announcements
  onPick?: (pick: ElementPickerPick) => void;
  onCancel?: () => void;
  onHoverChange?: (element: HTMLElement | null) => void; // optional host echo
  class?: string;
};
```

### 9.2 Eligibility and hover resolution

- An element is eligible when it matches `selector` (via `closest` semantics from the event target) or when `isEligible(element)` returns true for it or its nearest ancestor that satisfies the predicate. The host defines what a "block" is: for plain content a selector such as `p, li, h1, h2, h3, section, figure, [data-block]`; inside a `RichTextEditor` the FE-2 paragraphs (elements carrying `data-paragraph-id`, §9.4). The DS ships no default selector — a default would guess the host's document structure.
- Hover handling listens on `root` in the capture phase for `pointermove` (capture so host stop-propagation does not blind the picker) and resolves the nearest eligible ancestor of `event.target`. Moving within the same block does not re-trigger highlight work; moving to a new block moves the highlight; leaving `root` clears it.
- The highlight never selects text, never focuses the hovered block, and never calls `preventDefault` on hover. Scrolling while active repositions the highlight against the last hovered element (recomputed from `getBoundingClientRect()` on scroll/resize, the Popper listener pattern).

### 9.3 The overlay highlight (outside the content DOM)

- The highlight is a single absolutely-positioned rectangle with `position: fixed` coordinates copied from the hovered element's `getBoundingClientRect()`, `pointer-events: none`, and styling from component tokens only (§12): outline/border, translucent background, `z-index` above content and below menus/tooltips. It is a sibling of the content, never a child of it, and it is rendered under the theme-conservation rule (§12): in place with top-layer-style positioning like `MenuPopover`, or through `Portal` only into a target inside the active themed subtree — never bare into `document.body` where a `ThemeProvider`-scoped theme would be lost.
- **ProseMirror rule (blocking, `fe2-spec`):** the picker performs zero writes inside a ProseMirror view — no `classList`, no `style`, no attribute, no inserted node on any editor descendant. All drawing happens in the overlay (§9.3); all reading is `getBoundingClientRect()` / attribute reads. A `MutationObserver` witness over the editor subtree during a full hover+pick cycle must observe no DS-caused mutation (§14). This is what keeps the picker compatible with Tiptap in-place editing: ProseMirror's own DOM reconciliation is never disturbed, and undo/selection state is untouched.
- The same rule covers non-editor content: the picker adds no class or attribute to hovered host elements either. Hosts that need a persistent "picked" mark render it themselves from the returned descriptor.

### 9.4 FE-2 identity return

When the picked element is a paragraph of a `RichTextEditor` (FE-2), its `data-paragraph-id` attribute (`fe2-spec` §5.2 of that specification: ProseMirror attribute `paragraphId` rendered as `data-paragraph-id`) is read and returned as `pick.identity`. In the sentropic data model this is the block anchor's identity (`h-cond-plan`: the model's block anchor uses the Focus node identity of h2a #378, identical to the FE-2 paragraph ids — Appendix A; the DS carries that identity opaquely and owns no part of it). The picker allocates no identity, strips none, and — when the picked block is not an editor paragraph — returns `identity: undefined` and lets the host derive `hostIdentity` through `identify` (for example a `data-*` id of its own, or a diagram occurrence reference for a shape rendered as DOM). SVG-rendered diagram shapes that are not `HTMLElement` blocks are out of the picker's element model; diagram picking stays with the host's hit testing (§2.6) feeding §8.

### 9.5 Pick, cancel, keyboard equivalent, announcements

- **Pick — interception at the start of the gesture, delivery only after the gesture is consumed (blocking, Tiptap selection preservation):** intercepting only the final `click` is too late: the preceding `pointerdown` / `mousedown` can already move focus and the caret and collapse a Tiptap selection before any click handler runs, and a `MutationObserver` cannot observe that silent focus/selection change. The picker therefore listens on `root` in the **capture phase for `pointerdown`** (with a `mousedown` capture fallback for environments without pointer events, made idempotent per gesture — one pending record keyed by the primary pointer, `button === 0` — so one gesture is handled exactly once). On that initial event it resolves the eligible ancestor of `event.target`; when none matches, the gesture passes through completely untouched and no state is kept. When one matches, the picker immediately calls `preventDefault()` and `stopPropagation()` — before the browser can move focus, place a caret or alter the selection — and stores a **pending pick** (the resolved element; `bounds`, `identity` and any `identify` result are read from that element at delivery time). It does **not** call `onPick` yet. Delivery on the down event is forbidden: a host that sets `active = false` (or unmounts the picker) inside `onPick` would otherwise tear the picker down mid-gesture, and the mode teardown below would remove the very listeners that must still swallow the rest of that gesture, exposing the underlying `click` (link navigation, button activation, editor caret placement).
- **Gesture consumption before delivery (blocking):** on storing a pending pick the picker installs a transient **gesture guard**: capture-phase swallow listeners (on `document`, so a release target outside `root` is still covered) for the remaining events of the same gesture — the compatibility `mousedown` / `mouseup`, `pointerup` and the final `click` — each swallowed with `preventDefault()` and `stopPropagation()`. Only after the guard has swallowed the `click` that completes the primary activation does it remove itself and then, exactly once, call `onPick(descriptor)` for the pending element. By that point no event of the gesture remains, so a host that deactivates or unmounts the picker inside `onPick` cannot expose anything. The picker moves neither focus nor selection at any point of the gesture. §14 proves this in a real browser over the complete gesture, comparing focus and both selection boundaries before and after (§14, CA-L5); a jsdom click test does not substitute.
- **Cancellation of a pending pick:** a pending pick is cancelled — no `onPick`, no `onCancel`, the highlight is cleared when the guard ends — when any of these occurs before the completing `click`: the `pointerup` resolves to a different eligible element or to no eligible element (the pointer was dragged off the block), a `pointercancel` arrives, `Escape` is pressed while the gesture is pending (it aborts the pending pick only; a later `Escape` outside any gesture is the mode cancel below), the window loses focus, `active` becomes `false`, or the component unmounts. Cancellation does **not** end the guard early: except where the pointer-events model guarantees no `click` follows (`pointercancel`, release outside the window), the guard keeps swallowing until it has swallowed that gesture's `click`, and only then removes itself. It never calls a host callback after teardown. A non-primary pointer or a non-left button never starts a pending pick. The keyboard pick (§9.5 below) has no pointer gesture to consume, so `Enter` delivery there remains synchronous and safe under immediate deactivation.
- **Cancel:** `Escape` while active and outside a pending pointer gesture calls `onCancel()`, clears the highlight and leaves focus where it was. The host toggles `active` off; the component also self-clears its overlay if `active` stays true (defensive, asserted in tests). Toggling `active` off by any means, or unmounting, removes every **mode** listener the picker registered (hover, keyboard, scroll/resize, live-region wiring); the single exception is a live gesture guard, which is not a mode listener: it survives deactivation/unmount only until its gesture terminus as defined above, holds no reference it may call back through after teardown, and then removes itself. The lifecycle witness therefore accounts listeners **after the gesture terminus**: from that point no listener, observer or task survives deactivation/unmount (the FE-2 lifecycle pattern).
- **Keyboard equivalent (blocking):** picking must not be pointer-only, and it must work when the control that toggled the mode sits **outside** `root` — the common case, where the host's picker toggle lives in a toolbar or panel and focus stays on it. Key handling is therefore **not** scoped to `root`: while `active` is true the picker registers a capture-phase `keydown` listener on `document`, which receives the keys wherever focus is in the document, including on an external trigger. The picker maintains a keyboard candidate, initially the eligible block containing (or following) the element that had focus at activation, else the first eligible block in `root`; `Tab` / `Shift+Tab` moves it forward/backward through eligible blocks in DOM order, `ArrowDown` / `ArrowRight` move to the next and `ArrowUp` / `ArrowLeft` to the previous eligible block, `Enter` picks the candidate with the same descriptor the pointer path returns, and `Escape` cancels. While active, these navigation keys are captured and `preventDefault`-ed so they neither move focus inside editable content nor move an editor caret; the mode is modal for those keys alone, and deactivating the mode (or `Escape`) releases them. The candidate and the hover highlight are the same visual overlay; moving the pointer takes the candidate over from the keyboard position. Focus itself is never moved into the content and no editable content is modified by keyboard navigation: the candidate is picker state, not DOM focus, which is also what keeps the path safe over a ProseMirror view.
- **Screen-reader announcement (from 0.37.0):** a visually-hidden `aria-live="polite"` region in the overlay announces, through injected messages (§11): activation (`messages.pickerActiveLabel`, for example "element selection active" in the host's language), then **every candidate change** — pointer or keyboard — as the host-supplied `describe(candidate)` text (§9.1), so a screen-reader user hears which block `Enter` would pick at each step, and finally the pick/cancel outcomes (`messages.pickerPickedLabel` / `messages.pickerCancelledLabel`). Announcing only the outcomes, or leaving the candidate undescribed, does not meet this contract. `describe` is called for reading only: the DS writes nothing into the described element or any editable content to obtain it, and echoes no block text of its own. The overlay rectangle itself is `aria-hidden`: it is a visual affordance, and the live region is the accessible equivalent.
- Touch: a tap resolves through the same deferred flow as a pointer pick — the down is intercepted, the tap's activation is consumed, and only then is the pick delivered (one tap highlights and, on release, picks; hosts on touch-first surfaces accept this or keep the mode desktop-scoped — stated as a host choice, not a DS promise of a two-step touch flow).

## 10. Frameworks: Svelte first, staged parity

Svelte is the delivery framework for 0.37.0 (`CA-D8`), per DS practice (§2.8) and the FE-2 precedent. The parity plan per framework:

| Framework | Package (measured version) | Plan | Claimed when |
| --- | --- | --- | --- |
| Svelte | `@sentropic/design-system-svelte` 0.36.0 → **0.37.0** | All blocks in §5–§9 delivered here first, exported from the Svelte barrel (`packages/components-svelte/src/lib/index.ts`, one `export` per component, `measured` pattern). | The §14 gates pass on the Svelte lots. |
| React | `@sentropic/design-system-react` 0.38.0 | Staged parity lot after the Svelte gate: same DS names, same props translated to React conventions (callbacks as props, `messages` object identity-stable), icon catalogue extended with the same eight names (its `catalog` module, §2.8). `AnnotateContextMenu`/`ElementPicker` port their logic; no Svelte runtime is imported. | Its own lot gate (component tests + the same RED witnesses translated) passes. Until then: **not delivered**, and docs/catalogues must not list it. |
| Vue | `@sentropic/design-system-vue` 0.38.0 | Same staged parity, after React or in parallel as a separate lot; identical DS names and message keys. | Same rule: gate first, claim after. |
| Angular | `@sentropic/design-system-angular` 0.38.0 | Staged parity last, following the measured Angular posture in FE-2 (partial compilation; its suite qualifies the module graph under JIT and a consumer AOT/linker build is the real gate). If resourcing defers Angular, the deferral is recorded in the lot and the Angular package simply lacks the blocks — it never ships a placeholder. | A real consumer AOT/linker build plus the translated witnesses pass; otherwise reported as deferred, not as delivered. |

No framework-neutral helper package is created by this specification. The only pure helper, `isContextMenuKey` (§8.2), ships from the Svelte package as a named export and is re-implemented (three lines, test-pinned to the same key table) in each parity port rather than extracted prematurely; if a second shared helper appears, extraction into a neutral module becomes its own additive lot.

## 11. i18n: injected labels, no hard-coded language

- Every user-visible or accessibility string owned by the new blocks comes from one host-supplied messages object. Component sources contain no natural-language literal for these strings (the FE-2 RED-8 discipline: render with sentinel messages and scan the DOM; a source scan asserts no built-in label remains — applied per lot in §14).
- Message shape (Svelte; parity ports keep the same keys):

```ts
type CommentAnnotateMessages = {
  // CommentListItem
  saveLabel: string;        // tooltip + accessible name of the save icon button
  cancelLabel: string;      // cancel icon button
  deleteLabel: string;      // delete icon button
  editLabel: string;        // read-mode edit icon button (when rendered, §7.2)
  editFieldLabel: string;   // accessible name (Textarea label) of the edit field (§7.3)
  // SplitIconButton / menus (per-call labels may override per instance)
  menuLabel: string;        // default menu accessible name where a call site omits one
  // AnnotateContextMenu
  contextMenuLabel: string; // menu aria-label fallback
  // ElementPicker
  pickerActiveLabel: string;    // live-region announcement on activation
  pickerPickedLabel: string;    // announcement after a pick
  pickerCancelledLabel: string; // announcement after Escape/cancel
  // Panel composition (§6) — supplied by the host at the composition site
  panelTitle: string;
  panelLabel: string;
  listTitle: string;
};
```

Per-instance props (`label`, `anchorLabel`, `kindLabel`, `menuLabel`, the menu `label`, item labels) are also host-supplied strings and follow the same rule. The DS fixes no wording, no locale and no pluralisation for any of them.

- **Missing-key marker (fixed form):** when a key is absent from the supplied catalogue (host passes a partial object), the component renders the explicit marker `⟦untranslated:comment-annotate.<key>⟧` as the visible/accessible text and sets `data-untranslated="comment-annotate.<key>"` on the same element — the FE-2 marker discipline (`fe2-spec` §5.7 of that specification) under this specification's own namespace. The marker is never replaced by a hard-coded French or English string and never presented as a translation. `CommentAnnotateMessages` is typed with all keys required; the partial-catalogue case arises only when a host casts, and the marker is the defined behaviour then.
- Changing `messages` (locale switch) re-renders labels in place: no remount, no state loss (an in-progress draft survives), caret/selection in the textarea preserved. Hosts resolve catalogues at build/production time; the DS ships no catalogue and fetches none. The host document `lang` is a host concern.

## 12. Theming: component tokens only; Airbus coverage

New styling reads component tokens with fallbacks, following the measured pattern (§2.5). No global (`--st-*` foundation/semantic) token is added or changed by these lots, and no component hard-codes a colour, shadow or radius that a token names.

| Component | Component tokens (all new, additive) | Fallback behaviour |
| --- | --- | --- |
| `CommentListItem` | `--st-component-commentListItem-background`, `-border`, `-radius`, `-padding`, `-gap`, `-bodyText`, `-metaText`, `-anchorText` | Semantic surface/text/border fallbacks; renders the base appearance under every current theme, Airbus included |
| `LabelledIconButton` | none of its own | Inherits `IconButton` (`--st-component-iconButton-*`) and `Tooltip` (`--st-component-tooltip-*`) tokens unchanged |
| `SplitIconButton` | `--st-component-splitIconButton-divider` (the hairline between the two targets) | Falls back to `--st-semantic-border-subtle`; the attached layout is the component's own over the wrapped buttons (§5.3), reusing `IconButton` and menu tokens |
| `AnnotateContextMenu` | none of its own | Reuses `Menu`/`MenuPopover`/`Popper` tokens (`--st-component-menu-*`, `--st-component-popover-zIndex`) unchanged |
| `ElementPicker` (overlay) | `--st-component-elementPicker-outline`, `-outlineWidth`, `-background`, `-radius`, `-zIndex` | Outline falls back to `--st-semantic-border-interactive`, background to a translucent semantic surface; must stay visible over text and diagram fills alike (contrast witnessed per theme in the lot) |

Airbus check (`measured`, §2.5): the two groups must stay distinct. (a) Tokens the Airbus factory already produces: `packages/theme-airbus` builds its component layer with `createComponent(semantic, foundation)` (its `createAirbusComponent` wrapper spreads that result and overrides only `field.maxWidth`), so the Airbus theme **does** emit the `menu` and `tooltip` component tokens — resolved from Airbus semantic/foundation values (`packages/tokens/src/component.ts`, `menu:` / `tooltip:` entries) — along with `popover`, `badge`, `tag`, `field`, `control`, `button` and the other factory keys. Menus and tooltips in the new blocks therefore render under Airbus from those factory-produced tokens, not from fallbacks alone. (b) Tokens no current theme emits: the factory produces no `iconButton`, `contextPanel` or `utilityPanel` key, and none of this table's new names (`commentListItem`, `splitIconButton`, `elementPicker`) exists yet, so those dedicated variables resolve from their per-variable fallbacks under Airbus exactly as under the base theme. Coverage for 0.37.0 (`CA-D10`) is (a) plus (b): the Airbus package needs no change, and a later Airbus override (for example a flatter item anatomy matching its measured `field`/`tag` style, or measured values for the new names) is an additive change inside `packages/theme-airbus` only, following the `createComponent` rule — the component layer stays factory-produced, with at most a thin single-leaf wrapper of the Airbus kind. Both Airbus modes (light `airbus`, dark `airbus-dark`) inherit this through their semantic layers; the picker overlay's visibility in both modes is part of the §14 witness set, asserted on computed styles under a locally scoped `ThemeProvider` rather than assumed.

**Theme conservation for portalled overlays (normative):** a theme applied through `ThemeProvider` exists only inside its `[data-st-theme]` subtree (§2.5). No overlay of this specification — the `AnnotateContextMenu` panel, the `ElementPicker` highlight and live region, or any menu the compositions open — may be teleported bare into `document.body`, where it would fall back to whatever theme (if any) sits above it. Each overlay either renders in place with fixed/top-layer positioning inside the themed subtree (the `MenuPopover` pattern) or portals into a target element that is itself inside the active themed subtree. §14 witnesses this with a locally scoped Airbus `ThemeProvider`, light and dark, nested inside a differently themed page: the overlays' computed styles must resolve to the Airbus values, not the outer theme's — a theme placed on `<html>` alone cannot detect the loss and does not satisfy the witness.

## 13. The anchor amendment point (single, delimited)

The single amendment point exists in the types from 0.37.0; it is not added later. `CommentListItemProps<Anchor = unknown>` (§7.1) declares the parameter once, and the `anchor` prop plus all five callback details (`onSave` / `onCancelEdit` / `onDelete` / `onStartEdit` / `onAnchorActivate`) are typed from that same `Anchor` (each payload as `Anchor | undefined`, mirroring the optional prop, §7.1) — there is no independent `unknown` left to hunt down in the file. When sentropic publishes the stable form of its anchor contract (owner decision G3, §0.2), the amendment is exactly this, and nothing else:

1. At the host composition site — never inside a DS package, which stays free of any sentropic data-model or Focus dossier-binding import (§0.2) — the host instantiates the component with the published type (in Svelte terms, the component's `Anchor` generic — declared once with `unknown` as its default — is bound to the model owner's published type at that site; parity ports use their framework's equivalent generic binding). The prop and every callback payload are then precisely typed in that one place, automatically, because they already share the parameter.
2. No DS source changes at all: no signature is edited, and no runtime code changes — the value was always passed through untouched. Hosts that do not specialise keep compiling unchanged against the `unknown` default.
3. Nothing in `AnnotateContextMenu` or `ElementPicker` mentions the anchor type (the picker returns an element `identity` string, §9.4; turning it into an anchor is host work), so the amendment cannot spread there.

Until that amendment, any DS code that branches on `anchor` content, renders it, or persists it is a specification violation, witnessed by a source scan in the lots (no `anchor` identifier appears outside prop declarations and callback payload forwarding in `CommentListItem`).

Appendix A restates the sentropic data-model anchor fields (`h-cond-plan`, the model owner's contract) that the amendment is expected to type. If the published stable contract differs from Appendix A, Appendix A is updated in the same amendment commit and nowhere else.

## 14. Lots, gates and RED witnesses

Ordered lots. Each lot is RED-first: its witnesses are written and observed failing before the implementation, then passing. Target release: `@sentropic/design-system-svelte` **0.37.0** (next minor from 0.36.0) containing CA-L1…CA-L5; parity lots release with their own packages' next versions and are not part of the 0.37.0 claim. No lot writes under `.track/`, uses the network, or uses Python.

Command discipline (measured, following the FE-2 precedent for this same package): the Svelte package test script is `vitest run src` (`packages/components-svelte/package.json`), and appending a path to it (`run test -- <path>`) combines the path with `src` by OR rather than narrowing the run, so a lot gate never targets tests that way. Every targeted jsdom gate below uses the direct form `npm --workspace @sentropic/design-system-svelte exec -- vitest run <exact test files>`, and its output must list exactly the named files. Assertions that jsdom cannot carry — real focus/selection behaviour, CSS `:hover`, real layout — are proven in a browser instead: `*.browser.test.mjs` files driven by the repository's `puppeteer-core` harness against a system Chromium and run with `node <file>`, never through Vitest. CA-L1 wires the separation into the package, together with the first browser witness: `packages/components-svelte/vite.config.ts` gains a `test.exclude` for `**/*.browser.test.mjs` (the measured config excludes nothing today, so without this the jsdom run would collect the browser files), and `packages/components-svelte/package.json` gains the `files` exclusion `!dist/**/*.test.mjs` so a browser witness is never published. No gate in this section uses the network: in particular `npm run verify` is **not** a lot gate — it ends in `pack:smoke` (`scripts/smoke-pack.mjs`), which creates a fresh npm cache and installs external dependencies, so it belongs to release verification in a network-capable environment and is named as such in CA-L6. The offline release path is defined there instead.

### CA-L1 — Icons, the menu icon extension and `LabelledIconButton`

- Files: [M] `packages/components-svelte/src/lib/icons.ts` (eight additive names, §5.1); [M] `packages/components-svelte/src/lib/Menu.svelte` and `packages/components-svelte/src/lib/OverflowMenu.svelte` (the additive `{ name: IconName }` icon form, §5.1); [N] `packages/components-svelte/src/lib/LabelledIconButton.svelte`, `packages/components-svelte/src/lib/LabelledIconButton.test.ts`, `packages/components-svelte/src/lib/LabelledIconButton.browser.test.mjs`, `packages/components-svelte/src/lib/Menu.test.ts`, `packages/components-svelte/src/lib/OverflowMenu.test.ts`; [M] `packages/components-svelte/src/lib/Icon.test.ts` (icon catalogue assertion extended; the file exists, `measured`), `packages/components-svelte/src/lib/index.ts` (barrel export), `packages/components-svelte/vite.config.ts` (`test.exclude` for `**/*.browser.test.mjs`, §14 preamble — landed here, with the first browser witness, rather than in CA-L2) and `packages/components-svelte/package.json` (`files` gains `!dist/**/*.test.mjs`).
- RED witnesses (jsdom, `@testing-library/svelte`): `ICON_NAMES` contains exactly the eight new names plus the eight existing ones, with existing mappings unchanged; a menu item with `icon: { name: "circle" }` renders the glyph (an SVG, not the text `"circle"`) in both `Menu` and `OverflowMenu`, while a string icon still renders as text and a component icon still mounts as before; `LabelledIconButton` renders one `<button>` whose accessible name equals the supplied sentinel label, shows the tooltip text on focus, renders the glyph `aria-hidden`, and forwards `disabled`/`variant`/`size`. (Tooltip visibility on real `:hover` is a browser proof, witnessed below and in CA-L2; the browser file is excluded from the jsdom run and from publication by this lot's `vite.config.ts` / `files` wiring.)
- RED witnesses (browser, `LabelledIconButton.browser.test.mjs`, puppeteer-core + system Chromium): hovering an enabled button shows its tooltip (computed opacity after a real hover, which jsdom cannot produce); **hovering a `disabled` button also shows its tooltip** (the §5.2 measured behaviour of the unconditional wrapper `:hover`), while the disabled button itself is not focusable and keyboard focus passes it by with no focus reveal.
- Gate: `npm --workspace @sentropic/design-system-svelte run check` and `npm --workspace @sentropic/design-system-svelte exec -- vitest run src/lib/LabelledIconButton.test.ts src/lib/Icon.test.ts src/lib/Menu.test.ts src/lib/OverflowMenu.test.ts` pass with exactly those files listed; `node packages/components-svelte/src/lib/LabelledIconButton.browser.test.mjs`; then `npm --workspace @sentropic/design-system-svelte run test` as the package regression check shows no new failure.

### CA-L2 — `SplitIconButton`

- Files: [N] `packages/components-svelte/src/lib/SplitIconButton.svelte`, `packages/components-svelte/src/lib/SplitIconButton.test.ts`, `packages/components-svelte/src/lib/SplitIconButton.browser.test.mjs`; [M] `packages/components-svelte/src/lib/index.ts` (barrel export). The `vite.config.ts` / `package.json` browser-witness wiring (§14 preamble) is already in place from CA-L1.
- RED witnesses (jsdom): primary activation fires `onPrimary` and never opens the menu; chevron activation opens the menu and moves focus to the first enabled item; arrow/Home/End navigation follows `Menu`'s roving tabindex; selection fires `onSelect(value)` and closes — with focus on the chevron when the host focuses nothing; Escape closes with focus returned to the chevron; outside pointer-down closes with focus returned; `disabled` disables both targets and `menuDisabled` only the chevron; the two targets have distinct accessible names (primary label, `menuLabel`), the trigger carries `aria-haspopup="menu"` / `aria-expanded` / `aria-controls`, and the list carries `role="menu"` labelled by `menuLabel`. These assertions run on the composed component — the §5.3 focus orchestration is the composition's own code, so no helper-level test substitutes.
- RED witnesses (composed focus handoff, jsdom): selecting an item whose host `onSelect` handler opens an editor (a textarea rendered by the harness) and focuses it leaves `document.activeElement` inside that editor after the menu has closed — not on the chevron; selecting an item whose handler opens a dialog and focuses its first field likewise ends inside the dialog; selecting an item whose handler focuses nothing ends on the chevron; and an `Escape` close from the same harness still ends on the chevron. The recorded activation order in the harness proves delivery happened after closure/restoration (the handler observes the menu already closed).
- RED witnesses (browser, `SplitIconButton.browser.test.mjs`, puppeteer-core + system Chromium): hovering the primary target shows its tooltip and hovering the chevron shows the `menuLabel` tooltip (computed opacity after a real hover, which jsdom cannot produce), focusing each target shows the same labels, and the attached geometry lands on the inner buttons — squared inner corners and outer corners at the `IconButton` radius on the rendered `<button>` elements, not on the tooltip wrappers.
- Gate: `npm --workspace @sentropic/design-system-svelte run check`; `npm --workspace @sentropic/design-system-svelte exec -- vitest run src/lib/SplitIconButton.test.ts`; `node packages/components-svelte/src/lib/SplitIconButton.browser.test.mjs`; then `npm --workspace @sentropic/design-system-svelte run test` as regression. The menu assertions reuse the `Menu` item model unchanged (no fork of `Menu.svelte`).

### CA-L3 — `AnnotateContextMenu`

- Files: [N] `packages/components-svelte/src/lib/AnnotateContextMenu.svelte`, `packages/components-svelte/src/lib/AnnotateContextMenu.test.ts`, `packages/components-svelte/src/lib/AnnotateContextMenu.browser.test.mjs`; [N] the pure helper `isContextMenuKey` exported from the same module (or a sibling `context-menu-key.ts` if the lot prefers; the barrel exports it either way); [M] `packages/components-svelte/src/lib/index.ts` (barrel exports). Lot note on positioning: implement rect anchoring on the exported pure `Popper.computePosition` inside the component, extended with the complete bounding of §8.4, or add an optional rect-anchor prop to `Popper.svelte` — either is acceptable; silently forking flip/shift arithmetic into the new component is not.
- RED witnesses (jsdom): `isContextMenuKey` accepts Shift+F10 and the ContextMenu key and rejects plain F10/Enter — a necessary unit witness that never substitutes for the composed behaviour below; given a host rect, the panel renders at the computed position under the theme-conservation rule (§12); `onSelect` carries the item `value`; opening/navigating/selecting performs zero writes to a fixture document's selection and content (asserted via a `MutationObserver` log and an unchanged `Selection` string).
- RED witnesses (composed, jsdom + browser): the real opening path — a focused host target receiving Shift+F10, then separately the ContextMenu key, through the host wiring of §8.2 — opens the menu with the first enabled item active, the panel carrying `role="menu"` / `aria-label` and items `role="menuitem"`; arrow navigation moves the active item; Escape requests close and, once closed, focus is back on the pre-open element; a selection whose host handler focuses nothing closes with focus back on that same element. Focus handoff in the same harness: a selection whose `onSelect` handler opens an editor and focuses its textarea — and, in a second case, opens a dialog and focuses its first field — ends with `document.activeElement` inside the opened surface, not on the pre-open element, and the handler observes the menu already closed at delivery time. Viewport proof in the browser file (real layout): a long menu whose natural height is 480 px anchored at `bottom = 300` in a 600 px viewport ends with its bottom edge inside the viewport (at or above 592 px) with the list scrolling internally; a scrolled anchor followed by a host-supplied renewed `anchorRect` keeps the panel on its target; an anchor scrolled entirely out of the viewport produces an `onClose` request rather than a detached panel.
- Gate: `npm --workspace @sentropic/design-system-svelte run check`; `npm --workspace @sentropic/design-system-svelte exec -- vitest run src/lib/AnnotateContextMenu.test.ts`; `node packages/components-svelte/src/lib/AnnotateContextMenu.browser.test.mjs`; then `npm --workspace @sentropic/design-system-svelte run test` as regression. No change to `Menu.svelte` item semantics (a diff there must be justified as additive or the lot fails its own gate).

### CA-L4 — `CommentListItem`

- Files: [N] `packages/components-svelte/src/lib/CommentListItem.svelte`, `packages/components-svelte/src/lib/CommentListItem.test.ts`, `packages/components-svelte/src/lib/CommentListItem.type-witness.ts` (compile-time witnesses only; no runtime assertions); [N] the messages type in a sibling module (`comment-annotate-messages.ts`) shared by CA-L3/CA-L5 components; [M] `packages/components-svelte/src/lib/index.ts` (barrel exports: component + `CommentAnnotateMessages` type).
- RED witnesses (compile-time, `CommentListItem.type-witness.ts`, checked by the lot's `svelte-check` gate under the strict configuration — the witness file is included by the package tsconfig and produces no published output): an **anchored** consumer specialising `Anchor` to `{ id: string }` and supplying the prop compiles; inside each of the five callbacks the payload is assignable to `{ id: string } | undefined`, assigning it to a bare `{ id: string }` without narrowing is marked `// @ts-expect-error` (the line must error, or the witness fails), and reading `detail.anchor.id` after a narrowing check compiles. An **unanchored** consumer specialising `Anchor` to the same type and omitting the prop compiles; its callbacks receive `undefined` as a legal payload value, and an unguarded `detail.anchor.id` read is marked `// @ts-expect-error`. A default (`unknown`) consumer supplying no anchor compiles unchanged. A witness that stops erroring where `@ts-expect-error` stands — for example if a payload regresses to bare `Anchor` — fails `run check`, which is the RED mechanism for this finding.
- RED witnesses (jsdom): read mode renders kind badge text `kindLabel` (sentinel), anchor button with text `anchorLabel`, body as text (a `<script>`-shaped body string renders as text, never as markup); anchor activation carries the exact opaque `anchor` object by reference (`toBe` on the payload), and an item rendered without the `anchor` prop delivers `undefined` in every callback payload; the edit field is found by its accessible name — `getByRole("textbox", { name: <editFieldLabel sentinel> })` — in every edit render; the §7.3 transition table holds in both forms: controlled (save/cancel fire their callbacks and the item stays in edit mode until the host flips `mode`, then focus is restored per §7.4) and uncontrolled (the same gestures switch the internal mode, cancel discards so re-entry shows `body`), with `Ctrl+Enter` / `Cmd+Enter` saving and `Escape` requesting cancel; whitespace-only draft disables save; delete fires `onDelete` with no dialog rendered; the append-only `actions` slot renders host controls **after** the DS actions without suppressing any of them; the `anchor` value appears nowhere in the rendered DOM (attribute/text scan) and no `editing` prop exists in the component source (single-source scan); labels render from sentinel `messages` and a missing key renders `⟦untranslated:comment-annotate.<key>⟧` with `data-untranslated` set (§11).
- RED witnesses (jsdom, external entry — the §7.3 second row): a controlled harness whose own external button sets `mode="edit"` enters edit mode (the textbox appears by its accessible name), proving the chosen external path; the same external button in an **uncontrolled** harness — wired by the host to invoke its own `onStartEdit` callback without touching any prop — leaves the item in read mode (no textbox), while the built-in edit action in that same uncontrolled harness does enter edit mode. No test may reach the internal state by any other route, and the component source exposes no imperative entry method (source scan for an exported entry API).
- RED witnesses (jsdom, IME composition — the §7.4 guard): with the item in edit mode and the draft modified from `body`, a `keydown` carrying `isComposing: true` for `Escape` and, separately, for `Ctrl+Enter` invokes neither `onCancelEdit` nor `onSave`, leaves the item in edit mode and leaves the draft text intact; the same holds for keys dispatched between a `compositionstart` and a `compositionend` on the textarea. After `compositionend`, a plain `Escape` does request cancel (and, in a fresh render, a plain `Ctrl+Enter` does save), proving the guard is scoped to the composition and does not disable the shortcuts.
- Gate: `npm --workspace @sentropic/design-system-svelte run check`; `npm --workspace @sentropic/design-system-svelte exec -- vitest run src/lib/CommentListItem.test.ts`; then `npm --workspace @sentropic/design-system-svelte run test` as regression. The §13 source scan (no `anchor` branching, single `Anchor` parameter) runs as a test or lint assertion in this lot.

### CA-L5 — `ElementPicker`

- Files: [N] `packages/components-svelte/src/lib/ElementPicker.svelte`, `packages/components-svelte/src/lib/ElementPicker.test.ts`, `packages/components-svelte/src/lib/ElementPicker.browser.test.mjs`; [M] `packages/components-svelte/src/lib/index.ts` (barrel exports: component + `ElementPickerPick` type). The browser file is excluded from the jsdom run by the CA-L1 `vite.config.ts` wiring and from publication by the `files` exclusion, both already in place when this lot runs.
- RED witnesses (jsdom): with `active` and a selector fixture, hovering highlights the nearest eligible ancestor (overlay rect equals the block's stubbed rect, overlay outside the fixture subtree and inside the themed subtree, §12); a fixture paragraph carrying `data-paragraph-id` returns it as `identity` (§9.4) and the editor-fixture subtree shows zero DS mutations (`MutationObserver` log empty across hover+pick, ProseMirror-shaped fixture included); Escape cancels with no pick; the live region announces the sentinel activation message, then the `describe` sentinel of each candidate as it changes, then the picked/cancelled sentinels; deactivation/unmount removes all mode listeners (FE-2-style accounting on `root`, `document`, `window`, evaluated after any gesture terminus as §9.5 defines).
- RED witnesses (keyboard, jsdom): the toggle control sits **outside** `root` and keeps focus; with the mode activated from it, Tab/Shift+Tab and the arrow keys move the candidate across eligible blocks, each move updating the live region with that candidate's `describe` text, `Enter` picks the candidate with the same descriptor the pointer path returns, and `Escape` cancels — all without focus ever entering the content.
- RED witnesses (browser, `ElementPicker.browser.test.mjs`, puppeteer-core + system Chromium, real input throughout — the page mouse / native input path, never a synthetic `element.click()`): the Tiptap-preservation proof over the **complete gesture** — in a ProseMirror-shaped fixture with a real text selection (recorded anchor/focus nodes and offsets) and focus inside the editor, a full `pointerdown` → `mousedown` → `mouseup` → `click` sequence on an eligible block produces exactly one `onPick`, delivered only after the `click` has been swallowed, the fixture's own click handler never fires, `document.activeElement` is unchanged, both selection boundaries are unchanged, and the editor subtree shows zero DS mutations; the same sequence on a non-eligible target passes through untouched (caret placement behaves as without the picker); scroll repositions the highlight onto its block.
- RED witnesses (browser, teardown under immediate host reaction — the §9.5 guard): three variants of the complete gesture on an eligible block whose underlying element carries its own click handler (a link/button/editor surface). (a) `onPick` immediately sets `active = false`: exactly one `onPick`, the underlying click handler never fires, focus and both selection boundaries unchanged. (b) `onPick` immediately unmounts the picker (the host removes it from the DOM in the handler): the same assertions. (c) The host deactivates — and, in a second run, unmounts — the picker **between `pointerdown` and `pointerup`** (mid-gesture, before any delivery): no `onPick` is delivered, the underlying click handler still never fires, the gesture guard is gone after the terminus (listener accounting on `document` returns to its pre-gesture count), and a subsequent ordinary click on the same element behaves normally, proving the guard did not leak. Cancellation variants in the same file: a release dragged off the pending block and a `pointercancel` each deliver no `onPick` and no `onCancel`, suppress the underlying activation where one would follow, and leave the picker usable for the next gesture.
- Gate: `npm --workspace @sentropic/design-system-svelte run check`; `npm --workspace @sentropic/design-system-svelte exec -- vitest run src/lib/ElementPicker.test.ts`; `node packages/components-svelte/src/lib/ElementPicker.browser.test.mjs`; then `npm --workspace @sentropic/design-system-svelte run test` as regression. The no-mutation and selection-preservation witnesses are release blockers, not warnings.

### CA-L6 — Composition witness, docs and the 0.37.0 gate (offline)

- Files: [N] a docs/showcase composition in the existing docs app (`apps/docs`) wiring §6 (UtilityPanel + ContextPanel + CommentListItem list + SplitIconButton + context menu + picker over a fixture page) with sentinel-free real injected messages in one language supplied by the docs host; [M] `packages/components-svelte/package.json` version 0.36.0 → 0.37.0 at release time only.
- Witnesses: the composition renders under the base theme and under a **locally scoped** Airbus `ThemeProvider` (`airbusTheme` and `airbusDarkTheme`) nested inside a differently themed page, with the context-menu panel and picker overlay computed styles resolving to the Airbus values and the picker overlay visible in both modes (asserted on computed outline/background) — the theme-conservation witness of §12, which a theme on `<html>` cannot satisfy; the licensing/notices state is unchanged unless a dependency was added (none is planned: lucide is already a dependency).
- Offline gate (no network, in this order): `npm run licensing:check`; `npm --workspace @sentropic/design-system-svelte run check`; `npm --workspace @sentropic/design-system-svelte exec -- vitest run src/lib/LabelledIconButton.test.ts src/lib/Icon.test.ts src/lib/Menu.test.ts src/lib/OverflowMenu.test.ts src/lib/SplitIconButton.test.ts src/lib/AnnotateContextMenu.test.ts src/lib/CommentListItem.test.ts src/lib/ElementPicker.test.ts`; `node packages/components-svelte/src/lib/LabelledIconButton.browser.test.mjs`, `node packages/components-svelte/src/lib/SplitIconButton.browser.test.mjs`, `node packages/components-svelte/src/lib/AnnotateContextMenu.browser.test.mjs` and `node packages/components-svelte/src/lib/ElementPicker.browser.test.mjs`; `npm --workspace @sentropic/design-system-svelte run test`; `npm --workspace @sentropic/design-system-svelte run build`; and `npm pack --workspace @sentropic/design-system-svelte --dry-run` with the listing asserted to contain the new components and no `*.browser.test.*` entry. This dry-run pack is the offline smoke path: it packs locally and installs nothing. `npm run verify` / `npm run pack:smoke` remain release verification only — `scripts/smoke-pack.mjs` creates a fresh npm cache and installs external dependencies — so they run once at release in a network-capable environment, are never a lot gate, and their result is reported as release verification, not folded into any gate above. No React/Vue/Angular catalogue or doc lists the new blocks (§10 claim rule).

### CA-L7… — Framework parity (staged, after CA-L6)

One lot per framework in the §10 order (React, then Vue, then Angular), each translating the CA-L1…CA-L5 witnesses before implementing, each ending at its own package gate (Angular: plus a consumer AOT/linker build, §10). A parity lot that cannot be resourced is recorded as **deferred** in the release notes; the framework package then lacks the blocks and claims nothing.

## 15. Open questions to the owner

Only questions that cannot be settled from the sources are listed. Answer as « Q1 A », « Q2 B », etc. Each question blocks only the lot named; the rest of the lots proceed. The kind-badge tone is not a question: the brief already constrains it (opaque anchor, host-supplied `kind`/`label`, no DS branching on `kind`, §0.3), so `kindTone` stays host-supplied per item and the DS fixes no mapping on the host-supplied kind vocabulary.

**Q1 — Delete confirmation ownership (blocks only the wording of §7.2's no-dialog rule).** §7.2 specifies no DS confirmation, because the DS deletes nothing (§0.2). Options:
- **A (recommended):** confirmation, if wanted, is a host dialog (at the dossier-binding composition site) around `onDelete`. The DS rule stands as written.
- **B:** `CommentListItem` gains an inline confirm state (delete button turns into confirm/cancel icon pair for a few seconds). Self-contained, but the DS then owns a destructive-action policy and its labels/timeout need owner wording.
- **C:** no confirmation anywhere, stated as a product rule. The DS rule stands and the host is told not to add one.

**Q2 — Unresolved-anchor presentation (blocks nothing in 0.37.0 unless answered B).** When a host knows an anchor no longer resolves (its target was edited away), §7.5 leaves presentation to the host. Options:
- **A (recommended):** host handles it (omits `onAnchorActivate` or styles its own state). No DS change.
- **B:** `CommentListItem` gains an additive `anchorState: "resolved" | "unresolved"` prop rendering the anchor link disabled with an injected `messages.anchorUnresolvedLabel`. Small, but it starts typing anchor lifecycle in the DS before sentropic publishes the stable contract (§13).
- **C:** the item renders an additional unresolved badge (host-supplied label) beside the kind badge. Most visible; same concern as B.

**Q3 — Context-menu items for the diagram case: geometry actions in-menu or split-button only (blocks CA-L3's example fixtures, not its contract).** The contract (§8) is item-agnostic either way; the question is which surface the owner wants the first host to use for circle/rectangle/note. Options:
- **A (recommended):** both surfaces allowed; the first host puts geometry choices in the context menu (right-click a shape → annotate as circle/rectangle/note) and keeps the split button for panel-level creation. §8's fixtures follow this.
- **B:** geometry choices only in the split-button menu; the diagram context menu carries comment/annotate entries without geometry. One creation surface fewer to learn.

## 16. NOT covered

Exhaustive list of what this specification and its lots do **not** deliver. Anything not listed as delivered in §4–§14 and excluded here is `unknown` and must not be assumed.

1. **Comment / annotation data model** — no comment type, no thread/reply structure, no resolved/open state, no ordering, no pagination. The host maps the sentropic data model to `CommentListItem` props. (sentropic-owned, §0.2; consumed through the Focus dossier binding.)
2. **Anchors** — no anchor creation, resolution, re-anchoring after edits, or unresolved detection. The DS carries the opaque value only (§0.3, §13). The sentropic model's anchor fields (Appendix A, the model owner's contract) are not implemented, validated or frozen here.
3. **Persistence and edit return** — no storage, no network, no save transport, no sentropic model return envelope, no diff. `onSave` hands the draft to the host; what happens next is sentropic / host work through the dossier binding.
4. **Document or diagram mutation** — no text insertion, no selection changes, no shape creation or geometry editing. Diagram annotation geometry (a circle/rectangle/note drawn on a diagram or image) is created by the host/diagram surface after `onSelect`/`onPick`; the DS supplies icons and menu/picker surfaces only. `packages/diagram-canvas` / `packages/diagram-core` are not modified and not depended on.
5. **Rich-text editing** — no editor, no Tiptap integration, no toolbar. FE-2 owns the editor; this specification only reads its published identity attribute in the picker (§9.4).
6. **A comment list component** — no `CommentList`, threading indentation, grouping, filtering, sorting, search, or "load more". The host composes items inside the §6 panel.
7. **Creation forms** — no "new comment" composer, no reply box beyond `CommentListItem` edit mode, no mention/autocomplete, no attachment or image upload.
8. **Presence and collaboration** — no live cursors, no co-editing, no notifications, no unread counts (a host may render a `Badge` count itself; no block here computes one).
9. **Confirmation, undo and history UI** — no delete confirmation (Q1), no undo toast, no comment history or audit view.
10. **Native context-menu replacement policy** — the DS does not suppress the browser menu anywhere; the host decides per surface (§8.2). No touch long-press menu is specified (Q3 covers geometry placement only; a long-press gesture is a future additive host/DS decision).
11. **Framework delivery beyond Svelte in 0.37.0** — React, Vue and Angular blocks are planned (§10) but explicitly **not covered** by the 0.37.0 claim; Angular may remain deferred past its parity lot without blocking Svelte.
12. **Theme deliverables** — no new theme, no Airbus token overrides in `packages/theme-airbus` (§12 covers rendering by fallback). A measured Airbus visual pass over the new blocks is follow-up work in that package.
13. **Docs and catalogue publication** — beyond the CA-L6 composition witness, no public docs page, catalogue entry or CDN artefact is specified or claimed.
14. **Backend, MCP and h2a surfaces** — no endpoint, no MCP tool, no Focus dossier-binding UI. The consuming page and the Focus dossier binding integrate the blocks over the sentropic data model; their integration code is not DS work.
15. **Accessibility certification** — the lots assert the keyboard/focus/announcement contracts in §7–§9 with the DS test stack; no external audit or WCAG conformance claim is made by this specification.

## Appendix A. Sentropic data-model anchor fields — the model owner's contract, carried opaquely by the DS

Restated from the commissioning brief, as relayed through the Focus dossier binding, so the §13 amendment has its expected input in one place. These fields are **sentropic's** (owner decision G3, §0.2): the data model's anchor fields, cited here as the model owner's contract that the DS carries opaquely. **None of this is a DS contract or a DS-owned type.** The DS implements none of it (§0.3); if sentropic publishes a different stable shape, this appendix is rewritten by the amendment and no component contract changes except the §13 type.

- **Common envelope:** `{ kind: text | block | diagram, ...selector, label }` — a `kind` discriminator, kind-specific selector fields, and a display `label`. DS correspondence today: `kind` → the opaque `kind` token, `label` → `anchorLabel`/`kindLabel` as the host splits them; the selector part never reaches the DS.
- **text:** via a W3C Web Annotation `TextQuoteSelector` `{ tab, sectionId, exact, prefix, suffix, lang }`, plus an `unanchored` fallback for text that no longer matches. DS correspondence: none — text anchoring and re-anchoring are sentropic / host work in the data model; the DS only reports the picker/menu gestures that start a creation flow.
- **block:** via the Focus node identity of h2a #378 (`targetRef` / paragraph id). Relayed by h-cond as the same identity as the FE-2 rich-text editor's paragraph ids, so the picker stays compatible with Tiptap in-place editing. DS correspondence: §9.4 — when the picked block is a paragraph of a `RichTextEditor` (FE-2), the picker returns that identity (`data-paragraph-id`) in `pick.identity`. Verified on the DS side only up to the FE-2 attribute contract (`fe2-spec`); the identity's meaning in the sentropic data model is the model owner's contract, not a DS fact.
- **diagram:** via `{ diagramId, targetIds[], frame: scene | image, geometry (circle | rect | note + coordinates) }`. DS correspondence: none beyond icons (`circle`, `rectangle`, `note`) and the context-menu surface (§8); diagram identity, frames and geometry are produced and stored in the sentropic data model, consumed through the dossier binding.

## Appendix B. File map for the lots

New files use `[N]`, modified files `[M]`. All paths are inside `packages/components-svelte` unless stated.

| Lot | Files |
| --- | --- |
| CA-L1 | [M] `src/lib/icons.ts`, `src/lib/Menu.svelte`, `src/lib/OverflowMenu.svelte`, `src/lib/Icon.test.ts`, `vite.config.ts`, `package.json`; [N] `src/lib/LabelledIconButton.svelte`, `src/lib/LabelledIconButton.test.ts`, `src/lib/LabelledIconButton.browser.test.mjs`, `src/lib/Menu.test.ts`, `src/lib/OverflowMenu.test.ts`; [M] `src/lib/index.ts` |
| CA-L2 | [N] `src/lib/SplitIconButton.svelte`, `src/lib/SplitIconButton.test.ts`, `src/lib/SplitIconButton.browser.test.mjs`; [M] `src/lib/index.ts` |
| CA-L3 | [N] `src/lib/AnnotateContextMenu.svelte`, `src/lib/AnnotateContextMenu.test.ts`, `src/lib/AnnotateContextMenu.browser.test.mjs`; [M] `src/lib/index.ts`; possibly [M] `src/lib/Popper.svelte` (additive rect anchor only, §14 CA-L3 note) |
| CA-L4 | [N] `src/lib/CommentListItem.svelte`, `src/lib/CommentListItem.test.ts`, `src/lib/CommentListItem.type-witness.ts`, `src/lib/comment-annotate-messages.ts`; [M] `src/lib/index.ts` |
| CA-L5 | [N] `src/lib/ElementPicker.svelte`, `src/lib/ElementPicker.test.ts`, `src/lib/ElementPicker.browser.test.mjs`; [M] `src/lib/index.ts` |
| CA-L6 | [N] composition under `apps/docs`; [M] `packages/components-svelte/package.json` (version, release step only) |
| CA-L7+ | Per-framework counterparts under `packages/components-react`, `packages/components-vue`, `packages/components-angular` (names follow each package's measured conventions) |

Export rule for every lot: each new component and public type is exported from the Svelte barrel `packages/components-svelte/src/lib/index.ts` in the same lot that introduces it (the measured one-export-per-component pattern, §2.8). No subpath export is created; none of these blocks pulls a heavy runtime (no Tiptap, no diagram package), so the barrel rule that FE-2 applies to its editor does not apply here.


