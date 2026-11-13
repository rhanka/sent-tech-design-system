# Dataviz conversion evidence

Author launch: codex, requested gpt-6.1-sol, effort xhigh. Node 22.22.1; Vue/compiler 3.6.0-rc.15. Original chart fixtures/goldens committed in 596db79 before conversion.

| Component | G1 | G2 | G3 | G4 | G5 | G6 |
| --- | --- | --- | --- | --- | --- | --- |
| CrossfilteredBarChart | PASS | PASS | PASS | 7/7 | PASS | PASS |
| DrillBarChart | PASS | PASS | PASS | 6/6 | PASS | PASS |
| SmallMultiples | PASS | PASS | PASS | 5/5 | PASS | PASS |

All three passed on their first gate run. No golden changes after capture. SmallMultiples preserves the former Grid's DOM/styles directly in its template; its BarChart children share the original domain calculation.

Verification before readiness:

- Targeted workspace builds: tokens, themes, diagram-core, diagram-canvas, graph, components-vue, dataviz-core, dataviz-vue passed. Dataviz emitted classic and native Vapor JS/declarations; all three components appear in the Vapor barrel.
- `node packages/dataviz-vue/bench/check-package.mjs`: all three mounted from the built `@sentropic/dataviz-vue/vapor` export, selection/drill/filter updates passed, subscription disposal passed. No interop or browser process.
- Scoped Vitest: CrossfilteredBarChart, DrillBarChart and SmallMultiples, 3 files / 14 tests passed.
- Shared harness regression: Badge G1–G6 passed; shared normalizer/compiler tests 5/5 passed.
- `git diff --check` passed.

The inherited legacy allow-list contained deleted originals of prior conversions; removed those stale entries so the existing build lint could run. No new legacy entries were added.
