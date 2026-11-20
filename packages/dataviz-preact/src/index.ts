/**
 * @sentropic/dataviz-preact
 *
 * Preact + Signals adapter and dashboard components for @sentropic/dataviz-core,
 * built on @sentropic/design-system-preact. Single JSX source of truth for the
 * Preact package and the emitted @sentropic/dataviz-react build (lot P6).
 */

// Adapter + full core surface re-export (incl. the core's `describeFilterSpec`).
export * from './adapter.js';

// Shared drill engine helpers.
export { drillLevel, onDrillSelect, drillDepth } from './lib/drill.js';
export type { DrillLevel, DrillDatum } from './lib/drill.js';
