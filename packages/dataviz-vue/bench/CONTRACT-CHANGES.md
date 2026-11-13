# Dataviz contract changes

CrossfilteredBarChart, DrillBarChart and SmallMultiples preserve public component/Props names, defaults, callback signatures, selection/drill behavior, attrs and SSR fixture output. No caller migration is required.

CrossfilteredBarChart output-only facets (`selectable: false`) now update when store filters change. The original read the subscription state only in its selectable branch, so output-only charts kept stale rows. The template's computed data explicitly subscribes in both modes, following the conversion recipe's reactivity rule. A probe of the original confirmed two bars remained after filtering to one category; classic and published Vapor regression checks require one bar after that update. Selection controls remain absent in output-only mode.

FieldPane and PalettePicker expose no public VNode-valued props or markup-returning callback types. Their internal VNode assembly is replaced with private templates, so no named-slot migration or public Props change is needed. FieldPane preserves its recursive clickable authoring branch and flat passive branch, optional Boolean defaults, expansion seeding/control, attr destinations and selection callback. PalettePicker preserves layout classes/styles, palette ordering, scale labels/endpoints and swatch sizing. All 14 fixtures match their frozen originals.

FieldPane's undeclared `update:selectedId` listener remains filtered by Vue's model-listener fallthrough rule; the passive tree does not gain keyboard selection. This was checked against the original before correcting the extra runtime test's expectation.

The `./vapor` entry now includes all 117 public components and routes their DS presenter imports to the native DS entry. It preserves all 275 root public names and their value/type kinds, including companion scalar helpers such as `rowsToCsv` and `dateRangeToSpec`. ObjectLayers is split into WebFrame, DataImage and ObjectLayerPanel SFCs with the existing root names and Props. No legacy render modules remain.

DashboardGrid preserves its scoped default slot (`{ meta, panel }`) and emits `layoutChange` once per edit. Its existing `onLayoutChange` prop remains typed; Vue delivers the declared event to that listener, so the adapter no longer calls it a second time. CalculationEditor and FormatPanel likewise notify once per native edit through the child control's model update. Callback props and payload types remain available.

Native control attributes inside CalculationEditor, FormatPanel, QueryBar, RelativeDateFilter and the other reviewed control adapters follow PR 280: attributes and listeners reach the intended native control once, rather than also falling through onto its field wrapper. Generated IDs come from the underlying reviewed controls' setup `useId()` calls; consumers must treat their generated values as opaque. Explicit IDs, label references and ARIA relationships are preserved. The bounded reference adapter documents this correction without changing archived captures.

SelectionLegend still renders nothing with an empty selection; it appears and clears reactively. Its empty default is checked against both mounted runtimes, rather than requiring an element where the original contract returns none.

The release is `@sentropic/dataviz-vue@0.6.0-next.0`, a minor prerelease with `publishConfig.tag: next`. Classic remains available on the root entry with Vue 3.5 support; native Vapor is the opt-in `./vapor` entry on Vue 3.6. No tag or publication is part of this integration.
