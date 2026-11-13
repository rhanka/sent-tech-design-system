# Diagram 0.40 blocking patch

Base: `23929b5b` on `fix/dc2a-ds040-defects`. The supplied consumer report and PNGs were inspected. The four cleared JSON inputs are copied without modification; their SHA-256 values are in the fixture README.

| Defect | Fix | Regression evidence |
| --- | --- | --- |
| 1. Card text crosses titles/footers | Scene cards use the Inter token-face metrics with a 1.12 fallback width factor, the renderer’s actual text widths, content-derived height and a `card-grown` diagnostic. Both hosts wait for `document.fonts.ready`, measure the computed face with canvas and invalidate the DC-2b cache once when the content or label would overflow. | Both dossiers × folded/unfolded × 1440/390; body/footer invariant; both mocked font-ready paths; single zone diagnostic emission. |
| 2. Right side clipped after fit | Fit uses the drawable item union, including ports, routes and placed labels; suppressed bundle routes cannot retain stale authored extents. The scroll extent covers the complete union at the 0.45 floor. Capped scenes retain centring and shrink the frame height to the scene. | Eight full-bbox witnesses, authored-route replacement, camera suite and both mounted hosts. |
| 3. Labels cover cards/headers/labels | The entire zone header band blocks placement. Candidate placement and obstacle routing retain their retries; saturated external channels gain a comb column included in the fit union. | Card/header/label intersection and unrelated-card route checks on all eight scenes; saturated 14-label channel. |
| 4. Folded zones touch and lifted labels overlap | Folded containers use zone gaps. Lifted parallel relations share one route with an N-relations label and the original label list in its title; semantic occurrences remain intact. A saturated general comb may share a trunk while retaining distinct label rows. | Folded sibling gaps, bundle counts, title data and label separation at both widths. |
| 5. Nested storage overlaps a sibling | Bottom-up sizing reserves each descendant’s full measured card size plus the actual header, footer and insets before seating any sibling. | Nested containment/child-sibling checks in the architecture fixture; deep-container and existing DC-2a suites. |

## Golden changes

- New: the four `fixtures/h-cond/appctx-*.json` source fixtures and eight `h-cond.test.ts.snap` scenes. Geometry, routes, labels, bundle titles and complete bounds are pinned at both widths.
- `after.json`: 23 of 31 metric records change because measured heights, footer space, header blockers and lifted bundles change scene geometry. The eight other records remain unchanged.
  - vue-globale/before
  - vue-globale/intermediate
  - vue-globale/after
  - vue-globale/folded
  - ajout-preprod/before
  - ajout-preprod/intermediate
  - ajout-preprod/after
  - migration-cluster-mesh/before
  - migration-cluster-mesh/intermediate
  - migration-cluster-mesh/after
  - case-a/unfolded
  - case-a/pkg-folded
  - case-a/track-folded
  - case-b/unfolded
  - case-b/mesh-engram-folded
  - case-c/unfolded
  - case-c/lib-folded
  - case-d/unfolded
  - case-skills-r9/unfolded
  - case-skills-r9/skills-unfolded
  - case-integration-r9/unfolded
  - case-trackfocus-r9/unfolded
  - case-trackfocus-r9/inner-folded
- `fill-feasibility.json`: the independent proof now uses measured leaf area and footer/header heights instead of a fixed 200 px leaf. Its eleven existing scene records are recalculated:
  - vue-globale/before
  - vue-globale/intermediate
  - vue-globale/after
  - ajout-preprod/intermediate
  - ajout-preprod/after
  - migration-cluster-mesh/intermediate
  - migration-cluster-mesh/after
  - case-skills-r9/unfolded
  - case-skills-r9/skills-unfolded
  - case-integration-r9/unfolded
  - case-trackfocus-r9/unfolded
- `tuning.json`: the nine calibration cells are recomputed for the corrected geometry. The four hysteresis bands are unchanged. The observation now records 1.6 / 0 as the alternative that improves the old ranking; shipped row-pack defaults are retained in this patch.
- `baseline.json`, `stability.json` and the original DC-1 reference SVG/PNG assets are unchanged.
- The generated component index and contract digests are regenerated for Svelte/Vue version pins and the scene sizing/cache props; these are generated API artifacts, not visual rebaselines.

## Versions and generated artifacts

- `@sentropic/diagram-canvas` 0.1.1; `@sentropic/design-system-svelte` 0.40.1; `@sentropic/design-system-vue` 0.39.1.
- `diagram-core` stays 0.1.0; its source is unchanged.
- Consumer pins, including dataviz-vue, and the npm 10.9.9 lockfile are updated. Notices generation, component-index generation/check and licensing are required validation commands. No tags.

## Validation

Final command results are recorded in the PR. Commands use the supplied npm cache. The root npm test command, Track, browser runners and Python were not used.

- Canvas: `node node_modules/vitest/vitest.mjs run --config packages/diagram-canvas/vitest.config.ts --maxWorkers=2` and both TypeScript configurations.
- Svelte: scoped card/zone/scene/SSR/presentation suites, package build, both svelte-check configurations.
- Vue: full `src` Vitest suite (including built Vapor), cross-host dossier/font/diagnostic suites, package build with vue-tsc and published-type checks.
- `node --test scripts/component-index.test.mjs`, layering guard, index generation/check, notices generation and licensing check.

## Browser handoff

h-cond should repeat the existing 1440×900 and 390×844 captures with the patched packages, check loaded and fallback fonts for painted overflow, scroll to the rightmost/bottom content at the readability floor, inspect bundle titles and confirm that capped folded frames have no large empty band. This patch has only Node/Vitest/jsdom validation.

The named standalone DC-2a/DC-2b spec files are absent from this checkout; the committed DC-2a Appendix E proof, acceptance suites, DC-2b integration notes and the owner’s explicit acceptance criteria were used.
