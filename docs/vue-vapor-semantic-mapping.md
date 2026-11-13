# Vue semantic mappings and conversion ownership (V0b)

These are migration assignments for the remaining render modules at
`d20ae7cc`, not completed public API changes. The conversion lots must apply
the mappings, migrate callers and prove equivalent fixtures. Keep existing
slot names, scalar fallbacks, event payloads and precedence. Each module has
exactly one suggested owner in [vue-vapor-classification.csv](vue-vapor-classification.csv).
L1.5 reconciles public exports, references, consumer priority and acceptance.

## Public rich-content contracts

All file stems below are `packages/components-vue/src/<Name>.ts`. These 46
files have public rich-content or component-valued icon surfaces that need a
contract migration and belong to V6. `unknown` is included only where it is
actually rendered as a child; a TypeScript `as string` cast is not runtime
stringification. New slot names are proposed here; existing slots and the
bench's Alert/Tabs names are binding compatibility inputs.

| File | Current prop / nested member | Slot and scope |
| --- | --- | --- |
| Alert | title, message, actions | title, message, actions |
| Breadcrumb | items[].label | item-label `{ item, index }` |
| ChatComposer | submitLabel | submit-label |
| ChatMessage | content, timestamp, footer, actions, avatar | Existing default/footer/actions/avatar; add timestamp |
| ChatThread | messages[].content, emptyLabel | message-content `{ message, index }`, empty-label |
| Combobox | label | label; option labels/noResultsLabel remain scalar |
| ContentSwitcher | items[].label | item-label `{ item, index }` |
| DataTable | caption, columns[].label, columns[].cell(row,column) | caption, column-label `{ column, columnIndex }`, cell `{ row, column, rowIndex, columnIndex, value }` |
| DatePicker | label, helperText, errorText | label, helper-text, error-text |
| Dropdown | options[].label | option-label `{ option, index }` in list and selected display |
| EmptyState | title, message, action | title, message, action |
| Footer | brand, copyright, columns[].title, columns[].links[].label, links[].label, legalLinks[].label | Existing brand; copyright, column-title `{ column, columnIndex }`, link-label `{ link, index, column?, columnIndex? }`, legal-link-label `{ link, index }` |
| FormGroup | legend, helperText | legend, helper-text |
| Header | brand, title, (navigation ?? navItems)[].label | Existing brand; title, nav-label `{ item, index }` |
| Highlight | title | title |
| InlineLoading | label | label |
| LanguageSelector | options[].label | option-label `{ option, index }` in list and selected display |
| LoadingState | label ?? title | label, preserving alias precedence |
| MessageActions | actions[].(icon ?? label) | action-content `{ action, index }`; accessible name remains scalar |
| MessageStatusBadge | labels[status] | label `{ status }` |
| MultiSelect | label, helperText, errorText | label, helper-text, error-text; option labels remain scalar |
| NavActionStack | actions[].icon, dangerZone.icon | action-icon `{ action, index }`, danger-icon `{ action }`, or K7 data glyphs |
| NavRail | items[].label | item-label `{ item, index }`; icon/badge stay stringified |
| NumberInput | label, helperText, errorText | label, helper-text, error-text |
| OrderedList | items / recursive items[].content | item `{ item, index, path }`; preserve recursive children |
| PasswordInput | label, helperText, errorText | label, helper-text, error-text |
| ProgressBar | label | label |
| ProgressIndicator | items[].label, items[].description | item-label, item-description `{ item, index }` |
| Quote | author, source | author, source |
| Search | label | label |
| Select | label, helperText, errorText, options[].label | label, helper-text, error-text, option-label `{ option, index }`; retain default options override |
| SideNav | items[].label | item-label `{ item, index }`; do not add previously unrendered child recursion |
| StreamingMessage | text, placeholder, events[].label | text, placeholder, event-label `{ event, index }`; events[].text is unused |
| StructuredList | items[].(term ?? label), items[].(description ?? value) | term, description `{ item, index }`; preserve aliases |
| Switch | label, helperText | label, helper-text |
| Table | caption, columns[].label | caption, column-label `{ column, index }`; rows[][] stay stringified |
| Tabs | items[].label, items[].content | tab-label `{ item, index }`, panel `{ item }` (bench names) |
| Textarea | label, helperText, errorText | label, helper-text, error-text |
| Tile | title, description | title, description; existing default still replaces the whole body |
| TileGroup | legend, items[].(label ?? title), items[].description | legend, item-label, item-description `{ item, index }` |
| Toast | title, message; items[].title/message/actions | title, message, actions; collection scopes `{ item, index }` |
| Toggle | label, helperText | label, helper-text |
| Toggletip | label, content | label; use existing default for content, preserving scalar-prop precedence |
| Tooltip | content | content; retain existing trigger/default behavior |
| TreeView | recursive nodes[].label | node-label `{ node, index, path, depth }` |
| UnorderedList | items / recursive items[].content | item `{ item, index, path }`; preserve recursion |

Header/Footer's nonempty brand prop currently wins over their brand slot;
ChatMessage's existing slots win over their prop counterparts. Keep both-case
fixtures. Dropdown/LanguageSelector need rich labels in both the closed and
open displays, without changing their scalar search/value/accessible-name
logic. Preserve empty/false/null wrapper conditions exactly.

An additional public contract migration belongs to **V9**:
`packages/components-vue/src/Icon.ts` exports `IconGlyph = Component` and
component-valued `ICONS`. Change `glyph`/`IconGlyph` and registry values to
framework-neutral Lucide node data, preserving DS names and SVG semantics.
NavActionStack's icons share that dependency. Replacing only the import keeps
the VDOM dependency and does not satisfy K7.

The already-SFC Menu/MenuPopover/OverflowMenu family is outside the 331 rows,
but still delegates rich labels to `MenuLabel.ts`. V6 owns that helper and
must reconcile the family's existing public menu-label contract with typed
slots. No native coverage is inferred from its `.vue` extensions.

## Callback-to-event mapping

| Current contract | Target / compatibility rule |
| --- | --- |
| `onX(payload)` notification | Typed `defineEmits<{ x: [payload: Payload] }>()`; retain exact existing event casing where an event already exists |
| `modelValue` + `update:modelValue` | Keep the pair, payload and controlled precedence; extractor records bindable |
| Tabs `onchange(value)` plus `change` | Keep lowercase callback compatibility separately; do not silently drop either |
| NavActionStack actions[].onClick / dangerZone.onClick | Proposed action / danger-action events with the action payload; retain callback adapter until callers migrate |
| DataTable columns[].cell | Scoped cell slot; this callback returns rendered content |
| DataTable columns[].cellDecoration / rangeLabel | Keep computation/formatting callbacks; they do not become events or slots |
| Toast dismissLabel / Accordion items[].content formatter | Keep scalar formatter behavior; Accordion explicitly String-converts function output |
| Engine callbacks / public ref functions | Keep typed boundary callbacks or existing emits/exposed methods; no blanket event rewrite |

An event and its `onX` listener are two spellings of the same Vue notification:
do not manually invoke that listener after emitting it. Migration adapters must
specify precedence when both a legacy callback and new event listener are
present and test the number/order of calls. Listener-presence-dependent
TileGroup/Toast/TreeView behavior needs an explicit model; `useId` only replaces
identity. The extractor retains declared spellings verbatim and records event
pairs, so semantic equality applies these mappings rather than guessing names.

Data-only `unknown` in GeoChart geometry, ListReportPage/ObjectPage row bags
and ParallelCoordinatesChart data remains data. Combobox/MultiSelect option
labels, Table cell values and NavRail icon/badge paths already use `String`:
converting them to rich content would add behavior beyond this migration.

## The historical 18 VNode files

The plan's 18 is the **components-vue-only** scan at `a91b59de7`. It includes
ForceGraph/GraphLegend, now SFCs, and predates MenuLabel. The current scan is
17 components-vue TS files plus 2 dataviz files = 19. The following table
classifies all original 18; paths use `packages/components-vue/src/`.

| Historical file | VNode use | Public contract migration? | Owner |
| --- | --- | --- | --- |
| AppChrome.ts | Internal render children | No | V1 |
| AppShell.ts | Internal render children | No | V5b |
| Checkbox.ts | Internal render children | No | V2 |
| ConfigItemCard.ts | Internal render children | No | V4 |
| DataTable.ts | Public caption, column label and cell renderer | Yes: slots above | V6 |
| FieldCard.ts | Internal render children | No | V4 |
| ForceGraph.ts → ForceGraph.vue | Old internal annotation removed | No | G0.2, already converted |
| GraphLegend.ts → GraphLegend.vue | Old internal annotation removed | No | G0.2, already converted |
| NavActionStack.ts | Internal VNode list plus public Component icons | Yes: K7 data/slots | V6 + V9 dependency |
| NavItem.ts | Internal return annotation | No | V3 |
| NavSection.ts | Internal render children | No | V3 |
| OrderedList.ts | Public recursive rich items | Yes: item slot | V6 |
| PanelSection.ts | Internal render children | No | V1 |
| ScoreCard.ts | Internal render children | No | V4 |
| SelectableRow.ts | Internal render children | No | V4 |
| UnorderedList.ts | Public recursive rich items | Yes: item slot | V6 |
| VennChart.ts | Internal render children | No | V4 |
| cellDecoration.ts | Internal renderer returns VNode; barrel exports its types | No public runtime renderer export; migrate helper markup | V6 |

Current additions to that table:

| Current file | Classification | Contract consequence |
| --- | --- | --- |
| packages/components-vue/src/MenuLabel.ts | Private render helper, V6 | Transitive rich menu-label behavior; audit the existing SFC family |
| packages/dataviz-vue/src/lib/FieldPane.ts | Internal VNode render children, V7 | No VNode-valued public prop |
| packages/dataviz-vue/src/lib/PalettePicker.ts | Internal VNode render children, V7 | No VNode-valued public prop |

Reproduce the historical scan with `git grep -l -E
'\b(VNode|VNodeChild|VNodeArrayChildren)\b' a91b59de7 --
packages/components-vue/src ':!*.test.ts'`; current scans exclude tests,
declarations and test-support. The public-change list is the 46 V6 files in
the first table plus Icon (47 remaining modules); a literal VNode grep alone
misses rich `unknown` and Component-valued icon contracts.

## CSV classification and lot summary

Run `rtk node scripts/vue-vapor-classify.mjs` to regenerate, or append `--check`
to verify freshness without writing. It inventories actual render calls with
the existing K25 scanner, reads catalogue categories and TypeScript imports,
and resolves relative imports and dataviz DS-barrel dependencies. Semicolon
lists distinguish runtime and type dependencies. `lot_dependencies` includes
cross-lot runtime prerequisites and V9 for direct Lucide importers.

Classes are exclusive: rich public surface first (`VNode-prop`), then shell /
render-helper / Icon (`hard`), then data/dataviz, form, navigation/overlay,
and simple. This describes conversion work, not performance or acceptance.

| Class | Modules |
| --- | ---: |
| simple | 36 |
| form | 14 |
| data | 201 |
| overlay | 16 |
| hard | 18 |
| VNode-prop | 46 |
| Total | 331 |

| Suggested lot | Modules |
| --- | ---: |
| V1 | 27 |
| V2 | 14 |
| V3 | 16 |
| V4a / V4b / V4c | 29 / 29 / 29 |
| V5a / V5b | 9 / 14 |
| V6 | 48 |
| V7a / V7b | 58 / 57 |
| V7c / V8 | 0 / 0 (missing ports are outside this inventory) |
| V9 | 1 (Icon; importer work also appears as dependencies) |

Package totals: components-vue 216, dataviz-vue 115. Three rows are rendering
helpers, not public component modules: chartScale, cellDecoration, MenuLabel.
The 328 other rows are component modules. Portal/Popper and other existing
SFCs have no remaining-h row; their acceptance obligations still apply.

V4 and V7 batches use runtime-import dependency order with strongly connected
groups kept together and lexical tie breaks. V4 has 87 rows after rich-content
ownership moves and the chartScale helper is included; V7 remains 58/57.
chartScale's render helper is prerequisite work for core charts; preserve its
pure calculations in TS. cellDecoration is shared by DataTable and KpiCard.
DrillChart's chart dependencies and ChartExport's ExportMenu dependency are
kept before them in the dataviz order.

The older category counts and V6 effort estimate no longer describe this
partition: public rich surfaces move out of their category batches, NavRail
moves out of V5b, Icon moves to V9, and two portal modules are already SFCs.
V6 now owns 48 remaining modules (46 public migrations + 2 render helpers).
Cross-lot dependency cycles can require coordinating prerequisite modules
before the rest of their lot. The CSV is a module-level fan-out input, not
permission to run every lot concurrently or a revised calendar estimate.
