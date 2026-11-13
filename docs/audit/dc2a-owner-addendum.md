# DC-2a owner addendum

This patch carries owner sections A1–A13 through the shared scene model and
the Svelte and Vue hosts. It preserves endpoint provenance, Vue menu cascade
and the ERD work merged from main. ERD tables remain exempt from card icons.

## Behavior and acceptance evidence

| Sections | Change | Evidence |
| --- | --- | --- |
| A1, A9 | Each nested or root channel counts routed occurrences, including members of folded bundles, and the labels intersecting its strips. Both axes use a token-driven clamped formula. Empty channels use the minimum. Parallel routes retain dock normals, containment, obstacles and pair reservations. | `owner-addendum.test.ts` independently recounts h-cond traffic in both fold states; `dense-labels.test.ts` retains 14 separate labels and disjoint parallel routes. |
| A2, A3 | Resolve explicit icon → profile/type data binding → closed role default. The scene host defaults to the DS registry and strict mode; unresolved components report `card-icon-missing` and display `unknown`. | Shared resolution tests cover precedence, missing roles and shape exemptions; jsdom mounts both hosts with default and unresolved icons. |
| A4, A5, A11 | Replay the measured label text, retain all card and zone slots, wrap full footers/subtitles, and grow/repack content. Overflow is diagnostic; DOM and SVG helpers retain the component. | h-cond, vue-globale, memory and README content fixtures; both hosts check nonempty labels, icons, complete footers and zero refusals. |
| A6, A13 | The fixture adapter consumes approved `source.layout.top` and `source.layout.children`. A resize changes the camera while preserving the figure arrangement. | `owner-order.test.ts` compares visible membership, containment, column reading order and physical channels with independently extracted R14 geometry, unfolded and folded. Paired old/new column snapshots expose regrouping. The existing 390/1440 and route/label collision checks remain. |
| A7, A8 | Both fold states use the inset token. The anatomy contract includes both hosts' rendered slot trees, inline positioning, actual button dimensions, button styles and relevant tokens. Component-index exposes its digest to all ports. | `diagram-anatomy-rendered.test.ts` mounts each host's standalone card and folded/expanded zone. Changing an inline slot position or the actual button size fails the golden assertion. Token overrides at 8/20 units retain equal top/right offsets. CI's `anatomy change` label gate remains. |
| A10 | Default lines, arrowheads, card bars and label chips use neutral colors. Existing icon colors remain part of the icon anatomy. | Standalone SVG tests and host parity; neutral edge/chip tokens are explicit. |
| A12 | Proposed structured bundle chip: count header, one marked group per relation, separator, hanging indent and 320 px width cap. Its complete height is measured and cached. Separators are painted without consuming layout height. | Deterministic measurement, group count, host markup and SVG checks. |

The DC-2b fingerprint includes both axes' channel metrics, label band, caps,
effective dock spacing and the bundle width cap. Bundle measurements are
reused on cache hits.

## Calibration needing owner resolution

A9 names two target bands that do not intersect on the supplied inputs.
The 0.40.0 medians are 24 px horizontally and vertically for both appctx
architecture and vue-globale. Doubling gives 48 px (±15%: 40.8–55.2).
The approved R14 inner gaps are 160 px on each axis; its root vertical gap
is 280 px. Applying the specified old-inner ratios gives 106.67 px
horizontally (90.67–122.67) and 80 px vertically (68–92).

The current defaults are retained pending owner choice:

| Parameter | Horizontal | Vertical |
| --- | ---: | ---: |
| Minimum | 96 | 72 |
| Base | 64 | 8 |
| Track pitch | 14 | 7 |
| Label band | 30 | 30 |
| Maximum | 240 | 240 |

The owner is comparing V1 **72/96**, V2 **48/48**, and V3 **20/80** world units
(vertical/horizontal). A9 and Carbon M5 remain pending that selection. No
numerical A9 target is accepted by this patch. `owner-spacing.json` retains
the independently derived historical measurements and lists the choices;
acceptance reads the current token data instead of pinning provisional medians
or declaring an old-ratio target accepted.

The single source is `packages/tokens/src/diagramSpacing.ts`. Its first data
line contains `gapMin`, `gapMinBlock`, `gapBase`, and `gapBaseBlock`; the
remaining channel parameters and `containerPadding` are alongside it.
`scripts/sync-diagram-spacing.mjs` generates canvas's DOM-free defaults during
its build. A freshness test rejects drift. Zone child gaps and card root gaps
alias the scene tokens, and both mounted hosts read them into layout/cache
metrics. Change that one data line to apply the owner's gap choice, then build
canvas/tokens/themes and refresh the affected geometry goldens.

CSS tokens: `--st-component-diagramScene-gapMin`, `-gapMinBlock`, `-gapBase`,
and `-gapBaseBlock`. Inner padding is
`--st-component-diagramScene-containerPadding` (16 units). Zone content insets,
card-to-frame and nested-zone placement, footer measurement, both mounted
hosts and standalone SVG use that same padding. Regressions cover 16/32 units.

Residual differences from R14 include DS card anatomy, content-driven heights,
16:9 packing instead of the old large fixed whitespace, and exterior label
lanes when a channel is saturated. This is geometry/content validation through
SSR and jsdom, without a browser pixel comparison.

## PR 277 review fixes

The three Astra Major reproductions failed before their fixes:

- **A6:** memory's root and child hints differed from the stored approved
  order (`host-poste` now starts at `rt-codex` and ends at `rt-claude`).
  `owner-order.test.ts` now checks that order and the independent geometry.
- **A8:** all six mounted anatomy cases lacked a corresponding rendered
  contract. Their committed golden now captures the rendered slots and
  controls, with negative mutation witnesses for position and size drift.
- **A11:** a 100-character identifier exceeded every default standalone
  text slot. The default measurer now uses the content-preserving wrapper,
  breaking long words while retaining characters and growing height.
  Pure card/zone/SVG and both hosts check complete strings and line widths
  for title, subtitle/body, kicker and footer. Explicit hard caps still
  report overflow.

Carbon Blocking/Major findings were also checked:

- **B1:** retain unplaced-label widening requests; feasible placed chips
  reserve their thickness and stabilize subsequent passes. Chips larger
  than the axis cap retain exterior lanes instead of widening an unusable
  internal gap. Geometry/fill gates remain enforced.
- **B2:** missing font slots use their role's size/weight, expanded zone
  footers participate, and comparison uses the effective scene measurer.
  New documents reset font corrections and consumer measurers take priority.
  Both font helpers failed the inherited-16px regression before the fix;
  mounted font-ready/unfold tests also pass.
- **B3:** the valid presentation sentinel `icon: "none"` carries shape
  exemptions and non-strict unresolved icons through projection, measurement
  and rendering, without changing diagram-core's pinned schema. Standalone
  component defaults retain their icons; unknown-icon diagnostics are reachable.
- **B4:** the label workflow, source-contract check and mounted font tests
  already existed at the inspected head. A8 strengthens the rendered contract;
  B2 adds the missing-slot witness.
- **M1:** unlabelled bundles render their count without internal relation IDs;
  named groups retain their text. Measure each bundle once.
- **M2:** authored sibling gaps and group `gapAfter` replace the default floor.
  Regressions retain 48-unit sibling hints and 8/10-unit group gaps.
- **M3:** expanded toggles resolve the same inset token as folded cards.
- **M4:** DOM/SVG directed links have neutral arrowheads; standalone scenes
  retain ERD tables, cardinalities, label leaders and injected line measurements.
- **M5:** belongs to the pending A9 owner decision above.

Golden updates cover approved memory ordering, feasible label clearance,
rendered anatomy/button tokens and the measured tuning grid. Historical
baseline/stability/reference artifacts are retained.

## Fixture provenance and golden changes

The requested sentropic kit location was absent. The read-only source was
the existing `tmp/worktrees/ecosystem-ds/docs/governance/kit/src/presentation-scenes.json`
under the same sentropic checkout. Its manifest has ten named README frames:
h2a, surfaces, cluster-mesh, cm-catalog, cat-mcp, cm-storage, cm-security,
cm-cluster, engram and design-system. These ten, the overview and an additional
fully unfolded central frame provide twelve README fixtures. The central
frame is explicitly identified as additional coverage, not an eleventh
historical named frame. Memory comes from the approved `memory-scenes-r14.json`;
vue-globale comes from the existing DS fixture. Extraction is reproducible
with `scripts/dc2a-owner-fixtures.mjs`. Independent geometry is separately
reproduced by `scripts/generate-r14-reference.mjs`: it executes the pure
`renderContainerScene` for the approved memory scene and extracts placement
through the exact `layout-r9.js` imported by that renderer for both fixtures.
The renderer and placement source hashes are recorded. R14's prepared route
table only accepts its original scene/fold keys; the synthetic vue-globale
fixture therefore uses the extracted placement function, without changing the
reference engine or launching a browser.

Golden changes required by the addendum:

- Eight h-cond snapshots in `__snapshots__/h-cond.test.ts.snap`: mandatory
  icons, full subtitles/content, flow-sized gaps and structured bundles.
- Fourteen new owner fixture snapshots in
  `__snapshots__/owner-addendum.test.ts.snap`: twelve README scenes, memory
  and vue-globale, pinning node geometry and complete measured labels.
- `after.json`: all 31 scene/fold rows regenerated for the new content and
  spacing; `tuning.json` and `fill-feasibility.json` refreshed with the same
  new minima, content and mandatory-icon measurement.
- New `owner-spacing.json` and `contracts/diagram-anatomy.v1.json`.

Historical `baseline.json`, stability input and old reference artifacts remain
the comparison evidence. Anatomy changes requiring owner approval are the
mandatory icon allocation, complete content slots, equal toggle insets and
neutral default accent. The PR carries the required label and lists them.

## Side-by-side artifacts

The shared DS SSR path generates these standalone SVGs, with declared
Inter/system fonts, under `scratchpad/dc2a-fix/renders/` in the parent checkout:

- `appctx-architecture-unfolded.svg`
- `vue-globale-compact.svg`
- `vue-globale-folded-390.svg`
- `readme-frame-cluster-mesh.svg`
- `readme-frame-cat-mcp.svg`

The SVG root records viewport width and display scale. The full world viewBox
is preserved at the narrow viewport, so the artifact retains the same figure
arrangement and full extent.

## Verification

Final scoped results: canvas **522 passed, 1 skipped** (47 files), plus the
additional padding-origin regression **1 passed**; Svelte diagram suites
**361 passed** (8 files); Vue diagram/ERD/cross-host suites **227 passed**
(7 files); component-index **139 passed**; tokens **18 passed**; themes
**7 passed**. Repository/index/layering/workflow guards: **37 passed** across
the suite and an isolated retry. One temporary-tree cleanup failed with
`ENOTEMPTY` while removing its `.git` directory; the same guard passed on
an isolated rerun without changing its assertions.

Canvas and both host builds and type checks passed. Svelte check reports
zero errors (26 main-config warnings; zero parity warnings). Vue's build
includes vue-tsc and published-type checks. Anatomy and generated-spacing
freshness checks, index generation/check (430 artifacts), diff checks and
licensing (22 packages) passed. Package versions are retained. No root test
command, browser, Python or Track command was used.
