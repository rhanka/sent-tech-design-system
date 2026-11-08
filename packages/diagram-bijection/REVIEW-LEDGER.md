# DL-0 review ledger

Scope: every finding of the two independent reviews of lot DL-0, reproduced
against the code and the frozen spec, then fixed or pushed back.

- Frozen spec: `spec/SPEC_EVOL_DL01_BIJECTION_HARNESS.md`, sha256
  `5595e8a8dde33c88b016c986885219b3058fba74f93d35b37419904db2cf2ca8` (unchanged at
  ledger time). The spec wins over both reviews.
- Reviews: Argon (`scratchpad/diag-lib/dl0-rev-argon.out`, 8 blocking + 3
  non-blocking), GLM 5.3 (`scratchpad/diag-lib/dl0-rev-glm.md`, 9 non-blocking).
  A previous Argon review cited text that did not exist, so each claim below
  was verified against code and spec before acting; citation mismatches are
  noted in the row.
- Statuses: `fixed` (failing repro turned green), `pushed back` (claim wrong,
  with spec + code evidence), `deferred` (none).

## Argon findings

| Id | Claim (one line) | Status | Evidence |
| --- | --- | --- | --- |
| Argon 1 | report/pin API signatures deviate from the frozen §2.3/§2.4 declarations | fixed | `src/report/markdown.ts:26` `renderReportMarkdown(report, source)`, `src/report/write.ts:13` `writeReport(report, outDir): Promise<{jsonPath, mdPath}>`, `src/report/write.ts:31` `checkGeneratedReports(dir): Outcome<{checked}>`, `src/pins/fixture-pins.ts:52` `readFixturePins(file?)` with `DEFAULT_PINS_FILE` at :50; spec:285-287, spec:409. Tests: report.test.ts:63,73,81; pins.test.ts (default read). Argon cited non-existent `scripts/generate-reports.ts`/`check-generated-reports.ts`; the real callers are `src/harness/cli.ts:77,162` and the tests, all updated. |
| Argon 2 | S4 probe mutation: a second allowed probe on the same record saw the first probe's patch | fixed | `src/harness/model.ts:36` `applyJsonPatch` is pure (`structuredClone`) with RFC 6902 array handling (:55 splice remove, :57 splice insert, `-` append). Repro: pre-fix model/run restored temporarily -> 4 tests failed (cross-probe mutation, array remove hole, array add `-`, S3 interplay); post-fix green. Tests: harness.test.ts:190, 212. |
| Argon 3 | S6 passed by comparing a state to itself when S1/S2 failed | fixed | `src/harness/run.ts:240-243` S6 is `not-run` « prerequisite failed » when `imported.size === 0`; per-state missing import gives `harness-render-mismatch` (:256). Test: harness.test.ts:150. |
| Argon 4 | a zero-tally report passed validation | fixed | `src/report/validate.ts:53-61` tally rule applies when S2/S3 ran non-vacuously (`ranComparison`, :56-57); vacuous S2/S3 with 0/0 still accepted, as W-DL0.2's all-states-fail shape requires (spec:382, spec:645). Verdict cross-checks per spec:219-220 added at validate.ts:40-49. Argon's extra « S4 pass implies complete fractions » is derivable from spec:219-220 and is covered there instead. Side effect: run.ts:138 S3 is vacuous-fail when `imported.size === 0`. Tests: report.test.ts:120,127,132,148,155. |
| Argon 5 | §2.5 raw-field handling not fail-closed / self-scan / zone tint / run.json count | fixed (a, d), pushed back (b, c) | (a) dropped-field value types now checked: `src/anon/hrpn-fixture.ts:124-126` scene.title/caption/legendPassages, :146-149 detail/footer/name/role/store, :192 zh node label; tests anon.test.ts « dropped raw fields are still type-checked ». (d) run.json `unresolvedFoldIds` is the array: `src/anon/cli.ts:253`; spec:499 « raw values go to run.json only ». (b) pushed back: the core signature is frozen (spec:440-462) with no baseline parameter, while §2.7 item 5 (spec:601) makes the distinctive set baseline-dependent; a full-set core scan false-positives on common words and would break W-DL0.8 — the scan is correctly CLI-side « before any write » (spec:502), implemented in the `generate` command. (c) pushed back: spec:488 row « entity `tint` » covers zones; spec:526 « zones with a tint: 0 » is a measured count of the pinned raw (F-9), not a key ban; the synthetic fixture legitimately has tinted zones. |
| Argon 6 | rawgate `allow[].reason` not checked against its digest | fixed (gate), pushed back (allow preservation) | `rawgate/dl-rawgate.mjs:360` `validateAllowReasons(key, file)` refuses when any reason token digests to the entry's digest or any file digest (spec:611); called in `main()` at :421, exit 1; digests ascending/unique at :340-342; allow digest 32-hex + non-empty reason in `validateDigestFile`. Declared in `rawgate/dl-rawgate.d.mts`. Tests: rawgate.test.ts « allow reason that digests to a guarded digest… », « unsorted digests or a non-32-hex allow digest… ». Pushed back: buildDigestFile/cmdGenerate need not preserve old `allow` entries — §2.7 rotates the key at every regeneration, so old entries are stale by design. |
| Argon 7 | W-DL0.3 13-state witness did not prove each toggle differs from default by one container | fixed | harness.test.ts:265 uses `defaultCollapsed` = all 10 containers, asserts default == all-folded and symdiff == {id} per toggle (spec:646, spec:216). Note: Argon's fix text « states[0] == states[1] » is wrong — all-expanded is ∅, so default == all-folded is states[2]; the test asserts the correct relation. |
| Argon 8 | W-DL0.13 merged comment and CDATA into one vector; tie-break untested | fixed | bpmn.test.ts splits COMMENT_VECTOR and CDATA_VECTOR (four vectors per spec:656); new describe « selectBpmnFixture tie-break on synthetic candidates » covers flowNodes → diagrams → path-bytes-ascending (incl. byte order 'Z' < 'a'). |
| Argon 9 | §2.6 step 4 ran git on the non-real ancestor; home-chain permission check skipped an existing target outside home | fixed (both), pushed back (--is-inside-git-dir) | `src/anon/out-of-repo.ts:114` and :133 use `gitSaysInsideWorkTree(real)` (the step-3 real path, spec:551-552 « that ancestor »); :91 checks the target `to` itself even outside the home chain. Tests: out-of-repo.test.ts « group/other-accessible target directory itself, even outside the home », « accepts an existing 0700 target directory outside the home ». Pushed back: spec:552 names only `--is-inside-work-tree`; Argon's cited test lines 69-77 do not match the current file. |
| Argon 10 | `tiny.structure.json` sat under `fixtures/structures/` instead of `fixtures/synthetic/` | fixed | `git mv fixtures/structures/tiny.structure.json fixtures/synthetic/tiny.structure.json` (spec:65 §1 tree, spec:243 §2.2); pins.json:76, all 13 `fixtures/report-vectors/*.json` fixture.path strings and tests/pins.test.ts:41 updated; `src/harness/cli.ts:80` scans both dirs. Test: pins.test.ts « the tiny pin lives under fixtures/synthetic/ per the §1 tree ». |
| Argon 11 | no test for the CLI `verify` CI refusal; dead code in the anon tests | fixed | cli.ts already refused CI for both commands (spec:504); added test anon.test.ts « the CLI verify also refuses with anon-ci-refused when CI=true (exit 1) »; removed the unused `override` param and `parsed` var in `synthInput`. Note: the exit code is 1, not 2 as Argon stated — the CLI returns 1 for `anon-ci-refused`. |

## GLM 5.3 findings

| Id | Claim (one line) | Status | Evidence |
| --- | --- | --- | --- |
| GLM 1 | provenance `counts` were measured on the anonymised output, not the raw input | fixed | `src/anon/hrpn-fixture.ts:340-368` builds the raw-id view and `countStructure`s it before id replacement, refuses `anon-structure-invalid` on divergence (:367-368), commits `rawCounts` (:414); spec:474 « measured on the raw input ». Test: anon.test.ts « provenance counts are the raw-measured counts and match the committed structure »; W-DL0.12 test unchanged and green (synthetic and pinned counts coincide, no fixture regeneration needed). |
| GLM 2 | run.json `unresolvedFoldIds` was a count, not the ids | fixed | same as Argon 5(d): `src/anon/cli.ts:253` writes the array; spec:499. |
| GLM 3 | rawgate hits were deduped per digest only, not per (path, line, digest) | fixed | dedupe keys are `${line}\u0000${digest}` in `scanTree` and `scanCommitMessages`; spec:601 « one hit per path, line and digest ». Test: rawgate.test.ts « the same canary word on two lines of one file yields one hit per line; repeated on one line it is deduped ». |
| GLM 4 | digests file not validated as ascending/unique; allow digest/reason unchecked; reason not digest-checked | fixed | same as Argon 6: `rawgate/dl-rawgate.mjs:333-357` (`validateDigestFile`), :360 (`validateAllowReasons`), :421 (CLI call, exit 1). Tests: rawgate.test.ts « unsorted digests or a non-32-hex allow digest… », « allow reason that digests to a guarded digest… ». |
| GLM 5 | report/pin signatures deviate from §2.3/§2.4 | fixed | same as Argon 1. |
| GLM 6 | `parseTag` loops forever on a stray `/` inside a tag (e.g. `<x b/2>`) | fixed | `src/bpmn/xml-count.ts:66` `if (i === attrStart) return null;` after the attribute-name scan -> `bpmn-xml-unreadable`. Test: bpmn.test.ts « a stray '/' inside a tag … is unreadable, not an infinite loop ». Note: a hang repro could not be executed (the sandbox blocks ad-hoc node scripts); evidence is code reading plus the post-fix test. |
| GLM 7 | a dangling entity `parent` was silently re-rooted to null | fixed | `src/anon/hrpn-fixture.ts:162-170` refuses `anon-structure-invalid` on unknown parent and on parent cycles (the cycle guard also protects the depth walk of the counts); `entityOf` now maps with `idMap.get(e.parent) as string` (:265 area). Tests: anon.test.ts « a dangling entity parent is refused… », « an entity parent cycle is refused… ». |
| GLM 8 | pin paths were not checked for absolute/backslash form | fixed | `src/pins/fixture-pins.ts:32` rejects `path.startsWith("/")` and `path.includes("\\")`; spec:409 + « POSIX, relative to the root ». Test: pins.test.ts « a pin path that is absolute or holds a backslash is rejected ». |
| GLM 9 | `types.ts` had two declarations on one line | fixed | `src/harness/types.ts:43-44` newline before `export type ProbeExpectation`. |

## Verification

- `npm test -w @sentropic/diagram-bijection`: 100/100 passed (8 files).
- `npm run check -w @sentropic/diagram-bijection` (tsc --noEmit): clean.
- `node --test scripts/verify-workflow-invariants.test.mjs`: 26/26 pass.
- Spec sha256 unchanged: `5595e8a8dde33c88b016c986885219b3058fba74f93d35b37419904db2cf2ca8`.
- No raw S2-target file was opened, printed or quoted; no fixture regeneration
  was needed (synthetic and pinned counts coincide under raw measurement).
