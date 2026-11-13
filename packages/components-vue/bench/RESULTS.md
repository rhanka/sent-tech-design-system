# Harness verification

Measured on 2026-11-12 in `.vue-bench-wt`, branch
`bench/vue-vapor-conversion`, reference `213a81f8326cb481508190991d02dc763f123955`
(the worktree's `origin/main`). This is harness evidence, not a product conversion.

Toolchain: Node 22.22.1; Vue, compiler-sfc and server-renderer 3.6.0-rc.15;
vue-tsc 2.2.12; TypeScript 5.9.3; jsdom 27.4.0. Dependencies come from the
existing lockfile; no package manifests or lockfile changed. The compiler
fingerprint is in `build-sfc.sha256`.

## Baseline

`node packages/components-vue/bench/generate-goldens.mjs` captured 61 fixtures
from the original render-function implementations. Each JSON records the
reference commit, source SHA-256 and fixture SHA-256. G4 refuses fixture drift.

| Component | Fixtures | G1 | G4 | G6 |
| --- | ---: | --- | --- | --- |
| Button | 5 | FAIL | PASS | PASS |
| Badge | 6 | FAIL | PASS | PASS |
| Alert | 6 | FAIL | PASS | PASS |
| Input | 6 | FAIL | PASS | PASS |
| Checkbox | 6 | FAIL | PASS | PASS |
| Select | 6 | FAIL | PASS | PASS |
| Tabs | 7 | FAIL | PASS | PASS |
| Pagination | 6 | FAIL | PASS | PASS |
| Tooltip | 5 | FAIL | PASS | PASS |
| BarChart | 8 | FAIL | PASS | PASS |

G1 fails because the SFC is missing and the original `.ts` is present. G2, G3
and G5 also fail on the baseline because they require a converted SFC. Overall
checker exit status is 1, as intended. G4 independently renders the current
`.ts` implementation and compares every fixture; no gates are skipped.

## Badge proof

`node packages/components-vue/bench/selftest.mjs` temporarily placed the exact
worked example from `examples/Badge.vue` in `src/Badge.vue`, removed Badge.ts,
and routed the component plus all four public types through the SFC in index.ts.

| G1 | G2 | G3 | G4 | G5 | G6 | Exit |
| --- | --- | --- | --- | --- | --- | ---: |
| PASS | PASS | PASS | PASS (6/6) | PASS | PASS | 0 |

G5 mounted the **compiled Vapor** Badge and a Vapor template parent providing
the default slot, under createVaporApp with no interop plugin. It flushed and
unmounted without warnings/errors. The runtime is the official development
ESM build, loaded in Node after installing jsdom globals. Its startup banner
goes to stderr, preserving the worker's JSON protocol.

Eight negative controls independently verified that the intended gate fails:
aliased render call (G1), render call inside template (G1), invalid template
(G2), TypeScript error (G3), changed class markup (G4), changed fixture bytes
(G4), mounted-hook exception (G5), and removed Props export (G6).

The self-test restored Badge.ts and index.ts byte-for-byte in `finally` and
removed src/Badge.vue. The committed source tree remains unconverted.
`results/selftest.json` contains the per-gate machine evidence and restoration
flag. The examples remain under bench only.

`node --test packages/components-vue/bench/normalize.test.mjs`: 5/5 passed,
including generated ID-reference topology, SVG attributes and both worked
examples compiling in both modes. No root test, browser or Track command ran.

## Boundaries

G2 mirrors the existing build's compiler path in memory and rejects build-script
fingerprint drift; it does not run the whole package build. G3 and G6 are scoped
to the component and relevant exports, not the full barrel. G4 is classic SSR,
with sampled fixtures and the explicit VNode-to-slot adapters for Alert/Tabs.
G5 checks initial mount/unmount of the default fixture only. Normalization
intentionally loses formatting whitespace and Vue marker comments, and HTML
parser repair can conceal malformed markup. Known-pattern consumer IDs can be
masked as generated IDs. Deadlines can fail on a slow machine. See RECIPE.md
for the complete gate boundaries and portal caveat.

The required Badge proof is executed. The Tabs worked example is compiled in
both modes; its full gate/interaction acceptance is not claimed. No visual,
layout, reactive-update, event-order, keyboard or stable-Vue-3.5 compatibility
acceptance is claimed by this measurement harness.
