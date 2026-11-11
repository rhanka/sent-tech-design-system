# SPEC EVOL — DC-2a: row-pack 16:9 autolayout, zoom cap and orientation for `diagram-canvas`

| Field | Value |
| --- | --- |
| Status | Specification only. No implementation, test run, admission or publication is claimed. The code lot (§10) implements this document. |
| Card | DC-2a in `packages/diagram-canvas` (layout) plus creation of the scene host `DiagramSceneFigure` (§6.7, lot L4). Siblings: DC-2b (performance), DC-2c (C4 typed cards, later), CARDS DC-3 (figure contract, §7.6 of `SPEC_EVOL_DS_DIAGRAM_CARDS.md`). |
| Owner decision | A1 (DLR-004, DLR-387): the design system (DS) owns autolayout and routing for every diagram dossier. No consumer keeps a private packer. |
| Register rows | DLR-385, DLR-386, DLR-387, DLR-388 in `docs/diagram-library/OWNER-REQUIREMENTS.md` §2.22. Adjacent: DLR-040/041/044, DLR-319, DLR-322/392 (DC-2b), DLR-384 (routing, pending). |
| Inputs | `dc2a-inputs.md` §DC-2a (2026-11-08), owner feedback 11/11 on the architecture-cards dossier (§1.1), and the two normative owner requirements of 11/11 in §1.1 (16:9 readability / appropriate zoom; token spacing with no empty lanes). |
| Baseline | Worktree `.dc2a-wt`, branch `spec/dc2a-rowpack-autolayout` from `origin/main`. Engine files cited at this baseline. |
| Tooling | Node/TypeScript only. No Python. Vitest geometry (§9); browser only in CI/manual. |
| Reference algorithm | Read and generalised, never copied (§3.1). Its constants, identifiers and text do not enter DS source. |
| Acceptance scenes | Eight case ids (§1.3, Appendix A): `case-a`, `case-b`, `case-c`, `case-d`, `ajout-preprod`, `migration-cluster-mesh`, `vue-globale`, `case-skills-r9`. Referenced by id only; the source folders are not committed as dossier content (fixture clearance, §9.2). |

SHALL and MUST NOT are normative. `measured-code` pins a baseline observation. `decision` states a ruling here. `unverified` names a value the code lot must measure (§7.4).

## Decisions

Choices left open by the independent review are settled here. Each line is tagged `conductor decide-and-trace`.

| ID | Choice settled | Tag |
| --- | --- | --- |
| DEC-1 | B1: hard admissibility rule (all-singleton candidate inadmissible for n ≥ 2) instead of raising `tallBias`. The score alone does not guarantee AC-2 at chrome 0. | `conductor decide-and-trace` |
| DEC-2 | B3: create `DiagramSceneFigure` in `packages/components-svelte` (lot L4, priced) instead of deferring Z/T acceptance to a consumer lot. AC-13/AC-14/AC-18 therefore have a component under test in this repo. | `conductor decide-and-trace` |
| DEC-3 | M6: zero label-box/card overlaps and zero `label-unplaced` on every acceptance view, instead of a tolerated count. A view that cannot place a label inside the capped gutters fails by name. | `conductor decide-and-trace` |
| DEC-4 | §5: readout `100 %` denotes `MAX_DISPLAY_SCALE` (starting proxy 0.62), not zoom 1.0. Camera `zoom` stays CSS px per world unit (`transform.ts`); the interactive maximum is `MAX_DISPLAY_SCALE`, and `% = round(zoom / MAX_DISPLAY_SCALE × 100)`. | `conductor decide-and-trace` |
| DEC-5 | Fit uses one bbox shared with DC-2b: the scene `bounds` (union of node rects, edge bounds, ports and label boxes, `scene.ts`), not the §7 entity-only bbox. §7 keeps its entity-only bbox for aspect/fill only. | `conductor decide-and-trace` |
| DEC-6 | Gap caps bind both axes at 32 px by default (`gapInlineMax` = `gapBlockMax` = 32). Edge/label clearance is absorbed inside the cap; a label that needs more is `label-unplaced`, never a wider gutter. | `conductor decide-and-trace` |
| DEC-7 | §7.3 counts **visible leaves**: a visible leaf card counts 1, a visible collapsed occurrence counts 1; expanded containers and legend keys count 0. Retained occurrences never gate aspect/fill. | `conductor decide-and-trace` |

## 1. Problem

### 1.1 Owner inputs

Earlier inputs (`dc2a-inputs.md` §DC-2a, quoted character for character):

> « d ou vient cette horreur de verticalisation infinie sans respect de l'occupation de l'espace 16:9, avec en plus des espaces enormes ? … » ; « … j'aime bien le repliement, le pb est surtout l'autolayout qui va pas » ; « dis moi qui gere ca imméeiatement ».

> « faut que tu résolves cette merde avec le design system (vertical / cherche le 16:9 de base dans les affichages d'autolayout et évite les espaces vides verticaux gigantesques) ».

Normative input — owner feedback 11/11 on the architecture-cards dossier (source: `owner-20261111/owner-verbatim.txt` with `zoom-beyond-max.png` and `vertical-gaps-case-b.png` in the same handoff folder). Verbatim, in full:

> « pour les dossiers d'arhci: cas a : ok / cas b : ko pas possibilité d'unzoom et possibilité de zoom inituile on est au dela de la taille normale max de la carte deja demandée (a voir avec DS) + on a encore des diagrammes vertical a espacement intercomposant bcp trop grand. j'avai sdemandsé uun auto layout qui permette de passer de vertical a horizonal en fonction des depliement de boite. peut être avec un delpacement smooth d'ailleurs pour faciliter - l'objecti de L'autolayout est d'optimiser le remplisage de l'espace 16:9 et la lisibilité). a voir avec design system, mais donc la c'est ko ko / cas c,d: encore trop d'espace vertical entre composants / il manque un cas complexe comme la transition ajoute de preprod ou une migration de changement topologique d'archi (immo/sentropic vers cluster mesh) comme dossier d'illustration / + le diagramme global de sentropic (h2a/engram/sentropic/design system) / + le diagramme général d4o d'airbus (anonymisé, tu parles juste de fonctions sans citer la source) ou l'on est plus sur une architecture de capabilities / + le diagramme genair avec exemple de diff hrpn (anonymisé) / J'ai besoin aussi de diagrammes alternatifs: cas hldd de airbus sans citer airbus : diagramme process archimate etc (reprendre les layer de vues archimate du dossier gcp ai plateform, en anonymisant totalement) / si on a tous ces cas, on pourra avancer proprement sur la skil archi et sur les outils design system »

Normative new requirements — owner, 11/11 (screenshots in `owner-20261111/`, notably `spacing-skills-r9.png`):

> « la contrainte de lisibilité 16:9 et de zoom approprié (les cartes sont bcp trop grandes la il faut vraiment une taille max appropriée) »

> « trop d'espace vertical et meme horizontal entre les box, vraiment le design system doit fixer ca »

This revision turns the feedback into five normative requirement groups:

1. **Zoom.** Zoom-in is capped at an appropriate maximum display scale well below the 460 × 200 natural card size (§5, AC-13, AC-22). Zoom-out must exist; fit-to-view on both axes against 16:9 is the zoom-out path; reset returns to fit (AC-14, AC-23).
2. **Autolayout orientation.** Stacking switches between vertical (columns) and horizontal (rows) according to which boxes are unfolded, with a smooth transition that respects `prefers-reduced-motion`. Objective: optimise filling of the 16:9 frame and readability (§4, AC-16–AC-18).
3. **Vertical spacing.** Inter-component vertical spacing, far too large in cases b, c, d, is capped by token (§3.5, AC-3, AC-19).
4. **Both-axis spacing, no empty lanes.** Sibling spacing on both axes is computed from tokens plus actual edge/label clearance; no empty lane is reserved where no edge passes; sibling cards with no edge between them use the small token gap (§3.5, AC-24, AC-25).
5. **Label readability.** Edge labels must stay readable inside the capped gutters: zero overlaps, zero unplaced labels on the acceptance views (§7, AC-21), and rendered label sizes gate the display-scale calibration (§5.3).

The additional anonymised illustration dossiers named in the same feedback (capabilities, HR-flow diff, ArchiMate layers) are **not** DC-2a acceptance scenes. They need their own anonymisation review and owner ratification before any copying, and are out of scope here (§2, §9.2).

Register mapping: DLR-385 = the verticalisation defect; DLR-386 = folding is kept, DC-2a MUST NOT weaken folding to fix placement; DLR-387 = ownership (Decision A1); DLR-388 = the DS fix (16:9 base target, no giant vertical bands; AC-1–AC-3, AC-19, AC-20, AC-24, AC-25).

### 1.2 What the owner rejected

Expanded zones and the root lay children out as one vertical column: unbounded downward growth, empty horizontal space, tall strips with giant vertical bands, far from 16:9. Folding is not the complaint (a folded zone is one accepted 460 × 200 card); placement of *visible* children at every level is. Evidence split: the beyond-max zoom capability and the missing zoom-out are established by `owner-verbatim.txt:1`; `zoom-beyond-max.png` (captured at 79 %, `+` enabled as expected at that level) witnesses the chrome and the « 100 % = taille des cartes » readout; `vertical-gaps-case-b.png` witnesses case-b systems in one column with white bands of card-height order between zones, the bands also carrying the edge-label boxes (see §7 label gate).

### 1.3 Witnesses and acceptance scenes

Earlier witnesses: `owner-feedback-30.png` … `-39.png` (`-31` absent) and `-42.png` (2-children shape, AC-2 reproduction); reference `autolayout.js` (`c741e9e5…`) and `cluster-scenes.js` (`2edb27cc…`), read, never copied. Consumer renders are context, not oracles.

Acceptance scenes. Each case folder holds `<case>.semantic.json` (`archi@1` + `generic@2` legend), `<case>.views.json` (`view@2`, provenance `none`) and `<case>.card.md` (intent, fold states, owner verdict). This spec references them by case id only. The code lot SHALL copy **only** the cases listed below into DS test fixtures, after the recorded clearance line of §9.2; no other dossier content, and none of the anonymised dossiers named in §1.1, is copied.

Counts below are recomputed from `views.json`: **retained** = occurrences retained by the view (including occurrences hidden under a collapsed ancestor); **visible** = occurrences not hidden by a collapsed ancestor. `counts.elements` in the files is a third series and gates nothing. A **visible leaf** (DEC-7) is a visible leaf card or a visible collapsed occurrence.

| Case | Views in `<case>.views.json` | Retained / visible per view | Owner status |
| --- | --- | --- | --- |
| `case-a` | `unfolded`, `pkg-folded`, `track-folded` | — (view ids gate; counts pinned by L0) | ok — stays as is (regression scene) |
| `case-b` | `unfolded`, `mesh-engram-folded`, `folded` | — (view ids gate; counts pinned by L0) | ko — zoom + vertical spacing (fix required) |
| `case-c` | `unfolded`, `lib-folded`, `folded` | — (view ids gate; counts pinned by L0) | spacing reserve (fix required) |
| `case-d` | `unfolded`, `folded` | — (view ids gate; counts pinned by L0) | spacing reserve (fix required) |
| `ajout-preprod` | `before`, `intermediate`, `after`, `folded` | retained 14/27/29/29; visible 14/26/29/7 | transition scene |
| `migration-cluster-mesh` | `before`, `intermediate`, `after`, `folded` | retained 14/28/30/30; visible 14/28/30/8 | transition scene |
| `vue-globale` | `before`, `intermediate`, `after`, `folded` | retained 25/36/37/37; visible 25/34/37/12 | transition scene |
| `case-skills-r9` | `unfolded` (single view; h2a export pending to `archi-cases/case-skills-r9/`, referenced by id) | 10 sibling cards in one unfolded group; 1 internal edge, 1 outgoing edge (pinned by L0 from the export) | spacing witness (`spacing-skills-r9.png`) |

The three transition scenes exercise layout change across `before → intermediate → after → folded` as **four independent source views** (different occurrence sets per view), gated as four separate layout calls by AC-20; they are not fold toggles of one view. `ajout-preprod/intermediate` additionally carries 1 folded container. The four lettered cases exercise fold-state change inside one dossier. Appendix A maps every case and view to the ACs it must satisfy. Total acceptance views: 24 (23 + `case-skills-r9/unfolded`).

### 1.4 Why the current engine stacks vertically (measured-code)

The measured path (`layoutMeasured`/`layoutFolded`, `layout/measured.ts`) has no horizontal packing: one column per level (horizontal only via authored `LayoutGroup`, `hints.ts`, supplied by no dossier by default); width = widest child, height accumulates all; roots repeat the column; direction hard-coded `top-to-bottom`; no aspect/row logic; order only via host hints (`resolveOrder`). Measured baseline details that the fix must state exactly:

- Roots are seated with `gaps.rankGap` (56 in `layout/types.ts` `DEFAULT_LAYOUT_METRICS`; root loop in `layout/measured.ts`, `placeGroupItems`/`seatRoot` block); children use `nodeGap` 24. The giant root bands live on the `rankGap` path.
- `LayoutGroup.direction` baseline (measured path): `rows → "y"` (vertical stack) and `columns → "x"` (horizontal row) (`layout/measured.ts:589` `groupContentWidth`, `:961` `placeGroupItems`). Both values therefore change meaning under §3 (§3.7).
- Placement parents (`placementParentOf`, `layout/measured.ts:495`) are the nearest *visible expanded ancestor*, not the semantic parent; geometry is keyed by `EntityRef` with a representative occurrence.
- The measured fit block floors `fit.zoom` by `MIN_ZOOM` 0.75 (`layout/types.ts`, `measured.ts` fit block) and writes it into the view camera. Placement was never measured (routing-study finding F1), so DC-2a defines it (§7).

## 2. Scope and non-goals

DC-2a changes placement, per-level orientation choice, gap computation, and the host camera contract, and creates the scene host (§6.7). Unchanged: fixed 460 × 200 footprints (`layout/measure.ts`; legend key 64); injected `LineMeasurer` text measurement and no-truncation overflow; docking/routing engines (fed packed rectangles; routing choice stays open, DLR-384); the fold model (`fold → measure → place → route` from the retained source, §6); the scene contract (`scene.ts`, `visibility.ts`: item or reported exclusion, exactly once). Decision: one packing function for root, zones and legends (§3.3); no root-only or zone-only packer. Out of scope: routing engine choice (DLR-384), C4 typed cards (DC-2c), performance machinery (DC-2b beyond §6.6), card-face rendering/pixels, exports/editing, and the anonymised illustration dossiers of §1.1 (excluded pending owner ratification, §9.2).

## 3. Algorithm: shelf packing toward a target aspect ratio

### 3.1 Reference algorithm, generalised (never copied)

The reference packer handles one container: flow-order boxes, prefix-sum candidate widths, shelf fill, score = log distance of container aspect (chrome included) to a target (excess height penalised more) plus empty-shelf penalty; lowest wins, wider wins ties (equal boxes: 4 → 2×2, 3 → 2+1, 6 → 3×2, 9 → 3×3). DC-2a generalises without copying code/constants/wording: same function at every nesting level; fixed, collapsed and computed box sizes; input order = reading order (§6.4); DS-token gaps, real chrome and measured edge/label clearance (§3.5); same objective family with named options (§6.1).

### 3.2 The packing function (normative)

One pure function in `packages/diagram-canvas` layout modules:

```ts
interface PackBox { readonly width: number; readonly height: number }
interface PackOptions {
  readonly targetAspect: number; readonly gapX: number; readonly gapY: number;
  readonly chromeWidth: number; readonly chromeHeight: number;
}
interface PackResult {
  readonly width: number; readonly height: number;
  readonly rows: readonly (readonly number[])[];
  readonly positions: readonly { readonly x: number; readonly y: number; readonly row: number; readonly col: number }[];
}
function packRows(boxes: readonly PackBox[], options: PackOptions): PackResult
```

- **P-1 (shelf fill, declaration order).** Candidate widths are prefix sums `boxes[0..k]` plus `gapX` between neighbours, `k = 0..n-1`. For candidate width `W`, boxes join the current row while row width stays ≤ `W` (0.5 px tolerance); otherwise a new row opens. Rows are never re-sorted or balanced by moving boxes.
- **P-2 (no reordering, ever).** Concatenated `rows` equal `[0, 1, …, n-1]`. Rows read left-to-right, then top-to-bottom. Permuting siblings to improve score is a defect.
- **P-3 (score + admissibility).** `width` = widest row width; row height = tallest box in the row; `height` = row heights + `gapY` between rows. Score = `|ln(((width+chromeWidth)/(height+chromeHeight))/targetAspect)|`, multiplied by `tallBias` (§6.1) when the candidate is taller than target, plus `emptyPenaltyWeight × emptyAreaRatio` (row slack area over `width × height`). Lowest score wins. **Admissibility (DEC-1): for n ≥ 2 the all-singleton candidate (every row / every column holding one box) is inadmissible in both forms and is removed before scoring.** Without this rule the chrome-0 root scores the 2×1 column (0.79) below the 1×2 row (0.98) at gap 24, target 1.78, `tallBias` 1.6, and AC-2 fails exactly at the root. The remaining candidates keep the score above; no `tallBias` value substitutes for the rule.
- **P-4 (deterministic tie-break).** Scores equal within `1e-9`: wider candidate wins; further exact tie: smaller prefix index wins. No record or host object order may influence the result.
- **P-5 (gap bound, two paths kept apart).** *Measured path:* emitted sibling gaps equal the §3.5 resolved gap (base token plus measured edge/label clearance where an edge actually crosses, capped on both axes); the packer MUST NOT grow any gap beyond the cap for labels, routes or docks, and MUST NOT reserve a lane where no edge passes. Label outcomes (`label-unplaced`, `label-budget-exhausted`) and `route-obstructed` remain the vocabulary; routing never re-opens packing with larger gaps. *Compatibility path:* its rank-lengthening budget may move ranks along the flow; it never changes a measured level's block gap, and `rankGap` (§3.5) belongs to this path only.
- **P-6 (degenerate inputs).** Zero boxes: 0 × 0, no rows. One box: one row. Zero-height measuring placeholders are measured before packing and never reach the packer.
- **P-7 (row geometry).** Boxes are top-aligned on the row top; row height is the tallest box. This preserves DLR-319 (shared top, 0 px deviation) without forcing equal heights; `stretch` (§3.7) stays the only equal-size mechanism.
- **P-8 (column form).** `packColumns` is the exact transpose of `packRows` (shelves become columns, reading order runs top-to-bottom then left-to-right, same score with axes swapped, same P-3 admissibility). It exists only so §4 can choose orientation per level; both forms share P-2–P-6.

### 3.3 One function for roots and zones

Per level, bottom-up: (1) classify each visible child over the projected visibility (§6); (2) compute footprints (§3.4), packing expanded children recursively first; (3) choose orientation (§4) and pack once — expanded zone/legend: `chromeWidth = 2 × contentInset`, `chromeHeight = contentInset + measured header + header-to-children gap + contentInset`, gaps from zone tokens; root level: zero chrome, same tokens; legend keys inside an expanded legend keep their single-column list (height 64, width = legend inner width) — a legend is a list by design (DLR-341) and is the one level exempt from packing and from §4. Parent content size is the `PackResult` size; outer size adds chrome; positions are relative to the content origin.

Authored groups partition a level before packing (each packs as its own sub-level in authored order; ungrouped siblings form one packed run). Hint validation/refusals are unchanged apart from §3.7.

### 3.4 Footprints (unchanged measurement)

Leaf card and collapsed zone/legend: 460 × 200. Expanded zone/legend: packed content + chrome, ≥ 460 wide and ≥ header-driven width; height = header band + packed content + insets. Legend key: inner width × 64. Fixed footprints never grow for docking; width order becomes (a) header, (b) packed children, (c) grouping override (replaces widest-child). Headers are measured after widths are final, before seating.

### 3.5 Gaps, spacing caps and chrome as DS tokens

Gap and chrome values are DS tokens, not engine constants and not consumer input. Naming follows `packages/tokens/src/component.ts` (`component.diagramCard` / `component.diagramZone` → `--st-component-diagramCard-<key>` / `--st-component-diagramZone-<key>`). The code lot SHALL add:

| Token (component key) | CSS variable | Default | Meaning |
| --- | --- | --- | --- |
| `diagramZone.childGapInline` | `--st-component-diagramZone-childGapInline` | `24px` | Base `gapX` between two children of one row with no crossing edge, every level. Aligns with engine metric `nodeGap: 24` (`layout/types.ts`). |
| `diagramZone.childGapBlock` | `--st-component-diagramZone-childGapBlock` | `24px` | Base `gapY` between two rows (rows form) or two columns (columns form) with no crossing edge. |
| `diagramZone.gapInlineMax` | `--st-component-diagramZone-gapInlineMax` | `32px` | Hard cap on any horizontal sibling gap in emitted geometry, whatever its source. |
| `diagramZone.gapBlockMax` | `--st-component-diagramZone-gapBlockMax` | `32px` | Hard cap on any vertical sibling gap in emitted geometry, whatever its source (AC-19). |
| `diagramZone.rowPackTargetAspect` | `--st-component-diagramZone-rowPackTargetAspect` | `1.78` | Default `targetAspect` (16:9), chrome included. Unitless. |
| `diagramCard.rootGapInline` | `--st-component-diagramCard-rootGapInline` | alias of `childGapInline` | Root-level base inline gap (own leaf; root aliasing needs both leaves). |
| `diagramCard.rootGapBlock` | `--st-component-diagramCard-rootGapBlock` | alias of `childGapBlock` | Root-level base block gap (own leaf). |
| `diagramScene.maxDisplayScale` | `--st-component-diagramScene-maxDisplayScale` | `0.62` | `MAX_DISPLAY_SCALE` (§5): display scale at readout 100 %. Unitless, calibrated per §5.3. |
| `diagramScene.transitionDuration` | `--st-component-diagramScene-transitionDuration` | `240ms` | Fold/view transition duration (T-2); easing binds `foundation.motion.easing` (`packages/tokens/src/foundation.ts`). No host literal. |

Existing chrome is not re-valued: insets 16, rule gaps 4, rule-to-first-child 16, last-child-to-bottom 16 (DLR-323; `layout/measure.ts`). Values reach the engine as numbers (§6.2); no raw gap literal enters layout source; reference gap constants are not adopted. The new gap leaves are spacing values landed as tokens, which satisfies the no-new-visual-value-without-token rule (DLR-383/D6) once they land as planned here.

**Root gap source (normative).** Measured roots and measured levels use the resolved block/inline gaps above. The measured path MUST NOT seat roots or levels with `gaps.rankGap`; `rankGap` (56) and `ResolvedGaps.rankGap` (`layout/hints.ts`) remain compatibility-path only. AC-19 probes the root level explicitly.

**Edge-aware gap computation (normative).** For each adjacent sibling pair, the emitted clear gap is:

```
gap = clamp( max(baseGap, neededClearance), baseGap, axisMax )
neededClearance = labelThickness + 2 × labelMargin   if a routed edge or its label box crosses this gutter
                = 0                                    otherwise (no edge passes: exactly baseGap)
```

where `baseGap` is the resolved inline/block token (or a §3.7 hint override that passes validation), `labelThickness` is the measured label-box thickness transverse to the gutter, `labelMargin` is the engine metric (4), and `axisMax` is `gapInlineMax` / `gapBlockMax` (DEC-6). Consequences: (a) sibling cards with no edge between them always sit at the small token gap; (b) no empty lane is ever reserved — a gutter widens only where a routed edge or label box actually crosses it, and only by the measured thickness; (c) both axes are capped, so a label needing more than the cap is `label-unplaced` (AC-21), never a wider gutter; (d) zone chrome (header, insets) belongs to the parent box, not sibling spacing; (e) no step — packing, orientation, docking, routing, labels, transition — may insert extra white space between siblings beyond this rule. This is the testable form of the case-b/c/d complaint and of the 11/11 both-axes complaint.

### 3.6 Canonical equal-card grids

With equal 460 × 200 cards the packer MUST reproduce, **at chrome 0 and at zone chrome alike** (P-3 admissibility, not chrome, is what excludes the single line): 2 → 1×2 `[2]`; 3 → 2+1 `[2,1]`; 4 → 2×2; 6 → 3×2; 9 → 3×3 (rows form). In columns form the transposed grids hold (2 → 2×1, etc.). For mixed sizes P-3 decides, P-2 preserves order, §7 measures. A level of two children MUST NOT emit two rows (or two columns) while the one-line candidate exists; AC-2 states the testable form.

### 3.7 `stretch`, ordering and gap hints

`LayoutHints.ordering` and root order (§6.4) become the packer's reading-order input. **Semantic changes (both values, measured path):** baseline `rows → "y"` (vertical stack) becomes `rows` = packed horizontal shelves; baseline `columns → "x"` (horizontal row) becomes `columns` = packed vertical shelves. Both redefinitions are recorded as semantic changes with re-pin reasons (§9.5, AC-12); no fixture keeps the old meaning silently. `stretch` keeps its meaning and runs before packing on measured widths. `cardGapX/Y`, `zoneGapX/Y`, `rankGap` hint fields remain accepted as per-call overrides on their own paths (`rankGap`: compatibility only); AC-3/AC-19 bind the resolved emitted value, token or hint alike: routing still never grows it, and a vertical (or horizontal) sibling-gap override above the axis cap **refuses** as `layout-hint-invalid` (never silently capped).

## 4. Orientation choice from fold state, with transition

### 4.1 Orientation per level (normative)

Each packed level (root, or children of one expanded zone) has an orientation `rows | columns`:

- `rows`: shelves run horizontally; siblings fill left-to-right and wrap downward.
- `columns`: shelves run vertically; siblings fill top-to-bottom and wrap rightward.

Orientation is a derived layout property, recomputed on every layout call from the visible sibling footprints of that level at the current fold state. It is never authored, never persisted in the model, and never carried by the semantic document. Folding or unfolding a box changes the footprint set of its parent level and may therefore change that level's orientation; levels whose sibling set and footprints are unchanged keep their orientation (see also S-1, §6.5).

**Level identity (normative).** A level key is `root`, or the **placement-parent representative occurrence id**: the representative occurrence of the nearest visible expanded ancestor (`placementParentOf`, §1.4), never the semantic parent id and never a bare `EntityRef`. When a fold lifts a level to a different placement parent, the old key disappears and hysteresis for that level is lost by design; the new level starts with no previous value (O-2/O-3 decide). Multi-occurrence entities therefore never share a level key ambiguously: keys follow representative occurrences, as geometry does.

### 4.2 Deterministic choice rule (normative)

- **O-1 (score both).** For each packed level, compute the best `packRows` result and the best `packColumns` result over the same boxes, gaps, chrome and `RowPackOptions`. Score both with the **total P-3 score** (log term × `tallBias` where applicable, plus the empty-penalty term; axes swapped for columns).
- **O-2 (pick lower score).** The orientation with the lower total score wins. Reading order (P-2) holds in both forms; orientation never reorders siblings.
- **O-3 (tie-break).** Total scores equal within `1e-9`: `rows` wins, unless hysteresis (O-4) applies. Enumeration order, record order and fold-toggle order MUST NOT affect the outcome beyond O-4's explicit previous-orientation input.
- **O-4 (hysteresis, no flip-flop).** Layout accepts an optional previous-orientation map (§6.1): level key (§4.1) → `rows | columns`, as last emitted by the host for that level. If a previous orientation exists for the level and `|scoreRows − scoreColumns| < orientationHysteresis` (default `0.08`, total-score units, §6.1), the previous orientation is kept even when the other score is lower. Outside the band, the lower score wins and the emitted orientation becomes the new previous value. With no previous value, O-2/O-3 decide. A single-box or empty level always reports `rows`.
- **O-5 (stability under repetition).** Re-running layout with unchanged inputs and the emitted previous map MUST reproduce the same orientation for every level (fixed point: feeding the output map back changes nothing). Alternating a fold toggle `A → ∅ → A → ∅` MUST NOT alternate orientation unless the total-score gap leaves the hysteresis band in both states; Appendix A scenes assert this per level.

Rationale: without the band, toggles near the boundary flip a whole level on every click. The host-held previous map keeps layout pure: (document, fold state, options, previous map) → geometry + orientation map.

### 4.3 Transition (normative, host rendering only)

Layout output is final geometry; animation never feeds back into layout, routing or metrics.

- **T-1.** On fold/view change the host MAY animate visible rectangles from previous to new emitted geometry. Edges draw against interpolated endpoints or fade; geometry gates always read final rectangles.
- **T-2.** Default duration resolves from the `diagramScene.transitionDuration` token (240 ms), easing from `foundation.motion.easing`. Host code holds no duration/easing literal; values are never encoded in view data.
- **T-3.** Under `prefers-reduced-motion: reduce` (evaluated at toggle time): duration `0ms`, instant application, no interpolation or sequencing.
- **T-4.** A new change mid-transition retargets from the displayed state to the newest geometry (or snaps under reduced motion); no stale-target queue.
- **T-5.** Timing/easing are verified by host tests (mocked media query, fake timers) and CI/manual review — never by geometry tests, which assert final rectangles only.

## 5. Zoom: cap, zoom-out, fit and reset (host camera contract)

### 5.1 Definitions

World geometry is CSS px at zoom 1 (`scene.ts` holds no camera; `transform.ts`: `camera = {x, y, zoom}`, CSS px per world unit). **Readout 100 % denotes `MAX_DISPLAY_SCALE`, not zoom 1.0** (DEC-4). `MAX_DISPLAY_SCALE` resolves from the `diagramScene.maxDisplayScale` token (§3.5; starting proxy **0.62**, calibrated per §5.3). At 100 % a card renders at `460 × MAX_DISPLAY_SCALE` × `200 × MAX_DISPLAY_SCALE` CSS px (proxy: ≈ 285 × 124 px), well below its 460 × 200 natural size — this is the appropriate maximum the owner asked for. Zoom is a host camera value applied after layout; it never changes geometry (D-1).

Fit bbox (DEC-5): the scene `bounds` — union of node rectangles, edge bounds, ports and label boxes (`scene.ts`) — shared with DC-2b §3.2. The §7 entity-only bbox gates aspect/fill and is never used for fit.

Fit box (both axes, 16:9): for figure content width `viewW` (CSS px) and `windowH = window.innerHeight` (CSS px):

```
fitW = viewW
fitH = min(viewW × 9/16, 0.85 × windowH)
zoomFit = min(fitW / bboxW, fitH / bboxH, MAX_DISPLAY_SCALE)   (bbox = fit bbox above)
```

Empty scene (no fit bbox): `zoomFit = MAX_DISPLAY_SCALE` (readout 100 %). Interactive range: `[zoomFit, MAX_DISPLAY_SCALE]` — the dynamic lower bound is what makes fit a real zoom-out path for large unfolded scenes.

### 5.2 Normative camera rules

- **Z-1 (cap).** Camera zoom MUST NOT exceed `MAX_DISPLAY_SCALE` via any input (buttons, keyboard, wheel, pinch, programmatic). Requests clamp to `MAX_DISPLAY_SCALE`; zoom-in is disabled at the cap. A card rendered above `460 × MAX_DISPLAY_SCALE` × `200 × MAX_DISPLAY_SCALE` CSS px is a defect.
- **Z-2 (zoom-out exists).** Zoom-out via control, `Ctrl`+wheel/pinch (clamped to §5.1) and fit (Z-3). No state offers zoom-in only.
- **Z-3 (fit-to-frame).** Fit (« Ajuster ») sets `zoom = zoomFit` over the §5.1 fit box, centred. After any overflowing unfold, one fit activation shows the whole drawing. Fit never exceeds `MAX_DISPLAY_SCALE`.
- **Z-4 (reset).** Reset returns to fit. Fit and reset may share one control; any separate 100 % action sets `MAX_DISPLAY_SCALE` and stays bound by Z-1.
- **Z-5 (readout).** Percentage readout, 100 % = `MAX_DISPLAY_SCALE` (`round(zoom / MAX_DISPLAY_SCALE × 100)`), replacing the earlier « 100 % = taille des cartes » (zoom 1.0) reading.
- **Z-6 (layout invariance).** Zoom/fit/reset MUST NOT re-run packing or change rectangles/orientations (transform-only, §6.6). Layout `MIN_ZOOM` (0.75, `layout/types.ts`) governs the layout fit report only and MUST NOT floor the host camera (floor = `zoomFit`).
- **Z-7 (reclamp on relayout).** When a fold/view change produces a new layout (new fit bbox), the host reclamps the current zoom into the new `[zoomFit, MAX_DISPLAY_SCALE]` range (clamp to the nearest bound; centre preserved where the range allows). A zoom that stays inside the new range is preserved.
- **Z-8 (no seeding from layout fit).** The host MUST NOT seed its camera from the measured `fit.zoom` (floored by `MIN_ZOOM` 0.75 and written into the view camera, §1.4). Initial camera = fit (Z-3) computed by the host from the scene `bounds`; `fit.zoom` remains a layout report only.

`diagram-canvas` has no DOM or camera UI: Z-1–Z-8 bind the Svelte host created in §6.7; the engine only owes D-1/D-3 and scene bounds for `zoomFit`.

### 5.3 Calibrating `MAX_DISPLAY_SCALE` (normative protocol)

Starting proxy 0.62. Lot L1/L4 SHALL calibrate the token on all 24 acceptance views with this readability criterion, and record the chosen value with its measurements:

- At 100 % (`MAX_DISPLAY_SCALE`): rendered card title ≥ 18 CSS px and rendered card body ≥ 13 CSS px (token sizes 32/24 world px × scale).
- At fit on every acceptance view: rendered edge-label height ≥ 8 CSS px; a view failing this at fit is reported by name (fit stays as computed — readability is gated by AC-21 placement plus this report, not by exceeding the cap).
- Choose the smallest scale in [0.50, 0.75] satisfying the 100 % criterion on every view; if 0.62 satisfies it, keep 0.62. Changing the proxy is a token-value change with explained re-pins, never a code branch. Rendered sizes are computed as world size × scale from the emitted view (no browser needed); CI/manual witnesses confirm them visually (§9.4).

## 6. Determinism, folds, #203 wiring, API and host duties

### 6.1 New options (additive, DS defaults)

In `layout/types.ts`, `LayoutOptions` gains optional fields; existing signatures otherwise unchanged:

```ts
export interface RowPackOptions {
  readonly targetAspect?: number;        // default: token rowPackTargetAspect (1.78)
  readonly tallBias?: number;            // default 1.6
  readonly emptyPenaltyWeight?: number;  // default 0.4
  readonly orientationHysteresis?: number; // default 0.08 (total-score units, O-4)
}
export interface LayoutOptions {
  // … existing fields unchanged …
  readonly rowPack?: RowPackOptions;
  /** Previous emitted orientation per level key ("root" or placement-parent representative occurrence id, §4.1). Host-held, O-4. */
  readonly previousOrientation?: Readonly<Record<string, "rows" | "columns">>;
}
```

Layout output reports the chosen orientation per packed level (additive record on the measured result, keyed like `previousOrientation`), so the host can feed it back and tests can assert it without reading packer internals. Validation: non-finite or non-positive `targetAspect`, negative `tallBias` / `emptyPenaltyWeight` / `orientationHysteresis` refuse with one new code `row-pack-invalid` (`LayoutRefusalCode`, `path: "rowPack"`). Defaults resolve in one place (`resolveRowPack(options, tokens)`) so the DC-2b cache key (§6.6) sees resolved numbers only.

### 6.2 Token plumbing

`LayoutMetrics` gains optional `rowGapInline` / `rowGapBlock` (defaults: the §3.5 tokens, 24). `targetAspect` travels in `RowPackOptions` (per-call objective), not metrics. The engine keeps no CSS access: token values arrive as numbers through the existing injection discipline, and a token change recomputes layout in the same call that observes it.

### 6.3 Footprint and chrome sources

Unchanged from §3.4/§3.5: `measure.ts` constants (`CONTENT_INSET` 16, rule gaps 4/16) remain code-level chrome; sibling gaps, caps, target aspect, max display scale and transition duration become tokens. Any new spacing constant the code lot needs is a named layout/host constant in one place, never a scattered literal.

### 6.4 Reading order input

Declaration order becomes explicit through `hints.ts`, extended by `rootOrder?: readonly EntityRef[]` on `LayoutHints` (per-zone order already exists as `ordering[parent]`). Listed members come first in that order; unlisted visible siblings follow in UTF-16 reference order (current `resolveOrder` semantics) — **documented degraded mode**: it invents order from ids, is never used by acceptance fixtures, and a fixture that falls back to it fails AC-4 review. The host MUST supply full declaration order for root and every expanded zone it renders (for C4 scenes, the authored sequence, e.g. Front → Backend → DB); the engine MUST NOT invent order from ids or titles in the gated path. Unknown or cross-context entries refuse as `layout-hint-invalid`, as today.

**Fixture order source (normative).** Lot L0 SHALL build `ordering`/`rootOrder` for the eight scenes from the `cards[]` array order in each `<case>.views.json`, per view and per level. That array order is the only order present in the acceptance files; AC-4 fixtures assert exactly it.

### 6.5 Fold pipeline, determinism, stability

Pipeline per call: **fold → measure → place (§3+§4) → route**, recomputed from the retained source, never patched. `projectView` (`diagram-core/src/fold.ts`) is stage 1; `layoutFolded` keeps delegating to the measured path.

- **D-1.** World-coordinate packing (measured path): same document, fold state, order, options, previous-orientation map and tokens ⇒ same rectangles/orientations at any zoom (Z-6) and `targetWidth` (D-3).
- **D-2.** No record/key-order dependence beyond P-4/O-3.
- **D-3.** `targetWidth` never re-packs the measured path (it is required by `LayoutOptions` but unused for measured placement — D-3 already states the measured behaviour); narrower viewports scale/pan the same drawing. Byte-identity (AC-7) is scoped to the measured path: the compatibility path legitimately varies with `targetWidth`/direction (`layout/engine.ts` fit block).
- **S-1.** Untouched occurrences (visible in both states; not the toggled zone, descendants or ancestors) in an unchanged level: displacement 0 px.
- **S-2.** Movement only on genuine re-pack, exactly to the new packed position, reported per occurrence (§7).
- **S-3.** Unchanged-input re-layout byte-identical, orientations included (O-5).

Fold-toggle language (S-1/S-2, AC-8) applies to fold-state changes inside one dossier (lettered cases). Transition scenes are four independent source views (§1.3): AC-20 gates each as a separate layout call and Appendix A pins view-to-view deltas; no toggle stability is claimed across different occurrence sets.

#203 wiring (no `diagram-core` change): **W-1** only projected-visible occurrences are packed/docked/routed (`visibility.ts`); **W-2** internal relations (`classifyInternalRelations`) draw nothing, reserve no space, surface as `endpoint-hidden`; **W-3** projected relations dock/route on representative rectangles (the collapsed parent's packed box); **W-4** aggregation is render-derived, never persisted merged relations; **W-5** unfolding recomputes from the retained source, provenance never outlives hiding; **W-6** every folded view passes `validateView` with zero diagnostics.

### 6.6 Backward compatibility and DC-2b seam

New fields optional; existing callers compile unchanged. `LayoutFit.direction` stays `"top-to-bottom"` as a fit descriptor (documented on the field). Measured geometry changes deliberately (DLR-385/388); `generic@1` stays byte-identical. No new dependency (only `@sentropic/diagram-core`).

DC-2a touches layout modules (`measured.ts`, `hints.ts`, `types.ts`, `measure.ts` constants if mirrored), §3.5 tokens, one pure packer module (suggested `layout/pack.ts`), `tests/` helpers, and the new scene host (§6.7). No engine timers/observers. **DC-2b seam (normative):** lots L1/L2 SHALL extend the `createLayoutCache` key fingerprint (DC-2b `cache.ts`, when present; otherwise DC-2a exposes the digest for DC-2b to consume) with: fold state + measured-sizes digest + resolved row-pack options (incl. hysteresis) + resolved gaps/caps + previous-orientation digest + token digest + engine version, where **token version = digest of the resolved token numbers** (no new token-version export; tokens reach the engine as numbers, §6.2). DC-2a owes resolved numbers + S-3; cache storage/heap/idle/disposal stay DC-2b. DC-2b owns scheduling around the call, DC-2a computation inside it. DC-2b's « no `LayoutOptions` change » is read as applying to DC-2b's own lot; DC-2b wraps `layoutMeasured/layoutFolded` opaquely, so DC-2a's additive optional fields do not break the seam.

### 6.7 Svelte host duties — `DiagramSceneFigure` is created here (DEC-2)

Baseline (measured-code): `packages/components-svelte/src/lib/` holds `DiagramCard.svelte`, `DiagramZone.svelte`, headers and `diagramCardModel.ts`; **no `DiagramSceneFigure` exists** on `origin/main` (CARDS §7.6 specifies it, DC-3 delivers it in the CARDS plan), and `diagram-canvas` holds no camera UI. Lot L4 therefore **creates** the host; there is no existing host to rewire and no host-side packer to delete in this repo.

Deliverable (CARDS §7.6 contract; files named for L4):

- `[N] packages/components-svelte/src/lib/DiagramSceneFigure.svelte` — generic scene figure: props = scene identity + laid-out model (`SemanticDocument` + current `ViewDocument`, or host-resolved record), `defaultFolds`, `legend`, `title`/`label`, `compact`, host-supplied localised strings for every control; owns no model (fold state lives in the `ViewDocument`).
- `[N]` figure tests beside it (Vitest/jsdom, §9.3) covering Z-1–Z-8 and T-1–T-4.
- `[M] packages/components-svelte/src/lib/index.ts` — barrel export `DiagramSceneFigure` (+ props type).
- `[M]` component-index / catalogue registration only as CARDS DC-3 prescribes; no scene id, fold list or hint value in shipped sources.

The scene host SHALL: (1) call `layoutFolded`/`layoutMeasured` for every autolayout display, render at emitted geometry, keep no private packer; (2) pass declaration order (`rootOrder`, `ordering[parent]`), fold state, shared `measureLines`, `targetWidth`, runtime token numbers, and `previousOrientation` from its last result (O-4); (3) implement Z-1–Z-8 and T-1–T-4 over `PresentationState.camera`; (4) on fold/view switch, re-run layout fully, reclamp per Z-7, then animate per T-1 (instant under reduced motion). `DiagramCard`/`DiagramZone` face-component props do not change.

## 7. Metrics: the placement measure

### 7.1 Deterministic Node test helper (no browser)

One test-only helper (suggested `packages/diagram-canvas/tests/layout/rowpack-metrics.ts`, never shipped in `src/`), pure functions over emitted rectangles, emitted label boxes and the emitted orientation record:

```ts
export interface PlacementMetrics {
  readonly aspectRatio: number;          // entity bbox width / height, visible entity rects only
  readonly logAspectError: number;       // |ln(aspectRatio / 1.78)|
  readonly fillRatio: number;            // visible-leaf areas / entity bbox area (DEC-7 leaves only)
  readonly frameFillRatio: number;       // fit-scaled entity bbox area / pinned 16:9 viewport area (§7.2)
  readonly siblingGapXMax: number;       // largest clear horizontal sibling gap, px (§3.5)
  readonly siblingGapYMax: number;       // largest clear vertical sibling gap, px (§3.5)
  readonly sceneBandX: number;           // axis-projected uncovered interval, X (§7.1 band rule)
  readonly sceneBandY: number;           // axis-projected uncovered interval, Y (§7.1 band rule)
  readonly labelCardOverlaps: number;    // label boxes intersecting any card/zone rect
  readonly labelUnplaced: number;        // label-unplaced warnings on this view
  readonly orientationByLevel: Readonly<Record<string, "rows" | "columns">>;
}
export function placementMetrics(rects, labelBoxes, orientationByLevel): PlacementMetrics
export function foldStability(before, after, untouched): { max: number; mean: number; moved: number }
```

Definitions (exact, testable):

- **Entity bbox** = union of visible entity rectangles only. `fillRatio` sums visible-leaf areas only (DEC-7; expanded zones would double-count). Margins outside the bbox never count.
- **Sibling gaps** (`siblingGapXMax`/`siblingGapYMax`): for each level, successive sibling boxes sorted by position; clear gap = next edge − previous edge on that axis, chrome excluded. Two separately named gates (§7.3): the sibling-gap gate (§3.5 rule) and the scene-band gate below. Neither substitutes for the other.
- **Scene band** (`sceneBandX`/`sceneBandY`): axis-projected uncovered interval. Computation: take every visible entity rectangle **and** every emitted label box, clip to the entity bbox, project each box onto the axis (`[x, x+w]` for X, `[y, y+h]` for Y), merge overlapping/touching intervals, sort by start; the band is the largest gap between successive merged intervals (`next.start − prev.end`), or 0 if coverage is continuous. Label boxes count as coverage (a label sitting in a band shrinks it); title bands and routes do not. This is the only band definition; maximal-empty-rectangle readings are not used.
- **Label probes**: `labelCardOverlaps` counts label boxes intersecting any visible card/zone rectangle (0.5 px tolerance, touching edges allowed); `labelUnplaced` counts `label-unplaced` warnings. Reading-order probe: emitted order per level equals §6.4 order. Gap probe: each sibling gap equals the §3.5 resolved gap (base, or base raised by measured clearance within the cap; 0.5 px tolerance) and ≤ the axis cap, every fold state, after routing.

### 7.2 16:9 frame metrics

Pinned frame viewport: **1920 × 1080** (no other viewport gates AC-20). For entity bbox `bboxW × bboxH` with fit scale `s = min(1920/bboxW, 1080/bboxH, MAX_DISPLAY_SCALE)`: `frameFillRatio = (bboxW·s × bboxH·s)/(1920 × 1080)`. Report per scene view with `aspectRatio`, `fillRatio`, `sceneBandX/Y`, `siblingGapXMax/YMax`, `labelCardOverlaps`, `labelUnplaced` — all from rectangles and label boxes alone, no DOM/canvas/browser. Host fit (§5.1) uses the live `viewW`/`windowH` fit box and the scene `bounds`; §7.2's pinned viewport exists only to make thresholds comparable.

### 7.3 Thresholds (gates)

Gates bind packed output. Exact grid equalities (§3.6) and gap equalities (§3.5) are absolute. Aspect/fill gates are relative where scene size makes absolute 16:9 unreachable (a 2-card scene cannot fill 16:9; its gate is beating the column and choosing the score-optimal admissible candidate). Leaf counts use DEC-7 visible leaves.

| Gate | Threshold |
| --- | --- |
| Sibling gap, both axes (every level incl. root, every view, every scene) | equals §3.5 resolved gap; ≤ 32 px (axis cap default); 0 violations; root probed explicitly |
| Single-line defect | no level with ≥ 2 children packed as a single column (rows available) or single row (columns chosen by O-2) contrary to the emitted orientation record; P-3 admissibility holds |
| Root aspect, views with ≥ 9 visible leaves | `logAspectError` ≤ 0.35 and strictly less than the L0 column baseline |
| Root aspect, smaller views | strictly less than L0 baseline; chosen candidate is the P-3 optimum among admissible candidates (asserted via packer scores) |
| Fill (visible-leaf areas / entity bbox) | ≥ baseline + 0.10 on cluster-scale scenes; ≥ 0.85 on equal-card grids n ≥ 4; per-scene pins in Appendix A |
| Frame fill (pinned 1920 × 1080) | strictly greater than L0 baseline on every transition-scene view; per-view pins recorded by L0 |
| Scene band (`sceneBandY`, and `sceneBandX` where the level packs in columns) | strictly smaller than L0 baseline per scene; never used to excuse a sibling-gap violation |
| Label readability (DEC-3) | `labelCardOverlaps` = 0 and `labelUnplaced` = 0 on all 24 views |
| Fold stability | S-1: max 0 px in unaffected levels; S-2: moved set exactly as pinned |
| Orientation stability | O-5 fixed point on every scene; no orientation alternation across `A → ∅ → A → ∅` within the hysteresis band |

### 7.4 Baselines: measured by the code lot

This spec asserts no baseline number. Lot L0 (§10) runs §7.1 over the current engine for every Appendix A scene view at identical inputs (same pinned test measurer, fold states, `cards[]`-derived hints per §6.4) and records baseline aspect, fill, frame fill, bands, gaps, label outcomes, single-column levels and per-toggle stability into the fixtures. Acceptance compares packed output against those baselines with §7.3 directions. A baseline that already satisfies a bound invalidates the fixture, not the criterion, and is reported before L1 starts.

### 7.5 Tuning the retained defaults

Retained defaults: `targetAspect 1.78`, `tallBias 1.6`, `emptyPenaltyWeight 0.4` (§11). Protocol (L1, before L2): grid `tallBias ∈ {1.0, 1.6, 2.2} × emptyPenaltyWeight ∈ {0, 0.4, 0.8}` at 1.78 over all 24 scene views, with a **pinned test `LineMeasurer`** (fixed advances, recorded in fixtures). Hard constraints first (P-2, P-3 admissibility, §3.6 grids at chrome 0 and zone chrome, gap caps disqualify), then rank by summed `logAspectError + (1 − fillRatio)` (views with ≥ 4 visible leaves). Keep defaults unless a pair wins without losing any gate; a change is a default-value change with explained re-pins, never a code branch. Hysteresis: smallest of `{0, 0.04, 0.08, 0.12}` preventing toggle alternation while switching above a 0.15 total-score gap. **Measurer caveat:** production headers come from the host adapter, so grids/orientations tuned on the test measurer are re-checked (not assumed stable) under the production measurer in L4; a flip under the production measurer is reported with its view/level, not silently accepted. `MAX_DISPLAY_SCALE` is calibrated separately by §5.3.

## 8. Acceptance criteria

Each criterion is testable via §7/§9 unless it names host/CI verification. « Level » = one packed sibling level (key per §4.1). AC-1–AC-20 keep their numbers; AC-21–AC-25 are appended for the label gate and the 11/11 requirements.

- **AC-1 (16:9 target).** No `rowPack` option ⇒ every level targets 1.78 (token), chrome included (§3.6, §7.3).
- **AC-2 (no one-line stacking).** Equal cards: 2 → 1×2, 3 → 2+1, 4 → 2×2, 6 → 3×2, 9 → 3×3 (transposed in columns form), **at chrome 0 and at zone chrome** (P-3 admissibility); no ≥ 2-child level emits a single line against the §4 choice. Includes the owner-feedback-42 2-children shape.
- **AC-3 (gap never grown by routing).** Every sibling gap on both axes equals the §3.5 resolved gap exactly (base token, or base raised only by measured crossing clearance within the cap; an above-cap hint override **refuses** as `layout-hint-invalid`), every fold state, after routing/labels. Gap probe (§7.1) on all fixtures.
- **AC-4 (reading order).** Declaration order (= `cards[]` order in fixtures, §6.4) = reading order at every level and orientation; siblings never reorder. The UTF-16 fallback never fires in fixtures. Verified on geometry.
- **AC-5 (one function).** Root and expanded zones share the packer + §4 choice; no root-only/zone-only packer. Single module + root grids.
- **AC-6 (tokens, not literals).** Gaps/caps/aspect/scale/duration resolve from §3.5 tokens; token change alters geometry (or camera cap) in the same call; no new raw gap/scale/duration literal in layout or host source.
- **AC-7 (determinism, measured path).** Identical inputs (incl. previous-orientation map) ⇒ byte-identical canonical views across calls and fresh Node processes, every fold state, measured path only (D-3). Zoom never enters the comparison (transform-only).
- **AC-8 (fold stability).** S-1/S-2 with pinned moved sets; S-3/O-5 idempotence; `A → ∅ → A → ∅` byte-identical per repetition (lettered cases; transition views gated by AC-20 as separate calls).
- **AC-9 (#203 wiring).** W-1–W-6; internal relations draw nothing (`endpoint-hidden`); representatives dock/route; `validateView` zero diagnostics; scene conservation.
- **AC-10 (footprints/overflow).** Cards/collapsed zones stay 460 × 200; no docking growth; `card-overflow`/`zone-overflow` keep every character.
- **AC-11 (performance).** Linear candidates, quadratic worst-case shelf fill per level; **measured-path** fixture required: `tests/layout/performance.test.ts` today budgets `layoutDocument` (compatibility path), so L2/L3 SHALL add a `layoutMeasured`/`layoutFolded` budget in the same 1000 ms style on cluster fixtures; §6.6 cache inputs resolved; S-3 holds; no engine timers/observers.
- **AC-12 (compatibility).** Existing callers compile unchanged; `generic@1` byte-identical; semantic changes: `rows` **and** `columns` redefined on the measured path (§3.7), each with explained re-pins (§9.5).
- **AC-13 (zoom cap).** Camera never exceeds `MAX_DISPLAY_SCALE` via any input (Z-1); zoom-in disabled at the cap; no card above `460 × MAX_DISPLAY_SCALE` × `200 × MAX_DISPLAY_SCALE` CSS px. Host-tested on `DiagramSceneFigure` (§9.3).
- **AC-14 (zoom-out/fit/reset).** Zoom-out to `zoomFit` by control and wheel/pinch; fit frames the whole drawing centred over the §5.1 fit box; reset returns to fit; reclamp on relayout (Z-2–Z-4, Z-7); camera never seeded from `fit.zoom` (Z-8). One fit after unfolding any Appendix A scene frames it. Host-tested + CI/manual witness.
- **AC-15 (zoom transform-only).** Zoom/fit/reset never change rectangles, orientations or scene inputs (Z-6, D-1) and trigger no layout call (counted in host tests).
- **AC-16 (orientation deterministic).** Each level follows O-1–O-3 from current fold footprints (level keys per §4.1); same inputs ⇒ same emitted orientation map (asserted in fixtures); unfolding never selects a total-score-worse orientation outside the hysteresis band.
- **AC-17 (hysteresis, symbolic).** Fed-back map is a fixed point (O-5); while `|scoreRows − scoreColumns| ≤ orientationHysteresis` a toggle cycle never alternates orientation; when the gap exceeds `orientationHysteresis` the next layout switches (no hard-coded 0.15 — the band follows the tuned option). Synthetic near-boundary boxes + every scene toggle sequence.
- **AC-18 (transition/reduced motion).** Token duration (240 ms default) ease-out (T-1/T-2/T-4); reduced-motion applies instantly (T-3); final rectangles equal non-animated layout in both modes. Mocked media query + fake timers on `DiagramSceneFigure`; geometry in Vitest.
- **AC-19 (spacing fix, cases b/c/d + root).** All views of `case-b/c/d` (and every scene, **root level included**): `siblingGapYMax` ≤ 32 px default cap and every vertical sibling gap equals the §3.5 resolved gap; measured roots never use `rankGap`. Any above-cap gap fails by level name (level key per §4.1).
- **AC-20 (per-scene 16:9 metrics).** Every view of the eight scenes computes and gates §7 metrics (§7.3, Appendix A) at the pinned 1920 × 1080 frame; transition scenes gate all four views as separate layout calls, not only the last.
- **AC-21 (label readability gate).** On all 24 views: `labelCardOverlaps` = 0 and `labelUnplaced` = 0 (§7.1 helper over entity + label boxes). A failing view is named with its unplaced/overlapping relation ids; widening a gutter past its cap to pass is a defect (DEC-3, DEC-6).
- **AC-22 (appropriate maximum display scale).** Readout 100 % = `MAX_DISPLAY_SCALE` (token, starting proxy 0.62, calibrated per §5.3); at 100 % a card renders at `460 × MAX_DISPLAY_SCALE` × `200 × MAX_DISPLAY_SCALE` (≈ 285 × 124 px at the proxy), never at 460 × 200; §5.3 rendered-size criteria hold on every view. Host-tested (readout + rendered box) + geometry computation in Vitest.
- **AC-23 (fit on both axes, 16:9).** Fit uses `fitH = min(viewW × 9/16, 0.85 × windowH)`, `fitW = viewW` (§5.1) over the scene `bounds`; both axes constrain `zoomFit` (the tighter axis wins); fit never exceeds `MAX_DISPLAY_SCALE`; empty scene fits at 100 %. Host-tested with pinned `viewW`/`windowH` stubs.
- **AC-24 (edge-aware spacing, no empty lanes).** Sibling pairs with no crossing edge/label sit exactly at the base token gap on both axes; a pair widens only where a routed edge or label box crosses, only by measured `labelThickness + 2 × labelMargin`, never past the axis cap; no reserved lane exists without a crossing edge. Probed per pair on all fixtures (§7.1 gap probe extended with crossing flags).
- **AC-25 (`case-skills-r9` gutters).** On `case-skills-r9/unfolded` (10 sibling cards, 1 internal edge, 1 outgoing edge): every no-edge gutter = 24 px ± 0.5 (0.052 × card width, 0.12 × card height); every gutter (edge-crossing included) ≤ 32 px (≤ 0.070 × card width inline, ≤ 0.16 × card height block); the outgoing edge reserves no lane inside the group. Screenshot-scale gutters (card-height-order bands) fail by pair name.

## 9. Test plan

Engine tests: Vitest in `packages/diagram-canvas` (`vitest.config.ts` pins `node`, no-DOM asserted — keep it). Host tests: Svelte Vitest/jsdom on `DiagramSceneFigure` (`components-svelte` already runs jsdom). Real-browser needs go to CI/manual (§9.4); no local Chromium.

### 9.1 Packer and orientation unit tests

Grids n = 0,1,2,3,4,5,6,9,12 in both forms, **each at chrome 0 and at zone chrome** (B1 re-verification: AC-2 must hold in both); P-2 order where reordering scores better; P-3 admissibility (all-singleton removed for n ≥ 2); P-4 wider tie; tall-bias direction; empty-penalty (2+1 vs 1×3); mixed sizes and top alignment; degenerate inputs; `row-pack-invalid`; orientation choice on total score, tie-break, hysteresis bands (symbolic, AC-17), O-5 fixed point, missing previous map, level lifted by a fold (hysteresis lost, §4.1); gap bound and edge-aware clearance under label/route-heavy inputs (AC-24).

### 9.2 Scene fixtures (the eight cases)

**Clearance gate (normative).** Copying fixture content *is* committing derived content (semantic JSON carries real repo/system names). Lot L0 SHALL record, before copying, a clearance line naming the eight cases below as the only allowed set (the seven existing cases plus `case-skills-r9` on its h2a export), and SHALL NOT copy any other dossier content. The anonymised dossiers of §1.1 stay excluded **pending explicit owner ratification**; their exclusion is recorded here because it defers part of the 11/11 text (« si on a tous ces cas, on pourra avancer »).

Copy **only** the eight §1.3 cases (semantic + views JSON; card intent summarised in fixture notes) into `packages/diagram-canvas/tests/`. For `case-skills-r9`, L0 waits for the h2a export at `archi-cases/case-skills-r9/` and references it by id until then; a missing export blocks AC-25 only, not the other scenes. L0 builds `ordering`/`rootOrder` from `cards[]` order per view/level (§6.4) and pins retained/visible counts (§1.3) from `views.json`. Copied `view@2` grid geometry is input documentation, never pinned output. Each view asserts rectangles, orientation map, §7 metrics, label probes and gap probes (incl. crossing flags). Synthetic fixtures remain (2-children shape, grids, Front → Backend → DB, cluster shapes). Determinism: 10 fresh Node processes per fixture, identical bytes/metrics; record shuffling changes nothing. Fold toggles pin moved sets (lettered cases); transition scenes assert view-to-view deltas as separate calls (Appendix A).

### 9.3 Host tests (Vitest/jsdom, on `DiagramSceneFigure`)

Camera: clamp/disable at 100 % = `MAX_DISPLAY_SCALE` (AC-13, AC-22); zoom-out to `zoomFit`; fit over the §5.1 fit box frames an overflowing scene on both axes (AC-23); reset; readout (AC-14); reclamp after relayout (Z-7); no seeding from `fit.zoom` (Z-8); zoom triggers no layout call (AC-15). Empty scene fits at 100 %. Transition: token-duration interpolation; mocked reduced-motion applies instantly; mid-transition retarget (AC-18). Fake timers + mocked `matchMedia`/`windowH`/`viewW` only.

### 9.4 CI/manual browser witnesses

CI (or manual review): render the eight scenes via `DiagramSceneFigure` beside the §1.3 witnesses, incl. fit-after-unfold, 100 % card size (≈ 285 × 124 px at the proxy), `case-skills-r9` gutters, and a reduced-motion pass, next to the 11/11 screenshots (`zoom-beyond-max.png`, `vertical-gaps-case-b.png`, `spacing-skills-r9.png`). Witnesses gate nothing beyond §9.1–§9.3.

### 9.5 Regression gates

Full `diagram-canvas` suite (compatibility byte-identical; measured re-pins only with named reasons, incl. **both** `rows`/`columns` redefinitions of §3.7); `diagram-core` green and untouched; token emission/aliases (incl. the two root-gap leaves); geometry gates (no overlaps, containment, scene conservation) on every fixture; measured-path performance budget (AC-11).

## 10. Lot plan for the code author (muse-spark)

Ordered lots; each ends green before the next starts. Estimates are agent-time for one `muse-spark` author including tests, excluding owner review waits. Re-priced per the review (L2/L4) plus the 11/11 scope (8th scene, scale calibration, edge-aware gaps).

| Lot | Work | Estimate |
| --- | --- | --- |
| L0 — Fixtures and baseline | Record the §9.2 clearance line; copy only the eight §1.3 cases (skills scene on export) into test fixtures; build hints from `cards[]` order (§6.4); pin retained/visible counts; implement §7.1 helper (incl. label boxes, scene band, crossing flags); record §7.4 baselines on the current engine. No engine change. Report any inverted §7.3 direction before proceeding. | 4–5 h |
| L1 — Packer, orientation, tuning | `packRows`/`packColumns` (P-1–P-8 incl. admissibility), orientation choice + hysteresis on total score (O-1–O-5), §3.5 tokens (gaps, caps, aspect, scale, duration); §9.1 tests at chrome 0 and zone chrome; §7.5 tuning grid over the 24 views + §5.3 scale calibration (keep or re-pin with reasons); extend the DC-2b cache fingerprint inputs (§6.6). | 6–7 h |
| L2 — Measured placement | Wire §3.3/§4/§3.5 into `measured.ts` (widths, placement, roots off `rankGap`, edge-aware gaps, emitted orientation record), options + `rootOrder` (§6.1/§6.4), gap plumbing, cache fingerprint (§6.6); measured-path perf fixture (AC-11); re-pin measured fixtures with reasons. `measured.ts` carries the stretch fixed-point, grouping, legend lists and lifted placement parents — priced as a placement rewrite, not a patch. | 8–12 h |
| L3 — Fold, zoom-invariance, #203 | Fold/zoom fixtures (§9.2), stability pins, label gate (AC-21), `validateView` zero-diagnostic assertions, fresh-process determinism. | 4–5 h |
| L4 — Host creation: `DiagramSceneFigure` | Create `packages/components-svelte/src/lib/DiagramSceneFigure.svelte` + tests, barrel export, CARDS §7.6 props (§6.7): Z-1–Z-8 camera (cap at `MAX_DISPLAY_SCALE`, out, fit box, reset, readout, reclamp), `previousOrientation` feedback, T-1–T-4 transition + reduced motion from tokens; production-measurer re-check (§7.5); §9.3 host tests. Greenfield in this repo — priced as creation. | 8–12 h |
| L5 — Gates and hand-off | §9.4 CI witness wiring, §9.5 suites, Appendix A metric pins filled from L0/L1, change notes (re-pins, both `rows`/`columns` semantics, any default/scale change), register update proposal for DLR-385–388. | 3–4 h |

Total: **33–45 agent-hours**. Critical path L0 → L1 → L2 → L3; L4 can overlap L3 once the orientation record exists. If L0 baselines contradict a §7.3 direction, stop and report to the conductor before L1: the fixture is wrong, not the criterion (§7.4).

Author instructions: implement §§3–7 exactly; stay in the §6.6 seam; never copy reference code/constants; measure first (L0 before L2); copy nothing beyond the eight cases; give every re-pin a one-line reason; no Python, no new dependency, no local Chromium.

## 11. Open defaults (retained, tunable)

None blocking. Retained unless the owner rules otherwise; each reversible by token/option alone:

1. Target aspect **1.78 (16:9)** for every packed level, zones included (AC-1); legend lists exempt (§3.3).
2. Score defaults **tallBias 1.6**, **emptyPenaltyWeight 0.4**, **orientationHysteresis 0.08** (total-score units), tuned on the eight scenes by the §7.5 protocol (grid + hard constraints incl. P-3 admissibility + rank rule) before L2 pins them.
3. Spacing defaults: base sibling gaps **24 px** both axes, hard caps **32 px** both axes (`gapInlineMax`/`gapBlockMax`), root gaps via the `diagramCard.rootGap*` leaves (§3.5); edge clearance absorbed inside the caps (DEC-6).
4. Camera/transition defaults: `MAX_DISPLAY_SCALE` **0.62** starting proxy (token, §5.3 calibration; readout 100 % = this scale), fit box `min(viewW·9/16, 0.85·windowH)` × `viewW`, transition **240 ms** token duration, **0 ms** under reduced motion (§§4–5).

## Appendix A. Case → AC map and per-scene gates

Normative mapping. Geometry gates read final rectangles + label boxes (§7.1); zoom/transition gates are host/CI (§9.3–§9.4).

| Case / views | Must satisfy | Scene-specific gate |
| --- | --- | --- |
| `case-a` — `unfolded`, `pkg-folded`, `track-folded` | AC-4, AC-7, AC-8, AC-9, AC-10 (regression); AC-3, AC-19, AC-21, AC-24 as non-regression (already conforming gaps/labels stay conforming) | Stays as is: owner verdict ok. No geometry change is required beyond not regressing reading order, folds and 460 × 200 footprints. Any re-pin needs a §3.7 reason. |
| `case-b` — `unfolded`, `mesh-engram-folded`, `folded` | AC-1–AC-10, AC-13–AC-25 (all applicable) | Spacing fix (AC-19, root included) on all views; root no longer a one-column stack in `unfolded`; zoom cap/fit/reset demonstrated on this scene (AC-13/AC-14/AC-22/AC-23). Direct successor of `vertical-gaps-case-b.png`. |
| `case-c` — `unfolded`, `lib-folded`, `folded` | AC-1–AC-10, AC-16–AC-25 | Spacing fix (AC-19) on all views; `diagram-core` children (2 leaves) pack on one line inside their zone per AC-2/O-2. |
| `case-d` — `unfolded`, `folded` | AC-1–AC-10, AC-16–AC-25 | Spacing fix (AC-19); folded view keeps the aggregated `lance · appelle · 2 liaisons` summary on the 460 × 200 Track card (AC-9/W-4). |
| `ajout-preprod` — `before`, `intermediate`, `after`, `folded` (retained 14/27/29/29; visible 14/26/29/7; `intermediate` carries 1 folded container) | AC-1–AC-25 | Transition exercise: per-view metrics gated as separate calls (AC-20); orientation/grid evolves `before → intermediate → after` only toward lower total P-3 scores outside the band (AC-16/AC-17); `folded` keeps 6 collapsed 460 × 200 containers with summary edges (AC-9). |
| `migration-cluster-mesh` — `before`, `intermediate`, `after`, `folded` (retained 14/28/30/30; visible 14/28/30/8) | AC-1–AC-25 | Transition exercise: topological change must not re-stack vertically at any step; per-view AC-20 gates; `folded` (9 collapsed) frames on one fit (AC-14/AC-23). |
| `vue-globale` — `before`, `intermediate`, `after`, `folded` (retained 25/36/37/37; visible 25/34/37/12) | AC-1–AC-25 | Largest scene: root aspect/fill/frame-fill gates of §7.3 apply on visible leaves (DEC-7); `folded` (13 collapsed) is the executive reading and must fit via AC-14/AC-23 without exceeding AC-19 gaps. |
| `case-skills-r9` — `unfolded` (10 sibling cards, 1 internal edge, 1 outgoing edge) | AC-1–AC-10, AC-16–AC-25; AC-25 decisive | Both-axes gutter gate (AC-25): no-edge gutters 24 px, all gutters ≤ 32 px, no reserved lane for the outgoing edge. Direct successor of `spacing-skills-r9.png`. Blocks on the h2a export only for this row. |

Numeric pins per view are recorded by L0/L1 in fixtures; §7.3 gates stand without waiting for pins.

## Appendix B. Orientation example (informative)

At chrome 0 with two equal cards, gap 24, target 1.78, `tallBias` 1.6: the 1×2 row scores 0.98 and the 2×1 column 0.79 — the column would win on score alone, which is why P-3 removes the all-singleton candidate for n ≥ 2 (DEC-1) and AC-2 then holds at the root as well as inside a zone (zone chrome only widens the margin). Orientation stays scored, never assumed: mixed footprints can favour columns, and near the boundary (total-score gap < `orientationHysteresis`) O-4 keeps the previous orientation. Fixtures pin winners with measured chrome; synthetic boxes pin the band.





