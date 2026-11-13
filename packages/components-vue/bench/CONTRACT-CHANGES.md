# Overnight Vapor content migrations

The original `.ts` fixtures and goldens were frozen before conversion. Every
`legacyProps` rich-content fixture renders the old VNode/component callback and
an equivalent template slot, with the same tags, text and order. G4 compares
that equivalent markup against the original golden. The review corrections below explicitly remove duplicated fallthrough attributes and restore control IDs; review-corrections.mjs applies those bounded changes without replacing the archived HTML. Scalar content props remain supported.
VNode objects and component/render callbacks that return VNodes require slots;
passing them through interpolation or dynamic components would require VDOM
interop. Notification and data-formatting callbacks keep their existing roles.

| Module | Old prop | New slot | Migration line |
| --- | --- | --- | --- |
| Dropdown | `options[].label` (VNode) | `option-label` `{ option, index }`, selected display and list | `<template #option-label="{ option }"><strong>{{ option.label }}</strong></template>` |
| TileGroup | `legend`, `items[].label ?? title`, `items[].description` (VNode) | `legend`, `item-label`, `item-description` `{ item, index }` | Move rich markup into the corresponding slot; keep scalar data in items. |
| Toast | `title`, `message`; `items[].title/message/actions` (VNode) | `title`, `message`, existing `actions`, queue scopes `{ item, index }` | `<template #title="{ item }"><strong>{{ item?.title }}</strong></template>`; single message prop retains precedence over default. |
| TreeView | `nodes[].label` (VNode) | `node-label` `{ node, index, level }` | `<template #node-label="{ node }"><strong>{{ node.label }}</strong></template>` |
| OrderedList / UnorderedList | items or recursive `items[].content` (VNode) | `item` `{ item, index, path }` at every depth | `<template #item="{ item }"><strong>{{ item.content }}</strong></template>` |
| MenuLabel (internal) | `label` (VNode) | existing/default slot | `<MenuLabel><strong>Label</strong></MenuLabel>`; scalar `label` stays supported. |
| Menu / MenuPopover / OverflowMenu (callers) | rich `items[].label` in actions and groups | `item-label` / `group-label` `{ item, index, depth }` forwarded through both hosts | Move label markup to these slots; keep scalar labels for accessible names and data. |
| DataTable | `caption`, `columns[].label`, VNode-returning `columns[].cell(row, column)` | `caption`, `column-label` `{ column, columnIndex }`, `cell` `{ row, column, rowIndex, columnIndex, value }` | `<template #cell="{ value }"><b>{{ value }}</b></template>`; scalar-returning cell callbacks remain supported. |
| NavActionStack | `actions[].icon`, `dangerZone.icon` (Vue component) | `action-icon` `{ action, index }`, `danger-icon` `{ action }` or neutral glyph data | Move arbitrary component icons into slots; neutral data uses DS Icon. |
| Icon (dependency) | component-valued `glyph`, component-valued `ICONS` | neutral glyph data; default slot for authored SVG children | Use DS icon names or `{ name, nodes }` glyph data; VDOM glyph components require caller migration. |
| cellDecoration (helper) | `renderCellDecorationIcon(icon): VNode \| null` | data resolver plus `CellDecorationIcon.vue` | Use the resolver for data, or `<CellDecorationIcon :icon="icon" />` for markup. |

Toast and TreeView expose typed listener props instead of inspecting Vue instance
internals. Events still invoke each listener through `emit`; controls remain
absent without listeners. Generated identities use `useId()`; the reference
normalizer masks only the registered generated IDs and TileGroup radio names.
Portal/Popper retain V0c behavior and move their public types into their SFCs.

The native interaction witnesses also corrected duplicate notifications in
NavItem, NavSection/Collapsible and Popper: a declared event already invokes
its matching callback prop. These now emit once without calling that same
callback a second time. Payloads and public callback props are retained.
Popper installs Escape/focus handling when it is initially open as well as
when it opens after mount. Neither change affects the frozen SSR markup.

## Integration and remaining lanes

All existing component and auxiliary exports retain their public names and
value/type kinds. Pure runtime helpers move out of script setup: Flex's
spacing/align/justify functions, Grid's gridTemplateColumns, Col's spanBasis and
offsetMargin, Header's deriveInitials, IdentityMenu's identityInitial and
PanelStack's constants remain exported through the public barrel. chartScale
stays TypeScript: chartDataList now returns accessible-list data; chart SFCs own
the list markup. No helper calls h or creates VNodes.

| Module | Rich-content migration |
| --- | --- |
| Header | `brand`, `title` and navigation labels use `brand`, `title`, `nav-label` (`{ item }`) slots with scalar fallbacks. The existing brand slot remains. |
| Table | `caption` and column labels use `caption` and `label` (`{ column }`) slots with scalar fallbacks. |
| Search | Rich `label` content uses the `label` slot with its scalar prop fallback; the pre-existing declared prop type remains unchanged. |
| Alert / LoadingState / Toggle / Toggletip | Rich label/title/message/content props migrate to their corresponding named slots; scalar fallbacks and existing slots remain. |
| Tabs | Rich item labels and panels use `tab-label` (`{ item, index }`) and `panel` (`{ item }`). |
| ChatMessage | Rich avatar, content, footer and actions use `avatar`, existing `default`, `footer` and `actions` slots. |
| Footer | Rich brand and copyright use `brand` and `copyright` slots. |
| FormGroup | Rich legend and helper text use `legend` and `helper-text` slots (with the deprecated `helperText` alias); existing default content remains. |
| Highlight | Rich title uses `title`; existing default content remains. |
| Switch / Textarea | Rich labels and help use `label` and `helper-text`; Textarea also exposes `error-text`. |
| Tile | Rich title and description use `title` and `description`; existing default content remains. |

Generated file-upload, search, gradient and clip identities use setup useId.
The measurement normalizer applies the same registered identity masks to both
frozen reference HTML and converted HTML, retaining SVG cell suffixes and
reference relationships. Table's paired rich-label input was repaired to use
the original per-column tags and alignments; the ORIGINAL Table.ts was rerun
and every frozen SSR fixture matched byte-for-byte. Only its fixture-input
digest changed; no reference output was regenerated.

ThemeProvider's original SSR reference was captured under Node/JSDOM because
its style-injection effect requires document. This preserves that existing
environment requirement. This port does not add server-only document support.

The release is prepared as `0.41.0-next.0` under npm's `next` dist-tag. Publishing
and any release tag remain with the owner. Dataviz-vue conversion follows in a
second PR.

The index's measured Vue declarations now expose Button's default slot,
DataTable's caption/cell/column-label slots and Modal's default/footer slots.
Eight derived Vue contract cells move from partial to complete without losses:
AppHeader, Drawer, LanguageToggle, Modal, Notification, Pagination,
PaginationNav and Popover. The contract baseline records those measured
changes; source-conversion progress remains a separate metric.

## Review fixes for PR 280

Every migrated top-level content prop is optional. Existing strings, numbers,
empty strings and defaults retain their fallback path; VNode/component markup
uses slots. New slots take precedence over their scalar fallbacks. Header brand
now follows that rule, and slot-only Header titles and Icon SVG children render
without a companion prop. Popover keeps its earlier non-null content-prop
precedence, including content="". Alert actions and Toggle helper-text are public
slots. FormGroup and Toggle retain helperText as a deprecated helper-text alias.

| Component | Additional content slots | Scope / behavior |
| --- | --- | --- |
| Input, Textarea, PasswordInput, NumberInput, Select, Combobox, MultiSelect, DatePicker | label, helper-text, error-text | Scalar fallbacks stay supported; error slots drive invalid state and react to removal. |
| Select, Combobox, MultiSelect | option-label | { option }; scalar option data still drives selected input text. |
| Tooltip | content | content prop is optional for slot-only callers. |
| Quote | author, source | Slot-only attribution exposes its footer. |
| StructuredList | term, definition | { item, index }; term/label and description/value remain scalar aliases. |
| ProgressBar | label | Slot-only labels expose the header. |
| ProgressIndicator | item-label, item-description | { item, index }; slot-only descriptions expose their wrapper. |
| StreamingMessage | text, placeholder, event-label | { event } for event-label; text slots use active-text styling. |
| Footer | column-title, link-label | { column, index } and { link }; link-label also covers legal links. |
| ChatThread | message-content | { message }, forwarded into ChatMessage for populated messages. |
| ChatMessage | timestamp | Exposes the timestamp/footer without a scalar prop. |
| ChatComposer | submit-label | Replaces rich submitLabel content. |
| MessageActions | action-content | { action, index }; scalar labels or item IDs retain accessible naming. |
| ContentSwitcher, SideNav | item-label | { item }. |
| NavRail | item-label, item-icon, item-badge | { item }; wrappers account for slot presence. |
| LanguageSelector | current-label, option-label | { option }; current option can be undefined. |
| Menu, MenuPopover, OverflowMenu | item-icon | { item, index }; string icon characters remain supported. Component-valued icons move to this slot; hosts forward it. |

The menu cascade chevrons and overflow trigger use native SVG. All Classic
runtime exports are present in ./vapor, including all four reviewed charts and
the three menus. CellDecorationIcon and CellDecorationIconProps are now public.
Icon bare preserves composition markup; OrderedList/UnorderedList path is
explicitly internal recursion state. NavDrawer forwards scoped slot payloads.
DatePicker uses its open-label fallback when label is empty. SVG class tokens
are emitted once by Icon, Combobox and MultiSelect.

Canonical slot spellings also include extra-selectors (AppChrome), top-chrome,
primary-rail, navigation-panel, context-panel, utility-panel, bottom-panel
(AppShell), and custom-extra (TimeRangePicker). Their existing camelCase names
remain deprecated aliases. Panel-resize callback keys retain their existing names.

All explicit attrs paths disable automatic inheritance. Form attrs and native
listeners go once to the control; Modal/Drawer attrs go once to the panel;
Popper forwards attrs only to its inline panel. Live render-time merges preserve
attributes added, changed or removed after an initially empty mount. Explicit
native IDs keep label relationships. All generated identities use setup useId,
including the menu family and TimeRangePicker. The extracted counter helpers
have been removed. Eight additional callback/emit duplicates are corrected in
Autosave, CheckboxGroup, DashboardGrid, RadioGroup, Rating, SlideIndicator,
Stepper and Tag; listener prop types, event payloads and ordering are retained.

G4 retains every archived capture. The bounded review-corrections adapter removes
wrapper fallthrough from form controls, Table and Modal/Drawer compositions,
restores caller IDs on Select/Textarea/PasswordInput/NumberInput, and reflects
MultiSelect invalid state on its trigger. A new inline Popper reference explicitly
records the corrected id/role/accessible name; its archived V0c implementation
warned and omitted them. New paired rich fixtures were captured from archived
sources with source hashes; ChatThread records its recovered ChatMessage renderer.

G5 independently mounts every Classic/Vapor fixture, compares the entire body
and teleport destinations, reflects live control state, and asserts cleanup for
every component. Normalization ignores only runtime markers, registered IDs,
class redundancy/empty classes and CSS serialization differences. Element order,
text, ARIA, attribute values and ID-reference relationships remain checked.
