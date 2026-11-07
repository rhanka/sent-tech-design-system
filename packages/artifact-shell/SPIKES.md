# SPIKES.md — lot record, @sentropic/design-system-artifact-shell

Lot AS-0 (preparation and package scaffold), branch `feat/as0-artifact-shell`,
executed 2026-11-07 (UTC) from the frozen spec
`scratchpad/artifact-shell/as01-spec-frozen.md` (sha256 `8f7bb962…`, verified at
start). AS-1 is not started by this lot.

## 0. Version drift re-measure (spec §2.2)

| Package | Spec pin (basis origin/main @ 48aa4ca6) | Measured origin/main @ bbf8b390 at execution start | Used in package.json |
| --- | --- | --- | --- |
| @sentropic/design-system-tokens | 0.11.0 | 0.12.0 | 0.12.0 |
| @sentropic/design-system-themes | 0.11.0 | 0.12.0 | 0.12.0 |
| @sentropic/design-system-svelte | 0.36.0 | 0.37.0 | 0.37.0 (peer + dev) |
| svelte | ^5.53.2 | ^5.53.2 (installed 5.55.7) | ^5.53.2 |

Pin rule unchanged (exact for DS packages, caret for tooling); the drift is
recorded here per §2.2 and the measured train is pinned in the new manifest.

## 1. G-0 step 0 — workspace link (npm install)

`NPM_CONFIG_CACHE=… npm install` from the repository root (worktree): exit 0,
"added 767 packages, and audited 939 packages in 5s". The new workspace is
linked (`node_modules/@sentropic/design-system-artifact-shell ->
packages/artifact-shell`) and `package-lock.json` records the workspace; no
root manifest was edited by hand.

Precondition builds (spec §2 preamble): `npm run build` for
@sentropic/design-system-tokens, @sentropic/design-system-themes and
@sentropic/design-system-svelte — exit 0, all dists present. Additionally
@sentropic/graph and @sentropic/design-system-rich-text dists were built
(exit 0): the `@sentropic/design-system-svelte` barrel chain
(`ForceGraph.svelte` -> `@sentropic/graph/processing`, rich-text editor) must
resolve when a test imports `ThemeProvider` through the barrel in vitest dev
mode.

`package-lock.json` diff after install: 28 insertions, all of them the
`packages/artifact-shell` workspace entry and its `node_modules` link — pure
workspace registration, no root manifest edit.

Repository guards environment note (spec §8.1 pre-existing-failure check): the
first `node scripts/run-script-guards.mjs` run in this fresh worktree exited 1
with 6 failures, all in `scripts/component-index.test.mjs`:
`emit: missing source: declaration build (packages/components-react/dist)`.
Verified pre-existing by `git stash -u` comparison: the same 6 failures
reproduce on origin/main without the new package (pass 7 / fail 6 on the same
file). Cause: a fresh worktree has no built dists. After building the
declaration/browser dists the guard needs (dataviz-core, dataviz-react,
dataviz-vue, design-system-react, design-system-vue, design-system-angular,
elements incl. `dist/browser` + sri.json — all exit 0; dataviz-angular's ngc
build fails on a pre-existing NG8002 in `SelectionLegend.ts` in this
environment and is not required by the guard), the guard exits 0:
171 tests, 168 pass, 0 fail, 3 skipped.

## 2. RED witnesses (spec §6, §8.3)

Command (exact, from the repository root, cache-prefixed):

    npm --workspace @sentropic/design-system-artifact-shell exec -- vitest run src/lib/ScaffoldSmoke.test.ts src/lib/types.test.ts src/lib/import-graph.test.ts

RED (witnesses written first, implementation absent) — exit 1, output lists
exactly the three named files:

- `src/lib/ScaffoldSmoke.test.ts` FAIL — `Failed to resolve import "./index.js"`
  (also `./ScaffoldSmoke.svelte`, `./fixtures.js`)
- `src/lib/types.test.ts` FAIL — `Failed to resolve import "./fixtures.js"`
  (also `./types.js`)
- `src/lib/import-graph.test.ts` — 2 failed: cardinality
  `expected 0 to be greater than or equal to 3` (gate printed
  `import-graph gate: examined 0 source files (floor 3)`) and
  `src/lib/types.ts must exist`

GREEN (after `types.ts` / `fixtures.ts` / `index.ts` / `ScaffoldSmoke.svelte`
landed) — exit 0: `Test Files 3 passed (3)`, `Tests 14 passed (14)`, gate
printed `import-graph gate: examined 4 source files (floor 3)`. After the
review round (section 7) the same run is `Tests 23 passed (23)` — the gate
additionally carries permanent planted-failure tests (below).

W-0.3 failure-mode plants (temporary, removed, never committed):

- planted forbidden specifier (an `@sentropic/artifacts` import) in a
  throwaway `src/lib/zz-plant-tmp.ts` -> gate FAIL, exit 1:
  `lib/zz-plant-tmp.ts: non-allowlisted @sentropic/ specifier "@sentropic/artifacts"`
- planted hard-coded client/agent product name in the same throwaway file ->
  gate FAIL, exit 1: `lib/zz-plant-tmp.ts: contains a forbidden client/agent name`

Both plants were deleted immediately after each run; the file was never
committed.

Since the review round (section 7), `import-graph.test.ts` also carries
permanent planted-failure tests: each plant is an in-memory synthetic file —
dynamic `import()`, TS `import("…")` type specifier, `require()`, a `.js` and
a `.mjs` file under `src/`, a relative path escape out of the package, and a
raw colour literal outside the token table — the plants are never written to
`src/` and never committed. The compile-time half of W-0.2 was additionally
proven falsifiable by temporary plants in `types.ts` (adding `onHoverBlock` to
`BlockHighlightOverlayEvents`, and making `activeKey` optional on
`CommentModeStatusProps`): `svelte-check` failed with 2 unused
`@ts-expect-error` directives, exit 1; both plants were reverted immediately.

## 3. Spikes S-1…S-4 (spec §8.3)

### S-1 — header fit pre-check at 320/390 px (AS-2 input)

- Hypothesis: the §5.1 inventory (title, version select, comments button with
  unread badge, share action, author avatar, collapse toggle, CommentModeToggle)
  fits one row ≤ 48 px at 320/390 px with title truncation, at dense IconButton
  sizes.
- Method: static arithmetic from measured token values (this environment has
  no layout engine — host GPU unavailable, so no browser row): IconButton dense
  sm 2rem = 32 px (`IconButton.svelte`), Avatar sm 1.5rem = 24 px, gaps
  `--st-spacing-1` = 4 px each, row padding 2 × `--st-spacing-2` = 16 px,
  version select width capped 6rem = 96 px with ellipsis (worst case), 1 px row
  border.
- Threshold: one row, height ≤ 48 px incl. border, at 320 and 390 px; title
  truncates first.
- Observed: fixed chrome = 4×32 + 24 + 96 + 6×4 + 16 = 288 px; the title gets
  32 px at 320 px, 102 px at 390 px, 992 px at 1280 px -> one row at every
  measured width; row height = 32 + 2 = 34 px ≤ 48 px.
- Verdict: **PASS** (static token arithmetic; the pixel-exact layout measurement
  stays an AS-2 browser row at 320/390/1280 px, lot plan §3.6). The 44 px
  touch-target exception is recorded alongside (lot plan §1.3 item 9): header
  and pins keep dense sizes, pins gain enlarged hit areas in AS-2, and the
  44 px rule is not claimed for the artefact header or the pin layer.
- Decision: recorded for AS-2; no header is built in AS-0.

### S-2 — mention-picker route (AS-3 input)

- Hypothesis: direct reuse of the Svelte `Combobox` for the mention picker.
- Method: read of `packages/components-svelte/src/lib/Combobox.svelte` on
  origin/main @ bbf8b390, against the four gaps.
- Threshold: all four gaps closed by the current primitive.
- Observed gaps: (1) filtering is internal (`filtered` derived from the input
  value by label substring); the only outward event is `onchange(value)` with
  the raw string when `allowCustomValue` — no query event for runtime
  filtering; (2) selection is by label string (`value = option.label`) and
  `onselect` emits the plain string `option.value` — no opaque-key selection;
  (3) no pinned/distinct candidate in `ComboboxOption { label, value, disabled }`;
  (4) `disabled?: boolean` only, no per-candidate disabled reason. Additionally
  the list id is the fixed literal `st-combobox-list` (`aria-controls` and the
  list div) while the input id is random per instance.
- Verdict: **FAIL** for direct reuse (the spec default, confirmed against the
  current source). Decision input for AS-3: build the picker on the Combobox
  pattern and tokens (new component) or extend `Combobox` additively; the AS-3
  gate states which.

### S-3 — barrel import weight

- Hypothesis: importing `IconButton`/`Tooltip`/`Icon` through the
  `@sentropic/design-system-svelte` barrel into the scaffold bundle tree-shakes
  to the imported primitives (spec §8.3 S-3).
- Method (exact commands, run from `packages/artifact-shell`, cache-prefixed;
  throwaway dir `.spike-s3/` deleted after the run and never committed):
  `SPIKE_ENTRY=.spike-s3/entry-empty.ts SPIKE_OUT=.spike-s3/out-empty ../../node_modules/.bin/vite build --config .spike-s3/vite.config.ts`
  (likewise `entry-imports` -> `out-imports`, `entry-primitives` ->
  `out-primitives`; the throwaway config used the `svelte()` plugin,
  `build.lib` ES format, `minify: false`, `external: [/^svelte($|\/)/]` so the
  delta isolates the barrel), then `wc -c .spike-s3/out-*/bundle.js`, a grep
  of `out-imports/bundle.js` for unrelated component markers, and
  `npm pack --workspace @sentropic/design-system-artifact-shell --dry-run`
  from the repository root. Entries: `entry-empty.ts` = the empty scaffold
  (the package barrel `src/lib/index.js` alone); `entry-imports.ts` = scaffold
  + `import { Icon, IconButton, Tooltip } from "@sentropic/design-system-svelte"`;
  `entry-primitives.ts` = the three primitives only (P).
- Threshold: added bytes `W − E` ≤ budget = primitives' own size `P` × 1.20,
  and 0 hits for unrelated component code in the with-imports bundle.
- Observed (2026-11-07): E = 448 B; W = 40 767 B (+ 4 739 B CSS asset);
  P = 40 257 B (+ 4 739 B CSS asset); W − E = 40 319 B ≤ budget 48 308 B.
  Grep of `out-imports/bundle.js` for `st-accordion`, `st-alert`, `st-toast`,
  `st-combobox`, `st-avatar`, `st-appShell`, `st-forceGraph`, `st-richText`,
  `st-header`, `st-dialog`, `st-tabs`, `st-badge` = 0 hits; the only component
  classes present are `st-icon`, `st-iconButton`, `st-tooltip`.
  `npm pack --dry-run`: 11 files — `package.json`, `README.md`, `LICENSE`,
  `LICENSE.THIRD-PARTY.md`, `dist/index.{js,d.ts,d.ts.map}`,
  `dist/types.{js,d.ts,d.ts.map}`, `dist/tokens.css` — 0 `*.test.*`, 0 fixture
  files, 0 `ScaffoldSmoke.*` (the `files` exclusions `!dist/**/fixtures.*` and
  `!dist/**/ScaffoldSmoke.*` were added in this lot; before them the listing
  shipped `dist/fixtures.*` and `dist/ScaffoldSmoke.*`).
- Verdict: **PASS** (40 319 B ≤ 48 308 B budget; 0 unrelated component code).
  Note: the first measurement recorded for this spike (svelte-package `dist`
  bytes + grep of `dist`) was vacuous — `dist` never bundles externals, so the
  barrel import stayed a single external import statement — and is superseded
  by this consumer-bundle measurement.
- Decision: the §1 fallback did not fire; the standalone package stands and
  AS-1 imports primitives through the barrel.
- Date: 2026-11-07 (UTC).

### S-4 — Avatar initials + toast-stack route (AS-2/AS-4 inputs)

- Hypothesis: `Avatar`'s `deriveInitials(name)` covers most AS-2/AS-4 fixture
  names, the remaining cases are enumerable, and the toast stack reuses
  `Toast` tokens with an items alignment in AS-4 (lot plan Q4) with no shell
  toast visual.
- Method: read of `packages/components-svelte/src/lib/Avatar.svelte` (imports
  `deriveInitials` from `Header.svelte`; no `initials` prop),
  `Header.svelte` (`deriveInitials`: trim, split on whitespace, 0 parts ->
  `"?"`, 1 part -> first 2 characters uppercased, otherwise first letters of
  first and last word; the additive-override precedent
  `account.initials?.trim() || deriveInitials(account.name)`) and `Toast.svelte`
  (single toast, required `title`, tones info/success/warning/error with no
  neutral variant, role status/alert by tone, z token 60) on the current tree.
- Threshold: 100% of the AS-2/AS-4 avatar fixture cases whose intended initials
  differ from the derivation enumerated with an explicit override decision,
  and the toast route decided (reuse `Toast` tokens; no shell toast visual).
- Observed: the AS-2/AS-4 fixture cases needing an `initials` override beyond
  the derivation are exactly: (1) hyphenated single-token names
  (`"Anne-Marie"` -> `AN`, not `AM`); (2) particle-style multi-word names
  (`"Charles de Gaulle"` -> first+last = `CG`, not `CDG`); (3) non-Latin
  single-token names where a specific rendering is wanted (`"王小明"` ->
  `王小`); (4) empty/whitespace-only names (`"?"`). Plain two-word Latin names
  (`"Marie Dupont"` -> `MD`) need no override. Toast route: reuse `Toast`
  tokens with an items alignment on the Svelte side in AS-4; no shell toast
  visual.
- Verdict: **PASS** (recording complete: all four override cases enumerated,
  toast route decided).
- Decision: an additive `initials` prop on `Avatar` is proposed in the owning
  lot (AS-2 header account avatar, AS-4 comment-author avatars) for exactly
  those cases — never a workaround inside the shell.
- Date: 2026-11-07 (UTC).

## 4. Browser rows

AS-0 ships no `*.browser.test.mjs` witness. Every browser row of the lot
programme (AS-1 B-1…B-3 when they exist) is recorded **`not run (host GPU)`** in
this environment; the CI run of the same `node <file>` commands on the PR is the
evidence (spec §8.2). No gate row is claimed green from jsdom evidence.

## 5. Gate G-0 results (2026-11-07, exact commands, cache-prefixed, from the repository root; re-run after the review round, same date)

| # | Command | Exit |
| --- | --- | --- |
| 1 | `npm install` | 0 (added 767 packages, audited 939; re-run after the review round: no lockfile change) |
| 2 | `npm --workspace @sentropic/design-system-artifact-shell run check` | 0 (svelte-check: 0 errors, 0 warnings) |
| 3 | `npm --workspace @sentropic/design-system-artifact-shell exec -- vitest run src/lib/ScaffoldSmoke.test.ts src/lib/types.test.ts src/lib/import-graph.test.ts` | 0 — output lists exactly the 3 named files, `Test Files 3 passed (3)`, `Tests 23 passed (23)`, gate prints `examined 4 source files (floor 3)` |
| 4 | `npm --workspace @sentropic/design-system-artifact-shell run test` | 0 — same 3 files, 23 passed |
| 5 | `npm --workspace @sentropic/design-system-artifact-shell run build` | 0 (svelte-package: src/lib -> dist) |
| 6 | `npm run licensing:check` | 0 — "Licensing gate OK: 21 publishable packages…"; the new package is skipped as `private: true` |
| 7 | `node scripts/run-script-guards.mjs` | 0 — 171 tests, 168 pass, 0 fail, 3 skipped (see the environment note in §1 for the initial pre-existing failure and its stash verification) |
| 8 | `npm run notices:generate` | 0 — "21 paquets publiables", no diff (`git status` shows only the workspace registration and this package) |
| 9 | `npm pack --workspace @sentropic/design-system-artifact-shell --dry-run` | 0 — 11 files: `package.json`, `README.md`, `LICENSE`, `LICENSE.THIRD-PARTY.md`, `dist/index.{js,d.ts,d.ts.map}`, `dist/types.{js,d.ts,d.ts.map}`, `dist/tokens.css`; 0 `*.test.*`, 0 fixture files, 0 `ScaffoldSmoke.*` (§8.3 S-3 listing, §8.4) |

component-index `index:check` is not run: AS-0 changes no barrel and no
catalogue entry (the new package is private and outside the index's framework
sources; the component-index guard tests inside step 7 pass without it).

## 6. Known AS-R obligations (recorded, not pre-claimed)

- When AS-R flips visibility (`publishConfig.access: public`, `private`
  removed), `npm run licensing:check` will require for this package:
  non-placeholder `license` (present: MIT), `LICENSE` ≥ 300 bytes (present,
  1066 B), a current `LICENSE.THIRD-PARTY.md` (regenerate then), and both files
  inside the `npm pack --dry-run` listing.
- Manual notices step (spec §2.7): the root generator scans publishable
  workspaces only, so it produces no file for this private package.
  `packages/artifact-shell/LICENSE.THIRD-PARTY.md` was created with the
  generator's own `renderNotices` output for the package's runtime closure
  (helper script kept outside the repo). The closure lists no third-party
  package because `@sentropic/*` workspace dependencies are first-party by the
  generator's FIRST_PARTY_SCOPE rule. `npm run notices:generate` afterwards
  reports no diff (21 publishable packages current; this file is untouched
  while the package is private).

## 7. Review round (2026-11-07) — dispositions against the frozen spec

Input: the independent AS-0 review output `scratchpad/rev/as0-rev-argon.out`
(5 blocking findings). Each finding was checked against the frozen spec first;
applied where the spec supports it, rejected with section references where it
does not.

1. Hard-coded hex literals in `fixtures.ts` — **fixed**. `pageBackgrounds`
   now reads `foundation.color.slate[10]` / `foundation.color.slate[90]` from
   `@sentropic/design-system-tokens` (allowlisted §2.6 item 1, runtime
   dependency §1), and the import-graph gate gained a colour-literal scan over
   all of `src/**` except the token table `src/lib/tokens.css` (spec §11: no
   raw colour literal appears outside the token table), with a planted-failure
   test.
2. `tokens.css` (A0-17) — **rejected**. A0-17 defines the file as
   documentation-only: "No component imports this file; each component reads
   the §2.5 variables with inline fallbacks … and the base appearance never
   depends on this file". §2.5 freezes fallback *rules* per token group
   (semantic references / fixed dual values), not concrete values, and §11's
   "no raw colour literal appears outside the token table" is a prohibition on
   package sources, not a mandate to write literal values into the file in
   AS-0. The file stays as committed; `ScaffoldSmoke.svelte` already reads its
   variables with inline fallbacks exactly per A0-17.
3. W-0.2 falsifiability — **fixed**. The SA-1 required fields are now
   witnessed by two separate `@ts-expect-error` declarations, one per field
   (§6 W-0.2: assigning a props object without either field errors);
   `BlockHighlightOverlayEvents` witnesses now include `onAnchor` in the
   rejected object so the only possible compile error is the rejected
   host-handler member (`onHoverBlock` and `onBlockClick`, §3.3 H-1 "carries
   only onAnchor"); `makeBlocks` now asserts distinct labels and strictly
   increasing `rect.y` (reading order, §5.4 F-1) instead of a tautology.
   Falsifiability proven by temporary plants (section 2).
4. Import-graph gate coverage — **fixed**. `extractSpecifiers` now also matches
   dynamic `import("…")`, TS `import("…").Type` specifiers and `require("…")`;
   `SOURCE_EXTENSIONS` covers `.js`/`.mjs` and `isTest` matches
   `*.test.{ts,js,mjs}`; relative specifiers are resolved and must stay inside
   `src/` and off forbidden paths (§2.6 "extracts every import/export
   specifier"; §0.3 bars any reference to another package, so a relative
   escape counts). One planted-failure test per case (in-memory plants, never
   written to `src/`).
5. S-3/S-4 recording + `files` — **fixed**. S-3 re-measured with real consumer
   bundles (section 3: both numbers recorded, budget = P + 20%, PASS); S-4 now
   records hypothesis / method / threshold / observed / verdict / date /
   decision per §8.3; `package.json` `files` gained `!dist/**/fixtures.*` and
   `!dist/**/ScaffoldSmoke.*` (§2.2 binding note: tests and fixtures are
   excluded from the tarball from day one; §8.4: no `*.test.*`, no fixture
   files) — `npm pack --dry-run` now lists 11 files with none of them (section
   5, row 9).

The non-blocking finding 6 (W-0.1) was also applied: `ScaffoldSmoke.test.ts`
now asserts that `.st-scaffoldSmoke` renders inside the `[data-st-theme]`
subtree and that the injected theme stylesheet defines the exact custom
properties the component reads (`--st-semantic-surface-raised`,
`--st-semantic-text-primary`, `--st-spacing-2`, `--st-spacing-3`) — W-0.1
"themed smoke … token variable resolves".
