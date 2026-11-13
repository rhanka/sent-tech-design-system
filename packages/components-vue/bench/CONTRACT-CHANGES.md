# Overnight Vapor content migrations

The original `.ts` fixtures and goldens were frozen before conversion. Every
`legacyProps` rich-content fixture renders the old VNode/component callback and
an equivalent template slot, with the same tags, text and order. G4 compares
that equivalent markup against the original golden; it does not accept changed
markup or regenerate the reference. Scalar content props remain supported.
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
| FormGroup | Rich legend and helper text use `legend` and `helperText` slots; existing default content remains. |
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
