# Dataviz contract changes

CrossfilteredBarChart, DrillBarChart and SmallMultiples preserve public component/Props names, defaults, callback signatures, selection/drill behavior, attrs and SSR fixture output. No public contract migration for these proofs.

The `./vapor` entry now includes these native adapters and routes their DS presenter imports to the native DS entry. It deliberately excludes components whose runtime children still require VDOM interop.
