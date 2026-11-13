# HARD lane content migrations

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
