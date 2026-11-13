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
| A6, A13 | Source order is explicit layout data. A resize changes the camera, preserving the figure's row-pack arrangement, with the readability floor and horizontal scrolling. | Folded vue-globale and memory at 390/1440 have identical node geometry and orientations. Geometry and label boxes are golden-pinned. |
| A7, A8 | Card and zone toggles use the same 8 px top/right inset. The committed anatomy contract pins geometry, slot layout, tokens and both hosts' anatomy stylesheets. Component-index entries expose its digest to all ports. CI requires the `anatomy change` label for golden changes. | Shared model and jsdom parity checks plus `diagram-anatomy-contract.mjs`; component-index generation/check. |
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

The provisional implementation favors the old-inner ratios:

| Parameter | Horizontal | Vertical |
| --- | ---: | ---: |
| Minimum | 96 | 72 |
| Base | 64 | 8 |
| Track pitch | 14 | 7 |
| Label band | 30 | 30 |
| Maximum | 240 | 240 |
| Appctx unfolded median | 96 | 72 |
| Vue-globale median | 101 | 80 |

`owner-spacing.json` pins the source measurements, alternatives and provisional
decision. The tests verify the old-ratio band and explicitly verify the
disjoint target bands. They do **not** assert that the incompatible 2×24 target
passes. The minima also mean that sparse channels sit at the lower clamp,
not its middle. A9 supersedes A1's initial 40/32/14/160 defaults and A6's
earlier raw-old-gap tolerance; the remaining calibration needs owner choice.

Residual differences from R14 include DS card anatomy, content-driven heights,
16:9 packing instead of the old large fixed whitespace, and exterior label
lanes when a channel is saturated. This is geometry/content validation through
SSR and jsdom, without a browser pixel comparison.

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
with `scripts/dc2a-owner-fixtures.mjs` and never imports the old renderer.

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

Scoped results: diagram-canvas 506 passed with one pre-existing skipped dense
performance follow-up; Svelte diagram suites 361 passed; Vue diagram suites
213 passed; core merge checks 12 passed; tokens 36 passed; themes 14 passed;
component-index 139 passed; repository/index/layering/workflow guards 37 passed.
The final metric pins and the affected zone-token assertion were checked again
after their updates.

Core/canvas, tokens/themes and both host builds passed. Svelte check reports
zero errors (26 existing warnings in the main config; zero warnings in the
parity config). Vue's build includes vue-tsc and published-type checks. The
anatomy contract, index generation/check (430 artifacts), npm 10.9.9 lock
regeneration, third-party notices and licensing gate passed. No root test
command or browser was used.
