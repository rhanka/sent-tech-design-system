# Vue V8 / V9 validation

Base branch: feat/vue-vapor-night (PR 280). Target branch: feat/vue-vapor-v8.

| Check | Result |
| --- | --- |
| components-vue full suite | 121 files, 2,421 passed |
| dataviz-vue full suite | 37 files, 160 passed |
| Editor port suites | 6 files, 77 passed, included above |
| Small-port suites | 3 files, 25 passed, included above |
| V9 Menu/Icon scoped suite | 2 files, 118 passed, included above |
| Five bench components | All G1–G6 pass; 23 Svelte SSR fixtures |
| Both Vue workspace builds / vue-tsc | Pass; components-vue compiles 238 SFCs |
| Separate classic compiler | Vue 3.5.45 compilation passes |
| Packed consumers | 5 tests each on classic 3.5, separate 3.5 output, and native Vapor; declarations + dependency graphs pass |
| Component-index | 16 files, 153 passed; 218 entries / 216 contracts / 436 fresh artifacts |
| Bench normalizer + SFC tooling | 13 passed |
| Licensing / notices | 22 publishable packages pass; notices regenerated |
| K25 allow-list | Regenerated, 115 → 115; no additions against feat/vue-vapor-night |
| Lockfile | Regenerated with npm 10.9.9 --package-lock-only |

The runtime used jsdom. No root test campaign or browser was used.
The packed installations are outside the workspace and use published package
entrypoints, including the editor and presence subpaths. Classic bundles reject
Vapor dependencies; the native Vapor package graph rejects VDOM components.

Source-of-truth contract notes are in ../../CONTRACT-CHANGES.md. Individual
bench gate details are saved beside this file. Source and fixture hashes in
each golden identify its Svelte SSR reference; no Vue output supplied a golden.
