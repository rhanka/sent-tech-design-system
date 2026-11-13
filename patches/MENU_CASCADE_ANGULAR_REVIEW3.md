# Angular menu cascade: third review corrections

Date: 2026-11-12. Branch: `feat/menu-cascade-angular`. Baseline: `fb8ce4ea`.

Both remaining findings from the third review are resolved. Before production
changes, `MenuCascadeReview3.test.ts` ran against the baseline build: five
assertions failed and three cases passed. Failures reproduced deepest-panel
focus loss, the extra decorated input, the published prop, and both host bindings.

| Finding | Fix | Regression |
| --- | --- | --- |
| P2: pointer closure loses focus from a deeper sibling panel | Inspect all panels being removed before truncating the path; restore focus to the surviving parent if any contains the active element | Fake timers exercise closure from levels 0 and 1, focus in either removed panel, the 250 ms boundary, parent button focus and roving state; focus outside the removed panels stays untouched |
| P2: host ID wiring introduces a public `id` input | Remove the input and `MenuProps.id`, both host bindings and the public-ID fallback; keep private `MENU_HOST` sharing and generated standalone IDs | Decorated input and emitted declaration assertions; parsed Angular host templates; live private ID sharing with both hosts and unique standalone IDs |

The existing input/binding assertions were updated to the approved surface.
Generated menu-family entries/contracts and their indexes were refreshed; the
Angular menu contract no longer contains an `id` prop.

The requested external spec path is absent; the worktree's
`spec/SPEC_EVOL_MENU_CASCADE.md` supplies §2.2 and §3.3(5). Svelte menu-family
sources match `origin/main` at `f0cafb9f`. Its pointer-close implementation
contains the same focus defect identified by the review; Angular follows the
normative focus requirement. No Svelte source was changed.

All npm commands exported the owner-specified `npm_config_cache`.

| Verification | Result |
| --- | --- |
| Angular `npm run build -w @sentropic/design-system-angular` | Passed |
| Angular `npm run check -w @sentropic/design-system-angular` | Passed |
| Angular package `npx vitest run --config vitest.config.ts src` | 26 suites, 550 tests passed, including eight new cases |
| Component-index workspace `build`, `check`, `test` | Passed; 15 suites, 137 tests |
| Component-index workspace `index:generate`, `index:check` | Passed; 430 artifacts fresh |
| `npm run notices:generate` and `node scripts/generate-third-party-notices.mjs --check` | Passed; 22 publishable packages |
| `npm run licensing:check` | Passed; 22 publishable packages |
| `git diff --check` | Passed |

Verification used Node-based tooling. AC-24 remains the L5 manual rendering
check specified in the existing acceptance plan.
