# PR 282 integration verification

Merged `origin/main` at `a9f7ffd6f186de5228a1f1337c26fb890d49a251` into `feat/vue-vapor-dataviz` on 2026-11-13 (America/Toronto). The merged dependency pins are graph 0.3.1, DS Vue 0.41.0-next.2 and rich-text 0.1.1. No packages were published.

Passing checks:

- All G1–G6 checks for 117 public dataviz components (702 gates). Four SSR comparisons initially detected PR 286's reviewed Icon and DataTable changes; bounded reference corrections and their regression tests resolve those differences. Frozen fixtures and goldens were not rewritten.
- Dataviz-vue Vitest: 37 files, 161 tests. Native interaction suite: 8 Classic and 8 Vapor tests. Bench capture/selftest, K25 safety and dependency-gate tests: 59 tests; expanded correction regressions: 7 tests; V8 review regressions: 5 tests.
- Classic/Vapor builds, stable 3.5.45 compiler output, standalone vue-tsc, published declaration parity, package chart witnesses and rich fixtures.
- `node scripts/vue-vapor-packed.mjs`: isolated npm 10.9.9 consumers with local closure tarballs served through its temporary registry. Strict declarations, Vite dependency graphs, root/Vapor exports, optional editor peers and native mounts pass. Each runtime suite has 12 tests; stable 3.5 output also passes 12 tests.
- `node scripts/smoke-pack.mjs --workspaces=@sentropic/dataviz-vue`: tarball contents and 322 imported/type-checked exports pass.
- Independently installed public `@sentropic/graph@0.3.1`: root, processing, presentation, engine, layout-client and worker all import; the client's sibling worker file exists.
- npm 10.9.9 lockfile regeneration, notices generation, component-index generation/check and licensing across all 22 publishable packages. Provenance hashes preserve upstream identities and are checked by `node tools/graph-dataviz-provenance/verify.mjs`.

## Remaining public registry blocker

`node scripts/dataviz-vue-registry-packed.mjs` packs the actual dataviz-vue candidate, installs it outside the workspace with public npm as its only dependency registry, then checks root/Vapor and all graph entries. The installation currently fails with ETARGET for themes 0.14.0; it cannot reach the import assertions. Direct public-registry queries also return 404 for DS Vue 0.41.0-next.2.

The PR 286 npm-existence gate was run for every package in dataviz-publish and for components-vue using `node scripts/verify-deps-published.mjs --workspace packages/<workspace> --runtime`. Dataviz-core passes. The other gates fail closed on these unpublished pins:

| Workspace | Missing public registry versions |
| --- | --- |
| dataviz-svelte | DS Svelte 0.41.0; themes 0.14.0 |
| dataviz-react | themes 0.14.0 |
| dataviz-vue | DS Vue 0.41.0-next.2; themes 0.14.0 |
| dataviz-angular | DS Angular 0.40.0; themes 0.14.0 |
| components-vue | rich-text 0.1.1; themes 0.14.0; diagram-canvas 0.2.0 |

The requested pins remain intact. Release owner action: publish the missing dependency closure, then rerun both commands above. Acceptance requires the registry-only install and imports to pass without overrides to first-party versions or additional local dependency tarballs. Local packed checks do not establish this public registry proof.

No root test command, browser, Chromium, Python or tracking commands were run.
