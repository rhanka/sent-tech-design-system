# HARD lane conversion results

Branch: `feat/vapor-lane-hard`. All 19 requested entries pass G1–G6.
The 95 HARD fixtures plus 28 supporting-dependency fixtures match their frozen
original SSR goldens and mount under native Vapor without interop. No G4
exception was used. Original source hashes at each golden's recorded revision
and current frozen-fixture hashes were verified for all 26 entries.

| Module | result | contract change | note |
| --- | --- | --- | --- |
| AppChrome | PASS G1–G6 | None | Native AppHeader and SVG data; useId drawer; role filtering and menus retained. |
| AppShell | PASS G1–G6 | None | Disclosure content remains mounted; controlled/uncontrolled widths and keyboard resize retained. |
| cellDecoration | PASS G1–G6 | Internal VNode helper → neutral SVG data | Stays TypeScript; CellDecorationIcon.vue owns markup; KpiCard caller migrated. |
| DataTable | PASS G1–G6 | Rich caption/column labels/cell callbacks → scoped slots | Scalar props and scalar cell callbacks retained; sorting, selection, pagination and decorations retained. |
| Dropdown | PASS G1–G6 | Rich options[].label → option-label slot | Scalar labels retained; native Teleport; selected and list labels share the slot. |
| MenuLabel | PASS G1–G6 | Rich label → default slot | Scalar label retained; Menu/MenuPopover/OverflowMenu forward typed item-label/group-label slots. |
| NavActionStack | PASS G1–G6 | Component icons → glyph data or icon slots | Scalar action labels retained; DS Button/Divider/Icon dependencies compiled natively. |
| NavItem | PASS G1–G6 | None | Composes native SelectableRow/ColorSwatch/StatusDot/Badge; selection notifies once. |
| NavSection | PASS G1–G6 | None | Native Collapsible/Overline/Badge; useId labels; toggle notifies once. |
| OrderedList | PASS G1–G6 | Rich recursive content → item slot | Scalar items retained; scoped item/index/path forwarded at every depth. |
| PanelSection | PASS G1–G6 | None | Typed injection key moved to pure helper; registration, collapse and primary state retained. |
| Popper | PASS G1–G6 | None | V0c wrapper removed; public types retained; pure geometry exports retained; initially-open Escape handling and single placement notification verified. |
| Portal | PASS G1–G6 | None | V0c wrapper removed; default/custom targets, inline movement and teardown verified. |
| SelectableRow | PASS G1–G6 | None | Typed context moved to pure helper; managed selection, tab stops and registration retained. |
| TileGroup | PASS G1–G6 | Rich legend/labels/descriptions → slots | Scalar props retained; useId radio names; model value emitted before change. |
| Toast | PASS G1–G6 | Rich title/message/actions → slots | Scalar props retained; typed listeners replace instance inspection; single/queue controls retained. |
| TreeView | PASS G1–G6 | Rich nodes[].label → node-label slot | Scalar labels retained; typed listeners replace instance inspection; keyboard focus/expansion/selection retained. |
| UnorderedList | PASS G1–G6 | Rich recursive content → item slot | Scalar items retained; scoped item/index/path forwarded at every depth. |
| VennChart | PASS G1–G6 | None | Pure layout retained; SVG and accessible data list moved into templates. |

Contract details and migration lines: [CONTRACT-CHANGES.md](/home/antoinefa/src/sent-tech-design-system/.vapor-hard-wt/packages/components-vue/bench/CONTRACT-CHANGES.md).
Per-module evidence: [results/hard](/home/antoinefa/src/sent-tech-design-system/.vapor-hard-wt/packages/components-vue/bench/results/hard).

Supporting dependencies Icon, AppHeader, Collapsible, ColorSwatch, StatusDot,
Overline and Divider also pass G1–G6, with original fixtures captured and
committed before conversion. Icon keeps the DS name registry and consumes
neutral Lucide data; component-valued glyphs migrate to data or authored slots.
The menu family receives the label-slot migration only; its remaining existing
Lucide/component icon dependencies are outside the native coverage claimed here.

Validation: 710 classic checks in 16 scoped files, 116 menu migration checks,
15 native Vapor interaction checks, 5 V0c compatibility checks and 6 normalizer
checks pass. Package strict type checking, classic/Vapor build, published
declaration validation, stable Vue 3.5.45 compilation, K25 lint and classification
freshness pass. Vue/Vapor pin: 3.6.0-rc.15. CSS was unchanged.

Reference commits: `4f341b0e` (HARD components), `c29009c0` (supporting
dependencies), `8b7023c2` (cellDecoration). Each requested entry has its own
`vapor: convert <Name>` commit. Later integration fixes preserve notification
counts, originally-open Popper handling, caller imports and menu declarations.

Author: Codex / GPT-6 family; exact routed model/effort is not exposed in this
session. Recorded interval starts with the first reference commit at
2026-11-12 23:47:12 America/Toronto; result written 2026-11-13T05:18:21.299Z.
Scoped retries resolved Vue fallback markers in templates, literal style/attrs
ordering, callback duplication, and slot/declaration emission. Final gate
results are saved; reference fixtures/goldens were never refreshed.

The evidence covers classic SSR, native Vapor in Node/JSDOM, declarations and
compilation. It does not establish browser layout/visual/print acceptance or
programme-wide coverage. No browser, root test script, Track operation or push
was run. Independent peer consensus review was not performed in this lane.
