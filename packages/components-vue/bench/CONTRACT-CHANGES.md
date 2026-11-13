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

## V8 missing ports: badge, labelled icon button and web frame

These three components had no original Vue render module. Their frozen G4
references come from Svelte SSR via `capture-svelte-goldens.mjs`, with source
revision, source digest and fixture digest recorded in each golden. The script
removes only Svelte compiler scope-class tokens and hydration markers before
applying the shared DOM normalizer. The badge tooltip ID uses Vue useId rather
than the Svelte module counter; the normalizer masks that registered prefix
while retaining its aria-describedby relationship. Fourteen fixtures cover
unlocked, locked, expired, requested, read-only, live-binding, activity and
missing-message badge states; labelled-button variants; and frame attributes.

LockPresenceBadge reuses the framework-neutral rich-text collaboration state
and color validation. Its four callbacks become typed requestUnlock,
acceptUnlock, forceUnlock and releaseLock events; existing onX listeners remain
supported and run once. Presence totals include the current actor while the
avatar/roster list excludes them; holder order, inert labels, untranslated
markers and keyboard tooltip linkage follow the Svelte contract. It exposes
no slots and does not control editor editability.

LabelledIconButton keeps its scalar label, tooltip-content override, pressed
state and key-shortcut attributes. Svelte onclick remains a compatibility
callback; Vue consumers can use the click event with the same MouseEvent. If
both are provided, the callback runs before the listener, once each. Its local
tooltip template preserves the Svelte Tooltip DOM; it uses the shared global
DS tooltip styles. The additive Icon svgClass prop lets this DS composition
retain the complete reference SVG class list without changing existing Icon
output. An absent pressed prop omits aria-pressed; false is rendered verbatim.
There are no public slots.

WebFrame's Svelte reference lives in dataviz-svelte, which owns that framework's
implementation. The new components-vue export delegates to the same
framework-neutral dataviz-core resolveWebFrame function. It retains iframe
src/title, sandbox array-or-string handling, loading/referrer-policy defaults,
allow and optional class, with no events or slots. The Svelte object-layer
iframe witness is ported alongside attribute/default/update checks.

## V8 editors and V9 completion

RichTextEditor and ComposerEditor also had no historical Vue render module.
Nine additional fixture goldens are captured from their Svelte SSR output,
using the same source/fixture provenance and normalization above. SSR renders
an empty editor surface (plus RichTextEditor's status/live facts); the engine
mounts only on the client, matching Svelte. Snapshot notifications are also
client-only, covered by an SSR regression. The full profile is asynchronous:
capture waits for it, pending prop changes reconcile on settlement, and a
late instance is destroyed when its host has already unmounted.

Both Vue adapters reuse @sentropic/design-system-rich-text/editor, the same
neutral Tiptap engine as Svelte. No framework-specific engine or duplicate
schema is added. RichTextEditor exposes captureDocument/readiness;
ComposerEditor exposes captureComposer/readiness. Notification callbacks map
to typed Vue events with identical payloads and one delivery per listener.
ComposerEditor onKeyDown remains a synchronous policy callback because its
return value or preventDefault controls the engine's keyboard handling.
Neither editor exposes slots. Document fingerprints preserve nested reactive
updates without replaying unchanged values on locale switches; full composer
seeds preserve untouched Markdown bytes and elide synthetic trailing blocks.

The rich-text-editor and presence-badge subpaths, including their default and
named exports, mirror Svelte; parallel vapor subpaths expose native compiled
SFCs with the same Props and capture handles. The editor engine stays out of
the root barrel. rich-text-editor.css is available as a separate stylesheet.
The shared build's added subpath emission does not change compiler options;
the bench compiler pin was refreshed after checking the matching options.

V9 replaces the two remaining lucide-vue-next consumers (Menu/OverflowMenu)
with DS Icon on neutral node data. Their prior SVG classes, geometry, sizing,
stroke and decorative ARIA are preserved. The comment/message-square glyph
also matches Svelte's registry. lucide-vue-next is removed from the Vue package
and lockfile. K25 regeneration retains 115 dataviz legacy modules and adds no
entries; these missing ports did not have legacy render functions to remove.
