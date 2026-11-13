# Dataviz conversion evidence

Author launch: codex, requested gpt-6.1-sol, effort xhigh. Node 22.22.1; Vue/compiler 3.6.0-rc.15. Original chart fixtures/goldens committed in 596db79 before conversion.

| Component | G1 | G2 | G3 | G4 | G5 | G6 |
| --- | --- | --- | --- | --- | --- | --- |
| CrossfilteredBarChart | PASS | PASS | PASS | 7/7 | PASS | PASS |
| DrillBarChart | PASS | PASS | PASS | 6/6 | PASS | PASS |
| SmallMultiples | PASS | PASS | PASS | 5/5 | PASS | PASS |
| FieldPane | PASS | PASS | PASS | 7/7 | PASS | PASS |
| PalettePicker | PASS | PASS | PASS | 7/7 | PASS | PASS |

All five passed on their first gate run. No golden changes after capture. SmallMultiples preserves the former Grid's DOM/styles directly in its template; its BarChart children share the original domain calculation. FieldPane and PalettePicker originals were frozen in 657484b before conversion. The five public conversions comprise eight SFCs including private presenters.

Verification before readiness:

- Targeted workspace builds: tokens, themes, diagram-core, diagram-canvas, graph, components-vue, dataviz-core, dataviz-vue passed. Dataviz emitted classic and native Vapor JS/declarations; all three components appear in the Vapor barrel.
- `node packages/dataviz-vue/bench/check-package.mjs`: all three mounted from the built `@sentropic/dataviz-vue/vapor` export, selection/drill/filter updates passed, subscription disposal passed. No interop or browser process.
- Scoped Vitest: CrossfilteredBarChart, DrillBarChart and SmallMultiples, 3 files / 14 tests passed.
- Shared harness regression: Badge G1–G6 passed; shared normalizer/compiler tests 5/5 passed.
- `git diff --check` passed.

The inherited legacy allow-list contained deleted originals of prior conversions; removed those stale entries so the existing build lint could run. No new legacy entries were added.

Readiness commit: `d89b2686f00b72051d8384b659f4e1145db2874d`. The marker was written immediately after its verified commit. The orchestration log confirms marker consumption at 23:51:57 and Ember lanes 6/7 launched at 23:52:00/23:52:01 on 2026-11-12 America/Toronto. The lane started at 23:37:57: readiness took approximately 14 minutes. The three-proof conversion batch took 3 minutes 28 seconds from frozen-baseline commit to conversion commit.

Final verification for the remaining modules:

- FieldPane and PalettePicker: all six gates, 14/14 frozen SSR fixtures. FieldPane gates were rerun after simplifying its passive presenter and remained green.
- Final dataviz workspace build: 8 classic + Vapor SFCs and declarations; legacy lint passes with 316 remaining modules across both Vue workspaces.
- `node packages/dataviz-vue/bench/check-rich.mjs`: all 14 built Vapor fixtures mount/unmount without Vue errors or warnings; recursive field selection, controlled collapse, branch changes and palette prop updates pass.
- `node packages/dataviz-vue/bench/check-package.mjs`: the three built chart exports pass selection/drill/filter and subscription cleanup; an additional output-only filter regression passes.
- Scoped Vitest: index and FieldPane, 2 files / 10 tests passed; CrossfilteredBarChart with its new output-only regression, 1 file / 7 tests passed. Together with the earlier DrillBarChart/SmallMultiples runs, 25 distinct relevant tests passed.
- `node --test scripts/vue-conversion-bench/capture.test.mjs`: 6/6 capture safeguards passed, including overwrite refusal, later original capture, batch SSR failure, duplicate/unknown names, and mutation detection.
- Frozen golden diffs against 596db79 and 657484b are empty. `git grep VNode -- packages/dataviz-vue/src` returns no matches.

An extra runtime expectation for FieldPane's undeclared model listener failed. A probe of the original established the same listener filtering and lack of keyboard selection, so the expectation was corrected and its unnecessary private keyboard implementation removed. This was an expectation error, not a failed parity gate. The retained regression checks the original behavior.

The output-only chart subscription correction is described in CONTRACT-CHANGES.md. No public VNode/slot migration was needed for FieldPane or PalettePicker.
