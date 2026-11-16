# Dataviz Vapor integration verification

Stacked on PR 280, branch `feat/vue-vapor-night` at `2c2376a0`.
Merged all four `feat/vapor-dv2-lane-*` branches from common base `ad2c8e7d`.
The original fixture/golden pairs were retained. WebFrame, DataImage and
ObjectLayerPanel were captured from ObjectLayers.ts before splitting it.
SelectionLegend retains the original empty-render contract.

| Source-conversion metric | Before | After |
| --- | --- | --- |
| dataviz-vue | 0 / 115 (0%) | 120 / 120 (100%) |
| components-vue | 233 / 233 (100%) | 233 / 233 (100%) |
| combined | 233 / 348 (66%) | 353 / 353 (100%) |
| dataviz-vue K25 legacy modules | 115 | 0 |

The 120 dataviz SFCs contain 117 public components and three private template
children. Splitting ObjectLayers adds two public source files relative to its
single original module. This metric measures source conversion, not exhaustive
behavioral coverage. No blocked component remains.

| Gate | Result |
| --- | --- |
| G1 typed template + K25 safety AST | 117 / 117 PASS |
| G2 Classic/Vapor compiler pipeline + build pin | 117 / 117 PASS; final source/compile sweep repeated after native-barrel fix |
| G3 scoped vue-tsc | 117 / 117 PASS |
| G4 archived SSR fixtures | 117 / 117 PASS; 639 fixtures |
| G5 every-fixture Classic/Vapor DOM, live properties, warnings and teardown | 117 / 117 PASS; 639 fixtures per runtime; no interop |
| G6 public exports/Props | 117 / 117 PASS; 275 original public names and value/type kinds preserved |
| K25 with parent as baseline | PASS; empty allow-list |
| dataviz-vue Classic suite | 37 files, 161 tests PASS |
| native interaction regressions | 7 Classic + 7 Vapor PASS |
| capture, G1, normalizer, correction and K25 regressions | 31 PASS |
| build/toolchain regressions | 13 PASS; exact pins and Vapor plugin verified |
| package emission + vue-tsc | PASS; 120 Classic/Vapor SFCs and separate stable Vue 3.5 compiler output |
| published Vapor package witnesses | PASS; selection/drill/output-only updates, subscriptions, FieldPane/PalettePicker fixture and reactive checks |
| packed consumers (npm 10.9.9) | PASS; strict declarations and dependency graphs, 5 tests each for Classic, stable compiler output and native Vapor |
| index:generate + index:check | PASS; rebuilt declarations; deterministic generated artifacts included |
| notices + licensing | Regenerated (no notice diff); 22 publishable packages PASS |

The native-barrel regression resolves ForceGraph's DS compatibility entry to its
native SFC, preserves dataviz companion runtime helpers, and avoids exporting
DS-only graph helpers from dataviz. The installed Classic and Vapor runtime
export sets match. See [contract changes](../CONTRACT-CHANGES.md) and
[per-component gate evidence](integration.json).

Version: `@sentropic/dataviz-vue@0.6.0-next.0`, publish channel `next`.
No package publication or tag was created. Root tests, browsers and Track were
not run. The Track directory is unchanged from the parent branch.
