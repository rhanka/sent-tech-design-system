# Angular menu cascade: second review corrections

Date: 2026-11-12. Branch: `feat/menu-cascade-angular`. Reviewed baseline: `ef0c3f34`.

All four P1/P2 findings in the second review are resolved. The new regression
suite first ran against that baseline: **9 tests failed**, covering every
finding, before production changes. Six further cases cover the review's
navigation and containing-block coverage requests.

| Finding | Fix | Regression in `MenuCascadeReview2.test.ts` |
| --- | --- | --- |
| P1: Angular sanitizes SVG supplied through `innerHTML` | Literal SVG/path template elements at both parent depths, in both directions | Parse the Angular template and require four chevron spans containing SVG/path elements with the expected namespace, size and path; no HTML injection binding |
| P1: projected cascade survives host close | Imperative and input-driven close clear the projected path and hover timers; input close also resets top-layer state | Open two levels, arm hover, close outside or through the input, reopen, advance timers; require no stale path/focus and successful top-layer reopening |
| P2: independent panel flips disagree with keyboard directions | Parents use their child panel's resolved opening side; leaves retain their containing panel's return direction | Both right/left and left/right configurations keep the child open and focus its first item; the leaf's opposite arrow closes one level and focuses its parent |
| P2: root menu has no accessible name | Bind the name on the actual root menu; private host composition supplies the existing host label; standalone native ARIA naming attributes are forwarded, with a `Menu` fallback | Check parsed root and submenu bindings, live labels from both hosts, standalone naming precedence, and the unchanged decorated input set |

Additional assertions exercise Up/Down/Home/End, wraparound, disabled skipping
and isolation at each of three levels (AC-13). AC-36 walks neutral ancestors to
the nearest transformed host, then checks the applied coordinates for vertical,
horizontal and combined translations.

## Reference and scope

Compared against `spec/SPEC_EVOL_MENU_CASCADE.md` in this worktree. The requested
main-checkout spec path does not exist. The Svelte `Menu.svelte`,
`MenuPopover.svelte`, `OverflowMenu.svelte`, `menu-cascade.ts` and cascade tests
in this worktree match `origin/main` at `f0cafb9f` byte for byte. Geometry,
containing-block conversion, safe-triangle priority, delays, level structure,
classes, ARIA relationships, selection and host close behavior were compared.
The geometry helpers differ only in comments and framework-private context
definitions. Angular retains its item aliases and bare-item `select`, plus additive
`selectPath`.

The independent-flip keyboard defect also exists in the Svelte reference, as
the review reports. Angular follows normative AC-19/30 here; no Svelte files
were changed. The existing flat-menu regression tests remain green. The new
naming channel adds no public input or barrel export. Generated menu entries
retain Angular `match` parity and version `0.40.0`.

## Verification

All npm commands exported the owner-specified `npm_config_cache`.

| Command (repository cwd unless specified) | Result |
| --- | --- |
| `npm run build -w @sentropic/design-system-angular` | Passed |
| `npm run check -w @sentropic/design-system-angular` | Passed |
| `npx vitest run --config vitest.config.ts src` (Angular package cwd) | 25 suites, 542 tests passed, including 15 new cases |
| `npx vitest run src/MenuCascade.test.ts src/lib/menu-cascade.test.ts` (Svelte package cwd) | 2 suites, 79 tests passed |
| `npm run build -w @sentropic/design-system-component-index` | Passed |
| `npm run check -w @sentropic/design-system-component-index` | Passed |
| `npm run test -w @sentropic/design-system-component-index` | 15 suites, 137 tests passed |
| `npm run index:generate -w @sentropic/design-system-component-index` | Passed; menu source/declaration digests refreshed |
| `npm run index:check -w @sentropic/design-system-component-index` | 430 artifacts fresh |
| `npm run notices:generate` | Passed; four inline menu paths now recorded |
| `node scripts/generate-third-party-notices.mjs --check` | Passed for 22 publishable packages |
| `npm run licensing:check` | Passed for 22 publishable packages |
| `git diff --check` | Passed |

Angular verification remains Node-based per D11. No browser was launched.
**AC-24 remains the dated human/CI rendering check at L5**, per D14 and §7;
this automated L4 pass does not claim it.
