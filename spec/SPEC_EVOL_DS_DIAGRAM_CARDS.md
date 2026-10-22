# SPEC EVOL — DS-DIAGRAM-CARDS: atomic and wrapping diagram cards with interactive fold

| Field | Value |
| --- | --- |
| Status | Specification only. Every owner value in §2.1 is **frozen** (owner-validated 2026-10-21). No implementation, no package and no test execution is claimed by this document. |
| Date | 2026-10-21 |
| Branch | `spec/diagram-cards`, cut from `origin/main` `60d61fc013495ecdd366759ede15035c415c493a` |
| Components | `DiagramCard` (atomic card), `DiagramZone` (wrapping card), `DiagramZoneHeader` (shared zone header, internal), `DiagramZoneFoldBar` (per-zone chips bar) — Svelte first in `packages/components-svelte`, other frameworks staged (§12) |
| Pivot model | `packages/diagram-core` (`SemanticDocument` / `ViewDocument`, commands, profiles, view state). No second model. Engram provides the profiles (§4). |
| Reference render | sentropic PR #711, merged to main as `4138a0ecba9c5b37409abb5ac00f732d02b7dc8d`; final validated branch head `6bb351559fa707a8cd304c4c3498a29f775e0abe`; portable `docs/governance/governance-r11-portable.html` at that merge, sha256 `831cbdee9bb5820e7e19ed55c942522a5848c402db9be0c89d87d02559bf6f35` (recomputed from `git show`, §2.2). It is the pixel-parity reference (§10). |
| Requirements source | `/home/antoinefa/src/sentropic/.tmp/governance-unification/DS-DIAGRAM-MODULES-REQUIREMENTS.md`, sha256 `c65f5f3afc752b387d3ee2498f894fb6a8637fa7a845b9e0608b450b4325e944` (read-only, verified on disk). **Every value in it is frozen.** Where the #711 code and that file differ, that file wins and the difference is flagged (§15). |
| Raw owner feedback | `/home/antoinefa/src/sentropic/.tmp/governance-unification/owner-feedback-diagram/OWNER-FEEDBACK-RAW.md` and `naming-2026-10-20.md` (read-only). Owner verbatims are quoted in §2.1 and are never paraphrased into requirements. |
| Origin card | `git -C /home/antoinefa/src/radar-immobilier show fa8133c2:docs/architecture/focus/ServiceNode.svelte`, `ServiceIcon.svelte`, `service-icons.js` (xyflow custom node, §2.3). |
| Downstream fixtures | `/home/antoinefa/src/airbus-genair-hrpolnav/docs/architecture/hrpn/ds-fixtures/`, `MANIFEST.md` sha256 `9558092fa2af669af9dcd4df6d9380e24a1cba723dbdd603ad2ebd86c6439a49` (read-only, verified on disk). Acceptance scenes in Appendix C. |
| Related | [JSON render standard](SPEC_EVOL_DS_JSON_RENDER_STANDARD.md) on `main`, and its L8 amendment on branch `spec/l8-dossier-diagrams` (`SPEC_EVOL_DS_JSON_RENDER_STANDARD.md` §§10.6–10.14, rules L-R13 to L-R17, §10.11 xyflow, §10.12 export). This specification is the component specification that L-R16 will point to; §16 lists every point where L-R16 must change. [Rich text editor](SPEC_EVOL_DS_RICH_TEXT_EDITOR.md) on `main` (RT-0 core merged, private; the Svelte adapter RT-1 is not started) gates §11. |
| Out of scope, staged later | draw.io export keeping folds as collapsible groups; legend inside the diagram (both: L8 dossier r3); editable / re-connectable edges (sentropic Track `01M5F3XSAJC2H6S9ZREP7JFFJ6`). See §13. |
| Language / tooling | This document is in English. No network access is used by any lot. Nothing is written under `.track/`. No Python is used anywhere (implementation, tests, jobs, one-off scripts): the stack is Node/TypeScript and the native tooling already present. |

## 0. How to read this specification

### 0.1 Source tags (mandatory on every decision)

Every decision in §3 carries one primary source tag.

| Tag | Meaning |
| --- | --- |
| `frozen-requirement` | A value or behaviour from the frozen requirements file (§2.1). It is final: no lot may re-open it, mark it provisional, or substitute a measured code value for it. |
| `measured-code` | A fact read from the pinned #711 code, the radar origin, or this repository at the base above. Measurements state their locator. Where a measurement conflicts with a `frozen-requirement`, the frozen value governs and §15 records the difference. |
| `ds-proposition` | A design choice made by this specification for the design system. It requires DS owner ratification where §17 states so and must never be reported as an owner requirement. |

`SHALL` / `MUST NOT` state the proposed contract. Frozen requirements already carry force from the owner validation of 2026-10-21; `ds-proposition` clauses acquire force at ratification of the corresponding decision.

### 0.2 Units and the one scale

- All card values are **card pixels**: CSS pixels at zoom 1, on the 1:1 SVG scale of the #711 render (`frozen-requirement`, requirements §"Atomic card"). A token whose value is stated in card pixels does not scale with the diagram zoom unless its row says so; the rule (§5.4) is the single exception that is defined in screen pixels.
- Zoom is a host/view concern (camera in `PresentationState`, `packages/diagram-core/src/view.ts`). No component in this specification owns a zoom control.
- Every geometric or typographic value is a **named component token** (§5.3, §6.4, Appendix A). A raw hex value, a raw pixel value outside a token definition, or a locally redefined `--st-*` token in a card, a dossier, a kit or a scene stylesheet is a defect (§5.5).

### 0.3 What this specification does not do

It creates no package, no component and no test. It defines the contract that lots DC-0 to DC-4 (§12) implement, the gates they must pass, and the acceptance items (`CA-…`) that witness each gate. File lists in §12 use `[N]` for a new file and `[M]` for a modified file, following the rich-text specification's convention.

## 1. Goal, scope, non-goals

### 1.1 Goal

Deliver two reusable design-system modules, validated at pixel parity against the #711 render:

1. **Atomic card** — the leaf card, for example « 1. Server API » (`frozen-requirement`, requirements §"The two modules").
2. **Wrapping card** — the zone/group frame, collapsed and expanded, for example « H2A · Responsible AI Organization », **including its interactive fold/unfold mechanism** as part of the component.

Both modules:

- are **pixel-exact** against the #711 render, witnessed by a visual parity test (§10);
- work as **xyflow (Svelte Flow) custom nodes** with handles, and standalone (§8);
- are **embeddable in graphs** and **editable Tiptap-style** (§11, gated on RT-1);
- bind to the **diagram-core pivot document** as their only model; Engram provides the profiles; there is no second model (§4).

Owner verbatim (requirements file, §"The two modules"): « réutilisable au pixel »; « mode xyflow ou la suite »; « doivent devenir des modules design system incubables dans les graphiques et doivent devenir éditables a la tiptap ».

### 1.2 In scope (this specification)

Section map: §4 pivot binding; §5 atomic card; §6 wrapping card and shared header; §7 interactive fold/unfold; §8 xyflow nodes, standalone use and graph embedding; §9 pictograms; §10 pixel parity and geometry checks; §11 editable surface (gated on RT-1); §12 lots, gates and acceptance items; §13 staged out-of-scope items; §14 consumer note (hrpolnav switch-over); §15 differences between the #711 code and the frozen requirements; §16 changes required in L-R16 (and in L-R15(c)(d), §10.11, §10.12 where they touch these components); §17 open questions.

### 1.3 Non-goals

- No layout engine is specified here beyond the fold reflow contract of §7.3: ranking, docking, orthogonal routing and label placement remain the L8 engine rules (L-R1 to L-R14) implemented by `packages/diagram-canvas`.
- No edge editing, no edge re-connection, no draw.io export shape and no in-diagram legend is specified (§13 names their owners).
- No React, Vue or Angular component is claimed delivered before its stage gate (§12.6). Framework parity is recorded per stage, never claimed from types alone.

## 2. Binding inputs, as read

### 2.1 Frozen owner requirements (requirements file, read in full)

Status line of the source file: owner-validated on 2026-10-21. Owner verbatim recorded there: « écoute c'est bon pour 711, stp squashe un peu et livre les 2 composants au design system avec tous mes requirements (les finaux) ». The fold verbatim: « donne le retour au design system pour avoir les 2 types de cartes (+ éditables) stp incluant le mécanisme de dépliement interactif ».

Frozen values (requirements file; each is restated as a token in §5/§6 and collected in Appendix A):

- **Atomic card.** Fixed size **460 × 200** (ratio 2.30:1); every card the same size; a card never grows with its text. **Square corners**: on a 3 px radius the owner word is « strictement invisibles » — no radius. Left accent bar and border as in the radar-immobilier `ServiceNode` reference (`fa8133c2`). Header: icon 70; icon → text gap 6; kicker 22 px, weight 400, uppercase, grey secondary token; title 32 px, weight 700, line-height 1.3. Body: 24 px, weight 400, line-height 1.3; body left inset is the original + 4 px (accent bar → first glyph 14 px). Rule: 1 px, border-subtle token (`#bdcad0` fallback), 4 px margins; it stays **1 screen px at every zoom**, including the overview. Footer (for example « service: Sentropic ») pinned to the bottom; bottom offset is the original 9.25 px; the owner rejected the extra bottom inset. **No ellipsis, ever**: wording must fit the allocated size, otherwise an overflow diagnostic is emitted; no clipping.
- **Wrapping card.** **One header component for all zones** — owner: « utilise le meme composant pour tous ». Same typography as the atomic card for every role: title 32/700; kicker 22/400, uppercase grey, **not bold**; subtitle 24/400. Icon 70, the same as the cards — owner: « pourquoi les icone des groupes sont plus petits ». The kicker carries the package name: `H2A`, `SENTROPIC`, `ENGRAM`, `DESIGN SYSTEM`; « SENTROPIC & 3RD PARTIES » / FR « SENTROPIC & TIERS » for Access surfaces; « SENTROPIC » for its sub-zones. The title is shown without the package prefix. The header follows its actual content (no reserved empty title line). The title → subtitle gap equals the card's. Expanded: the subtitle wraps under the icon from the left inset; the header is separated from the body by the same rule as the card footer. Collapsed: the collapsed frame has the card size; its subtitle is **centred horizontally and vertically** in the free area under icon + titles, with a 16 px side margin on each side; lines are simply centred — no justification, no letter/word stretching; owner: « pas de justifier les caracteres ». Zone frames side by side in a row share top and height; card rows and columns are aligned with 0 px deviation.
- **Expanded zone spacing (frozen).** Subtitle last line → header rule: **4 px** in every zone, whatever the number of subtitle lines; it equals the card's body → rule gap. Header rule → top of the child cards: **16 px**. Bottom of the child cards → zone bottom edge: **16 px**. Top and bottom stay balanced. Edges never reserve empty height: they route in the gutters between cards, along the frame, or outside it.
- **Icons.** One **blue duotone pictogram family**, delivered as a DS asset on its own subpath: same base diamond, palette, layers, 64-unit viewBox and stroke weight. It includes the pictograms added for #711: `brain` (AI) and `robot` (agents). Lucide outline icons are never mixed inside diagram cards.
- **Fold/unfold (part of the wrapping card).** Every wrapping card can be collapsed or expanded in place with a +/− icon button, the DS Lucide `IconButton`; its focus ring appears on keyboard focus only (`:focus-visible`), never after a mouse click. Collapsed, the wrapping card takes the atomic card size (460 × 200) at every nesting level, with the collapsed-subtitle centring above. Expanding or collapsing reflows the layout without collisions, and edges re-route. Global controls: « Expand all / Collapse all », and per-zone chips in a bar above the canvas. Performance: no continuous work at idle; the worst interaction stays under 1.8 s, measured over 600 interactions and 240 stress toggles; timeouts are never raised.
- **Edges (future, non-blocking).** Edges can be re-connected and their labels edited inline, as proposals the host applies or refuses, in diagram-core. Track `01M5F3XSAJC2H6S9ZREP7JFFJ6`. Out of scope here (§13).
- **Performance (general).** No continuous work at idle. Worst interaction under the 1.8 s UI budget; timeouts are never raised.

Raw-feedback verbatims that the frozen file already settles, quoted here only so a reader can trace them (they add no requirement beyond §2.1): « les "+" sont immondes (bcp trop grand, et on a un design system) » (the complaint is size/style, the +/− controls stay); « a la premiere présentation, laisse tout replié » (initial state, §7.2); « utilise un seule modele de largeur pour les fiches (le moins large petit donc) »; « mets un S a sentropic » / « mets un O a organisation » (title capitalisation is content, never a renderer transform — §6.5).

### 2.2 Reference implementation #711, as measured

Read via `git -C /home/antoinefa/src/sentropic show 4138a0ecba9c5b37409abb5ac00f732d02b7dc8d:<path>`. The portable at that merge recomputes to sha256 `831cbdee9bb5820e7e19ed55c942522a5848c402db9be0c89d87d02559bf6f35`, equal to the frozen file's value. The working tree of that repository no longer holds the portable file; the pinned commit is the only source.

| File (under `docs/governance/kit/`) | Measured role |
| --- | --- |
| `src/hrpolnav-card.js` (54 lines) | `renderStructuredCard(node, escapeXml)`: one `foreignObject` HTML card per leaf plus one SVG `diagram-card-rule` line; `structuredCardStyle` carries every card CSS value. |
| `src/hrpolnav-card-font.js` | Embedded `Dossier Inter` 700 woff2 (data URI) for card titles and footers; licence file `src/hrpolnav-card-font.LICENSE.txt` is SIL OFL 1.1 (Inter). |
| `src/architecture-svg.js` (111 lines) | `renderSceneSvg`: groups (zone frames, header, collapsed subtitle centring, header rule), edges, label pills, nodes; tone palettes via `--st-semantic-*` tokens with local colour-mix derivations. |
| `src/architecture-icons.js` (25 lines) | `diagramIcon(name, x, y, size = 42)` and the 9-glyph set (§9.2); base diamond `M8 53L32 44L56 53L32 62Z` on a 64-unit viewBox. |
| `src/governance-collapse.js` (58 lines) | `collapseGovernanceScene`: representative projection of folded subtrees, edge aggregation by endpoint pair, prepared-route cache keyed by a geometry signature (bounded runtime map of 32 entries). |
| `src/FrameToggle.svelte` (10 lines) | DS `IconButton size="sm" variant="ghost"` with Lucide `Plus`/`Minus`, `aria-expanded`, label from the host. |
| `src/governance-layout.js` (115 lines) | `packGovernanceScene`: hand row/column layouts per group id; `COLLAPSED_CARD_HEIGHT = 272`; `PAD = 16`; inter-frame `GAP = 160`. |
| `src/architecture-routing.js` (824 lines) | Orthogonal routing: visibility graph, A* search with turn penalty, port slots (`PORT_SLOT_COUNT = 11`), label placement; `routeScene` is the fold re-router. |
| `src/governance-font-metrics.js` | Browser-measured per-character advances at 1 px for the card roles (`title`, `body`, `footer` and the influence roles); the wrapping measurer of `architecture-layout.js` consumes them. |
| `src/ArchitectureFigure.svelte` (533 lines) | Host figure: `collapsedIds` state (all collapsed at first presentation), `Expand all / Collapse all`, per-zone chips bar, in-frame toggles mounted into SVG `foreignObject`s, `aria-busy` while a re-layout is in flight, zoom/pan viewer (host concern, not ported — §7.4). |
| `scripts/check-browser.mjs` (183 lines) + `scripts/browser-checks.mjs` | Playwright matrix (desktop/mobile × FR/EN × light/dark), per-interaction 1800 ms budget assertions, `inspect()` geometry/typography assertions, `contrast()`, `stressFolds()` (120 toggles per language = 240). |
| `scripts/check-geometry.mjs` (125 lines) | Headless geometry gate over every prepared scene and fold: 15 failure categories (§10.3), leaf footprint 460 × 200, collapsed footprint 460 × 272 (difference DIF-01), zone inset balance, row alignment, 16:9 frame. |
| `scripts/check-performance.mjs` | Idle gate: after 10 s idle, task time < 100 ms, script time < 10 ms, zero `requestAnimationFrame`, zero `ResizeObserver` callbacks, heap < 32 MiB; load and Expand-all each < 1800 ms. |

Measured card values (from `hrpolnav-card.js`, `architecture-layout.js`, `architecture-svg.js`; each is either frozen as-is or flagged in §15): card chrome `padding: 8px`, `border: 2px solid`, `border-left: 8px solid`, `box-sizing: border-box`; header `gap: 6px`, icon box 70; kicker 22/1.3 with `letter-spacing: .04em`; title 32/700/1.3; gap 6; body 24/1.3 with `padding-left: 4px`; rule `height: 1px; margin: 4px 0`; footer 24/700/1.3; the SVG rule spans `x + 16` to `x + width - 10` at `ruleY = y + 10 + (22 + 32 + 24 × 2) × 1.3 + 6 + 4 + 0.5` with `vector-effect="non-scaling-stroke"`; zone header icon at `(x + 16, …)`, zone text at `x + 92`; zone subtitle (expanded) at `x + 16`; collapsed subtitle width `width − 2 × (16 + 16)`; zone group rectangle `rx="6"` in markup, forced square by the dossier style rule; group stroke-width 1.5.

### 2.3 Origin card (radar-immobilier `fa8133c2`)

`ServiceNode.svelte` is an xyflow (`@xyflow/svelte`) custom node: fixed card template A′ (460 × 200, derived in `scenes.js` from the widest measured title and the line sum 70.2 + 6 + 31.2 + 31.2 + 9 + 31.2 + 20), invisible handles — for each of `target`/`source`, each side (`left`, `right`, `top`, `bottom`) and each of 10 slots at `(i + 1) / 11 × 100 %` — with the comment that the icon is exactly as tall as the first two lines (22 + 32 at line-height 1.3 = 70.2 px, drawn at 70). Its CSS is the direct ancestor of the #711 card style (same sizes, same rule, same footer). `ServiceIcon.svelte` renders the blue duotone family on `viewBox="0 0 64 64"` (base `#dceaff`, face `#639dff` with stroke `#3f7ae0` at 1.5, lines `#e6f0ff` — or `#3575d9` for `join`/`graph`/`network` — at 2.5, round caps/joins); `service-icons.js` holds 19 glyphs (§9.2) under the header comment: "Original, local pictograms. These are service symbols, not vendor logos."

### 2.4 Design-system context in this tree (at `60d61fc0`)

- **`packages/diagram-core`** (`@sentropic/diagram-core` 0.1.0, `private: true`, zero-DOM): the pivot. `SemanticDocument` (`src/document.ts`: entities, relations, semantic ports, resources, preserved extensions; no geometry — a test asserts the field set), `ViewDocument` (`src/view.ts`: entity/relation/port occurrences with `Geometry`, `VisualGroup { id, label?, collapsed? }`, filters, `PresentationState { camera, grid?, theme? }`), 18 commands with transactions, inverses and explicit delete policies (`src/commands.ts`), typed attributes (`src/attributes.ts`: a value carries its kind; undeclared content is an extension, never a fact), profiles (`src/profile.ts`; `generic@1` in `src/profiles/generic.ts` is the only `complete` profile: entity types `node` and `container`, port type `port`, relation types `link`, `contains` (tree hierarchy `containment`), `association`; limits 64 containers, container `name` unique and ≤ 200, link `label` ≤ 120), diagnostics with stable codes (`src/diagnostics.ts`). Collapse-relevant fact: `container` already declares a `collapsed` boolean attribute, and `VisualGroup` already carries `collapsed` — §4.3 decides which of the two is the fold state (the view one) and why the semantic attribute must not be used for it.
- **`packages/diagram-canvas`** (`private: true`, zero-DOM, only bare import `@sentropic/diagram-core`): the headless L8 engine. `layoutDocument` (`src/layout/engine.ts`) takes a `generic@1` `SemanticDocument` plus an injected `TextMeasurer` and returns a `ViewDocument` with warnings or a refusal carrying diagram-core diagnostics verbatim. Metrics defaults (`src/layout/types.ts`): `nodePaddingX 12`, `nodePaddingY 8`, `nodeMinWidth 64`, `nodeMinHeight 32`, `containerPadding 16`, `rankGap 56`, `nodeGap 24`, `slotSpacing 12`, `clearance 8`, `labelMargin 4`. The current signature accepts **no collapse input** and emits `groups: {}` — the L-R15(c) engine input is specified in the L8 amendment but not implemented at this base (§7.3, lot DC-2 dependency).
- **`packages/graph`** (`@sentropic/graph` 0.3.0, publishable, subpath exports `./processing`, `./worker`, `./layout-client`): the WebGL graph renderer and layout registry. It is a consumer surface for §8.4, not a layout engine for cards.
- **`packages/rich-text`** (`@sentropic/design-system-rich-text` 0.1.0, `private: true`): RT-0 is merged. The pure `"."` entry (model, messages with the `⟦untranslated:rich-text.<key>⟧` marker, P0 profile descriptors, identity attribute contract, token theme mapping) loads no Tiptap, ProseMirror, framework or DOM module; the Tiptap-bound `"./editor"` entry holds the factory. The Svelte adapter (`@sentropic/design-system-svelte/rich-text-editor`, RT-1) **does not exist at this base** (`packages/components-svelte` has no rich-text source and no such export): §11 is therefore specified in full and gated on RT-1.
- **`packages/components-svelte`** (`@sentropic/design-system-svelte` 0.36.0): single `"."` export today; the barrel is `src/lib/index.ts`. `IconButton` (`src/lib/IconButton.svelte`: `size sm|md|lg`, `variant ghost|secondary|danger`, mandatory `aria-label`, `:focus-visible` ring `0 0 0 2px` on `--st-component-iconButton-focusRing`; sm box 2 rem = 32 px) and `Icon` (`src/lib/Icon.svelte`: Lucide glyphs via `./icons.js`, token-driven stroke) are the controls §7 reuses. Precedent for a non-barrel entry: `packages/graph` subpaths and the rich-text specification's `@sentropic/design-system-svelte/rich-text-editor` subpath rule — a plain `Button`/`Card` import must never load diagram or editor code (§5.6).
- **`packages/tokens`**: foundation/semantic/component layers compiled to `--st-*` custom properties (`--st-semantic-text-primary/secondary`, `--st-semantic-surface-raised/subtle/default`, `--st-semantic-border-subtle/strong/interactive`, `--st-semantic-data-category1…8`, `--st-font-sans`, anatomy leaves under `--st-component-<name>-*`). Dark values live in the `*.dark.ts` layer; a component reads tokens only and defines no colour (§5.5). No `diagramCard`/`diagramZone` token exists at this base: DC-0 creates them.

### 2.5 Downstream acceptance fixtures (HRPN, read-only)

Four `generic@1` scenes with no coordinates (the DS computes the layout), generated by `build-fixtures.mjs`; counts per `MANIFEST.md` (cards/zones/relations): **S2-asbuilt 41/17/44** (37 solid, 7 dashed), **S2-target 51/22/54** (54 solid; clean: no removed, no risk, no dashed link), **S1-conversational 23/17/24** (14 solid, 10 dashed), **S3-agentfactory 37/15/36** (33 solid, 3 dashed). Fixture entities carry `entities[] { id, kind card|zone, label, detail, parent, tint, code, role, name, footer, store }` and `relations[] { id, from, to, label, style solid|dashed }`, mapped to `generic@1` by `profileMapping` (`node`, `container`, `contains`, `link`); `tint-legend.json` (sha256 `cc47a3e3a2019af8c436ce28a34d0d52d71b8439cf55a44a33f1c0239752a26d`) declares the closed tint set (`genair`, `specific`, `added`, `removed`, `risk`, none) as HRPN scene semantics; `reference/*.png` and the draw.io file (`hrpn-architecture.drawio`, sha256 `80c2cea7688ea667a3b8d2bcfc2bb73b7d9ff98e7c3c9eac7b162546cd0547a8`) are layout targets for visual comparison only, never geometry input. Full hashes in Appendix C. These scenes are acceptance inputs for DC-1/DC-2/DC-3 (§12); they are never copied into this repository by this specification — lots consume them by path + sha256, as the manifest prescribes.

## 3. Decisions

One decision per item. `DC-D…` ids are this specification's own; `L-R…` ids belong to the JSON render standard and are only referenced.

### DC-D1 — Two components, one shared zone header — `frozen-requirement` (component split: `ds-proposition`)

The atomic card is **`DiagramCard`**; the wrapping card is **`DiagramZone`**. Both are Svelte components in `packages/components-svelte`, delivered first; React/Vue/Angular adapters are staged (§12.6) and reuse the same token and measurement contract. Every zone header — atomic-level or nested, expanded or collapsed — is rendered by **one** internal component, **`DiagramZoneHeader`**, shared by `DiagramZone` in both states (owner: « utilise le meme composant pour tous »). `DiagramZoneHeader` is not a public export: its contract is exercised through `DiagramZone`. A per-zone header variant, a reserved empty title line, or a second header implementation is a defect.

### DC-D2 — Pivot binding: entity → card, container → zone, no second model — `frozen-requirement` (mapping mechanics: `ds-proposition`)

A `generic@1` `node` entity (or any profile entity type declared as a card type by its Engram profile) maps to `DiagramCard`; a `container` entity maps to `DiagramZone`; containment is the profile's `contains` tree, never a component prop (§4). Card slots travel as profile-declared typed attributes; a renderer invents no slot by splitting a name or parsing an undeclared attribute. Collapse state is **view state** (`ViewDocument` groups + the layout input of §7.3), never a document attribute and never component-local state that a second view could disagree with.

### DC-D3 — Every value is a named component token at its frozen value — `frozen-requirement`

Tables §5.3/§6.4 and Appendix A are normative. Tokens only: no raw hex, no raw pixel value outside a token definition, no locally redefined token, in light and dark alike. The decomposition of any composite inset is fixed by stating each token's measurement edges; where the #711 code's decomposition sums to a different total than the frozen token, §15 flags it and the token governs.

### DC-D4 — Zero-ellipsis: overflow is a diagnostic, never a rendering choice — `frozen-requirement`

No slot is ever truncated, clipped or ellipsised, at any zoom, in any state (§5.4). A text that does not fit its frozen allocation raises the diagnostic `card-overflow` (card variant) or `zone-overflow` (zone header), naming the component instance, the slot and the measured need against the allocation. The host shortens the wording or the profile allocation process re-issues the content; the renderer never resolves overflow by itself.

### DC-D5 — Fold/unfold is part of `DiagramZone` — `frozen-requirement` (engine assignment: `ds-proposition`)

The +/− control is the DS `IconButton` (`size="sm"`, `variant="ghost"`, Lucide `Plus`/`Minus`) with its ring on `:focus-visible` only. The chips bar is **`DiagramZoneFoldBar`**; Expand all / Collapse all are host controls emitting the same per-zone state changes in bulk (§7.2). The layout and routing engine that reflows a fold in the DS is **`packages/diagram-canvas` (`layoutDocument`) extended with the L-R15(c) collapse input**, reusing `packages/diagram-core` view state. From #711, the *algorithms* of §7.4 are ported as behaviour (representative projection, edge aggregation, header measurement, bounded route memoisation); no #711 file, hand layout table or scene data is copied.

### DC-D6 — xyflow nodes are thin wrappers; measured size feeds layout — `frozen-requirement` (wrapper shape: `ds-proposition`)

`DiagramCard` and `DiagramZone` each have an xyflow (Svelte Flow) node form (§8) with handles, the fixed 460 × 200 footprint for leaves and for collapsed zones, and the engine-computed rectangle for expanded zones. The size the layout consumed is the size the node reports: the wrapper takes its box from the `ViewDocument` occurrence geometry and never re-measures itself into a different box. Standalone use (no xyflow) renders the same components from the same props.

### DC-D7 — Pictograms: one blue duotone family on its own subpath — `frozen-requirement` (subpath name: `ds-proposition`)

The icon slot draws only from the blue duotone family of §9 (same base diamond, palette, layers, 64-unit viewBox, stroke weights), including `brain` and `robot`. The set ships as `@sentropic/design-system-svelte/diagram-icons`, an explicit subpath export, **never through the main barrel**: a host that draws no diagram card loads no pictogram. No Lucide glyph is drawn inside a diagram card; the fold control (§7) is outside the card's icon slot and keeps the DS `IconButton` contract.

### DC-D8 — Pixel parity against the pinned portable, with named deviations — `frozen-requirement` (method: `ds-proposition`)

Acceptance compares the DS render against `governance-r11-portable.html` at `4138a0ec` (sha256 in the header) by the method of §10: same FR/EN field corpus, headless Chromium, boxes within 1 CSS px, pixels within 0.5 % differing, same font stack. Where a frozen requirement overrides the code that produced the portable (collapsed height, ellipsis, footer pin, body inset, dark tokens — §15), parity asserts the frozen value and lists the portable's value as an intentional deviation; a deviation not listed in §15 fails the test.

### DC-D9 — Editable surface, fully specified, gated on RT-1 — `frozen-requirement` (gating: `ds-proposition`)

Inline editing of kicker, title, body and footer is specified in §11 through the rich-text editor (profile P0). Editing emits diagram-core commands carried in §4.6 `proposal` events; the host applies or refuses them; the component never mutates the document itself. Lot DC-4 implements §11 and **cannot start before RT-1** (the Svelte rich-text adapter) passes its gate. No fallback editor is specified or permitted.

### DC-D10 — Lots DC-0 to DC-4, RED-first, each with its gate — `ds-proposition`

§12. No lot claims the next lot's surface. The hrpolnav switch-over point is **DC-3** (§14).

### DC-D11 — Staged items stay with their owners — `frozen-requirement`

draw.io export keeping folds as collapsible groups and the in-diagram legend belong to the L8 dossier r3 work; editable/re-connectable edges belong to Track `01M5F3XSAJC2H6S9ZREP7JFFJ6`. This specification defines no shape for any of them (§13).

## 4. Pivot binding (diagram-core)

### 4.1 Entity mapping

| Pivot element (`generic@1` names; other profiles by declaration) | Component | Occurrence |
| --- | --- | --- |
| Entity whose type is declared a card type (`node` in `generic@1`) | `DiagramCard` | One `EntityOccurrence` with `Geometry` 460 × 200 (§5.2) |
| Entity whose type is declared a container type (`container` in `generic@1`) | `DiagramZone` | One `EntityOccurrence`; expanded geometry from layout, collapsed geometry 460 × 200 (§6.2) |
| `contains` relation (roles `parent`/`child`, hierarchy `containment`) | Nesting of zones and cards | Drawn by nesting; no `RelationOccurrence` (engine rule, `diagram-canvas` §"OUTPUT") |
| `link` relation (roles `source`/`target`) | Edge between cards/zones | One `RelationOccurrence`; route from `relationRoute(view, occurrenceId)` (§8.2) |
| Semantic port + `PortOccurrence` (`side`, `order`, `anchor`) | xyflow handle (§8.2) | One handle per port occurrence |

The mapping is by **declared type**, never by name pattern, depth or child count. A profile that declares further card or container types (Engram profiles) names them in its declaration; the components consume the declaration. `DiagramCard` never renders a container's children and `DiagramZone` never renders a leaf's body lines: the variant is selected from the entity type, exactly as L-R16(a) selects the card variant from content presence for dossier diagrams.

### 4.2 Card slots as profile attributes (schema work, gated)

`generic@1` today declares, for `node`: `name` (text, required, ≤ 200), `state`, `weight`, `duration`, `createdAt`, `pinned`, `tags`, `owner`; for `container`: `name` (required, ≤ 200, unique), `collapsed`. It declares **no** kicker, body, footer, icon or tint attribute, and `validateDocument` refuses an undeclared attribute as `attribute-not-in-schema` (`packages/diagram-core/src/validate.ts` via `src/attributes.ts`). Therefore:

- The slot attributes are **profile schema work owned with the Engram profile definitions** (the same h2a-side schema item the L8 amendment lists in its §10.13): the profile in force for a card scene SHALL declare, per card type, the optional attributes `kicker` (text), `body` (text; body lines in order, §5.1), `detail` (text; the secondary-tone body line), `footer` (text), `icon` (text; a §9 glyph name — never SVG data), and, per container type, `kicker` (text; the package name, §6.3) and `subtitle` (text). Attribute length bounds are set by that profile work so that the measured corpus of §10 fits; the frozen geometry does not move to fit a longer bound (DC-D4).
- `name` remains the title source: for a card, the entity `name` is the title; for a zone, the entity `name` is the zone title **without** any package prefix (§6.3). A document that stores « H2A · … » as a zone name is migrated by its producer, not parsed by the renderer (no ` · ` splitting anywhere in a component).
- Tint/tone is **not** a `generic@1` attribute today. HRPN tints (Appendix C) are scene semantics carried outside `generic@1` attributes by the fixture's own statement (`profileMapping.extraFields`). In the DS, a card's tone resolves from the profile-declared tone kind where a profile declares one (L-R17 tones), and HRPN tints map to tone tokens only through the consumer's own mapping (§14) — the DS ships no HRPN tint token.
- Until the profile in force declares the slot attributes, a scene renders simple label nodes under L-R12 and **no** card: inventing slots is forbidden (L-R16(b) rule, carried over unchanged). DC-1's gate therefore includes the profile declaration for the scenes it accepts (§12).

### 4.3 Collapse state is view state

Two carriers exist at this base and the choice is normative:

- `container.collapsed` (semantic attribute) is **not** the fold state. Folding is presentation: two views of one document may fold differently, a fold must not bump `document.revision`, and an undo of a text edit must not unfold a zone. Recording a fold as an `update-entity-attributes` command would violate all three.
- The fold state is the **view state**: one `VisualGroup` per container in the `ViewDocument`, with the deterministic id form of L-R15(c) (`grp.<len>.<local id>`) and `collapsed` set from the layout input, plus the `layoutDocument` collapse input itself (§7.3). `DiagramZone` receives `collapsed` as a prop derived from that state; its toggle emits the §7.2 event; the host re-runs layout and replaces the `ViewDocument` wholesale. Component-local fold state that survives a `ViewDocument` replacement, or that a static export cannot read back, is a defect (§10.12 of the JSON render standard: the export preserves the supplied collapse state).

### 4.4 Commands and proposals (editing and interaction boundary)

- Components never mutate a `SemanticDocument` or a `ViewDocument`. Every outward effect is an event of §4.6 of the JSON render standard: `intent` (`select`, and the diagram `collapse`/`expand` names of its §10.11) for interaction, `proposal` (`{ "event": "proposal", "transaction": { "commandId", "baseRevision", "commands": [...] } }`) for edits the host applies with compare-and-swap or refuses.
- Text edits (§11) propose `update-entity-attributes` commands against the slot attributes of §4.2. Fold toggles propose **no document command**: they are `collapse`/`expand` intents answered by a freshly laid-out `ViewDocument` (§7.2).
- A proposal's `baseRevision` is the revision the component rendered from. A host refusal (including `revision-conflict`) leaves the rendered document untouched; the component shows no local winner (§11.3).

### 4.5 No second model

No type in `packages/components-svelte` re-declares an entity, a relation, a containment tree or a fold set. Props (§5.1, §6.1) are projections of one entity (plus its view state) computed by the host or by the xyflow adapter (§8); the projection is derived deterministically from `(SemanticDocument, ViewDocument)` and is never persisted as a model. The HRPN fixture shape (`entities[]`/`relations[]`, §2.5) is an input to a host-side projection onto `generic@1`, not a component input format.

## 5. Atomic card — `DiagramCard`

### 5.1 Props and slots

Svelte first (`packages/components-svelte/src/lib/DiagramCard.svelte`, lot DC-1). Prop names are the DS API (`ds-proposition`); values and behaviour are frozen where tagged.

| Prop | Type | Required | Meaning |
| --- | --- | --- | --- |
| `kicker` | `string` | no | One short uppercase line (the code, for example `AUT`). Uppercasing is a CSS text transform of the supplied string under the host locale's case mapping, never a second stored string. Absent: the slot is omitted and the title rises (no reserved line). |
| `title` | `string` | yes | The entity display name (`name`, §4.2). The only mandatory slot. |
| `body` | `readonly string[]` | no | Body lines in order (the measured card carries a function line then a detail line). The projection marks the detail line, which renders in the secondary text token; line order is content order, never sorted. |
| `footer` | `string` | no | One bold line (for example « service: Sentropic »), set off by the rule (§5.4). Absent: no rule and no footer are drawn. |
| `icon` | `string` | no | A §9 glyph name. An unmapped name draws no icon, raises `card-icon-unknown` (§5.4) and the slot collapses (header text starts at the header inset). |
| `tone` | profile tone kind | no | Resolves the accent and fill through L-R17 tokens (§5.5). Absent: neutral. |
| `entityId` | `EntityRef` (string form) | yes in a diagram host | Identity for diagnostics and `select` intents. Standalone documentation use may pass a local id; it is never rendered as text. |

Slots (Svelte snippets/children), in render order: `icon` is rendered by the component from the `icon` prop (no host markup enters the pictogram slot); hosts do not pass body markup — body lines are text props so that measurement (§5.2), editing (§11) and the text twin (§10.4) read the same strings. Five text slots in order: kicker, title, body lines, rule (drawn only when `footer` is present), footer. No slot repeats another slot's text (measured card contract: the code appears once and is never repeated in the name — a projection that duplicates a string into two slots is a host defect the parity corpus checks, §10.2).

Events out: `onSelect` → §4.6 `intent`/`select` with `target = entityId`; `onDiagnostic` → §5.4 (also mirrored as `data-card-overflow` / `data-card-icon-unknown` attributes on the card root for headless checks). The card emits no layout, drag or geometry event: it owns no layout (DC-D6).

### 5.2 Geometry — fixed size, measured once

- The card box is **460 × 200 card px** (`--st-component-diagramCard-width/height`), `box-sizing: border-box`, at every zoom (the box scales with the host transform; its card-pixel size never changes). Every card in a scene is the same size; rows and columns align with **0 px deviation** (geometry check §10.3).
- The card **never grows with its text** (`frozen-requirement`). There is no `auto` size variant for `DiagramCard`: the L-R16 `size: 'auto' | 'fixed'` prop does not survive into this component (§16, LR16-C2). A scene that needs a larger leaf uses a zone, not a larger card.
- The measured footprint that feeds autolayout is the token box itself (460 × 200), taken **before** placement (§10.6 layering rule of the JSON render standard: card measurements are engine input). A token change that alters the footprint recomputes placement, docks and routes in the same layout call; an appearance-only change (fill, border colour, glyph inside the unchanged 70 px icon box) never moves a dock, route or rank.
- Anatomy, top to bottom (border-box edges; token names in §5.3): accent bar on the left edge; header row (icon box, then kicker over title); 6 px gap; body lines (full width, left-aligned, `text-align: left`); rule; footer pinned to the bottom (§5.4). Text is left-aligned everywhere in the card; vertical centring of the whole block inside a stretched rectangle is L-R15(a) and does not apply to the fixed card (its rectangle is never stretched — a rank that grows leaves the card at 460 × 200 and centres the *card*, per L-R6/L-R15(a) as amended in §16).

### 5.3 Component tokens — atomic card (all values frozen)

Token prefix `--st-component-diagramCard-`. "Frozen value" is the value at owner validation; "Source" states where it was measured. A theme may override an alias only through the semantic layer (§5.5); the geometry tokens are not theme-overridable in a way that changes the footprint without a parity re-run (§10).

| Token | Frozen value | Source |
| --- | --- | --- |
| `width` | `460px` | requirements; `hrpolnav-card.js` (460 footprint), radar `CARD.A.width` |
| `height` | `200px` | requirements; radar line sum (§2.3) |
| `radius` | `0` | requirements (« strictement invisibles » on 3 px) |
| `borderWidth` | `2px` | `ServiceNode.svelte`; `hrpolnav-card.js` |
| `accentWidth` | `8px` | `ServiceNode.svelte` (`border-left: 8px`) |
| `padding` | `8px` | `ServiceNode.svelte`; `hrpolnav-card.js` |
| `headerInset` | `16px` (card left edge → icon left edge: accent 8 + padding 8) | measured composition; zone icon inset (§6.4) is the same value |
| `iconSize` | `70px` (square box; glyph drawn inside the §9 64-unit viewBox) | requirements; icon = 22 + 32 at 1.3 = 70.2, drawn at 70 |
| `iconTextGap` | `6px` (icon right edge → header text left edge; header text at inset 92) | requirements; `header { gap: 6px }` |
| `kickerFontSize` / `kickerFontWeight` / `kickerLineHeight` | `22px` / `400` / `1.3` | requirements |
| `kickerLetterSpacing` | `0.04em` | `hrpolnav-card.js` `.card-code` |
| `kickerTextTransform` | `uppercase` | requirements |
| `titleFontSize` / `titleFontWeight` / `titleLineHeight` | `32px` / `700` / `1.3` | requirements |
| `gap` (header → body) | `6px` | `.card-gap { height: 6px }` |
| `bodyFontSize` / `bodyFontWeight` / `bodyLineHeight` | `24px` / `400` / `1.3` | requirements |
| `bodyInsetFromBar` | `14px` — accent-bar left edge → first body glyph. Decomposition (`ds-proposition`, fixed here so the total is checkable): accent 8 + padding 2 + body extra inset 4. The header keeps `headerInset` 16; body lines therefore start 2 px left of the header icon edge. | requirements (frozen total 14 = original 10 + owner +4). The #711 code sums to a different total — DIF-05 (§15); the token governs and DC-1's parity assertions measure the glyph position, not the CSS that produces it. |
| `ruleHeight` | `1px`, drawn as **1 screen px at every zoom** (SVG form: `vector-effect: non-scaling-stroke`; HTML form: the §5.4 single-rule construction) | requirements |
| `ruleMargin` | `4px` (body last line → rule 4; rule → footer 4) | requirements; `.card-rule { margin: 4px 0 }`; browser check asserts both gaps at 4 |
| `ruleInsetStart` / `ruleInsetEnd` | `16px` / `10px` (card left/right edge → rule ends) | measured SVG rule `x + 16` → `x + width − 10` (requirements silent; code value frozen here as `measured-code`) |
| `footerFontSize` / `footerFontWeight` / `footerLineHeight` | `24px` / `700` / `1.3` | `.repo-label` (24/1.3, weight 700) |
| `footerBottomInset` | `9.25px` — footer text-box bottom → inner edge of the bottom border | requirements (original value; the +4 px bottom pass was rejected by the owner) |
| `fontFamily` (title, footer) | `var(--st-font-sans)` at weight 700 — no embedded font ships in the component (§10.2 font rule) | DS token layer; the #711 embedded `Dossier Inter` subset is a portable-build device, DIF-08 |
| `fontFamily` (kicker, body) | `var(--st-font-sans)` at weights 400 | DS token layer |

### 5.4 Rule, footer pin and the zero-ellipsis policy

- **One rule, 1 screen px.** The card draws exactly one rule element. In SVG hosts it is a `line` with `vector-effect="non-scaling-stroke"` and `stroke-width: 1` on the border-subtle token, so at overview scale it remains 1 screen px (the #711 portable keeps both an HTML rule and an SVG overlay line; the DS component keeps only the non-scaling form — DIF-07). In pure-HTML hosts the same visual is produced by a 1 px element counter-scaled by the host transform; a rule that thickens or thins with zoom fails §10.
- **Footer pinned.** The footer is pinned to the bottom of the fixed box: in flow terms the footer block is pushed by an automatic top margin (`margin-top: auto` or the flex equivalent) so that its text-box bottom sits at `footerBottomInset` from the bottom border's inner edge **whatever the body line count** (zero, one or two lines). The #711 code reaches 9.25 only because its fixed content happens to fill the box (no pin construct) — DIF-04; DC-1 implements the pin and §10 asserts the inset at each body line count.
- **Zero-ellipsis (blocking).** CSS for every text slot forbids `text-overflow: ellipsis`, line clamping and content clipping as a fit mechanism: `overflow` on the card is `visible` for measurement purposes in tests, and the shipped style contains no `ellipsis`, no `-webkit-line-clamp` and no `white-space: nowrap` on card text (the #711 style declares all three — DIF-02). Text wraps at word boundaries inside its allocation with the §7.4 measurer; a slot's allocation is its frozen box (kicker/title: header width at inset 92 to the card's right padding edge; body: full width at `bodyInsetFromBar`; footer: full width). If the measured need (lines × line-height, or a single unbreakable word wider than the allocation) exceeds the allocation, the component:
  1. still renders the complete strings (no character is dropped, shortened or replaced);
  2. raises `card-overflow` with `{ entityId, slot, neededPx, allocatedPx }` through `onDiagnostic` and sets `data-card-overflow="<slot>"` on the root;
  3. leaves geometry unchanged (the box stays 460 × 200; the layout is not recomputed around an grown card).
  The host surfaces the diagnostic in its diagnostics list (the diagram-core `Diagnostic` shape, §12 CA-DC1-4) and shortens the wording; a scene with an unresolved `card-overflow` fails its geometry gate (§10.3). Overflow is therefore visible in checks and in the host UI, never hidden inside the card. The same rule applies to the zone header as `zone-overflow` (§6.2).

### 5.5 Colours, tokens only, dark mode

- Border: `--st-component-diagramCard-border` aliasing `var(--st-semantic-border-strong)`; accent bar: the card tone's accent (L-R17: `--st-component-diagramCanvas-cardAccent<T>`); surface: `var(--st-semantic-surface-raised)` composed with the tone fill of L-R17; primary text `var(--st-semantic-text-primary)`; kicker and detail line `var(--st-semantic-text-secondary)`; rule `var(--st-semantic-border-subtle)` (fallback `#bdcad0` only as the token's own fallback in the token definition, never as a component literal).
- The #711 card style overrides four semantic tokens locally (`--st-semantic-border-strong:#607b82`, `--st-semantic-data-category1:#145f68`, surface `#fff`, text `#172033`) and dark scheme forces zone fills to `#fff` — both forbidden here (DIF-06, DIF-09). In the DS, light and dark resolve through the semantic layer (including `packages/tokens/src/semantic.dark.ts`); if a resolved pair fails the §10 contrast matrix, the theme token changes, never a component-local override.
- No colour, spacing, radius, font or motion value is hard-coded in the component where a `--st-*` token exists. A scan for hex literals and for locally redefined `--st-*` properties in the card/zone sources is part of DC-1/DC-2 acceptance (the L-R12(d) presentation scan, extended unchanged).

### 5.6 Packaging of the components

`DiagramCard`, `DiagramZone` and `DiagramZoneFoldBar` live in `packages/components-svelte/src/lib/` and are exported from the package **barrel** (`src/lib/index.ts`): they carry no Tiptap, ProseMirror, xyflow or pictogram payload, so a plain import stays light. The pictogram set (§9) and the xyflow node wrappers (§8) are separate subpath exports and never enter the barrel graph. The editable surface (§11) enters only through the rich-text subpath. Each claim is witnessed by an import-graph test in its lot (§12), in the shape of the rich-text packaging witness: importing `"."` must not resolve the `diagram-icons`, xyflow-node or rich-text module graphs.

## 6. Wrapping card — `DiagramZone` and the shared header

### 6.1 Props and slots

Svelte first (`packages/components-svelte/src/lib/DiagramZone.svelte`, lot DC-2). The header props are consumed by `DiagramZoneHeader` (DC-D1) and are stated here once.

| Prop | Type | Required | Meaning |
| --- | --- | --- | --- |
| `kicker` | `string` | no | The package name, already in its display form (§6.3): for example `H2A`, `SENTROPIC & 3RD PARTIES`. Rendered uppercase by transform, weight 400. Absent: omitted, the title rises (no reserved line). |
| `title` | `string` | yes | The zone title **without** the package prefix (the prefix is the kicker). Capitalisation is content: the renderer never upper- or lower-cases a title character (the measured counterexample of a title-case transform in layout code is forbidden, §6.5). |
| `subtitle` | `string` | no | One or more lines at 24/400. Expanded: wraps under the icon from the left inset. Collapsed: centred per §6.2. Absent: no subtitle block in either state. |
| `icon` | `string` | no | A §9 glyph name; same slot rules as the card (`zone-icon-unknown` on an unmapped name, slot collapses). |
| `tone` | profile tone kind | no | Zone fill/border through L-R17 container fills (accent at 4–5 % over the canvas token). |
| `collapsed` | `boolean` | yes in a diagram host | View state (§4.3), derived from the `ViewDocument`; the component never owns it. |
| `entityId` | `EntityRef` (string form) | yes in a diagram host | Identity for diagnostics, intents and the fold control's `data-frame-control` equivalent. |
| `toggleLabel` | `string` | yes when foldable | Host-supplied localised label for the +/− control (for example "Collapse <title>"). No built-in language (§6.5). |

Children: the zone's body is host-rendered content — in a diagram host, the child cards and sub-zones placed by the layout (§7.3); standalone, arbitrary DS content. `DiagramZone` positions none of it: expanded geometry (header height, content box) comes from the `ViewDocument` occurrence, and the component paints header, rule, frame and toggle around the box it is given. The header follows its content: `DiagramZoneHeader` measures kicker/title/subtitle with the §7.4 measurer and reports its height; no empty kicker or title line is ever reserved (a zone without a kicker has a one-line-shorter header, in both states).

Events out: `onToggle` → §4.6 `intent` with `name: "collapse" | "expand"`, `target = entityId`, `context: { "group": "<grp.… id>" }` (the §10.11 envelope of the JSON render standard, §7.2); `onSelect` as for the card; `onDiagnostic` for `zone-overflow` / `zone-icon-unknown` (mirrored as data attributes).

### 6.2 Expanded and collapsed anatomy

**Expanded.** Header (icon 70 at the 16 px header inset, kicker over title at the 92 px text inset, subtitle wrapping under the icon from the left inset at `x + 16`); then the header rule — the same rule as the card footer rule (1 screen px, border-subtle, same insets); then the content box. Frozen vertical rhythm: subtitle last line → rule **4 px**; rule → first child card top **16 px**; last child card bottom → zone bottom edge **16 px**; inline content inset **16 px** on each side; top and bottom balanced (asserted within the §10.3 tolerance of 2 px on legacy prepared scenes and at 0.02 px in the browser assertions of §10.2 — DC-2 asserts 4/16/16 exactly on its own fixtures). Title → subtitle gap equals the card's header → body gap as a *rendered* gap: the browser witness of #711 compares the zone's title→subtitle gap against the card's title→body gap (`cardGap`, including the embedded font's leading) and fails above 0.02 px; the token statement is §6.4 (`subtitleGap` aliases the card `gap` plus the same leading rule for both components, so the equality holds by construction, not by a second constant).

**Collapsed.** The frame takes the atomic card size **460 × 200 at every nesting level** (`frozen-requirement`; the #711 code's 272 is DIF-01). Header at the top (same `DiagramZoneHeader`, same icon and type sizes); the subtitle is centred horizontally and vertically in the free area under (icon + titles) — the free area is the collapsed box minus the 16 px frame inset and the header block — with a **16 px side margin on each side** inside that inset (effective text inset 32 px from the frame edge, as the #711 code and its browser assertions measure: inset 16 + margin 16). Each subtitle line is centred on its own (`text-anchor: middle` equivalent); **no justification**: no `textLength`, no `lengthAdjust`, no letter- or word-spacing change (asserted by comparing the subtitle's spacing properties against the card body's, §10.2). Children are not rendered; incident edges dock on the collapsed frame (§7.3). A collapsed zone with no subtitle renders header only. Overflow of the collapsed subtitle (more lines than the free area holds) raises `zone-overflow` (slot `collapsed-subtitle`); it is never shrunk, clipped or reduced in font size.

**Rows.** Zone frames side by side in a row share top and height; card rows and columns align with 0 px deviation (§10.3 asserts both, including the equalised header bottoms of expanded zones in one row: the shorter header is padded by the layout's header equalisation, as the #711 pack layout does, so first-row children share a top).

### 6.3 Kicker naming rule (no hard-coded language)

The kicker is the package name. It is **content supplied through the profile attributes** (§4.2), resolved by the producer (skill/Engram profile) per document locale — the component never derives a kicker from a title string (the #711 layout derives it by matching `/h2a/i`, `/engram/i`, `/\bDS\b/` against titles and by comparing a title to the literal `'Access surfaces'`: DIF-10, forbidden here).

| Zone kind | Kicker (EN document) | Kicker (FR document) |
| --- | --- | --- |
| h2a package zones | `H2A` | `H2A` |
| Sentropic platform zones (top level) | `SENTROPIC` | `SENTROPIC` |
| Access surfaces zone | `SENTROPIC & 3RD PARTIES` | `SENTROPIC & TIERS` |
| Sub-zones of a Sentropic zone | `SENTROPIC` | `SENTROPIC` |
| Engram zones | `ENGRAM` | `ENGRAM` |
| Design-system zones | `DESIGN SYSTEM` | `DESIGN SYSTEM` |

Rules: (1) the stored kicker string is already in display case for names containing `&` (the uppercase transform still applies uniformly; `&` and digits are unaffected); (2) the title never repeats the kicker — a title stored with a « H2A · » style prefix is a producer defect, and the parity corpus (§10.2) includes a frame-title check equivalent to the #711 geometry gate that rejects a lowercase-after-`·` title pattern; (3) locale comes from host configuration (JSON render standard §6.5) — the component holds no FR/EN pair and switches nothing by itself; a locale change re-renders the host-supplied strings with no geometry change beyond re-measurement.

### 6.4 Component tokens — wrapping card (all values frozen)

Token prefix `--st-component-diagramZone-`. Typography tokens alias the card's so the "same typography" requirement holds by construction: a test asserts computed-style equality between zone and card for each role (§10.2), in the shape of the #711 browser witness.

| Token | Frozen value | Source |
| --- | --- | --- |
| `radius` | `0` (square, as the cards) | `ds-proposition` from the frozen square-card rule + the dossier style forcing `rx: 0`; the #711 markup default `rx="6"` is DIF-03. Ratified or changed only through Q1 (§17). |
| `borderWidth` | `1.5px` | measured group `stroke-width="1.5"` (requirements silent; code value frozen as `measured-code`) |
| `headerInset` | `16px` (frame left edge → icon left edge) | measured icon at `x + 16` |
| `iconSize` | `70px` | requirements (« pourquoi les icone des groupes sont plus petits ») |
| `iconTextGap` | `6px` (header text at frame left + 92) | measured; same as card |
| `kickerFontSize/Weight/LineHeight` | alias `diagramCard-kicker*` (22/400/1.3, uppercase, secondary) | requirements (not bold — the bold-kicker shape is a named defect in the raw feedback) |
| `titleFontSize/Weight/LineHeight` | alias `diagramCard-title*` (32/700/1.3) | requirements |
| `subtitleFontSize/Weight/LineHeight` | `24px / 400 / 1.3` (secondary for the detail tone where the profile so marks it; default primary per the #711 render, which paints the zone subtitle in primary) | requirements; `architecture-svg.js` subtitle at 24 |
| `subtitleGap` | rendered title → subtitle gap equal to the card's rendered header → body gap (token alias of the card `gap` under the shared leading rule, §6.2) | requirements ("equals the card's") |
| `headerRuleGap` | `4px` (subtitle last line → header rule; also header block → rule when no subtitle) | requirements (expanded spacing) |
| `contentInsetTop` | `16px` (header rule → first child card top) | requirements |
| `contentInsetBottom` | `16px` (last child card bottom → zone bottom edge) | requirements |
| `contentInsetInline` | `16px` | measured `PAD = 16` |
| `collapsedWidth` / `collapsedHeight` | `460px` / `200px` | requirements (DIF-01 against the code's 272) |
| `collapsedInset` | `16px` (free-area inset inside the collapsed frame) | measured |
| `collapsedSubtitleMarginInline` | `16px` (each side, inside `collapsedInset`) | requirements ("16 px side margin") |
| `toggleSize` | the DS `IconButton` sm box (32 px at the current anatomy) — the control is not drawn text and carries no card token of its own | §7.1; supersedes the L-R15(d) 28 px bound (§16) |
| Colours | frame fill/border via L-R17 container tokens; header text via the semantic text tokens; rule via `diagramCard` rule tokens | §5.5 rule applied to zones |

### 6.5 i18n and content rules

No hard-coded language and no hard-coded colour in either component: every string (kicker, title, subtitle, body, footer, toggle labels, chips-bar labels, Expand/Collapse-all labels) is host-supplied content or host-supplied localised label; locale and theme arrive by host configuration; no fallback string is ever drawn — a missing optional slot is omitted (§5.1), and a missing `toggleLabel` makes the zone non-foldable rather than labelling the control in a built-in language. Case transforms use the host locale's mapping. Title capitalisation is never transformed by a component or by layout code (the #711 `groupContent` title-case rewrite `· (\p{Ll})` → uppercase is DIF-11, forbidden: « mets un S a sentropic » / « mets un O a organisation » are content corrections by the producer). The L-R12(d) presentation scan (no colour literal, no natural-language literal) extends to both components unchanged (§10.3).

## 7. Interactive fold/unfold

### 7.1 The toggle control

Each foldable `DiagramZone` header carries one toggle: the DS `IconButton` (`@sentropic/design-system-svelte` barrel export), `size="sm"`, `variant="ghost"`, Lucide `Plus` when collapsed, `Minus` when expanded, `aria-expanded` set from the collapsed state, `aria-label` from the host-supplied `toggleLabel`. The icon size inside the button follows the DS button anatomy token (`--st-component-button-anatomy-density-sm-fontSize`), as `FrameToggle.svelte` does. The focus ring is the `IconButton`'s own `:focus-visible` ring: it appears on keyboard focus and **never after a mouse click** — the #711 browser witness (focus via keyboard: ring present and `:focus-visible` matches; click afterwards: no ring, `box-shadow: none`) is ported as a DC-2 test (§10.2). The control is placed inside the frame border, at the header's top-right, clear of header text at every width (the #711 placement inside an SVG `foreignObject` at the frame's right edge is a host-mounting device of that kit; in the DS the header is HTML/SVG-native to the component and no `foreignObject` sizing pass exists). The control never renders a text "+" or "−" glyph, never exceeds the header height, and takes the header's tone tokens. Plus/Minus here are DS control glyphs (Lucide via `IconButton`); DC-D7's ban on Lucide inside diagram cards covers the pictogram slot only.

### 7.2 State changes, chips bar, Expand all / Collapse all

- Activating a toggle emits the §10.11 intent: `{ "event": "intent", "name": "collapse" | "expand", "target": "<container entity id>", "context": { "group": "<grp.… id>" } }`. The component mutates no geometry. The host answers with a freshly laid-out `ViewDocument` (§7.3) and the renderer replaces geometry wholesale — stale boxes are never animated into place. While a re-layout is in flight the host surface exposes `aria-busy` (the #711 figure's contract) and the toggle that initiated it keeps focus; on completion focus returns to that toggle (the #711 `setDetail(…, focusId)` behaviour, ported as host behaviour).
- **`DiagramZoneFoldBar`** (chips bar): one chip per foldable zone in the current view, in document order, each chip a DS `Button size="sm" variant="secondary"` showing the zone title with a `Plus`/`Minus` icon and `aria-expanded`. It sits above the canvas (host-placed), scrolls horizontally on narrow viewports (the #711 `mobile-frame-controls` shape), and emits the same `collapse`/`expand` intents as the in-frame toggles. Chip labels are host-supplied localisations of (state, title); the bar holds no fold state of its own.
- **Expand all / Collapse all** are host controls with host-supplied labels (for example « Tout déplier / Tout replier », "Expand all / Collapse all"). Semantically they are bulk applications of the per-zone transition over every foldable zone in the view, delivered as one host layout pass (one replacement `ViewDocument`), not as N sequential re-layouts. Their disabled states derive from the view state (Expand all disabled when nothing is collapsed, and conversely), as in the #711 figure.
- **Initial state.** At first presentation every foldable zone is collapsed (owner: « a la premiere présentation, laisse tout replié »; the #711 figure initialises `collapsedIds` to all groups). A host may restore a persisted view state instead only through the `ViewDocument` it supplies; the component defaults nothing by itself.

### 7.3 Engine: what runs the reflow in the DS

**Decision (DC-D5): the DS engine is `packages/diagram-canvas`.** A fold is a layout call, not a component behaviour:

1. Input: the `SemanticDocument`, the injected `TextMeasurer` (with the card roles of §7.4), `targetWidth`, and the collapse input — `layoutDocument` gains `options.collapsedContainers?: readonly EntityRef[]` (semantic **container entity** ids, nothing else), exactly the L-R15(c) engine input. This input does not exist at the measured base (§2.4): implementing it is part of lot DC-2 (engine side), including the L-R15(c) semantics: a collapsed container removes its descendant entities from the drawing (no reserved empty box), keeps its own occurrence at the collapsed size (460 × 200, §6.2 — L-R15(c)'s "header only" size is superseded for zones by the frozen card size, §16), re-runs placement, docking, routing and label placement on the collapsed graph in the same call, records one `VisualGroup` per container with `collapsed` set, lifts incident relations (one end hidden: drawn to the collapsed container's rectangle; both ends hidden in the same container: not drawn; ends in two different collapsed containers: container-to-container), restores a descendant's recorded flag when an ancestor re-expands, and reproduces the pre-collapse canonical geometry exactly on re-expansion.
2. Output: one replacement `ViewDocument` (occurrences, routes via `relationRoute`, groups with collapse state, camera preserved unless the host refits). Determinism is the engine's existing contract: same document + same collapse input ⇒ same canonical bytes (`serialiseView`), independent of record insertion order.
3. Edges route in the gutters between cards, along the frame, or outside it; a route never reserves empty height inside a zone (frozen spacing rule). The routing, docking and label rules are L-R1 to L-R14 as implemented by `diagram-canvas`; fold adds obstacles (the collapsed frame is an ordinary obstacle rectangle), it does not add a routing mode.

`packages/graph` is not the fold engine (it renders graphs; it does not implement L-R docking/routing), and xyflow is never a layout engine here (§8.1). ELK (`elkjs`) is not adopted: the #711 kit vendors it for study layouts, the L8 amendment records "allowed and not adopted", and no DC lot introduces it.

### 7.4 Ported versus reused (from #711)

No #711 file is copied. Behaviour is re-implemented in the DS from the measurements, as the JSON render standard already requires for L-R1 to L-R11 ("No code is ported from any measured source").

| #711 behaviour (locator) | Disposition in the DS |
| --- | --- |
| Representative projection: a folded subtree's internal relations disappear; external relations re-target the outermost collapsed ancestor (`governance-collapse.js` `representative()`) | **Ported as engine behaviour** into the `diagram-canvas` collapse path (same rule over `contains` ancestry), witnessed by the HRPN scenes (§12). |
| Edge aggregation by endpoint pair with counted summary labels (« N links / N liaisons ») and the all-collapsed top-level aggregation (`governance-collapse.js`, `governance-summary.js` `aggregateTopLevel`) | **Ported as behaviour** where the host profile declares summary edges; the label strings are host-supplied per locale (the code's inline `language === 'en' ? 'links' : 'liaisons'` is not ported). Aggregation correctness (no duplicated or missing cross-frame relation, direction preserved) is asserted as in `check-geometry.mjs`'s aggregation block. |
| Header measurement and wrapping with browser-measured character advances (`governance-font-metrics.js`, `architecture-layout.js` `wrapText`/`frameHeaderContent`, including the routing-clearance slot metrics at 1.125×) | **Ported as measurement data + algorithm**: the DS `TextMeasurer` host implementation for card roles (`card-code`, `card-title`, `card-body`, `card-footer`, zone roles aliasing them) uses per-character advances measured the same way, versioned with the font stack (§10.2). The 1.125× routing-clearance factor is an engine clearance detail, re-measured at DC-2, not a token. |
| Prepared-route memoisation keyed by a geometry signature (visible boxes + edge set), bounded cache (`governance-collapse.js`, 32-entry runtime map; build-time `governance-routes.json`) | **Ported as a memoisation contract**: a host may memoise layout results on the canonical signature of (document hash, collapse set, target width, measurer version); the cache is bounded, keyed by content, and never changes results — a cache miss recomputes identically. No prepared-routes file ships in a DS package. |
| Hand row/column layout tables per group id, `GAP = 160`, `CARD_STACK_GAP = 72`, scene data (`governance-layout.js`, `governance-central.js`) | **Not ported.** DS spacing is the engine metrics + the frozen zone insets (§6.4). The 160/72 gutters are scene devices of one diagram. |
| `ArchitectureFigure` viewer (dialog, pinch/wheel zoom, pan, fit) and the dossier page chrome | **Not ported.** Zoom/pan/fit are host concerns over `PresentationState.camera`; this specification's components are the cards, the zone and the fold controls only. |
| `FrameToggle` mounting into SVG `foreignObject` with a `getScreenCTM` sizing pass | **Not ported as a mechanism.** The DS header renders the `IconButton` natively (§7.1); no `foreignObject` measurement pass exists to go stale. |
| Checks (`check-geometry.mjs` categories, `browser-checks.mjs` `inspect()`/`contrast()`/`stressFolds()`, `check-performance.mjs` idle gate) | **Ported as test contracts** (§10.2/§10.3), re-implemented against DS fixtures; the assertions, thresholds and budgets are carried over, the code is not. |

### 7.5 Performance contract (frozen budget)

- **No continuous work at idle.** After load and after any fold settles, the card/zone subtree performs no periodic work: the §10 performance witness (10 s idle window, the `check-performance.mjs` thresholds: idle task < 100 ms, idle script < 10 ms, zero animation-frame callbacks, zero resize-observer callbacks attributable to these components, bounded heap) must pass. No polling timer, no standing `ResizeObserver` on card content (fixed size makes one unnecessary), no route recomputation without a state change.
- **Worst interaction < 1.8 s.** Every fold interaction — single toggle, chips-bar toggle, Expand all, Collapse all — completes (state visible + `aria-busy` cleared) in under 1800 ms, measured over **600 interactions** across the acceptance scenes and **240 stress toggles** (the #711 stress pattern: 120 per language on the central scene), on the §10.2 browser matrix. Timeouts are never raised to make a slow interaction pass: the 1800 ms bound is the test timeout as well as the assertion, as in `check-browser.mjs`. A fold that cannot meet the budget on an acceptance scene is a lot failure, not a budget renegotiation.
- Reflow is synchronous with the layout call: no intermediate geometry (overlapping or half-moved boxes) is ever painted as a settled state; `aria-busy` covers the in-flight interval.

## 8. xyflow nodes, standalone use, graph embedding

### 8.1 xyflow (Svelte Flow) node forms

For each component, a node wrapper in the xyflow subpath (`ds-proposition` names, lot DC-3): `DiagramCardNode` and `DiagramZoneNode`, exported from `@sentropic/design-system-svelte/diagram-nodes` (own subpath, §5.6 rule — an app without xyflow loads no xyflow code). The wrappers render `DiagramCard`/`DiagramZone` unchanged inside the xyflow node element; xyflow is the render and interaction layer fed by engine geometry, never a second layout engine (JSON render standard §10.11, carried over):

- Node `width`/`height` are the occurrence geometry from the `ViewDocument` (leaf and collapsed zone: 460 × 200; expanded zone: the laid-out rectangle). The wrapper sets xyflow's node dimensions from that geometry and reports the same box as its measured size: xyflow's internal measurement of the wrapper must equal the occurrence box within 1 CSS px, and any mismatch raises `node-size-mismatch` in the DC-3 harness rather than silently feeding a different size back to layout. **Measured size fed back**: hosts that let xyflow measure (rather than declaring dimensions) pass the measured box to the next layout call as the node's footprint input, so placement, docks and routes are computed on the rectangles actually drawn (§10.6 layering rule).
- Dragging never writes geometry directly. Where the host enables editing, drag end emits the §10.11 `proposal` event (`move-occurrence` with `geometry` placement only; `port`/`waypoints` placements are forbidden in a proposal) and the host answers with a freshly laid-out `ViewDocument` whose geometry wins on any conflict. Hover, pan and zoom emit no event.
- If xyflow fails to load, the host renders the static SVG form (JSON render standard §10.12) for the same geometry instead of a blank surface.

### 8.2 Handles

Two endpoint kinds, per §10.11 of the JSON render standard (which DC-3 implements without change):

- **Port endpoint:** one handle per `PortOccurrence` — side from `side` (`north/east/south/west` mapped to xyflow `Position`), position along the side from `anchor`, handle id encoding the port occurrence id.
- **Entity endpoint (no port):** one handle per relation end, derived from the endpoint's entity occurrence and the first (source) or last (target) point of `relationRoute(view, occurrenceId)`: side is the rectangle side containing that dock point, position is read from the dock coordinates, id is `<occurrenceId>#source` / `<occurrenceId>#target`. Deriving handles from port occurrences alone is forbidden (the §15 witnesses of the JSON render standard carry zero port occurrences).

Handle presentation follows the radar origin: handles are invisible (`opacity: 0`, `pointer-events: none`) in the reading surface and become connectable only in a host-declared connect mode; the centre handle (anchor 0.5, L-R1) is an ordinary handle. The radar node's full slot grid (4 sides × 10 slots × target/source) is the *origin* contract of one application, not the DS contract: DC-3 implements the two-kind derivation above, which reproduces the docked geometry without inventing undocked slots (§16, LR16-C6).

### 8.3 Standalone use

Outside xyflow, `DiagramCard` and `DiagramZone` render from props alone (§5.1/§6.1) at the same token geometry: a documentation page, a dossier panel or a graph side panel hosts them with no canvas, no layout call and no `ViewDocument` (the host supplies `collapsed` and content directly). Standalone rendering is pixel-identical to the in-diagram rendering for the same props (asserted in DC-1/DC-2 by rendering the parity corpus standalone and in a scene). The fold toggle in standalone use emits the same intent shape with the standalone zone's id; a host that cannot reflow may leave `toggleLabel` unset, rendering the zone non-foldable (§6.5).

### 8.4 Embedding in graphs

The components are DOM components. In `packages/graph` (WebGL) hosts and in mixed canvas hosts, cards and zones embed as DOM overlays anchored to graph node positions (the host projects graph coordinates to the overlay plane; the card box stays 460 × 200 card px at the overlay's scale). No WebGL re-implementation of the card is specified or permitted (a second rendering of the same card would break DC-D8 parity). A graph host that cannot overlay DOM renders the static SVG form of the same geometry (§8.1 fallback rule).

## 9. Pictograms — the blue duotone family

### 9.1 Family contract (frozen)

One family, drawn identically in cards and zones, at the 70 px icon box:

- **Geometry:** `viewBox="0 0 64 64"` (64-unit viewBox). Base diamond (canonical, from the validated #711 render): `M8 53L32 44L56 53L32 62Z`. Every glyph keeps this base, this viewBox and this layer order; a glyph that needs a different base is a new family, not a variant. The radar base (`M7 54L32 42L57 54L32 64Z`) differs by 1–2 units (DIF-12): radar glyphs are redrawn onto the canonical base at DC-0, and the redrawn paths are the shipped asset — neither source file is copied verbatim into the package.
- **Layers, in paint order:** (1) `base` — the diamond, fill = info accent at 18 % over the card surface; (2) `face` — the glyph face path, fill = info accent at 75 % over the surface, stroke = info accent, stroke-width 1.5, round joins; (3) `line` — the glyph detail path, no fill, stroke = surface colour, stroke-width 2.5, round caps/joins; the `dark` line variant strokes in the info accent instead (the radar `join`/`graph`/`network` case, the #711 `link` flag). Layer colours resolve through icon tokens (`--st-component-diagramIcon-base/face/faceStroke/line/lineDark`, aliasing the semantic feedback-info and surface tokens); no per-glyph colour, no raw hex in the asset. The radar fixed palette (`#dceaff` / `#639dff` / `#3f7ae0` / `#e6f0ff` / `#3575d9`) is the measured origin of these mixes and is **not** shipped as values (DIF-13).
- **Stroke weights** are in 64-unit space (face 1.5, line 2.5) and scale with the icon box; they are family constants, not tokens a theme may retune without a parity re-run.
- **Text-bearing glyphs:** the radar set carries optional centred text (for example `S3` at 13 units, weight 750, surface fill). Text inside a pictogram is part of the glyph asset, never host-supplied content, and never localised.
- An unmapped glyph name draws nothing and raises `card-icon-unknown` / `zone-icon-unknown` (§5.1); the component never substitutes a default glyph (the #711 `diagramIcon` fallback to `server` on an unknown name is DIF-14, forbidden: a wrong icon drawn silently is worse than an empty slot with a diagnostic).

### 9.2 Inventory (DC-0 ships the union, redrawn on the canonical base)

| Source | Glyphs |
| --- | --- |
| radar-immobilier `fa8133c2` `service-icons.js` (19) | `s3`, `postgres`, `cluster`, `web`, `api`, `cronjob`, `identity`, `workstation`, `document`, `map`, `join`, `graph`, `check`, `release`, `user`, `url`, `llm`, `network`, `unknown` |
| sentropic #711 `architecture-icons.js` (9) | `people`, `window`, `server`, `brain`, `robot`, `link`, `db`, `shield`, `cloud` |
| Added for #711, mandatory (frozen) | `brain` (AI), `robot` (agents) — already in the #711 row; listed here because the frozen file names them explicitly |

Name collisions across the two sources are resolved at DC-0 by keeping both geometries under source-stable names where they differ (for example radar `cluster` ≠ #711 `server`); no glyph is silently overwritten by a same-named import. The zone→glyph mapping of the #711 scene (`groupIcons`: `h2a → people`, `surfaces → window`, `cluster-mesh → server`, `cm-catalog → window`, `cat-mcp → link`, `cm-storage → db`, `cm-security → shield`, `cm-cluster → link`, `cm-providers → cloud`, `engram → db`, `design-system → window`) is scene content of that diagram, not a DS mapping: the DS ships glyphs by name and profiles/scenes name the glyph per entity (§4.2). The influence dossier's 25-glyph set (`scene.mjs`) is geometry provenance for the family (same diamond/layer idea) and adds no shipped glyph beyond the union above unless DC-0's inventory review records it in the provenance ledger with its path data redrawn on the canonical base.

### 9.3 Delivery, licence, provenance

- **Subpath:** `@sentropic/design-system-svelte/diagram-icons` (explicit export in `packages/components-svelte/package.json`, alongside `"."`; DC-0). It exports the glyph registry (name → `{ base, face, line, darkLine?, text? }` path data on the canonical base) and a Svelte `DiagramIcon` renderer that paints the three layers from tokens. It is **never** exported from the main barrel, and importing `"."` must not resolve it (§5.6 witness). Other frameworks consume the same registry data through their staged adapters (§12.6); the path data is framework-neutral data in the package, not Svelte markup, so no framework re-draws a glyph.
- **Licence:** the pictograms are original Sentropic pictograms ("Original, local pictograms. These are service symbols, not vendor logos." — radar source header). They ship under the package's MIT licence (`packages/components-svelte` `license: MIT`); no third-party icon licence attaches, and no Lucide licence is incurred inside cards (Lucide is used only by the fold control through the existing DS dependency). The Inter font licence (SIL OFL 1.1, §2.2) does **not** ship: DC-0 ships no font (§10.2).
- **Provenance:** DC-0 writes `packages/components-svelte/src/lib/diagram-icons/PROVENANCE.md` recording, per glyph: shipped name, source repository + commit + file, canonical-base redraw (yes/no), layer notes. The licensing guard (`npm run licensing:check`) and `THIRD-PARTY-NOTICES.md` regeneration cover the package as for any publishable change; no new notice entry is expected (no third-party asset), and DC-0 asserts that expectation rather than assuming it.

## 10. Pixel parity and geometry checks

### 10.1 Principle

The portable render at the pinned merge is the pixel reference (DC-D8). Parity is a **test**, not an intention: DC-1/DC-2 each ship a failing-first parity harness, and a lot is not done while its parity items are red. Two comparison layers, both required: (a) **geometry** — boxes compared numerically (headless, no pixels); (b) **pixels** — raster comparison on the same boxes. Geometry catches drift pixels hide at small sizes; pixels catch paint (colour, stroke, glyph) drift geometry cannot see.

### 10.2 Visual parity test (method)

Following the #711 `check-browser.mjs` matrix shape and the dossier host-pair precedent (0.5 % of pixels differing):

1. **Fixture extraction.** At test time (never as a shipped copy), the harness extracts the reference from the pinned commit: `git -C <sentropic> show 4138a0ec…:docs/governance/governance-r11-portable.html` (sha256 asserted equal to `831cbdee…` before any comparison; a mismatch aborts the run as a fixture error, not a test failure). The DS-side corpus is the same FR/EN field set rendered by the portable's central scene: every card field and zone header of that scene, transcribed once into DS fixtures (a `SemanticDocument` + view state per fold state: all-collapsed, all-expanded, and the mixed folds the #711 browser run exercises), committed in the DS test tree with their source (scene id + field) recorded per fixture. HRPN scenes (Appendix C) are *additional* acceptance scenes (§12); they have no portable reference and are checked geometrically (§10.3) and by box equality against their `ViewDocument`, not by pixels against the HRPN PNGs (different renderer, different layout — visual comparison targets only, per their manifest).
2. **Rendering.** Headless Chromium (the repository's existing `puppeteer-core`/`playwright-core` + system Chromium shape; no new browser dependency). Both renders at 100 % and 300 %, in light and dark, FR and EN. The DS render runs standalone (§8.3) and in a laid-out scene; both are compared.
3. **Fonts (blocking).** Same font stack and sizes on both sides: the DS side resolves `--st-font-sans` to the same Inter stack the portable embeds. The test environment must provide Inter (the host's installed font); if Inter is absent the run is `unverified` for pixels and reports `source-gap: font` — it never passes on a fallback stack and never embeds the OFL subset into the package to force a pass. Text measurement for layout (§7.4) uses the same stack's measured advances, versioned (`measurerVersion`) so a font change invalidates memoised layouts (§7.4).
4. **Tolerance.** Boxes (card, zone frame, icon box, header text block, rule, footer, collapsed subtitle block) equal within **1 CSS px** per edge. Pixels: at most **0.5 % of pixels differing** per compared box (per-channel threshold set at DC-1 and recorded in the harness; anti-aliasing edge pixels are counted, not masked out — a harness that excludes edges to pass is a defect). Full-string presence: every fixture string is found complete in the rendered text (no ellipsis character `…` introduced by rendering, no clipped glyph box) — the 720-field zero-ellipsis corpus shape of #711, re-run on the DS corpus.
5. **Deviations.** Each §15 deviation (collapsed 200 vs 272, footer pin at all body counts, body glyph at 14, single non-scaling rule, token dark scheme) has its own assertion against the frozen value and is **excluded** from the portable box comparison by name in the harness, with the portable's measured value printed in the report. An exclusion not listed in §15 fails the run.
6. **Contrast.** The resolved-token matrix of L-R17(b) (every shipped theme × light/dark × tone: detachment ≥ 3:1 by fill or qualifying boundary, primary text ≥ 4.5:1, secondary/detail ≥ 4.5:1 on the fill) is computed on the DS token values, plus the #711 `contrast()` browser measurement (text ≥ 4.5, secondary ≥ 4.5, boundary-vs-fill ≥ 3) on the parity scenes. The #711 card's local secondary override (`#52656b`) is not reproduced; if the semantic secondary fails a row, the theme token is the fix (§5.5).

### 10.3 Geometry checks (equivalent to `check-geometry.mjs`)

DC-2 ships a headless geometry gate over every acceptance scene (central-scene fixtures + HRPN scenes) in every fold state the fold corpus enumerates, porting the 15 categories of `check-geometry.mjs` as failure categories with the same semantics: `crossings`, `sharedCorridors`, `headerIntrusions`, `borderOverlaps`, `labelCollisions`, `labelCardCollisions`, `edgeLabelCollisions`, `cardIntrusions`, `cardOverlaps`, `offCentreEndpoints`, `detachedEndpoints`, `detachedLabels`, `diagonals`, `selfEdges`, `missingArrows` — plus the structural assertions that precede them in that script, restated on frozen values:

- every leaf node is 460 × 200; every collapsed zone is 460 × 200 (not 272);
- collapsed header fits its box; expanded zone insets are exactly 4 (subtitle→rule), 16 (rule→children), 16 (children→bottom) with top/bottom balanced;
- zones in a row share `y` (0 deviation) and expanded zones in a row share the header-bottom line (children share a top);
- no unresolved `card-overflow` / `zone-overflow` / `card-icon-unknown` / `zone-icon-unknown` diagnostic exists in the scene;
- aggregated (folded) relations: no duplicated relation id, every cross-frame relation present exactly once, summary direction preserved (the `check-geometry.mjs` aggregation block, including its harness-reachability witness restated on the DS corpus);
- orthogonal routes only; endpoints banked symmetrically about the side centre (the off-centre bank rule, step ≥ 12 card px); labels centred on their carrier segment, clear of cards, headers and other labels by the engine metrics.

The gate runs in Node (no browser) over `ViewDocument` geometry, so it can run in CI without the parity browser; the browser assertions of §10.2 (computed-style equality zone↔card per role, collapsed centring within 0.02 px, footer inset 9.25 at each body count, rule gaps at 4, focus-ring behaviour, per-interaction < 1800 ms over the fold corpus) run in the browser harness. Neither harness substitutes for the other.

### 10.4 Text twin and accessibility (carried from the export contract)

Each diagram rendering carries the plain-text twin (cards grouped by container, then links) and `<title>`/`<desc>` equivalents (JSON render standard §10.12), generated from the same props the components render — one more reason body content is text props, not markup (§5.1). Collapsed zones contribute their header + subtitle to the twin; folded-away children do not disappear from the twin (collapse is view state, §4.3). Interactive surfaces meet the host's accessibility checks (keyboard reachability of every toggle and chip, `aria-expanded`, `aria-busy` during reflow, no `serious`/`critical` axe violation on the acceptance scenes) as part of DC-2/DC-3 acceptance.

## 11. Editable cards (Tiptap-style) — gated on RT-1

This section is specified in full and implemented only by lot DC-4, which **cannot start before RT-1** (the Svelte rich-text adapter, rich-text specification §12) passes its gate (DC-D9). At the measured base RT-0 is merged and private; RT-1 does not exist (§2.4). DC-4 adds no editor of its own and no fallback editor.

### 11.1 Which fields edit, and through what

In an editing host, each text slot of `DiagramCard` and the header slots of `DiagramZoneHeader` become inline-editable in place (no modal, no separate form): **kicker, title, body lines and footer** for the card; **title and subtitle** for the zone (the zone kicker is package identity, §6.3 — its editability is open question Q4, §17; until answered, DC-4 ships the zone kicker non-editable and the card kicker editable). Editing uses the rich-text editor component (`@sentropic/design-system-svelte/rich-text-editor`, profile P0 `focus.markdown.p0@1`: paragraphs with bold/italic/inline-code; everything else preserved) mounted on demand for the active field only, under the rich-text specification's controlled contract: value in (`RichTextDocument` projected from the field's current string), complete document + gesture provenance out, opaque block identities carried by the host adapter, no diff computed in the DS, external updates surfaced never overwritten, no network, language-free with injected messages and the `⟦untranslated:…⟧` marker.

Field ↔ editor projection (`ds-proposition`, fixed here): a card field is a single-field `RichTextDocument` whose blocks are the field's lines (body: one block per body line, in order; kicker/title/footer/subtitle: one block). The projection is derived from the profile attribute strings (§4.2) by the host adapter; the card component itself holds no `RichTextDocument` when not editing. Multi-paragraph field content beyond the field's line structure is preserved-block content under P0 and renders non-editable in place, exactly as the rich-text profile prescribes.

### 11.2 What an edit emits

A completed editing gesture (the rich-text component's single `onChange` for that gesture) is converted by the host adapter into a diagram-core transaction and emitted as a §4.6 `proposal` event:

```json
{ "event": "proposal",
  "transaction": {
    "commandId": "<host-allocated>",
    "baseRevision": 0,
    "commands": [
      { "kind": "update-entity-attributes",
        "entity": "entity:<id>",
        "attributes": { "footer": { "kind": "text", "value": "service: Sentropic" } } }
    ] } }
```

Rules: one proposal per completed gesture, carrying the complete new field value(s) for the edited entity (never a character diff — the Focus per-paragraph diff, where a Focus host needs one, is computed host-side by `@sentropic/focus/editing` against its retained baseline, as the rich-text specification §5.3 prescribes; the diagram host's equivalent is its own command application). The host applies the transaction with compare-and-swap on `baseRevision` (diagram-core `applyTransaction`: refusal returns diagnostics, including `revision-conflict` and profile refusals such as `text-too-long`), then supplies the new `(SemanticDocument, ViewDocument)`; the component re-renders from it. A refused proposal leaves the displayed document untouched and the local draft preserved in the still-mounted editor (host keeps it mounted and shows the refusal through its own diagnostics surface); the component applies no silent winner. Overflow after an edit (§5.4) is re-measured on the new value: an edit that makes a field overflow raises `card-overflow` on the next render and the host may refuse or accept-with-diagnostic under its own policy — the editor never truncates the field to fit (P0 has no card-length concept).

### 11.3 Non-editing hosts and states

`editable={false}` (or the host's viewer/locked state) renders every field as static text with the editor never mounted: typing, paste, drop and mutation shortcuts are inert because no editor exists to receive them (the rich-text viewer/locked rule, carried over). Switching `editable` takes effect without remounting the card (only the active field's editor mounts/unmounts). Locale/theme changes during editing follow the rich-text invariants (no remount, no identity change, caret/selection preserved). Unmount destroys the editor with no surviving listener, observer or pending capture (rich-text §5.9, asserted by DC-4's tests).

## 12. Lots, gates and acceptance items

Conventions: `[N]` new file, `[M]` modified file. Commands are the repository's real scripts (`package.json` at base: root `build`/`check`/`test`/`lint`/`verify`; per-package `build`/`check`/`test` as measured in §2.4). Targeted invocations name the workspace explicitly; a path fragment passed through a `vitest run src` script is never used to narrow a run (it combines by OR — the rich-text specification's measured warning). Every lot is RED-first: its parity/geometry items are written failing before the component code that turns them green. No Python anywhere (§0 header). Costs are not estimated here; gates are entry/exit conditions, not schedules.

### DC-0 — Tokens and pictograms

**Content.** (a) The token sets of §5.3/§6.4/§9.1 as component tokens (`packages/tokens` anatomy + compiled CSS variables, light and dark), including L-R17 alias bindings for card/zone fills and accents. (b) The pictogram registry + `DiagramIcon` on the `diagram-icons` subpath (§9.3) with `PROVENANCE.md`. (c) The card text measurer data (§7.4: per-character advances for the card roles on the DS font stack, versioned) as a framework-neutral module the layout host injects.

**Files.** `[N] packages/components-svelte/src/lib/diagram-icons/index.ts` (registry data), `[N] …/diagram-icons/DiagramIcon.svelte`, `[N] …/diagram-icons/PROVENANCE.md`, `[M] packages/components-svelte/package.json` (subpath export only — no barrel change), `[M] packages/tokens/src/component.ts` + compiled theme CSS inputs for the new anatomy leaves, `[N] packages/diagram-canvas/src/layout/card-metrics.ts` (measurer data + `cardTextMeasurer` factory; the engine package gains data, no DOM), `[N]` tests beside each.

**Gate.** Token compilation green (`npm run build` at root), licensing guard green with no new notice entry (§9.3 expectation asserted), packaging witness: importing `@sentropic/design-system-svelte` does not resolve the `diagram-icons` graph (and vice versa the subpath loads without the barrel's component graph beyond tokens).

**Acceptance.**
- CA-DC0-1: Every token of Appendix A exists with its frozen value (a test reads the compiled CSS and asserts each name/value pair, light and dark where the token is colour-valued).
- CA-DC0-2: The registry contains the full §9.2 union (28 glyph names before collision aliasing; each collision alias recorded in `PROVENANCE.md`), every glyph on the canonical base/viewBox with the three layers and frozen stroke weights; `brain` and `robot` present.
- CA-DC0-3: No raw hex in the registry or token definitions beyond token-definition fallbacks; glyph colours resolve through the icon tokens in light and dark (computed-style assertion).
- CA-DC0-4: Measurer: the ported advances reproduce the #711 wrapping of the parity corpus strings (same line breaks as `wrapText` on the corpus, both languages) at the recorded `measurerVersion`.

### DC-1 — Atomic card

**Content.** `DiagramCard` (§5) standalone + in-scene rendering, zero-ellipsis diagnostics, footer pin, single non-scaling rule, token-only colours, parity harness (§10.2, card scope) and its RED corpus.

**Files.** `[N] packages/components-svelte/src/lib/DiagramCard.svelte`, `[N] …/DiagramCard.test.ts`, `[N] …/diagram-card-parity/` (fixtures + harness, test-only), `[M] packages/components-svelte/src/lib/index.ts` (barrel export), `[M]` profile-side dependency: the §4.2 slot attributes must be declared by the profile in force for the accepted scenes — DC-1 records the declaring profile version it consumed and refuses card rendering (simple nodes) where undeclared (§4.2 rule), with a test for both branches.

**Gate.** DC-0 gate green. Package `check` + `test` green; root `verify` green (licensing at the unchanged publishable count — DC-1 adds no package).

**Acceptance.**
- CA-DC1-1: Fixed box: every rendered card measures 460 × 200 at 100 % and 300 %, standalone and in-scene; 0 px row/column deviation on the corpus scenes.
- CA-DC1-2: Pixel parity (§10.2) green on the card corpus (FR/EN × light/dark × 100 %/300 %), deviations only as listed in §15.
- CA-DC1-3: Zero-ellipsis: corpus renders every string complete (no introduced `…`, no clipped glyph); shipped card CSS contains no `ellipsis`, no line-clamp, no `nowrap` on card text (source scan).
- CA-DC1-4: Overflow: an over-long title/body/footer fixture raises `card-overflow` with slot + measured need/allocation through `onDiagnostic` and `data-card-overflow`, renders the complete string, and keeps the box at 460 × 200; an unknown `icon` name raises `card-icon-unknown` and draws no substitute glyph.
- CA-DC1-5: Footer inset 9.25 px (inner-edge measure) at body line counts 0, 1 and 2; rule at 1 screen px at overview scale (< 1:1) and at 300 %; rule gaps 4/4.
- CA-DC1-6: Token discipline: no hex literal, no locally redefined `--st-*` in the component (scan); dark scheme resolves with no white-forced surface (computed-style assertion).

### DC-2 — Wrapping card and fold mechanism

**Content.** `DiagramZone` + `DiagramZoneHeader` (§6), the toggle (§7.1), `DiagramZoneFoldBar` (§7.2), and the engine collapse input (§7.3: `diagram-canvas` `collapsedContainers` + `VisualGroup` recording + lifted relations), with the fold corpus, geometry gate (§10.3) and performance witness (§7.5).

**Files.** `[N] packages/components-svelte/src/lib/DiagramZone.svelte`, `[N] …/DiagramZoneHeader.svelte` (internal, not exported), `[N] …/DiagramZoneFoldBar.svelte`, `[N]` their tests + fold/geometry harnesses, `[M] packages/components-svelte/src/lib/index.ts`, `[M] packages/diagram-canvas/src/layout/types.ts` (`collapsedContainers` input), `[M] packages/diagram-canvas/src/layout/engine.ts` (+ place/route/dock modules as the implementation requires), `[N] packages/diagram-canvas` collapse tests (reflow, lifted relations, exact re-expansion, determinism under shuffled records).

**Gate.** DC-1 gate green. `diagram-canvas` and `components-svelte` `check`/`test` green. Dependency stated plainly: DC-2 is the first lot that touches the L8 engine's collapse behaviour (L-R15(c)); its engine items are prerequisites for DC-3.

**Acceptance.**
- CA-DC2-1: One header: every zone in the corpus (nested included, both states) renders through `DiagramZoneHeader` (component-instance assertion); computed styles of zone kicker/title/subtitle equal the card's kicker/title/body per role (weight 400 kicker included); icon 70 in zones and cards alike.
- CA-DC2-2: Kicker rule: corpus zones show the §6.3 kickers per locale with prefix-free titles; a title stored with a package prefix is a fixture defect the corpus check rejects; no kicker is derived from a title string (source scan for title-matching derivation in layout/component code).
- CA-DC2-3: Expanded rhythm 4/16/16 exact on DC-2 fixtures (subtitle→rule, rule→children, children→bottom), header follows content (a kicker-less zone's header is one line shorter in both states), title→subtitle rendered gap equal to the card's header→body gap within 0.02 px.
- CA-DC2-4: Collapsed: 460 × 200 at every nesting level; subtitle centred horizontally and vertically in the free area within 0.02 px, 16 px side margin inside the 16 px inset, per-line centring, no justification (no `textLength`/`lengthAdjust`/spacing change vs card body); collapsed overflow raises `zone-overflow`.
- CA-DC2-5: Fold semantics: toggling any zone reflows with zero `cardOverlaps` and zero §10.3 failures; ancestor collapse hides descendants regardless of their flags; re-expansion reproduces the pre-collapse canonical geometry byte-for-byte (`serialiseView`); incident relations lift per §7.3 (one-end, both-ends-same, two-containers cases).
- CA-DC2-6: Controls: toggle is the DS `IconButton` sm/ghost with Plus/Minus; keyboard focus shows the `:focus-visible` ring, subsequent mouse click shows none; chips bar emits identical intents; Expand/Collapse-all perform one layout pass; initial presentation is all-collapsed.
- CA-DC2-7: Performance (§7.5): 600 interactions + 240 stress toggles each < 1800 ms (timeout = assertion); 10 s idle witness green; no intermediate settled geometry painted during reflow (`aria-busy` coverage asserted).
- CA-DC2-8: Geometry gate (§10.3) green on the central corpus and on HRPN S2-asbuilt + S2-target in all enumerated fold states (S1/S3 join at DC-3).

### DC-3 — xyflow nodes

**Content.** `DiagramCardNode` / `DiagramZoneNode` (§8) on the `diagram-nodes` subpath: handles (§8.2), declared-vs-measured size feedback, drag-proposal contract, static fallback wiring, HRPN full-corpus acceptance.

**Files.** `[N] packages/components-svelte/src/lib/diagram-nodes/DiagramCardNode.svelte`, `[N] …/DiagramZoneNode.svelte`, `[N] …/relationRoute` adapter module (view → xyflow nodes/edges derivation, framework-neutral logic in the subpath), `[N]` their tests (including fixtures F-xy1/F-xy2 of §8.2: entity-endpoint-only view, and shared/parallel port view), `[M] packages/components-svelte/package.json` (subpath export), `[M]` the pinned `@xyflow/svelte` version recorded as an exact devDependency for tests (the L8 lot pins one exact version — 1.6.5 in the governance kit, 1.6.6 in the DS CSP probes at measurement; DC-3 records the version it qualified and ships no range in any consumer-facing manifest).

**Gate.** DC-2 gate green.

**Acceptance.**
- CA-DC3-1: Node boxes equal occurrence geometry within 1 CSS px (declared and measured modes); a forced mismatch raises `node-size-mismatch`; measured size fed back reproduces identical next-layout geometry on the corpus.
- CA-DC3-2: Handles: F-xy1 yields one handle per relation end on the docked sides (zero port occurrences); F-xy2 yields one handle per `PortOccurrence` with side/anchor/id preserved; handles invisible outside connect mode.
- CA-DC3-3: Drag end emits only the §8.1 `proposal` shape (`move-occurrence`/`geometry`); no `port`/`waypoints` placement ever emitted; host geometry wins on conflict (re-render from the answered `ViewDocument`).
- CA-DC3-4: Same `(SemanticDocument, ViewDocument)` renders the same node/edge sets in xyflow and in the static form, boxes within 1 CSS px; xyflow load failure renders the static form (no blank surface).
- CA-DC3-5: HRPN full corpus (all four scenes, Appendix C) laid out and rendered with the geometry gate green and card/zone boxes equal to their `ViewDocument` rectangles; S2-target's cleanliness (no removed/risk/dashed) preserved through the projection.
- CA-DC3-6: Packaging: importing `"."` resolves neither the `diagram-nodes` nor the `diagram-icons` graph; importing the subpath does not pull Tiptap/ProseMirror.

### DC-4 — Editable cards (gated on RT-1)

**Content.** §11 in full: inline editing of card kicker/title/body/footer and zone title/subtitle through the Svelte rich-text adapter, proposal emission, refusal handling, viewer lock.

**Entry gate (blocking).** RT-1 has passed its gate in the rich-text specification (Svelte adapter published at a pinned version with its RED list green). DC-4 records the exact pinned versions of `@sentropic/design-system-rich-text` and `@sentropic/design-system-svelte/rich-text-editor` it consumed. If RT-1 has not passed, DC-4 does not start and no substitute editor is built.

**Files.** `[N] packages/components-svelte/src/lib/diagram-editing/` (field↔editor projection + proposal builder, host-adapter shape), `[M] DiagramCard.svelte` / `DiagramZoneHeader.svelte` (editor mounting on the active field only), `[N]` tests (mount/edit/split/merge/paste/undo emission, refusal preservation, viewer-lock through paste and shortcuts, capture-during-composition via the rich-text deferred capture, unmount cleanliness).

**Acceptance.**
- CA-DC4-1: One completed gesture ⇒ exactly one `proposal` with the complete new field value as `update-entity-attributes` on the right entity/attribute and the rendered `baseRevision`; no diff-shaped payload anywhere in the emitted event (key inspection).
- CA-DC4-2: Host refusal (including `revision-conflict`) leaves the document and the local draft intact; host acceptance re-renders from the new state with identities preserved (split tail keeps the leading field identity per the rich-text carriage rules).
- CA-DC4-3: Viewer/locked: with `editable={false}` no editor mounts and paste/keyboard mutation paths change nothing and emit nothing.
- CA-DC4-4: Post-edit overflow re-measures and raises `card-overflow`/`zone-overflow` (§11.2); the editor never truncates to fit.
- CA-DC4-5: IME/composition: no capture or proposal mid-composition; the deferred capture resolves once with the committed revision (real-browser witness, as the rich-text RED 5 shape requires).

### 12.6 Other frameworks (staged)

React/Vue/Angular `DiagramCard`/`DiagramZone` adapters are staged after DC-3, one stage each, on the same tokens, measurer and (for nodes) handle derivation, each gated by: the same acceptance items executed against that framework's package, a real vertical scenario (mount, fold, edit where applicable, unmount) executed rather than type-checked, and parity recorded in the delivery note with any residue named. No catalogue or doc lists an adapter as available before its stage gate passes. The pictogram registry data (§9.3) and the token set (DC-0) are the shared substrate; no framework re-draws a glyph or re-declares a token.

## 13. Out of scope — staged later, with owners

| Item | Owner / vehicle | What this specification guarantees about it |
| --- | --- | --- |
| draw.io export keeping folds as collapsible groups | L8 dossier r3 (JSON render standard amendment) | The export consumes the same `ViewDocument` collapse state (§4.3); §10.12's state-preserving export rule is the input contract. No draw.io shape is defined here. |
| Legend inside the diagram | L8 dossier r3 (same vehicle; L-R11 keeps legends out of L8 until a profile declares kinds) | Cards/zones reserve no legend box and no legend token; a future legend must not move a card box (geometry invariance rule §5.2 applies to it as an appearance addition only if it stays outside card rectangles). |
| Editable / re-connectable edges (re-connection, inline label editing as host-applied proposals in diagram-core) | sentropic Track `01M5F3XSAJC2H6S9ZREP7JFFJ6` (frozen file §"Edges") | Non-blocking for every DC lot. Handles (§8.2) are drawn so a future connect mode can reuse them; no edge proposal shape is defined here beyond the drag `move-occurrence` rule of §8.1. |

Nothing else is staged by implication: an item not listed here and not in §12 is not part of this specification's delivery.

## 14. Consumer note — hrpolnav (HRPN dossier)

hrpolnav will reuse `DiagramCard`, `DiagramZone` and the fold mechanism for the HRPN dossier, consuming the HRPN scenes through the `generic@1` projection (Appendix C) instead of its current chain renderer. hrpolnav today carries a **provisional copy of the #711 kit** (its `ServiceNode.svelte` chain copy and scene styles). That provisional copy is **deleted at the switch-over delivery**, which is **lot DC-3**: DC-3 is the first lot that gives hrpolnav the xyflow node forms its dossier renders with (CA-DC3-5 runs the full HRPN corpus). DC-1/DC-2 give it the standalone components and the fold engine, but its rendered dossier switches only when the node wrappers land. The deletion happens in the hrpolnav repository's own switch-over change (consuming the pinned DS version by path + version, as its fixture manifest prescribes); this specification deletes nothing outside this repository and the DS lots never import an hrpolnav file. HRPN tint semantics stay hrpolnav's (§4.2): its consumer mapping resolves tints to DS tone tokens, and the DS ships no `genair`/`specific`/`added`/`removed`/`risk` token.

## 15. Differences between the #711 code and the frozen requirements

Each row: the frozen value governs; the code value is recorded so DC lots assert the frozen one and §10 excludes exactly these points from portable box comparison. "Code" means the pinned merge `4138a0ec` (validated head `6bb35155`) unless a locator says otherwise.

| ID | Point | Frozen requirement (governs) | #711 code as measured | Consequence for DC lots |
| --- | --- | --- | --- | --- |
| DIF-01 | Collapsed zone size | 460 × 200 at every nesting level | `COLLAPSED_CARD_HEIGHT = 272` (`governance-layout.js`); `check-geometry.mjs` and the browser matrix assert 460 × 272 | DC-2 asserts 460 × 200; collapsed-height boxes are excluded from portable comparison by name (§10.2 step 5). The portable's collapsed scenes will differ in height — expected, reported, not a failure. |
| DIF-02 | Ellipsis / clipping | No ellipsis ever; overflow ⇒ diagnostic; no clipping | `hrpolnav-card.js`: `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`, then `-webkit-line-clamp: 1` on title/body slots; card root `overflow: hidden` | DC-1 ships none of these (§5.4 scan, CA-DC1-3). The browser witness already fails clipped text; the CSS declarations themselves are removed, not merely unused. |
| DIF-03 | Zone corner radius | Square (0), as the cards | Group rect `rx="6"` in markup, forced to 0 only by the dossier style rule `[data-card-style="dossier"] .diagram-group-box { rx: 0 }` | DC-2 tokenises radius 0 in the component (§6.4); no style-mode override. Open question Q1 (§17) is the only path to a non-zero zone radius. |
| DIF-04 | Footer pin | Footer pinned to the bottom; bottom inset 9.25 at any body line count | No pin construct: footer follows the rule in flow; 9.25 holds only because the fixed content sum (≈198.6 px) fills the 200 px box | DC-1 implements the pin (§5.4) and asserts 9.25 at body counts 0/1/2. Portable comparison at the portable's own body counts stays valid. |
| DIF-05 | Body left inset | Accent bar → first glyph 14 px (original 10 + 4) | Border-box sum: accent 8 + padding 8 + body extra 4 = glyph at 20 px from the card edge (header glyph line at 16) | Token frozen at 14 with the §5.3 decomposition (8 + 2 + 4). DC-1 measures the glyph position (text-range box), not the CSS. If the parity corpus shows the portable's body glyph at 20, the report prints both values under this ID. |
| DIF-06 | Card colours | Tokens only; dark via the semantic layer | Local overrides: border-strong `#607b82`, category1 `#145f68`, surface `#fff`, text `#172033`, secondary override `#52656b` (`hrpolnav-card.js`), hard-coded `#172033` fills in `architecture-svg.js` | DC-0/DC-1 define aliases only; the contrast matrix (§10.2 step 6) is run on resolved DS tokens. A failing row changes a theme token, never a component. |
| DIF-07 | Rule construction | One rule, 1 screen px at every zoom | Two rules: HTML `.card-rule` (scales with zoom) + SVG overlay line with `non-scaling-stroke` | DC-1 keeps only the non-scaling form (§5.4). The HTML rule in the portable is part of its foreignObject device, not a second visual. |
| DIF-08 | Title/footer font | DS font stack via `--st-font-sans`, no shipped font | Embedded `Dossier Inter` 700 subset (OFL) for titles/footers; body in Inter/system stack | No font ships (DC-0). Parity requires the host Inter (§10.2 step 3); absent Inter the pixel layer is `unverified`, geometry still runs. |
| DIF-09 | Dark scheme, zones | Token-resolved dark fills/borders | `@media (prefers-color-scheme: dark)`: zone fill forced `#fff`, stroke `#718c93` | Forbidden shape (§5.5). DC-2 asserts token-resolved dark values with no forced white. |
| DIF-10 | Zone kicker derivation | Kicker is supplied package content per locale (§6.3) | Derived in layout code from group id and by regex/substring matching on titles (`/h2a/i`, `/engram/i`, `/\bDS\b/…`, title `=== 'Access surfaces'`) | Forbidden. DC-2 scans layout/component code for title-derived kickers (CA-DC2-2). Producers supply kickers through profile attributes (§4.2). |
| DIF-11 | Title capitalisation | Titles render exactly as stored | `groupContent` rewrites `· (\p{Ll})` to uppercase in zone titles during layout | Forbidden transform (§6.5). No layout or component code rewrites title case. |
| DIF-12 | Pictogram base diamond | One canonical base for the family | #711: `M8 53L32 44L56 53L32 62Z`; radar: `M7 54L32 42L57 54L32 64Z` | Canonical = #711 base (§9.1); radar glyphs redrawn at DC-0. Provenance ledger records the redraw per glyph. |
| DIF-13 | Pictogram palette | Token-resolved layers (info mixes) | Radar: fixed hex (`#dceaff`/`#639dff`/`#3f7ae0`/`#e6f0ff`/`#3575d9`); #711: token `color-mix` layers | Ship the #711 token form (§9.1). Radar hex values are provenance notes, never token values. |
| DIF-14 | Unknown icon name | No icon drawn + diagnostic | `diagramIcon` falls back to the `server` glyph on an unknown name | Forbidden (§9.1). DC-0/DC-1 assert the diagnostic and the empty slot. |
| DIF-15 | Icon default size | 70 in cards and zones | `diagramIcon(name, x, y, size = 42)` default 42; governance callers pass 70 explicitly | The DS component has no sub-70 default: the icon box token is 70 and the renderer always draws at the box (§9.1). |
| DIF-16 | Zone spacing tolerances | 4 / 16 / 16, top and bottom balanced | Geometry gate allows `|top − bottom| ≤ 2` on prepared scenes; browser witness asserts the rule gap at 0.02 but the bottom balance only within 2 | DC-2 asserts 4/16/16 exactly on its own fixtures (§6.2). The 2 px legacy tolerance is not carried into DS fixtures. |
| DIF-17 | Fold control size | DS `IconButton` (frozen file: the DS Lucide IconButton) | DS sm box is 32 px; L-R15(d) (L8 amendment) caps the control face at 28 × 28 | The frozen file governs: the control is the stock DS `IconButton` sm. §16 requires L-R15(d)'s bound to change; DC-2 adds no shrunk control variant. |

No other material difference was found: kicker weight 400 in zones (the bold-kicker defect of the raw feedback is already fixed in the pinned code and asserted equal to the card's), zone/card typography equality, icon 70 at governance call sites, subtitle→rule gap 4, rule→children 16, bottom 16, row alignment and header equalisation, collapsed subtitle centring geometry (inset 16 + margin 16, per-line centre, no justification), the `:focus-visible`-only ring, initial all-collapsed state, Expand/Collapse-all + chips bar behaviour, edge aggregation correctness, and the idle/1.8 s performance budgets all measure as the frozen file states.

## 16. Changes required in L-R16 (and neighbours) in the JSON render standard

This specification is the component specification L-R16 will point to. L-R16 as written on `spec/l8-dossier-diagrams` (§10.10) was drafted **before** owner validation of #711: every value there is marked "provisional — awaiting owner validation of #711", its reference is `02d04247` (portable sha256 `51aa62cb…`), and its parity test is "RED until the owner-validated #711 SHA … [is] relayed". Validation happened on 2026-10-21 and this specification freezes the values from `4138a0ec` / `6bb35155` (portable `831cbdee…`). The L8 spec must therefore change as follows. No L-R16 text is edited by this delivery; the edits land with the L8 lot that opens the amendment, and until they land the list below is the record of divergence.

| ID | Location (L8 amendment) | Required change |
| --- | --- | --- |
| LR16-C1 | §10.10 preamble + L-R16(c) status | Remove every "provisional — awaiting owner validation of #711" mark. Replace the reference pin `02d04247` / `51aa62cb…` with merge `4138a0ec`, validated head `6bb35155`, portable sha256 `831cbdee…` (this specification's header). The values are frozen, not provisional. |
| LR16-C2 | L-R16(b) component shape | Replace `DiagramCard` props `icon, kicker, title, lines[], footer, tone, size: 'auto' \| 'fixed'` with §5.1/§6.1 of this specification: no `size` prop (fixed only), `body` lines with the detail-tone rule, `entityId`, diagnostics events. The `auto` variant (grow-to-fit) contradicts the frozen never-grows rule and is deleted for diagram cards; L-R12's size-to-content continues to govern simple label nodes only. |
| LR16-C3 | L-R16(c) token list | Freeze each listed value (delete "Reference values are those of … with the footer correction" provisional framing), and add the tokens L-R16 lacks: full typography set (kicker 22/400/1.3 + 0.04em tracking, body/footer 24 with weights 400/700), `bodyInsetFromBar` decomposition as fixed in §5.3, `ruleInsetStart/End` 16/10, zone set of §6.4 (header inset, subtitle gap alias, 4/16/16 insets, collapsed 460 × 200 — L-R16 currently gives no collapsed size), focus/toggle reference to the stock `IconButton`. The sentence "The decomposition of the 14 px body inset … is fixed by the pixel-parity lot, not frozen here" is superseded: the decomposition is frozen in §5.3. |
| LR16-C4 | L-R16(b) zero-ellipsis + diagnostic | Keep the policy; rename/align the diagnostic contract with §5.4 (`card-overflow`/`zone-overflow` with slot + measured need/allocation, data-attribute mirroring, host surfacing, geometry-gate failure). L-R16's "in `auto` when growth is impossible" branch is deleted with the `auto` variant. |
| LR16-C5 | New: kicker naming + header rules | Add the §6.3 kicker table (including `SENTROPIC & 3RD PARTIES` / `SENTROPIC & TIERS` and sub-zone `SENTROPIC`), the prefix-free title rule, the one-header-component rule with header-follows-content (no reserved line), and the title-case non-transform rule (§6.5). None of these exists in L-R16 today. |
| LR16-C6 | L-R16(f) + §10.11 handles | Point the component reference here for props/geometry; keep §10.11's two-kind handle derivation as the DS contract and delete any reading under which the radar 4×10×2 slot grid is required (§8.2). State the measured-size feedback rule (node box == occurrence box within 1 CSS px, `node-size-mismatch`) in §10.11 terms. |
| LR16-C7 | L-R16(g) pixel parity | Replace the RED-until-relayed gate with this specification's §10: pinned portable `831cbdee…`, fixture extraction by `git show` with hash assertion, FR/EN corpus, 1 CSS px boxes, 0.5 % pixels, Inter font rule (`unverified`/`source-gap: font` without it), named deviations (§15) excluded by ID. The test turns GREEN only against the frozen values, by implementation, not by a further relay. |
| LR16-C8 | L-R16(e) icons | Update the inventory to the §9.2 union (radar 19 + #711 9, `brain`/`robot` mandatory), the canonical #711 base diamond (radar base superseded), token-resolved layers (radar fixed hex not shipped), unknown-name diagnostic (no `server` fallback), and the subpath name `@sentropic/design-system-svelte/diagram-icons` (L-R16 gives it only as an example). Licence/provenance per §9.3. |
| LR16-C9 | L-R15(c) collapse size | "keeps the container's own occurrence at header size" / "collapsed width is its header only" is superseded for `DiagramZone` by the frozen 460 × 200 collapsed size at every nesting level (§6.2). L-R15(c)'s engine-input semantics (`collapsedContainers`, lifted relations, exact re-expansion, direction caveat) stand unchanged and are implemented by DC-2. |
| LR16-C10 | L-R15(d) control | Replace "DS chevron glyph", "never a text +/−" framing and the "at most 28 × 28 CSS px" bound with §7.1: stock DS `IconButton` sm/ghost, Lucide Plus/Minus icons, `aria-expanded`, `:focus-visible`-only ring, host-supplied label. The measured 64 × 56 face remains the RED witness for oversize; the DS sm box (32 px) is the conforming size. |
| LR16-C11 | L-R15(b) spacing vs frozen zone insets | State explicitly that L-R15(b)'s engine metrics (`nodeGap` 24, `rankGap` 56, `containerPadding` 16) govern sibling/rank spacing generally, while inside a `DiagramZone` the frozen 4/16/16 rhythm and the §6.4 insets govern header/content spacing; the #711 scene gutters (160/72) are not engine values. No metric value changes. |
| LR16-C12 | §10.11 bulk fold controls | The `collapse`/`expand` intent vocabulary stands. Add the mapping for `DiagramZoneFoldBar` chips and Expand all / Collapse all (bulk application, one layout pass, §7.2) to the §10.11 contract-module rows, one row per callback as §4.6 requires. §4.6's own text needs no change. |
| LR16-C13 | §10.12 export note | Add a forward note only: folds export as draw.io collapsible groups and the in-diagram legend are L8 r3 work (§13 here); §10.12's state-preserving one-computation rule is unchanged and is the input those lots consume. |

Consistency check against the rest of the standard: L-R13/L-R14 need no change (fold adds obstacles, no routing mode — §7.3); L-R17's tone/fill/contrast machinery is consumed unchanged (§5.5, §10.2 step 6) except that its "provisional insets of L-R16(c)" acceptance phrase follows LR16-C3; the rich-text standard's §11.2.1 pin is untouched by this specification (DC-4 consumes the editor, it does not re-pin Focus). The L8 open questions Q1/Q2 of its §10.14 are unaffected except as §17 Q1 below restates the zone-radius part for these components.

## 17. Open questions (owner choices only)

Each question is answerable in the form « Q1 A ». A recommendation follows from the measurements above. Until the owner answers, the stated default stands and no lot claims the contested behaviour. Everything else in this specification is settled from the cited sources.

- **Q1 — Zone corner radius.** A: square (0), as the atomic cards (the token default in §6.4; the #711 dossier style already forces square). B: 6 px zone radius (the #711 markup default) with square cards. **Recommendation: A** — one box shape reads as one system, and the owner already ruled visible radius out on the cards (« strictement invisibles »).
- **Q2 — Collapsed-zone content beyond the subtitle.** A: header + centred subtitle only (as frozen and as #711 renders); folded children contribute nothing visual beyond the subtitle. B: add a child-count badge on collapsed zones (new token + new parity surface). **Recommendation: A** — the frozen collapsed card is already fully specified; a badge invents content the owner never asked to read at a glance.
- **Q3 — HRPN tint vocabulary.** A: HRPN tints stay consumer semantics mapped by hrpolnav onto L-R17 tones (§14; DS ships no HRPN token). B: the DS ships the five HRPN tints as first-class tone tokens for any consumer. **Recommendation: A** — the tints encode one programme's provenance/delta semantics; generalising them would freeze another team's vocabulary into the DS without a second consumer.
- **Q4 — Zone kicker editability (DC-4).** A: zone kickers stay non-editable (package identity, §6.3); card kickers, titles, bodies, footers and zone titles/subtitles edit. B: zone kickers edit like any field, with the naming table reduced to guidance. **Recommendation: A** — an edited kicker can silently break the package-naming rule that the frozen requirements impose on every zone; identity strings should change through the profile, not inline.

## Appendix A. Frozen token list (consolidated)

Atomic card (`--st-component-diagramCard-*`): width 460px; height 200px; radius 0; borderWidth 2px; accentWidth 8px; padding 8px; headerInset 16px; iconSize 70px; iconTextGap 6px; kicker 22px/400/1.3, letterSpacing 0.04em, uppercase; title 32px/700/1.3; gap 6px; body 24px/400/1.3; bodyInsetFromBar 14px (8 + 2 + 4); ruleHeight 1px (1 screen px at every zoom); ruleMargin 4px; ruleInsetStart 16px; ruleInsetEnd 10px; footer 24px/700/1.3; footerBottomInset 9.25px; families `var(--st-font-sans)`.

Wrapping card (`--st-component-diagramZone-*`): radius 0 (Q1); borderWidth 1.5px; headerInset 16px; iconSize 70px; iconTextGap 6px; kicker/title aliased to the card tokens; subtitle 24px/400/1.3; subtitleGap = card rendered gap; headerRuleGap 4px; contentInsetTop 16px; contentInsetBottom 16px; contentInsetInline 16px; collapsedWidth 460px; collapsedHeight 200px; collapsedInset 16px; collapsedSubtitleMarginInline 16px; toggle = DS `IconButton` sm.

Pictograms (`--st-component-diagramIcon-*`): viewBox 64; base `M8 53L32 44L56 53L32 62Z`; face stroke 1.5; line stroke 2.5; layers base (info 18 %), face (info 75 % + stroke), line (surface; dark variant info) — all resolved through semantic tokens. Colours everywhere resolve through `--st-semantic-*` (border-strong, border-subtle with `#bdcad0` as the token fallback only, surface-raised, text-primary, text-secondary, tone accents of L-R17); no component carries a hex value.

Performance (not tokens, frozen budgets): no continuous work at idle (10 s witness: task < 100 ms, script < 10 ms, 0 RAF, 0 ResizeObserver); worst fold interaction < 1800 ms over 600 interactions + 240 stress toggles; timeouts never raised.

## Appendix B. Pictogram inventory (shipped set, DC-0)

Radar origin (`fa8133c2`, 19): `s3` (text "S3"), `postgres`, `cluster`, `web`, `api`, `cronjob`, `identity`, `workstation`, `document`, `map`, `join` (dark line), `graph` (dark line), `check`, `release`, `user`, `url`, `llm`, `network` (dark line), `unknown`. #711 set (9): `people`, `window`, `server`, `brain`, `robot`, `link` (dark line flag), `db`, `shield`, `cloud`. Mandatory frozen additions are `brain` and `robot` (already in the #711 set). All redrawn on the canonical base of §9.1; per-glyph provenance in `PROVENANCE.md` (DC-0, CA-DC0-2). The #711 zone mapping (`groupIcons`, §9.2) is scene content, not part of the shipped set.

## Appendix C. Acceptance scenes (HRPN fixtures, by path + sha256)

Consumed read-only from `/home/antoinefa/src/airbus-genair-hrpolnav/docs/architecture/hrpn/ds-fixtures/` (`MANIFEST.md` sha256 `9558092fa2af669af9dcd4df6d9380e24a1cba723dbdd603ad2ebd86c6439a49`). Counts are cards/zones/relations.

| Scene file | sha256 | Counts | Notes for acceptance |
| --- | --- | --- | --- |
| `S2-asbuilt.json` | `7abc427f7beca5b0f87947efc9df4daf6316f24725074f47f1da2b04be76ba2e` | 41/17/44 (37 solid, 7 dashed) | tints: genair 20, none 6, risk 12, specific 3 |
| `S2-target.json` | `28a7271dd0bec89fa9ad435174a614ab4a40b346b10724da95736f9c55b574d9` | 51/22/54 (54 solid) | clean: no removed, no risk, no dashed link (CA-DC3-5) |
| `S1-conversational.json` | `d9f7f7cb80894b5301e11cc7b7f0fc2775d1933aa15013152001395d716a32c7` | 23/17/24 (14 solid, 10 dashed) | smallest scene; fold-corpus baseline |
| `S3-agentfactory.json` | `e362b9a8da84082e5389127ae463d282fb773ef8950f41017222e0b3ef9002fc` | 37/15/36 (33 solid, 3 dashed) | includes 1 removed, 4 risk |
| `tint-legend.json` | `cc47a3e3a2019af8c436ce28a34d0d52d71b8439cf55a44a33f1c0239752a26d` | — | closed tint set; consumer mapping only (§14) |
| `reference-renders.json` | `7afee15ef473389452011d38fbaf8547973b5eed572440cc0c31ee8d921e25db` | — | reference PNGs are visual targets only (§10.2 step 1) |

Generator checks the manifest records (counts equal to the build output, unique ids, relation endpoints are cards, parents are zones, closed tint set, `generic@1` limits, no geometry key in any fixture) are preconditions the DS harness re-asserts on load; a fixture failing them is a fixture error, not a DS test failure. Scene hashes and PNG hashes are in the manifest and are asserted by the DC-3 harness before use.



