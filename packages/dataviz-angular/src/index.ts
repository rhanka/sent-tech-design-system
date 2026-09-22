export { QueryBar } from './lib/QueryBar.js';
export type { QueryBarProps } from './lib/QueryBar.js';
export { DateHistogramChart } from './lib/DateHistogramChart.js';
export type {
  DateHistogramChartProps,
  DateHistogramChartTone,
  DateHistogramLabelFormatter,
} from './lib/DateHistogramChart.js';
export {
  DASHBOARD_STORE,
  createDashboard,
  injectDashboard,
  provideDashboard,
  toSignalStore,
} from './adapter.js';
export type { AngularDashboard, AngularSignalStore } from './adapter.js';
export * from './adapter.js';
