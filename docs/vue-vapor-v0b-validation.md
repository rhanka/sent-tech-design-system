# V0b validation and handoff

Built on `feat/vue-vapor-v0` after V0a/V0c (`d20ae7cc`). No production component
conversion or package version change is included in V0b.

## Changes verified

- Vue contract extraction resolves named/default/renamed/star exports through
  checker symbols, retains the component declaration when props live elsewhere,
  and requires exported `NameProps`. Dataviz SFC declaration paths are supported.
- Public constructor and generic-call surfaces supply slots, event payloads,
  binding pairs and handlers. Slot return types and Vue's universal slot index
  do not create fabricated contract entries. Missing expected slots and
  unsupported generic parameters remain partial.
- Generic defaults use parameter-symbol identity; concrete specializations
  have separate schema definitions and escaped references. Definitions used
  only by events/slots survive even with empty props.
- Branded primitives retain scalar JSON types with explicit loss records.
  Symbol-keyed members produce stable diagnostics and are omitted from JSON
  properties. The regression introduces unrelated unique symbols before
  extraction and checks identical output.
- The codemod leaves its input intact, exclusively creates optional draft/report
  files, and exits 2 for unsupported work. Frozen Badge and typed-event examples
  compile on stable 3.5, classic RC and Vapor RC; a UID witness exercises useId.
- The regenerated 64 contract documents change 63 Vue cells and the React/Svelte
  scene cells through the shared brand correction. No completeness status or
  contract baseline expectation changes. Generated contracts contain no
  TypeScript `__@` symbol allocation names. Much of the scene diff removes the
  erroneous string-object methods/length properties from branded refs.

## Checks

| Check | Result |
| --- | --- |
| Vue Vitest/jsdom, classic and native Vapor projects | 112 files / 1,880 tests passed |
| Dataviz Vue Vitest/jsdom | 37 files / 160 tests passed |
| Component-index Vitest suite | 16 files / 149 tests passed |
| `scripts/component-index.test.mjs` | 13 tests passed, including freshness, mutation refusal and independent digest/schema checks |
| `scripts/vue-to-sfc.test.mjs` | 6 tests passed; no browser |
| Component-index TypeScript build | Passed |
| Generated index `--check` | Passed |
| Classification `--check` | Passed: 331 unique current modules, 216 + 115 |
| K25 lint | Passed: unchanged 331-module allow-list |
| `licensing:check` | Passed: 22 publishable packages |
| `notices:generate` | Passed; no notice changes |
| `git diff --check` | Passed |

Focused SFC/conversion tests also pass after the final export-star and generic
reference checks. No root test command, browser, release, Track operation,
stash, rebase or force push is part of this work.

## Remaining acceptance work

The CSV supplies suggested ownership and dependencies, not §2.9 coverage.
It accounts for three rendering helpers and 328 component modules. V6 expands
to 48 rows after the public rich-content audit; its old effort estimate and
parallel fan-out assumptions need reassessment. Cross-lot dependencies can
require coordinated prerequisite conversions.

The semantic mapping lists 46 V6 public migrations plus Icon's K7 glyph-data
change. Generic parameters without defaults, non-JSON brands and other
declaration losses still make a derived JSON contract partial. Their behavior
is tested and recorded, not counted as complete programme coverage.

The benchmark recipe/checker were read at
`28739d99b7805ac572db0e553db916efc4b60928`. They remain on the measurement
branch; their helper/build hash must be reconciled with V0a's shared compiler
before use on this foundation. V0b does not claim new G1–G6 conversion trials,
packed-consumer reruns, browser/print acceptance or SSR/hydration acceptance.
The existing V0a/V0c evidence remains in [vue-vapor-v0.md](vue-vapor-v0.md).
No independent final PR consensus review is claimed by this builder.
