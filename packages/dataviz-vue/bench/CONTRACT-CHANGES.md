# Dataviz contract changes

CrossfilteredBarChart, DrillBarChart and SmallMultiples preserve public component/Props names, defaults, callback signatures, selection/drill behavior, attrs and SSR fixture output. No caller migration is required.

CrossfilteredBarChart output-only facets (`selectable: false`) now update when store filters change. The original read the subscription state only in its selectable branch, so output-only charts kept stale rows. The template's computed data explicitly subscribes in both modes, following the conversion recipe's reactivity rule. A probe of the original confirmed two bars remained after filtering to one category; classic and published Vapor regression checks require one bar after that update. Selection controls remain absent in output-only mode.

FieldPane and PalettePicker expose no public VNode-valued props or markup-returning callback types. Their internal VNode assembly is replaced with private templates, so no named-slot migration or public Props change is needed. FieldPane preserves its recursive clickable authoring branch and flat passive branch, optional Boolean defaults, expansion seeding/control, attr destinations and selection callback. PalettePicker preserves layout classes/styles, palette ordering, scale labels/endpoints and swatch sizing. All 14 fixtures match their frozen originals.

FieldPane's undeclared `update:selectedId` listener remains filtered by Vue's model-listener fallthrough rule; the passive tree does not gain keyboard selection. This was checked against the original before correcting the extra runtime test's expectation.

The `./vapor` entry now includes these native adapters and routes their DS presenter imports to the native DS entry. It deliberately excludes components whose runtime children still require VDOM interop.
