# DC-2a L2/L3 verification — conductor fill decision 12/11

Code/tests: `feat/dc2a-l2-l3`, HEAD `4256c9aeebd3a498ce2db35b7adba6d1d424f47b` plus this working-tree diff, in `.dc2a-build`.
Spec: `spec/dc2a-rowpack-autolayout`, only `spec/SPEC_EVOL_DC2A_ROWPACK_AUTOLAYOUT.md`, in `.dc2a-wt`.

The conductor decision is recorded verbatim as **Appendix E — Fill gate scope (conductor decision 12/11)** in the spec. This completes the remaining L2/L3 fill acceptance work: 20 capped views use a centred camera at exactly MAX_DISPLAY_SCALE (0.62), and 11 frame-limited views retain the frame-fill gate. Ten frame-limited cluster views use independently proven leaf-fill bounds minus 0.02. All other acceptance gates stay unchanged.

The supplied HEAD's report recorded two failing assertions: eleven leaf-fill misses and the folded-migration frame comparison. Appendix E exempts the capped `case-skills-r9/skills-unfolded` and `migration-cluster-mesh/folded` views; the ten remaining leaf thresholds now have per-view proofs. Production geometry, fixtures, baseline.json, after.json and tuning.json were not re-pinned in this change.

## Per-view fill acceptance

Fill and threshold pairs are **leaf / frame**. Leaf fill is visible-leaf area / entity-bbox area (DEC-7); frame fill is fit-scaled entity-bbox area / 1440 × 810. Leaf thresholds apply at ≥9 visible leaves. Frame comparisons are strict, as in §7.3. Scope uses the live whole-scene fit (entities, routes and labels), before rounding and the readability floor; the table displays the unchanged pinned measurements.

Sources: **E** = spec Appendix E, capped views exempt from both fill gates and tested for centred maximum-scale letterboxing. **P** = [fill-feasibility.json](fill-feasibility.json), keyed by the exact scene/view, reproduced by [fill-feasibility.mjs](fill-feasibility.mjs). **§7.3** = unchanged L0 comparison in [baseline.json](baseline.json). Full-precision thresholds live in P; table decimals are for reading.

| Scene/view | Scope | Fill: leaf / frame | Threshold: leaf / frame | Source |
| --- | --- | ---: | --- | --- |
| vue-globale/before | frame-limited | 0.280 / 0.709 | ≥ 0.260363475 / > 0.079 | P + §7.3 |
| vue-globale/intermediate | frame-limited | 0.308 / 0.988 | ≥ 0.288211835 / > 0.052 | P + §7.3 |
| vue-globale/after | frame-limited | 0.256 / 0.942 | ≥ 0.236140635 / > 0.048 | P + §7.3 |
| vue-globale/folded | capped | 0.683 / 0.311 | exempt / exempt | E |
| ajout-preprod/before | capped | 0.380 / 0.479 | exempt / exempt | E |
| ajout-preprod/intermediate | frame-limited | 0.315 / 0.976 | ≥ 0.296077087 / > 0.066 | P + §7.3 |
| ajout-preprod/after | frame-limited | 0.333 / 0.970 | ≥ 0.314359621 / > 0.059 | P + §7.3 |
| ajout-preprod/folded | capped | 0.680 / 0.134 | exempt / exempt | E |
| migration-cluster-mesh/before | frame-limited | 0.316 / 0.499 | n/a (<9 leaves) / > 0.158 | §7.3 |
| migration-cluster-mesh/intermediate | frame-limited | 0.397 / 0.910 | ≥ 0.378489612 / > 0.062 | P + §7.3 |
| migration-cluster-mesh/after | frame-limited | 0.331 / 0.928 | ≥ 0.310965505 / > 0.059 | P + §7.3 |
| migration-cluster-mesh/folded | capped | 0.907 / 0.134 | exempt / exempt | E |
| case-a/unfolded | capped | 0.306 / 0.396 | exempt / exempt | E |
| case-a/pkg-folded | capped | 0.366 / 0.249 | exempt / exempt | E |
| case-a/track-folded | capped | 0.534 / 0.114 | exempt / exempt | E |
| case-b/unfolded | capped | 0.409 / 0.223 | exempt / exempt | E |
| case-b/mesh-engram-folded | capped | 0.517 / 0.176 | exempt / exempt | E |
| case-b/folded | capped | 0.690 / 0.132 | exempt / exempt | E |
| case-c/unfolded | capped | 0.573 / 0.159 | exempt / exempt | E |
| case-c/lib-folded | capped | 0.584 / 0.104 | exempt / exempt | E |
| case-c/folded | capped | 0.975 / 0.062 | exempt / exempt | E |
| case-d/unfolded | capped | 0.585 / 0.155 | exempt / exempt | E |
| case-d/folded | capped | 0.975 / 0.062 | exempt / exempt | E |
| case-skills-r9/unfolded | frame-limited | 0.511 / 0.741 | ≥ 0.490807059 / > 0.082 | P + §7.3 |
| case-skills-r9/skills-unfolded | capped | 0.508 / 0.657 | exempt / exempt | E |
| case-skills-r9/folded | capped | 0.975 / 0.062 | exempt / exempt | E |
| case-integration-r9/unfolded | frame-limited | 0.368 / 0.808 | ≥ 0.347962535 / > 0.091 | P + §7.3 |
| case-integration-r9/folded | capped | 0.919 / 0.132 | exempt / exempt | E |
| case-trackfocus-r9/unfolded | frame-limited | 0.397 / 0.730 | ≥ 0.379311228 / > 0.101 | P + §7.3 |
| case-trackfocus-r9/inner-folded | capped | 0.485 / 0.188 | exempt / exempt | E |
| case-trackfocus-r9/folded | capped | 1.000 / 0.030 | exempt / exempt | E |

## Proof and scope checks

The diagnostic uses only the cleared input fixtures, their SHA-256 digests, the L0 thresholds and the pinned tokens/text metrics. It does not read after.json or import the engine. It enumerates every P-1 prefix candidate in both forms at each level, applies P-3/P-4/O-2, includes fixed leaf sizes, header chrome and the measured path's U-channel reservation, and freezes the selected shelves (BF-6). At fixed shelves and header heights, increasing any gap from 24 toward its 32 px cap cannot reduce the bbox area. Minimum-gap area therefore gives an optimistic upper bound on leaf fill under the prescribed algorithm. This is not a claim about unrestricted packing or alternative scoring rules.

The proof test reproduces stdout byte for byte, checks each minimum bbox and shelf choice against a fresh live base-gap layout, checks final dimensions cannot shrink below that minimum, and verifies every adjusted threshold is exactly its bound − 0.02 and below the unreachable spec value. The existing BF-6 test independently checks final shelves remain identical to base-gap shelves.

| Scene/view | Minimum bbox | Original §7.3 leaf threshold | Optimistic bound | Bound − 0.02 | Scope |
| --- | --- | ---: | ---: | ---: | --- |
| vue-globale/before | 3008 × 1200 | 0.618 | 0.280363475 | 0.260363475 | active |
| vue-globale/intermediate | 3072 × 1749 | 0.662 | 0.308211835 | 0.288211835 | active |
| vue-globale/after | 3588 × 1902 | 0.647 | 0.256140635 | 0.236140635 | active |
| ajout-preprod/intermediate | 3008 × 1645 | 0.769 | 0.316077087 | 0.296077087 | active |
| ajout-preprod/after | 3008 × 1738 | 0.763 | 0.334359621 | 0.314359621 | active |
| migration-cluster-mesh/intermediate | 2524 × 1555 | 0.726 | 0.398489612 | 0.378489612 | active |
| migration-cluster-mesh/after | 3008 × 1571 | 0.696 | 0.330965505 | 0.310965505 | active |
| case-skills-r9/unfolded | 2460 × 1025 | 0.872 | 0.510807059 | 0.490807059 | active |
| case-skills-r9/skills-unfolded | 1944 × 1025 | 0.893 | 0.507879153 | 0.487879153 | capped; diagnostic only |
| case-integration-r9/unfolded | 2460 × 1118 | 0.779 | 0.367962535 | 0.347962535 | active |
| case-trackfocus-r9/unfolded | 2492 × 1017 | 0.759 | 0.399311228 | 0.379311228 | active |

The diagnostic also retains the folded-migration capped-frame impossibility calculation: even both 32 px gutters give at most 0.135536593 frame fill versus the old >0.147 comparison. Appendix E scopes that gate out; no replacement frame threshold is used. Every frame-limited view beats its original frame-fill threshold.

The new camera check transforms the whole scene with the shipped worldToView/applyRect functions and verifies equal opposite margins, containment, no panning and exact 0.62 scale for every capped view. This is the L2/L3 harness projection of Z-3; host integration remains L4. A boundary regression check includes distant route and label extents and a fit of 0.6199 (display-rounded to 0.620), plus a fit below the readability floor, so rounded or floored values cannot grant a cap exemption.

## Validation

Full-suite result: **36 files passed; 418 tests passed, 1 skipped (419 total)**, 67.60 s. All L2/L3 gates passed. The three added tests cover proof reproduction/live shelf agreement, capped-scene centring at the exact maximum scale, and scope boundaries involving route/label extents, rounding and the readability floor.

Commands, from `packages/diagram-canvas`, with the requested `npm_config_cache` value:

- `rtk npx vitest run` — complete diagram-canvas suite, including performance, tuning, folds, routing, label placement and fresh-process determinism. Log: `.dc2a-build/dc2a-fill-full-suite.log`.
- `rtk npx tsc -p tsconfig.check.json` — passed.
- `rtk node tests/layout/dc2a/fill-feasibility.mjs` — passed; stdout reproduces the pinned proof output byte for byte in the suite.
- `rtk git diff --check` — checked in both worktrees.

No commit, push, stash, root npm test, Python, new dependency or fixture change.

## Files changed in this pass

Build worktree: `tests/layout/dc2a/rowpack.test.ts`, `rowpack-metrics.ts`, `fill-feasibility.mjs`, new `fill-feasibility.json`, and this report (all under `packages/diagram-canvas/`). Spec worktree: only `spec/SPEC_EVOL_DC2A_ROWPACK_AUTOLAYOUT.md`.
