# PR 280 review fixes

The branch was merged with origin/main in 1e0a1ea. Generated component indexes
were regenerated. This report covers both independent reviews, relative to the
original PR head a0a6379c12d7f1591404e8a68e5c0fb93581d90e.

All Blocking and Major findings are resolved. The inexpensive Minor fixes are
included. The code and measurement rules are documented in RECIPE.md and
CONTRACT-CHANGES.md. Detailed file lists, the source digest and all 220 gate
records are in [results/review-fixes.json](results/review-fixes.json).

| Finding | Fix | Regression witness |
| --- | --- | --- |
| Carbon B1 | Restore the four chart and three menu Vapor exports. Menus use native SVG and forwarded item-icon slots. The build rejects a component that would be silently omitted. | Built namespaces match all 253 runtime values; packed Vapor checks every Classic export and the eight reviewed/new names. |
| Carbon B2 / Astra 4 | Header exposes slot-only titles and brands, with documented slot precedence. | Slot-only Header test and paired archived rich fixture without placeholder props. |
| Carbon B3 | Alert, Switch, Toggle, Toggletip and FormGroup rich props become optional; Tooltip content is optional too. | Six warning-free slot-only mounts and twelve published Classic/Vapor props type assertions. |
| Carbon B4 / Astra 1, 3 | Disable implicit inheritance wherever attrs are forwarded; remove Search wrapper duplication; keep live merges and preserve inline Popper attrs, styles and listeners. | Native-control add/change/remove tests, single-listener assertions, main Positioning tests, inline Popper fixture and K25 AST negative controls. |
| Carbon M1 | Icon accepts authored SVG children without name/glyph and does not warn. | Slot-only Icon test and SVG-namespace witnesses. |
| Carbon M2 | Ten components use setup useId; eight counter helpers are removed. | SSR requests restart IDs; siblings remain unique for all ten components; K25 rejects module counters and extracted helpers. |
| Carbon M3 | Eight components retain one notification path through emit, preserving callback prop types. | Group/rating interaction tests, the complete behavior suite and AST duplicate-notification checks over every SFC. |
| Carbon M4 / Astra 5 | Error slots drive invalid state in eight controls, including Textarea, and react to removal. | Eight rich label/help/error tests, native aria-invalid assertions and helper fallback after slot removal. |
| Carbon M5 / Astra 2 | Add all missing rich-content slots, scalar guards and slot-dependent wrappers/state; use kebab-case and preserve existing camelCase aliases. | Rich Quote, StructuredList, PasswordInput, ProgressBar/Indicator, StreamingMessage, Footer, ChatThread, collection/control and naming tests; paired archived rich fixtures; CONTRACT-CHANGES.md. |
| Carbon M6 | Compare complete independently mounted Classic/Vapor DOM for every fixture and check every unmount. Include the three menus. | 1,215 paired fixture comparisons; altered-Vapor-DOM negative control; all 220 G1–G6 targets. |
| Carbon m1 | Export CellDecorationIcon and its props, document Icon bare, mark list path internal. | Public packed export assertion and recursion-state annotation check. |
| Carbon m2 | NavDrawer forwards scoped-slot payloads. | A scoped child witness passes its payload through NavDrawer in both runtimes. |
| Carbon m3 | Empty DatePicker label uses the open-label fallback. | Open-dialog accessible-name test. |
| Carbon m4 | Remove repeated SVG class tokens in Icon, Combobox and MultiSelect. | Three direct SVG token-uniqueness tests in both runtimes. |
| Carbon m5 | Remove three unused setup calls. | Full package compilation and all affected gates. Per-row local loops remain where hoisting would change their scope; no broad loop refactor was needed. |
| Astra minor | Preserve Popover content="" precedence over its content slot. | Assert that the open dialog exists and has empty content. The archived implementation fails this regression. |

## Class-wide changes

All 233 production SFCs were audited; 211 SFCs changed. Rule counts overlap:

| Rule | SFCs changed |
| --- | ---: |
| Add inheritAttrs: false, including the newly explicit Popper path | 46 |
| Remove cached attrs spreads/destructures | 34 |
| Make class/style binding precedence explicit | 168 |
| Replace identity counters with setup useId | 10 |
| Remove duplicate callback/emit notification paths | 8 |
| Extend content/slot contracts or scalar compatibility guards | 41 |
| Remove unused setup calls | 3 |

Eight extracted counter helpers were deleted. Existing type/value export names
remain; the two new CellDecorationIcon exports bring the public total to 885.

## Verification

| Check | Result |
| --- | --- |
| Complete components-vue suite, both configured Classic/Vapor projects | 112 files, 2,315 passed |
| Review regressions in Classic | 63 passed |
| Review + hard interactions + normalizer + AST regressions in Vapor | 93 passed |
| Whole-package vue-tsc, published consumer types, Classic/Vapor builds | Passed; 233 SFCs |
| Stable Vue 3.5.45 compiler output | Passed; 233 SFCs |
| K25 against origin/main | Passed; 115 existing dataviz modules, no additions |
| Existing K25/toolchain tests | 12 passed |
| Component-index suite | 16 files, 150 passed |
| Component-index/dependency Node guards | 22 passed |
| Generated component-index freshness | 430 artifacts fresh |
| Licensing/notices | 22 publishable packages passed |
| Packed Classic, stable-3.5 and Vapor consumers | All passed; 3 tests per run, declarations and dependency graphs checked |
| check.mjs on every converted component, original baseline controls and menus | 220 targets, 1,320 gates passed; 1,215 fixtures |
| git diff --check | Passed |

The regression campaigns first reproduced the defects: 40 failures in the
initial 42-case suite, six missing AST guard behaviors, three SVG class failures,
four explicit-ID failures, four additional rich-slot failures and two content
state failures. The three inexpensive Minor regressions and the Popover case
were also run against the archived original PR source and failed there.

Archived golden HTML was preserved. New paired fixtures were measured against
archived sources and recorded hashes. G4's bounded review-corrections adapter
removes duplicate wrapper fallthrough, restores native caller IDs and adds the
reviewed invalid state. Popper's new inline-attrs expectation explicitly records
its corrected contract. G5 canonicalizes runtime markers, generated IDs, CSS
serialization and redundant/empty classes while retaining text, attributes,
ARIA, structure and reference relationships.

No root npm test, browser, Python, Track command, rebase, stash or force-push was
used. Publication and release tags remain outside this PR-fix operation.

## Round-2 fixes

Merged DC-2c.1 / PR 272 from origin/main (`47c996d8`) in `fcddc800` and
regenerated the component indexes. The following corrections supersede the
first-pass class-wide claims above. All 238 production SFCs were audited.

| Findings | Correction and failing regression |
| --- | --- |
| Astra N1; Carbon M5 | Breadcrumb item-label renders linked/current rich labels with { item, index }; labels are optional and legacy non-scalars do not serialize. |
| Astra N2; Carbon B3/M5 | EmptyState title/message/action slots support slot-only markup and a working Retry button; wrappers react to slot removal; title is optional. |
| Carbon B1/m1, R2-M1 | Mixed inline type exports survive the Vapor build. Published gates compare every resolved type declaration, including CellDecorationIconProps: 632 types, 253 runtime values, 885 total names in each barrel. Menu component icons require item-icon and no longer leave empty spacers; empty string behavior is preserved. |
| Carbon B4, R2-M3 | LanguageToggle forwards attrs in both variants; AppHeader retains them with an open compact drawer; MenuPopover keeps caller styles alongside owned positioning. Fourteen layout/image hosts exercise conflicting string/object/array styles and late updates with original caller precedence; cached style composition is removed. |
| Carbon R2-M2/M4 | Combobox/MultiSelect/ChatComposer guard original values before string conversion. Slot labels name the listboxes and MultiSelect group/trigger. ChatComposer retains nullish defaults and explicit empty strings. |
| Carbon m5, R2-m1 | Removed the 28 dead attrs bindings and five unused imports identified by the initial audit, plus imports made unused by those removals. Header uses computed links; FileUploader derives row metadata without singleton loops. |
| Carbon R2-m2/m3 | Reactive select/drawer IDs retain stable generated fallbacks; LanguageToggle SVG tokens are unique; EventFeedPanel siblings have distinct label identities. |
| Carbon R2-m4 | NavShell and Notification declare their slots. The whole-package guard now checks every statically rendered slot, repairing the other missing declarations too. Archived source still fails this guard for both reviewed components. |
| Additional package audit | MessageStatusBadge gains scoped label; ChatMessage and MenuLabel gain named content/label aliases while preserving default slots; Combobox gains no-results-label; Accordion gains optional item-content for render callbacks. DatePicker's non-scalar dialog name falls back correctly; slot-only Toast queue titles have localized dismiss names. |

Rich fields are optional at both top-level and collection positions. @slot
documents equivalent existing scoped names; the two @vaporData exceptions are
serialized/unrendered data. K25 negative controls cover unknown/VNode aliases,
callbacks, optionality, missing/unrendered/undeclared slots, string conversion,
attrs class/style precedence, cached caller style and unused Vue bindings.

The initial new behavior campaign failed 33 of 62 cases. Three additional audit
cases and two scalar-boundary cases failed before their fixes. The published
type comparison failed specifically on CellDecorationIconProps. The final
campaign has 71 passing cases in each runtime. Existing golden HTML was retained;
two new paired fixtures were captured from archived Breadcrumb/EmptyState sources.

| Final verification | Result |
| --- | --- |
| components-vue full Classic/Vapor suite | 114 files, 2,385 passed |
| dataviz-vue full suite | 37 files, 160 passed |
| Round-2 regressions | 71 Classic + 71 native Vapor passed |
| Existing review regressions, Classic | 63 passed |
| Review/interaction/normalizer/AST/codemod Node suites | 119 passed |
| Existing toolchain/guard suite | 12 passed |
| diagram-core / diagram-canvas suites after main integration | 669 / 504 passed; one existing canvas skip |
| Component-index suite / freshness | 151 passed; 430 artifacts fresh |
| Index/dependency/provenance Node guards | 26 passed |
| Notices / licensing | Regenerated; 22 publishable packages passed |
| Published declarations, Classic/Vapor builds, stable Vue 3.5.45 builds | Passed |
| Packed Classic, stable-3.5 and Vapor consumers | All three runs passed; declarations, dependency graphs and runtime exports checked |
| Vue/dataviz package smoke shard | Passed, including strict peer installation and Vapor consumer types |
| All converted-component G1–G6 targets | 220 targets, 1,320 passing gates; 1,217 paired fixtures |
| K25 against origin/main; whitespace check | Passed |

The 33 targets updated during the gate campaign were rerun on final source.
The first new fixture ordering error was corrected; no archived expectation was
changed. Two verification attempts overlapped declaration builds and saw transient
missing/partial output; both were rerun after builds completed. See
[round2-fixes.json](results/round2-fixes.json) for final target results, the source
digest, per-file hashes and archived slot-declaration failures.
