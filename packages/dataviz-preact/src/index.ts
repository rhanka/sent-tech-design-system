/**
 * @sentropic/dataviz-preact
 *
 * Preact + Signals adapter and dashboard components for @sentropic/dataviz-core,
 * built on @sentropic/design-system-preact. Single JSX source of truth for the
 * Preact package and the emitted @sentropic/dataviz-react build (lot P6).
 */

// Adapter + full core surface re-export (incl. the core's `describeFilterSpec`).
export * from './adapter.js';

// Categorical charts (batch 2).
export { ComboChart } from './lib/ComboChart.js';
export type { ComboChartProps } from './lib/ComboChart.js';
export { StackedBarChart } from './lib/StackedBarChart.js';
export type { StackedBarChartProps } from './lib/StackedBarChart.js';
export { LollipopChart } from './lib/LollipopChart.js';
export type { LollipopChartProps } from './lib/LollipopChart.js';
export { StepLineChart } from './lib/StepLineChart.js';
export type { StepLineChartProps } from './lib/StepLineChart.js';
export { AreaChart } from './lib/AreaChart.js';
export type { AreaChartProps } from './lib/AreaChart.js';

// Shared drill engine helpers.
export { drillLevel, onDrillSelect, drillDepth } from './lib/drill.js';
export type { DrillLevel, DrillDatum } from './lib/drill.js';
