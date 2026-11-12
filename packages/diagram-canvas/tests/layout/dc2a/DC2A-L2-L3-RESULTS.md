# DC-2a L2/L3 verification

Target: `feat/dc2a-l2-l3`, HEAD `169e12dbae8202f5ae63be7b01e0d4d48df8cc44` plus the uncommitted working-tree changes. All work stayed in `.dc2a-build`.

The engine now places every label and routes every acceptance edge without obstruction. The task remains incomplete because the unmodified leaf-fill requirement fails on 11 views, and enforcing the full frame-fill requirement exposes one additional view. Neither gate is lowered.

| Goal | Supplied HEAD, reproduced | Result |
| --- | --- | --- |
| Full diagram-canvas suite | 10 failures, 404 passing, 1 skipped; 5 failing files | 2 failures, 413 passing, 1 skipped; 1 failing file |
| Leaf fill, §7.3 | 11 failing views | 11 failing views; required baseline + 0.10 retained |
| Frame fill, §7.3 | A zoom-cap exemption hid one failing transition view | Exemption removed; `migration-cluster-mesh/folded` fails explicitly |
| AC-21 | 26 unplaced labels (author report said 25) | 0; no remaining label exceptions |
| AC-25 routing gate | 1 obstructed route | 0 |
| Geometry protection | 0 card crossings / containment escapes | 0; same-pair sharing and crossings also 0 |
| Sibling gaps, DEC-6 | 32 px cap | Largest actual gap 30 px; 0 empty widened lanes |
| Readability floor | Token, camera and pack tests already 0.45 | Verified unchanged; 18 px labels render at least 8.1 CSS px |

`rowpack.test.ts` already contained the hard leaf-fill assertion at the supplied HEAD. The proposed per-scene thresholds in the author report were not present there. The remaining frame-fill exemption was removed: every transition view is now compared with its L0 baseline even when that baseline was at the maximum display scale.

The code changes scope the safer fallback to measured layouts, restoring compatibility-path behavior. Measured U-channel headroom uses actual wrapped label heights and separate shelf identities. Label routing tries clear horizontal segments and alternate ordinary-pair faces, checks complete routes against obstacles, containment and same-pair routes, and preserves the docks and routes of other edges. Labels exclude expanded-zone interiors as blockers (Appendix D BF-6). Widening is scoped to the shared placement level so an outgoing edge cannot shift an unchanged level when another zone folds (S-1).

## Unmet fill requirements

The table below uses visible-leaf area / entity-bbox area (DEC-7), the unchanged L0 baseline + 0.10 threshold (§7.3), and the 1440 × 810 pinned frame adopted by Appendix C C-2. Frame fill is a separate metric and does not excuse a leaf-fill miss.

| View | HEAD leaf fill | Current leaf fill | Required leaf fill | Current entity bbox | L0 → current frame fill |
| --- | ---: | ---: | ---: | --- | --- |
| vue-globale/before | 0.280 | 0.280 | 0.618 | 3008 × 1200 | 0.079 → 0.709 |
| vue-globale/intermediate | 0.307 | 0.308 | 0.662 | 3072 × 1749 | 0.052 → 0.988 |
| vue-globale/after | 0.255 | 0.256 | 0.647 | 3588 × 1902 | 0.048 → 0.942 |
| ajout-preprod/intermediate | 0.312 | 0.315 | 0.769 | 3008 × 1651 | 0.066 → 0.976 |
| ajout-preprod/after | 0.345 | 0.333 | 0.763 | 3008 × 1744 | 0.059 → 0.970 |
| migration-cluster-mesh/intermediate | 0.405 | 0.397 | 0.726 | 2524 × 1561 | 0.062 → 0.910 |
| migration-cluster-mesh/after | 0.330 | 0.331 | 0.696 | 3008 × 1571 | 0.059 → 0.928 |
| case-skills-r9/unfolded | 0.508 | 0.511 | 0.872 | 2460 × 1025 | 0.082 → 0.741 |
| case-skills-r9/skills-unfolded | 0.505 | 0.508 | 0.893 | 1944 × 1025 | 0.107 → 0.657 |
| case-integration-r9/unfolded | 0.368 | 0.368 | 0.779 | 2460 × 1118 | 0.091 → 0.808 |
| case-trackfocus-r9/unfolded | 0.397 | 0.397 | 0.759 | 2492 × 1023 | 0.101 → 0.730 |

The nine non-skills misses remain unresolved under the required per-level P-3/O-2 score optima, fixed 460 × 200 leaves, declaration order and hierarchical chrome (§§3.2–3.4, Appendix D BF-1/BF-6). Their current geometry and deficits are reported above; a global impossibility proof is not claimed for those nine views.

For the two skills views there is a reproducible incompatibility, even after removing all chrome and U-channel headroom and allowing every admissible prefix-shelf candidate instead of only the P-3 optimum. The two root boxes must sit beside one another (BF-1); their child counts are 10+4 and 10+1. Exhaustive enumeration yields optimistic fill maxima 0.614635 and 0.646609, below 0.872 and 0.893. The enumeration even allows free extra width/height to bring any candidate inside the 0.35 aspect bound. Thus restoring chrome or increasing gaps cannot close these deficits.

The folded migration frame-fill requirement is also incompatible with its canonical four-card grid (§3.6, Appendix D BF-1). At both maximum 32 px gaps, the 2×2 entity bbox is at most 952 × 432; its capped frame fill is 0.135537, below the required >0.147. The actual bbox is 944 × 430, frame fill 0.134. Increasing it further would violate the fixed grid/gap contract.

Reproduce the bounds with `rtk node packages/diagram-canvas/tests/layout/dc2a/fill-feasibility.mjs`. This diagnostic reads only the cleared fixtures and never changes them. §7.4 requires reporting the conflicting baseline/criterion; it does not authorize substituting per-scene lower thresholds.

## Validation

Token compilation, theme compilation/CSS generation, component-index compilation/generation and `--check` passed (428 generated artifacts fresh). `npx tsc -p tsconfig.check.json` and `git diff --check` passed. The full suite includes the measured-path performance budgets, all nine tuning cells, S-1/S-2, and ten fresh-process determinism runs. No root `npm test` was run.

Final full-suite command: from `packages/diagram-canvas`, with the requested `npm_config_cache` exported, `rtk npx vitest run`. Result: **35 files passed, 1 failed; 413 tests passed, 2 failed, 1 skipped (416 total)**, 59.71 s. The only failing file is `tests/layout/dc2a/rowpack.test.ts`; its two failing assertions are the 11-view leaf-fill list and the folded-migration frame-fill comparison. The log is `.dc2a-build/dc2a-full-suite.log`. All other assertions, including label placement, same-pair route geometry, folds, determinism, compatibility and performance, passed.

The component-index regeneration changes only the two `sourceCommit` fields from the prior source SHA to the supplied HEAD. `pack.test.ts` already asserts 0.45, so no readability re-pin was needed.

## Re-pin reasons

These are emitted-output measurement pins required by §9.5; no acceptance threshold, baseline, fixture input, or compatibility expected result was re-pinned. There is one reason per changed scene/cell below. The existing fold moved-set pins remain unchanged.

| after.json view | Re-pinned fields | One-line reason |
| --- | --- | --- |
| vue-globale/before | labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| vue-globale/intermediate | bboxHeight, aspectRatio, logAspectError, fillRatio, frameFillRatio, frameScale, displayScale, pans, edgeLabelCssPx, gapY, widenedGutters, labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| vue-globale/after | bboxHeight, aspectRatio, logAspectError, fillRatio, frameFillRatio, gapY, widenedGutters, edgesOutsideContainer, labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| vue-globale/folded | edgesOutsideContainer, labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| ajout-preprod/before | bboxHeight, aspectRatio, logAspectError, fillRatio, frameFillRatio, gapY, widenedGutters, sceneBandX, labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| ajout-preprod/intermediate | bboxWidth, bboxHeight, aspectRatio, logAspectError, fillRatio, frameFillRatio, frameScale, displayScale, edgeLabelCssPx, gapY, widenedGutters, sceneBandX, labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| ajout-preprod/after | bboxHeight, aspectRatio, logAspectError, fillRatio, frameFillRatio, frameScale, displayScale, edgeLabelCssPx, gapY, widenedGutters, sceneBandY, labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| ajout-preprod/folded | edgesOutsideContainer, labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| migration-cluster-mesh/intermediate | bboxHeight, aspectRatio, logAspectError, fillRatio, frameFillRatio, frameScale, displayScale, edgeLabelCssPx, labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| migration-cluster-mesh/after | bboxHeight, aspectRatio, logAspectError, fillRatio, frameFillRatio, displayScale, edgeLabelCssPx, gapY, widenedGutters, sceneBandY, labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| migration-cluster-mesh/folded | edgesOutsideContainer, routeObstructed, labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| case-a/unfolded | labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| case-a/pkg-folded | bboxHeight, aspectRatio, logAspectError, fillRatio, frameFillRatio, labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| case-c/unfolded | sceneBandX | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| case-skills-r9/unfolded | bboxHeight, aspectRatio, logAspectError, fillRatio, frameFillRatio, displayScale, edgeLabelCssPx, gapY, widenedGutters, sceneBandX | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| case-skills-r9/skills-unfolded | bboxHeight, aspectRatio, logAspectError, fillRatio, frameFillRatio, gapY, widenedGutters, sceneBandX | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| case-integration-r9/unfolded | sceneBandX, labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |
| case-integration-r9/folded | edgesOutsideContainer, labelUnplaced | BF-6 measured headroom/capped gutters and safe label detours; geometry and scene-fit metrics recomputed. |

| tuning.json cell | One-line reason |
| --- | --- |
| 1 / 0 | Recomputed all 31 layouts with BF-6 headroom and safe label routing; unplaced=0, aspect misses=0; no default or gate changed. |
| 1 / 0.4 | Recomputed all 31 layouts with BF-6 headroom and safe label routing; unplaced=0, aspect misses=0; no default or gate changed. |
| 1 / 0.8 | Recomputed all 31 layouts with BF-6 headroom and safe label routing; unplaced=0, aspect misses=0; no default or gate changed. |
| 1.6 / 0 | Recomputed all 31 layouts with BF-6 headroom and safe label routing; unplaced=0, aspect misses=0; no default or gate changed. |
| 1.6 / 0.4 | Recomputed all 31 layouts with BF-6 headroom and safe label routing; unplaced=0, aspect misses=0; no default or gate changed. |
| 1.6 / 0.8 | Recomputed all 31 layouts with BF-6 headroom and safe label routing; unplaced=0, aspect misses=0; no default or gate changed. |
| 2.2 / 0 | Recomputed all 31 layouts with BF-6 headroom and safe label routing; unplaced=0, aspect misses=2; no default or gate changed. |
| 2.2 / 0.4 | Recomputed all 31 layouts with BF-6 headroom and safe label routing; unplaced=0, aspect misses=2; no default or gate changed. |
| 2.2 / 0.8 | Recomputed all 31 layouts with BF-6 headroom and safe label routing; unplaced=0, aspect misses=2; no default or gate changed. |

Changed files: layout/measured.ts; layout/route.ts; dc2a/rowpack.test.ts; dc2a/after.json; dc2a/tuning.json; dc2a/fill-feasibility.mjs; this report; component-index/generated/component-index.json; component-index/generated/component-contract-index.json.

No commit, push, stash, checkout, reset, new dependency, Python, or browser invocation.
