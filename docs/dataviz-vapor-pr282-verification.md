# PR 282 integration verification

The final integration commit is `cff3a7b2eb1da1fbdf0b2faddebc25ed954ddc3c`, merging `origin/main` at `9c7097c5c9ee3746738cd0c1bc2f0b9ef746230a` into `feat/vue-vapor-dataviz`. The current pins are graph 0.3.1, DS Vue 0.41.0-next.4, DS Svelte 0.41.2, diagram-canvas 0.2.2, diagram-core 0.2.0 and rich-text 0.1.1. Final review corrections and registry observations below were checked on 2026-11-14 (America/Toronto). No packages were published.

Passing checks:

- All G1–G6 checks for 117 public dataviz components (702 gates). Four SSR comparisons initially detected PR 286's reviewed Icon and DataTable changes; bounded reference corrections and their regression tests resolve those differences. Frozen fixtures and goldens were not rewritten.
- Dataviz-vue Vitest: 37 files, 161 tests. Native interaction suite: 8 Classic and 8 Vapor tests. Bench capture/selftest, K25 safety and dependency-gate tests: 59 tests; expanded correction regressions: 7 tests; V8 review regressions: 5 tests.
- Classic/Vapor builds, stable 3.5.45 compiler output, standalone vue-tsc, published declaration parity, package chart witnesses and rich fixtures.
- `node scripts/vue-vapor-packed.mjs`: isolated npm 10.9.9 consumers with local closure tarballs served through its temporary registry. Strict declarations, Vite dependency graphs, root/Vapor exports, optional editor peers and native mounts pass. Each runtime suite has 12 tests; stable 3.5 output also passes 12 tests.
- `node scripts/smoke-pack.mjs --workspaces=@sentropic/dataviz-vue`: tarball contents and 322 imported/type-checked exports pass.
- Independently installed public `@sentropic/graph@0.3.1`: root, processing, presentation, engine, layout-client and worker all import; the client's sibling worker file exists.
- npm 10.9.9 lockfile regeneration, notices generation, component-index generation/check and licensing across all 22 publishable packages. Provenance hashes preserve upstream identities and are checked by `node tools/graph-dataviz-provenance/verify.mjs`.

## Remaining public registry blocker

`node scripts/dataviz-vue-registry-packed.mjs` packs the actual dataviz-vue candidate, installs it outside the workspace with public npm as its only dependency registry, then checks root/Vapor and all graph entries. The installation currently fails with ETARGET for DS Vue 0.41.0-next.4; it cannot reach the import assertions. The npm-existence gate for dataviz-vue also fails closed on this exact pin. Neither gate was weakened or bypassed.

Public npm exact-version queries on 2026-11-14 show the following missing first-party pins. The dataviz-vue runtime gate was rerun using `node scripts/verify-deps-published.mjs --workspace packages/dataviz-vue --runtime`:

| Workspace | Missing public registry versions |
| --- | --- |
| dataviz-svelte | DS Svelte 0.41.2 |
| dataviz-react | None |
| dataviz-vue | DS Vue 0.41.0-next.4 |
| dataviz-angular | DS Angular 0.40.0 |
| components-vue | diagram-canvas 0.2.2 |
| diagram-canvas | diagram-core 0.2.0 |

The exact remaining Vue closure prerequisites, matching the workspace manifests and pending diagram cascade, are:

1. `@sentropic/diagram-core@0.2.0`.
2. `@sentropic/diagram-canvas@0.2.2`, which pins that core version.
3. `@sentropic/design-system-vue@0.41.0-next.4` under `next`, which pins that canvas version. Dataviz-vue pins this DS Vue version exactly.

The rest of the first-party runtime closure is already on public npm: `@sentropic/dataviz-core@0.5.0`, `@sentropic/design-system-tokens@0.14.0`, `@sentropic/design-system-themes@0.14.0`, `@sentropic/graph@0.3.1` and `@sentropic/design-system-rich-text@0.1.1`. DS Vue's optional first-party peer `@sentropic/design-system-elements@0.2.0` is also published. All three pending versions return HTTP 404. The owner must complete npm 2FA for core, then publish canvas and DS Vue in order and rerun both commands above. Acceptance requires the registry-only install and imports to pass without overrides to first-party versions or additional local dependency tarballs. Local packed checks do not establish this public registry proof.

## Final review corrections

- Carbon 1: replace the raw NUL with the original `\u0000` escape in BookmarkNavigator and rebuild both compiled modes. `scripts/dataviz-vue-text.mjs` checks every source/dist file for C0 control bytes except tab/LF/CR, plus DEL; source lint and the completed build enforce it. Its regression covers all C0/DEL values and nested Classic/Vapor outputs.
- Carbon 2 / Astra 3: exclude `.srchash` and all maps from the package, stop emitting TypeScript maps, remove stale maps after compilation, and add packed-content exclusions to the smoke gate. `npm pack --dry-run --json --ignore-scripts` reports 510 files with neither artifact type and no dangling `sourceMappingURL` references.
- Carbon 3 / Astra 2: `dataviz-vue-v0.6.0-next.0` selects only Vue under `next`; `dataviz-v0.5.x` selects the stable family while Vue is ahead. The same selection drives builds, closure, publication, propagation and installed-package checks. Tests execute workflow shell bodies with mocked npm and demonstrate that either Vue registry gate failure stops publication. Action SHAs and permissions remain pinned/scoped.
- Carbon 4 / Astra 1: pending public npm closure documented above; versions unchanged, publication still blocked.
- Carbon 5: current pins and provenance note refreshed, preserving upstream identities and recomputing changed destination hashes.

Scoped verification after these corrections: dataviz-vue build and published type parity pass; 37 package test files / 161 tests and 134 scoped script tests pass; packed smoke imports/type-checks 322 exports; provenance verifies all 1,193 entries; component-index checks 436 fresh artifacts. The isolated K25 fixtures copy the control-byte guard along with the lint, exercise raw NUL rejection versus the escaped separator, and retain all 14 compatibility witnesses. No final registry import success is claimed while the three prerequisites remain unpublished.

No root test command, browser, Chromium, Python or tracking commands were run.
