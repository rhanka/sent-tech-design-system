/**
 * The BarChart source binding of the browser bundle: the design system
 * package's index re-exports the ENTIRE system (ForceGraph and its graph
 * dependency among them), so importing it would drag the whole design
 * system into the core chunk. The bundle instead pins the ONE component the
 * catalogue renders at L2, by its source file — same component, same
 * compiled output, no index. The contract still names the package as the
 * component's owner (src/contracts/bar-chart.ts); this module is the
 * bundle's mechanical import path, not a contract change.
 */

export { default as BarChart } from "../../../../components-svelte/src/lib/BarChart.svelte";
