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
first review round (section 7) the same run was `Tests 23 passed (23)`; after
the second review round (section 8) it is `Tests 30 passed (30)` — the gate
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
- Observed (model only — no layout engine ran in this environment): fixed
  chrome = 4×32 + 24 + 96 + 6×4 + 16 = 288 px; the title gets 32 px at 320 px,
  102 px at 390 px, 992 px at 1280 px; static row height = 32 + 2 = 34 px.
  No row height was observed in a real render, so per spec §8.3 this spike has
  no observed value.
- Assumptions the static model omitted, recorded per the second review: the
  vertical header padding was not counted — the model counted 16 px of
  horizontal padding but computed the row height as 32 + 2 = 34 px; with the
  same spacing-2 (8 px) padding applied vertically the row would be
  32 + 16 + 2 = 50 px, over the 48 px threshold. The unread badge on the
  comments button was not counted either. The title getting only 32 px at
  320 px is unusable.
- Verdict: **FAIL (unmeasured)** — spec §8.3: "a spike without an observed
  value is FAIL (unmeasured)". The static arithmetic above is the model, not
  an observed value; the PASS recorded before the second review is relabelled.
- Consequence per spec §8.3 (S-1 on FAIL): AS-1 is unaffected; AS-2 preparation
  reopens the header inventory with Sentropic, and the pixel-exact row
  measurement moves to a CI-run harness in AS-2 (browser rows at
  320/390/1280 px — the same `node <file>` commands run on the PR per §8.2,
  lot plan §3.6). The 44 px touch-target exception stays recorded alongside
  (lot plan §1.3 item 9): header and pins keep dense sizes, pins gain enlarged
  hit areas in AS-2, and the 44 px rule is not claimed for the artefact header
  or the pin layer.
- Decision: recorded for AS-2; no header is built in AS-0.
- Date: 2026-11-07 (UTC).

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
- Date: 2026-11-07 (UTC).

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
- Baseline P build route (second review): the original record did not state how
  `entry-primitives.ts` imported the primitives; treated as barrel-dependent
  (then P ≈ W − E by construction and the budget test cannot fail), the spike
  was re-measured on 2026-11-07 with P built from DIRECT SOURCE-PATH imports:
  `entry-primitives-direct.ts` imports
  `../../components-svelte/src/lib/{Icon,IconButton,Tooltip}.svelte` by
  relative path, bypassing the barrel entirely (same throwaway config and
  commands, `out-primitives-direct`).
- Threshold: added bytes `W − E` ≤ budget = primitives' own size `P` × 1.20,
  and 0 hits for unrelated component code in the with-imports bundle.
- Observed (2026-11-07, original barrel-baseline run): E = 448 B;
  W = 40 767 B (+ 4 739 B CSS asset); P = 40 257 B (+ 4 739 B CSS asset);
  W − E = 40 319 B ≤ budget 48 308 B.
- Observed (2026-11-07, re-measurement with the independent direct-source-path
  baseline P): E = 83 B; W = 40 257 B (+ 4 739 B CSS asset);
  P = 40 264 B (+ 4 738 B CSS asset); W − E = 40 174 B ≤ budget
  ⌊P × 1.20⌋ = 48 316 B. Grep of both `out-imports/bundle.js` and
  `out-primitives-direct/bundle.js` for `st-accordion`, `st-alert`, `st-toast`,
  `st-combobox`, `st-avatar`, `st-appShell`, `st-forceGraph`, `st-richText`,
  `st-header`, `st-dialog`, `st-tabs`, `st-badge` = 0 hits; the only component
  classes present are `st-icon`, `st-iconButton`, `st-tooltip`.
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
- Verdict: **PASS** — re-measured with the independent direct-source-path
  baseline: 40 174 B ≤ 48 316 B budget, 0 unrelated component code (the
  original barrel-baseline numbers, 40 319 B ≤ 48 308 B, also hold).
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
- Observed: `deriveInitials` (`Header.svelte`) already covers the non-Latin
  single-token case (`"王小明"` -> first 2 characters = `王小`) and the
  empty/whitespace-only case (`"?"`), so those need NO override — the second
  review's items (3) and (4) are dropped as override cases. The AS-2/AS-4
  fixture cases needing an `initials` override beyond the derivation are
  exactly: (1) hyphenated single-token names where the wanted initials differ
  from the first-2-characters derivation (`"Anne-Marie"` derives `AN`; `AM`
  needs an override); (2) particle-style multi-word names where the wanted
  initials differ from first+last (`"Charles de Gaulle"` derives `CG`; `CDG`
  needs an override). Intended target of (1) and (2): the AS-2 header account
  avatar and the AS-4 comment-author avatars, via the additive `initials` prop
  proposed in the owning lot. Plain two-word Latin names
  (`"Marie Dupont"` -> `MD`) need no override. Toast route: reuse `Toast`
  tokens with an items alignment on the Svelte side in AS-4; no shell toast
  visual.
- Verdict: **PASS** (recording complete: both override cases enumerated with
  their target, the derivation-covered cases stated, toast route decided).
- Decision: an additive `initials` prop on `Avatar` is proposed in the owning
  lot (AS-2 header account avatar, AS-4 comment-author avatars) for exactly
  those cases — never a workaround inside the shell.
- Date: 2026-11-07 (UTC).

## 4. Browser rows

AS-0 ships no `*.browser.test.mjs` witness. Every browser row of the lot
programme (AS-1 B-1…B-3 when they exist) is recorded **`not run (host GPU)`** in
this environment; the CI run of the same `node <file>` commands on the PR is the
evidence (spec §8.2). No gate row is claimed green from jsdom evidence.

## 5. Gate G-0 results (2026-11-07, exact commands, cache-prefixed, from the repository root; re-run after each review round, same date)

| # | Command | Exit |
| --- | --- | --- |
| 1 | `npm install` | 0 (added 767 packages, audited 939; re-run after the review round: no lockfile change) |
| 2 | `npm --workspace @sentropic/design-system-artifact-shell run check` | 0 (svelte-check: 0 errors, 0 warnings) |
| 3 | `npm --workspace @sentropic/design-system-artifact-shell exec -- vitest run src/lib/ScaffoldSmoke.test.ts src/lib/types.test.ts src/lib/import-graph.test.ts` | 0 — output lists exactly the 3 named files, `Test Files 3 passed (3)`, `Tests 30 passed (30)` (re-run after the second review round, section 8; 23 after the first), gate prints `examined 4 source files (floor 3)` |
| 4 | `npm --workspace @sentropic/design-system-artifact-shell run test` | 0 — same 3 files, 30 passed |
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

## 8. Second review round (2026-11-07) — dispositions against the frozen spec

Input: the independent AS-0 second review output
`scratchpad/rev/as0-rev2-sonnet.out` (verdict NOT MERGEABLE: 1 blocking +
non-blocking findings). Each finding was checked against the frozen spec
first; the assigned items 1–7 are dispositioned below. The review's remaining
non-blocking observations (client-name blocklist widening, W-0.1 component
coupling, `mode`-prop witnesses, notices regeneration at the AS-R flip, minor
items) were not in the assigned fix list and stay open for the conductor.

1. S-1 PASS did not meet §8.3 (blocking) — **fixed**. S-1 is relabelled
   **FAIL (unmeasured)** (section 3): the vertical-padding assumption (with
   spacing-2 vertical padding the row would be 50 px, over the 48 px
   threshold), the 32 px title result at 320 px and the uncounted unread badge
   are recorded, and per §8.3 the consequence is stated — AS-1 unaffected;
   AS-2 preparation reopens the header inventory with Sentropic and the
   pixel-exact measurement moves to a CI-run harness (browser rows) in AS-2.
2. Missing `Date:` lines on S-1/S-2 — **fixed** (section 3; S-3/S-4 already
   carried one).
3. S-3 baseline P build route — **fixed**. The original record did not state
   the route; the spike was re-measured with P built from direct source-path
   imports (section 3): E = 83 B, W = 40 257 B, P = 40 264 B, W − E = 40 174 B
   ≤ budget 48 316 B, 0 unrelated component markers. Verdict stays PASS on the
   independent baseline.
4. S-4 items (3)/(4) — **fixed**. `deriveInitials` already returns `王小` for
   `王小明` and `?` for an empty name (`Header.svelte`), so both are dropped
   as override cases; the intended target of (1)/(2) (AS-2 header account
   avatar, AS-4 comment-author avatars) is stated (section 3).
5. Import-graph gate bypasses — **fixed** in `import-graph.test.ts`:
   template-literal `import(\`…\`)` / `` from `…` `` / `require(\`…\`)` are
   extracted (a `${…}` interpolation is unverifiable and always a violation);
   block comments between the keyword and the specifier
   (`import(/* c */ "x")`, `from /* c */ "x"`) are tolerated by the patterns;
   `@import` in `.css` files and in the `<style>` blocks of `.svelte` files is
   extracted (quoted and `url(…)` forms) and classified by the same allowlist;
   subpaths of allowed `@sentropic/` packages are restricted to the documented
   set `ALLOWED_DS_SPECIFIERS` (bare package names only in AS-0/AS-1 — AS-1
   imports the primitives through the barrel per S-3; a fallback subpath would
   be added to the set in the same change that first uses it). Each case has
   an in-memory planted-failure test.
6. `node:*` / `puppeteer-core` for AS-1 test files — **fixed** by allowing
   them (the preferred option): `node:*` builtins and `puppeteer-core` are
   allowlisted in test files only — `*.test.{ts,js,mjs}`, which includes
   `*.browser.test.mjs` (the browser witnesses run with `node <file>` through
   the repository puppeteer-core harness, and the W-1.9 source scan of
   `.svelte` files needs `node:fs`). Planted tests prove a non-test file
   importing either still fails.
7. Colour-gate gaps and the tokens.css exemption — **fixed**: the scan now
   also detects CSS named colours used as a value token (including
   `transparent`), `color-mix(`, `hwb(`, `lab(`, `lch(`, `color(` and
   `light-dark(` (a lookbehind keeps `background-color(` from matching
   `color(`). The `tokens.css` exemption is kept and anchored: the gate asserts
   the token table exists and it remains the only exempted file, and the full
   `--st-component-<name>-<leaf>` name set is now listed in `tokens.css`.
   Dual-stroke literal sourcing, recorded now per the review: components source
   fallback values from the allowlisted `@sentropic/design-system-tokens`
   foundation table (as `fixtures.ts` already does with
   `foundation.color.slate[…]`), never as raw literals — so no component file
   ever needs the exemption and §11 holds without a
   `var(--st-component-…, <literal>)` loophole.

Gate re-run after this round: see section 5 (rows 3–4 re-run, test count
updated).

---

# AS-1 lot record — comment mode (scope AC-8)

Lot AS-1, branch `feat/as1-comment-mode`, executed 2026-11-07 (UTC) from the
same frozen spec `scratchpad/artifact-shell/as01-spec-frozen.md` (sha256
`8f7bb962…`, verified at start), on top of origin/main @ b4b4e0ff (AS-0, PR
#252) plus the CA-L1 fold-in commit `0893e2ac`.

## 9. Version re-measure (spec §2.2, at AS-1 start)

| Package | AS-0 pin | Measured at AS-1 start | Used |
| --- | --- | --- | --- |
| @sentropic/design-system-tokens | 0.12.0 | 0.12.0 | 0.12.0 |
| @sentropic/design-system-themes | 0.12.0 | 0.12.0 | 0.12.0 |
| @sentropic/design-system-svelte | 0.37.0 | 0.37.0 | 0.37.0 (peer + dev) |

No drift since AS-0; the measured train is unchanged.

## 10. CA-L1 fold-in record (spec §4.1 conditional)

Corrected at the PR #254 review reconciliation (see §16): `0893e2ac` is the
AS-1 fold-in commit itself ("AS-1 folds in the two CA-L1 pieces it needs on
day one"), on this branch — it did not land before AS-1 started. The
**CA-L1 amendment** it carries is: one glyph entry (`comment` ->
`MessageSquare`) in `icons.ts`, one new component `LabelledIconButton.svelte`
+ barrel line in `packages/components-svelte` (spec §5.0 additive props
`pressed`, `ariaKeyshortcuts`, `tooltipContent`), the
`**/*.browser.test.mjs` exclusion generalisation in
`packages/components-svelte/vite.config.ts` (A1-5; the comment in that file
still names the rich-text-editor browser harness so the RT-1 packaging
witness keeps passing), and the `Icon.test.ts` catalogue extension. The
amendment is additive only: no existing icon name, `IconButton` or
`Tooltip` source was modified.

Registration of the new barrel entry is **not** `barrelOnly.svelte`
(that list holds other barrel-only exports; `labelled-icon-button` is not
in it). The real parity baseline, landed in `c24408f3`
("index LabelledIconButton (213 rows, svelte-only parity)"):
`parity-baseline.json` `expectedParity["labelled-icon-button"]` = svelte
`source-of-truth`, react/vue/angular `missing` (line 25), a `gaps` row with
`componentId: "labelled-icon-button"` (line 1338), `contract-baseline.json`
line 1580, and `generated/contracts/labelled-icon-button.json`.
Docs catalogue: `apps/docs/src/lib/components-catalog.ts:103-106`,
`status: "documented"`, `groupSlug: "icon-button"` (commit `2cc7fcc4`).

## 11. RED witnesses W-1.1…W-1.10 (spec §6, §8.3)

Each witness test was written first and observed failing with the component
absent, then passing after the component landed. RED command per witness
(exact, from the repository root, cache-prefixed), e.g. for W-1.1:

    npm --workspace @sentropic/design-system-artifact-shell exec -- vitest run src/lib/CommentModeToggle.test.ts

RED (component file temporarily absent; for W-1.1 the `.svelte` was moved out
for the run and restored byte-identical, sha256 `eff518b2…` verified after
restore) — exit 1 each:

- W-1.1 `CommentModeToggle.test.ts` — `Failed to resolve import "./CommentModeToggle.svelte"`, `Test Files 1 failed (1)`
- W-1.2/1.3/1.4/1.8/1.10 `CommentModeStatus.test.ts` — `Failed to resolve import "./BlockCandidateList.svelte"` (harness import), `Test Files 1 failed (1)`
- W-1.5 `BlockHighlightOverlay.test.ts` — `Failed to resolve import "./BlockHighlightOverlay.svelte"`, `Test Files 1 failed (1)`
- W-1.6 `LassoLayer.test.ts` — `Failed to resolve import "./LassoLayer.svelte"`, `Test Files 1 failed (1)`
- W-1.7/1.9 `BlockCandidateList.test.ts` — `Failed to resolve import "./BlockCandidateList.svelte"`, `Test Files 1 failed (1)`

GREEN — the targeted seven-file run (gate G-1 step 5, below) — exit 0:
`Test Files 7 passed (7)`, `Tests 76 passed (76)` (67 at the first review
round, 76 after the PR #254 reconciliation — see §16), gate prints
`import-graph gate: examined 8 source files (floor 8)`; the per-witness file
counts are CommentModeToggle 6, CommentModeStatus 13, BlockHighlightOverlay 7,
LassoLayer 5, BlockCandidateList 17, import-graph 21, types 7.

Witness coverage: W-1.1 toggle (F-T1/F-T2/F-X1/F-R1, sentinel shortcut
round-trip proving no key literal is hard-coded, §7.1); W-1.2/1.3/1.4 status
(F-S1…F-S4, F-S2 live-region discipline, F-K2 arrow scoping); W-1.5 overlay
(F-H1 4 theme/page cells, F-H2 selected, F-H3 both-null, chip -> onAnchor,
F-X1, F-R1); W-1.6 lasso (F-L1 band geometry, F-L2 HostHandler payload);
W-1.7 list (F-C1…F-C4, list-stage Esc only); W-1.8 full keyboard trail
(F-K1 §5.6 steps 1–7 with the adopted Q2 steps 4–5 — focus on
`CommentModeStatus` after publish, `BlockCandidateList` row after Change
block when the list is open, else the status root; after Cancel the row
when open, else the toggle — both branches of steps 5/7 driven — staged
Esc list -> Armed -> Off, H-1 host-handler half); W-1.9 five-file source
scan (no natural-language literal outside the allowlist, now including a
svelte/compiler template-AST walk of text nodes and attribute strings);
W-1.10 viewer-absence fixtures (F-A1, falsifiable: presence half mounts all
five components first). Each of toggle/status/lasso/list also carries the
§5.4 light/dark viewer-theme matrix row. Reduced-motion proofs are the
F-R1 compile half in jsdom (transition duration 0 under the
reduced-motion media query) plus browser row B-3's `emulateMediaFeatures`
half.

## 12. Browser rows B-1…B-3 (spec §8.2)

- `node packages/artifact-shell/src/lib/BlockHighlightOverlay.browser.test.mjs` (B-1, A1-12: WCAG contrast >= 3:1 in the 4 theme/page cells, real hover chip, and since the PR #254 reconciliation the selected treatment per §5.3a — heavier outline weight, never colour/alpha alone) — **not run (host GPU)** locally; **CI runs it verbatim** (see below)
- `node packages/artifact-shell/src/lib/BlockCandidateList.browser.test.mjs` (B-2, A1-17: real focus/active-descendant movement, selected cue read from the correct nodes, no tautological assertions) — **not run (host GPU)** locally; **CI runs it verbatim**
- `node packages/artifact-shell/src/lib/comment-mode.browser.test.mjs` (B-3, A1-18: real :hover/:focus tooltip on the toggle — the CA-L1 fold-in proof rides on this run per §5.0 — the full §5.6 focus trail incl. both fallback branches of steps 5/7, all five components mounted, reduced-motion zero durations on every mounted node) — **not run (host GPU)** locally; **CI runs it verbatim**

No local Chromium run is performed in this environment (host GPU limit,
§8.2); the three commands are listed verbatim and **wired into CI**:
`.github/workflows/verify.yml`, `verify` job, steps "Set up Chrome for
browser witnesses" (`browser-actions/setup-chrome`, stable) + "Browser
witnesses B-1..B-3 (artifact-shell)", gated on
`matrix.task == 'test' && contains(matrix.workspaces, '@sentropic/design-system-artifact-shell')`,
with `CHROME_BIN` from the setup step — so the artifact-shell test shard
runs the exact `node <file>` commands on a real Chromium and the PR run is
the §8.2 evidence. No gate row is claimed green from jsdom evidence. The
browser harness files assemble their vite-plugin specifier at runtime so
the import-graph gate (which scans raw text) stays green, and resolve the
repository root by walking up to the package.json that declares workspaces
(the worktree path is not fixed).

## 13. Split decision (spec §4.1 split trigger)

**No split.** The full five-component set (CommentModeToggle,
CommentModeStatus, BlockHighlightOverlay, LassoLayer, BlockCandidateList)
plus the keyboard matrix (W-1.8 F-K1) was completed; the AS-1a-only fallback
was not needed.

## 14. Deferred spikes — status at AS-1 (spec §8.3, A1-22)

- S-1 header fit: **FAIL (unmeasured)** (section 3). Per §8.3 the consequence
  is AS-2-side; **AS-1 is unaffected** and built no header.
- S-2 mention picker: **FAIL** for direct `Combobox` reuse (section 3); the
  decision input stands for AS-3.
- S-3 barrel import weight: **PASS** (section 3); AS-1 imports the Svelte
  primitives through the barrel, no fallback fired.
- S-4 avatar/toast route: **PASS** (section 3); no AS-1 dependency.

## 15. Gate G-1 results (2026-11-07, exact commands in spec order, cache-prefixed, from the repository root)

| # | Command | Exit |
| --- | --- | --- |
| 1 | `npm --workspace @sentropic/design-system-svelte run check` | 0 — svelte-check 0 errors, 0 warnings (both tsconfigs) |
| 2 | `npm --workspace @sentropic/design-system-svelte exec -- vitest run src/lib/LabelledIconButton.test.ts src/lib/Icon.test.ts` | 0 — exactly the 2 named files, `Test Files 2 passed (2)`, `Tests 20 passed (20)` |
| 3 | `npm --workspace @sentropic/design-system-svelte run build` | 0 — svelte-package `src/lib -> dist` |
| 4 | `npm --workspace @sentropic/design-system-artifact-shell run check` | 0 — svelte-check 0 errors, 0 warnings |
| 5 | `npm --workspace @sentropic/design-system-artifact-shell exec -- vitest run src/lib/CommentModeToggle.test.ts src/lib/CommentModeStatus.test.ts src/lib/BlockHighlightOverlay.test.ts src/lib/LassoLayer.test.ts src/lib/BlockCandidateList.test.ts src/lib/import-graph.test.ts src/lib/types.test.ts` | 0 — exactly the 7 named files, `Test Files 7 passed (7)`, `Tests 76 passed (76)` (re-measured after the PR #254 reconciliation; 67 at the first review round), gate `examined 8 source files (floor 8)` |
| 6 | `npm --workspace @sentropic/design-system-artifact-shell run test` | 0 — same 7 files, 76 passed |
| 7 | `npm --workspace @sentropic/design-system-artifact-shell run build` | 0 — svelte-package `src/lib -> dist` |
| 8 | `npm --workspace @sentropic/design-system-svelte run test` | 0 — `Test Files 131 passed (131)`, `Tests 1895 passed (1895)` |
| 9 | `node packages/artifact-shell/src/lib/BlockHighlightOverlay.browser.test.mjs` | not run (host GPU) locally — run verbatim by CI in the `verify` job's "Browser witnesses B-1..B-3 (artifact-shell)" step (see §12) |
| 10 | `node packages/artifact-shell/src/lib/BlockCandidateList.browser.test.mjs` | not run (host GPU) locally — run verbatim by CI (same step) |
| 11 | `node packages/artifact-shell/src/lib/comment-mode.browser.test.mjs` | not run (host GPU) locally — run verbatim by CI (same step) |
| 12 | `npm run index:check -w @sentropic/design-system-component-index` | 0 — `component-index --check: 426 artifact(s) fresh.` |
| 13 | `node scripts/run-script-guards.mjs` | 0 — 171 tests, 168 pass, 0 fail, 3 skipped |
| 14 | `npm run licensing:check` | 0 — gate OK; artifact-shell skipped as `private: true` |
| 15 | `npm run notices:generate` (user gate addition) | 0 — "21 paquets publiables", **no diff** afterwards |

Environment precondition recorded: step 8 first failed on
`src/AnatomyTokens.test.ts` resolving `@sentropic/design-system-theme-dsfr`
whose dist was not built in this worktree (pre-existing, unrelated to AS-1);
`npm --workspace @sentropic/design-system-theme-dsfr run build` (exit 0)
then step 8 passed. Step 8 also first failed on the RT-1 packaging witness
because A1-5's generalised exclusion dropped the literal `rich-text-editor`
string from `vite.config.ts`; fixed by naming the rich-text-editor browser
harness in the exclusion comment (the `[M]` set for shared files was
respected — `packaging.test.ts` untouched), then step 8 passed.

component-index note: the artifact-shell barrel gained the five component
exports (A1-19), but the index's framework sources are the eight
component/dataviz barrels only and artifact-shell is private, so no index row
is produced for it; the components-svelte barrel change (CA-L1) was
registered in `0893e2ac` (baseline + regenerated artifacts) and step 12 is
green on the whole index.

Import-graph floor: A1-21 raised `MIN_SOURCE_FILES` 3 -> 8 (types.ts,
fixtures.ts, index.ts + the five components); the AS-0 `ScaffoldSmoke.*`
files were deleted per the A0-12 executor choice (delete), and the
`!dist/**/ScaffoldSmoke.*` tarball exclusion was removed with them, so the
gate now prints `examined 8 source files (floor 8)`.

## 16. AS-1 review reconciliation (PR #254)

Two independent reviews (Argon `scratchpad/rev/as1-rev-argon.out`, Opus
`scratchpad/rev/as1-rev-opus.md`, both NOT MERGEABLE) were reconciled in
`scratchpad/rev/as1-review-dossier.md`. Work was done on top of `c24408f3`
— no rebase, no merge of main, no force-push, no stash (conductor
instruction). The frozen spec `scratchpad/artifact-shell/as01-spec-frozen.md`
wins over any review text. Commits: `35e81d0c`, `d82d5497`, `12c97b6f`,
`bfa032e9`, `d3f0d57c`, `e2f54ad9`, `d89f9b0f` (head at reconciliation:
`d89f9b0f`; this SPIKES commit is the final one on top).

### Accepted items R1–R6 (applied)

- **R1** — browser witnesses are real and CI-wired. All three
  `*.browser.test.mjs` now resolve the repository root by walking up to the
  package.json that declares workspaces instead of a fixed `../..` count
  (`findRepoRoot`, e.g. `BlockHighlightOverlay.browser.test.mjs:35-50`,
  same in the other two), cover all five components through real hooks on
  `window.__shell` (`setHovered`/`setSelected`/`setLasso`/`openList`/
  `closeList`/`setChangeOpensList`/`setCancelOpensList`,
  `comment-mode.browser.test.mjs:140-150`), query the nodes that carry the
  styles (`.st-lassoLayer__band`/`__fill`, the active row's inset bar —
  `BlockCandidateList.browser.test.mjs:262-270`), and contain no
  `|| true` tautology. CI: `.github/workflows/verify.yml:187-211` adds
  "Set up Chrome for browser witnesses" + "Browser witnesses B-1..B-3
  (artifact-shell)" to the `verify` job, gated on
  `matrix.task == 'test' && contains(matrix.workspaces, '@sentropic/design-system-artifact-shell')`,
  running the three `node <file>` commands verbatim with `CHROME_BIN` from
  `browser-actions/setup-chrome` — the §8.2/§8.5 CI evidence. Locally still
  `not run (host GPU)`; the harness build (vite + svelte compile of the
  embedded app) was validated locally without launching a browser.
- **R2** — selected ≠ hover by outline weight only (§5.3a).
  `BlockHighlightOverlay.svelte:124-132`: selected dark stroke
  `border-width: var(--st-border-width-thick, 2px)`, selected light stroke
  `inset: var(--st-border-width-thick, 2px)` so the inner stroke cannot
  occlude the weight increase (hover 1+1px, selected 2+1px). B-1 exercises
  `selected` in all 4 cells (`BlockHighlightOverlay.browser.test.mjs:288-323`:
  2px outer, 2px inset, combined selected > combined hover, selected outline
  still >= 3:1, selected chip anchors); the jsdom half asserts the same
  rules in `BlockHighlightOverlay.test.ts`.
- **R3** — no hard-coded spacing/radius/border/focus outside `--st-*` tokens
  (§5), all with fallbacks as AS-0 did: `CommentModeStatus.svelte:86-92+`
  (spacing, border-bottom, focus-visible via `--st-focus-width`/
  `--st-focus-offset`), `BlockCandidateList.svelte:143-153+` (max-height,
  border, radius, paddings, active inset bar, row focus primitive with the
  §5 2px offset), `CommentModeToggle.svelte:40-53` (border, pressed thick
  border) and `LassoLayer.svelte:44` (border), plus the overlay chip
  spacing/radius/border in `BlockHighlightOverlay.svelte`. The toggle's
  reduced-motion block also zeroes the inner icon-button and tooltip
  transitions (`CommentModeToggle.svelte:61+`), which do not inherit
  `transition-duration`.
- **R4** — W-1.9 now scans template text nodes and attribute strings.
  `BlockCandidateList.test.ts:338-431` adds a `svelte/compiler` AST walk
  (`templateViolations`, line 362): Text nodes must be whitespace-only,
  static attribute values must be in the explicit allowlist (st-* classes,
  kebab `data-st-shell`/`role`, `aria-live`, `tabindex`, `type`, catalogue
  icon names from `ICON_NAMES`), user-facing attributes (`aria-label`,
  `title`, …) must bind to expressions. In-memory planted-failure tests at
  lines 486/496/505 prove each violation shape fails. Real injection proof:
  `<span>Select a block</span>` was temporarily added to
  `LassoLayer.svelte`, the scan failed with
  `LassoLayer.svelte: template text node is not whitespace-only: "Select a block"`
  (1 failed / 16 passed), the injection was removed, and the file re-ran
  green (17 passed). The injection was never committed.
- **R5** — every §5.6 branch is covered in W-1.8 and B-3, including the
  step 7 fallback. jsdom harness: `CommentModeStatus.test.ts:310-313` adds
  `via` + `openListOnChange`/`openListOnCancel`, the change/cancel buttons
  set them (lines ~446-460), `sync()` focus implements the §5.6 cells
  (row when open; status root when `via === "change"`; toggle button
  otherwise), and a dedicated test at line 605 drives both closed-list
  fallbacks. B-3 drives the same branches in real Chromium
  (`comment-mode.browser.test.mjs:417-448`).
- **R6** — this record: §10 CA-L1 corrected (the fold-in is `0893e2ac` on
  this branch; registration is `parity-baseline.json` `expectedParity` +
  `gaps` row + `contract-baseline.json` + `generated/contracts/labelled-icon-button.json`
  in `c24408f3`, docs catalogue `components-catalog.ts:103-106` in
  `2cc7fcc4` — NOT `barrelOnly.svelte`), §11/§12/§15 re-measured at the
  reconciliation head (76 tests, browser rows CI-wired).

### Verify-then-apply (spec-backed — applied)

- **Argon 4** (§2.5): lasso fill was 0.24 element opacity, above
  `blockHighlight.fill` 0.16 and dimming the border. Applied:
  `LassoLayer.svelte:44-59` — opaque band border (fallback
  `--st-semantic-border-interactive`), translucent fill on a child element
  at opacity 0.1 (below 0.16, same translucent family). Commit `12c97b6f`.
- **Argon 7** (§5.4 "every row renders in light and dark viewer themes"):
  added a `§5.4 fixture matrix` describe to all four remaining test files —
  `CommentModeToggle.test.ts:129`, `CommentModeStatus.test.ts:747`,
  `LassoLayer.test.ts:99`, `BlockCandidateList.test.ts:515` — each iterates
  `Object.values(viewerThemes)`, injects `compileTheme(theme)` under
  `data-st-theme`, asserts the root renders, unmounts and removes.
  (BlockHighlightOverlay already had the 4-cell matrix.) Commit `d3f0d57c`/`bfa032e9`.
- **Opus N-3** (§6 W-1.10 / F-A1 falsifiability): W-1.10 was tautological.
  Rewritten at `CommentModeStatus.test.ts:674-720`: presence half mounts all
  five components and asserts each `[data-st-shell=…]` root, then unmounts
  all and asserts each absent from the theme root and the document.
- **Opus N-5** (§0.3 falsifiability): removed the no-op
  `expect(bad).toBeUndefined;` in `LassoLayer.test.ts:75-76` (kept the
  `@ts-expect-error` compile-time line, now `void bad;`).
- **Opus N-11** (§8.3 RED attribution): re-observed RED at the
  reconciliation head — with `CommentModeStatus.svelte` temporarily absent,
  `vitest run src/lib/CommentModeStatus.test.ts` fails with
  `Failed to resolve import "./CommentModeStatus.svelte" from "src/lib/CommentModeStatus.test.ts"`
  (`Test Files 1 failed (1)`); the file was restored byte-identical
  afterwards. The §11 RED list above remains accurate.

### Rejected (one line, spec section)

- **Argon 9a** ("branch reverts 7 unrelated files"): artefact of the
  conductor's two-dot diff `origin/main..HEAD`, not a branch change —
  rejected per §0.1/§8.5; no rebase performed (conductor-owned, Step 0).

### Deferred (non-blocking follow-ups, logged per dossier)

- **Argon 10 / Opus N-14** — import-graph gate scans comments and can be
  bypassed via `.join("/")` dynamic specifiers (the browser harnesses use
  that pattern deliberately); hardening the scanner is a gate-owner task.
- **Argon 11** — `LabelledIconButton` defaults `size` to `"md"` while CA
  §5.2 notes `"sm"` for dense item contexts; a components-svelte API
  decision, not an AS-1 defect.
- **Opus N-1** — rebase onto origin/main is conductor-owned (Step 0 forbids
  it here).
- **Opus N-6** — exit-announcement-while-visible vs `{#if visible}` spec
  tension; routed to the spec owner per §8.5 (scope amendment route), the
  current prop-driven rendering stands.
- **Opus N-7** — list heading inside the listbox + module-level id counter.
- **Opus N-8** — overlay fill layering / stacked chips.
- **Opus N-10** — pressed-state border-width layout shift (2px vs 1px).
- **Opus N-13** — catalogue route deviation from A1-4b (recorded in §10).
- **Opus N-15** — peer pin 0.37.0 AS-R obligation (see §6).
- **Opus N-16** — packaging witness passes on comment text.

### CI item (separate commit, per dossier)

- `d89f9b0f` — `test(diagram-core): explicit 20s testTimeout for migration
  tests under full CI scan`: `packages/diagram-core/vitest.config.ts:16`
  adds `testTimeout: 20000` to the existing `test` block (Opus extra check 7:
  `tests/m1e-migrations.test.ts` timeouts under a full CI scan).

### Scoped verification at the reconciliation head (all exit 0)

- `npm test -w @sentropic/design-system-artifact-shell` — `Test Files 7
  passed (7)`, `Tests 76 passed (76)`, gate `examined 8 source files
  (floor 8)` (per-file: toggle 6, status 13, overlay 7, lasso 5, list 17,
  import-graph 21, types 7)
- `npx vitest run src/lib/LabelledIconButton.test.ts src/lib/Icon.test.ts`
  in `packages/components-svelte` — `Tests 20 passed (20)`
- `npm test -w @sentropic/design-system-component-index` — `Test Files 15
  passed (15)`, `Tests 136 passed (136)`; `node --test
  scripts/component-index.test.mjs` — 13 pass, 0 fail
- `node --test scripts/verify-workflow-invariants.test.mjs` — 21 pass, 0
  fail (verify.yml still parses with the new steps)
- `npm --workspace @sentropic/design-system-docs run check` — svelte-check
  0 errors (227 pre-existing warnings)
- Browser witnesses B-1..B-3: **not run locally (host GPU, §8.2)** — the
  `verify` job runs them on CI; the harness build itself (path resolution,
  vite + svelte compile of the embedded apps) was exercised locally without
  launching a browser.
