# Vue menu cascade verification — 2026-11-12

Branch: `feat/menu-cascade-vue`, worktree `.cascade-vue-wt`.
Reviewed baseline: `d22bdddae018cccc424eb0012a21701a8b2c4f6b`.
Target: the four P1/P2 findings in the final verdict of
`REVIEW2-cascade-vue-astra.md`.

| Finding | Fix | Regression evidence |
| --- | --- | --- |
| P1: transformed popovers clip fixed submenu descendants | Cascade hosts receive `st-menuPopover--hasCascade` and `overflow: visible`. The inner root list retains scrolling and inherits the host's height cap. | Four placement/alignment cases assert cascade and flat CSS, marker removal after changing to flat items, and both submenus outside the scroll list. Slot composition is covered separately. |
| P2: a second-level flip uses the containing panel's opening arrow | Expandable parents prioritize their own resolved side. Leaves retain their containing panel's side. | Opposite consecutive sides in both directions assert chevrons, panel persistence, first enabled child focus, and leaf closing back to its parent. |
| P2: ancestor hover close loses deeper keyboard focus | Check every removed panel and restore its surviving parent button. Read active focus from the menu's shadow root when applicable. | A focused depth-2 leaf survives through 249 ms, then both panels close and focus returns at 250 ms. Outside focus stays unchanged. The shadow-root variant is covered too. |
| P2: OverflowMenu emits two close updates for cascade leaves | Menu owns cascade close and modality-specific focus; OverflowMenu retains flat leaf closing. | Pointer, Enter, and Space each assert one callback, one selection with the full path, exactly one close update, and the appropriate focus behavior. |

Each finding was reproduced by a failing test before its fix. The shadow-root
focus case was also observed failing before correcting the active-element read.
There are 15 added regression cases. AC-32 coverage additionally verifies both
hosts close on Tab and Shift+Tab, leave `defaultPrevented` false, and never focus
the trigger during that close. These events use Vue Test Utils' timestamp handling
with the fake clock; AC-32 required no production change.

## Reference and specification

The supplied absolute specification path is absent. Verification used the tracked
`spec/SPEC_EVOL_MENU_CASCADE.md`, introduced in `432971ef9cfc759020548c0c77767f843a024d69`.

At verification time, local `main` was `956eeb92` and both `origin/main` and
`git ls-remote origin refs/heads/main` identified `f0cafb9f0c45b22680d2a53fe498a01edda908b7`.
Those main refs do not contain the cascade implementation. The cascade reference
available in this checkout is the inherited Svelte implementation from
`e8b0dd6a`, corrected in `865e40aece9bc0952a9e90b839eb43825ee26418`.

Re-read `Menu.svelte`, `MenuPopover.svelte`, `OverflowMenu.svelte`,
`lib/menu-cascade.ts`, `MenuCascade.test.ts`, and `lib/menu-cascade.test.ts`.
The Vue and Svelte geometry test files are byte-identical. TypeScript AST
comparison confirms all 11 geometry constants/functions match, including the
private triangle helper. Both geometry and cascade suites pass against the
inherited Svelte reference (79 tests).

The first three second-review defects also occur in that Svelte snapshot. The Vue
fixes follow spec sections 3.1, 3.3, 3.4 and AC-19/30 while retaining its geometry,
hover timings, sibling-panel structure, and framework-specific public API.
Vue's full suite covers the first review's fixes, flat compatibility,
Svelte API parity, and existing component behavior. Public depth/context props
were not added; Svelte and Angular sources were not changed.

## Validation results

All npm commands used the requested `npm_config_cache` path. Commands ran from
this worktree, through RTK.

| Command | Result |
| --- | --- |
| `rtk npm run test -w @sentropic/design-system-vue` | 104 files, 1,695 tests passed |
| `rtk npm run check -w @sentropic/design-system-vue` | Passed |
| `rtk npm run build -w @sentropic/design-system-vue` | Passed, including declaration generation and stylesheet copy |
| `rtk npm exec -w @sentropic/design-system-svelte -- vitest run src/MenuCascade.test.ts src/lib/menu-cascade.test.ts` | 2 files, 79 tests passed |
| `rtk npm exec -w @sentropic/design-system-component-index -- vitest run tests/contracts/vue.test.ts` | 4 tests passed |
| `rtk npm run build -w @sentropic/design-system-component-index` | Passed |
| `rtk npm run index:generate -w @sentropic/design-system-component-index` | Passed; only the two index source-commit stamps changed |
| `rtk npm run index:check -w @sentropic/design-system-component-index` | 430 artifacts fresh |
| `rtk npm run notices:generate` | Passed, 22 publishable packages |
| `rtk node scripts/generate-third-party-notices.mjs --check` | Current, 22 publishable packages |
| `rtk npm run licensing:check` | Passed, including license/notices tarball membership for all 22 publishable packages; temporary files confined under this worktree's `.vite/menu-cascade-review` |
| `rtk git diff --check` | Passed |

## AC-24 / L5 manual record

Date recorded: **2026-11-12**. Execution status: **pending human or later CI**.
No browser was launched. This records the remaining manual scope, without
claiming real-layout acceptance from jsdom/CSS assertions.

The dated L5 execution must cover diagonal pointer travel, top-layer rendering,
scroll/resize, shadow DOM, and a parent near the viewport bottom. Include long
root lists and two open submenu levels with `top-start`, `top-end`,
`bottom-end` / end alignment, and `bottom-start` / center alignment. Confirm the
root list scrolls within the host cap while submenu panels remain visible beyond
the transformed host; also check a flat popover retains its existing scrolling.
