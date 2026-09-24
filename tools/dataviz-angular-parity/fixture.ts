import { createDashboardStore, type DashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';

/** One fixture for both frameworks, so a diff can only come from the adapters. */
export const T0 = Date.UTC(2026, 0, 1);
export const DAY = 86_400_000;

export const model: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'ts', label: 'Timestamp', type: 'continuous' },
  ],
  measures: [
    { id: 'amount', label: 'Amount', aggregation: 'sum' },
    { id: 'latency', label: 'Latency', aggregation: 'avg' },
  ],
};

export const rows: Row[] = [
  { service: 'checkout', region: 'eu', ts: T0, amount: 10, latency: 120 },
  { service: 'checkout', region: 'us', ts: T0 + 1_000, amount: 5, latency: 90 },
  { service: 'billing', region: 'eu', ts: T0 + DAY, amount: 7, latency: 150 },
];

export function newStore(): DashboardStore {
  return createDashboardStore({
    model,
    data: rows,
    crossfilter: { views: { revenue: { field: 'service' }, table: { field: 'service' } } },
  });
}

export const filterControls = [
  { kind: 'query-search', label: 'Query', placeholder: 'Search rows', fields: ['service'] },
  { kind: 'date-range', label: 'Window' },
  { kind: 'relative-date', label: 'Preset', presets: [{ label: 'Last 7 days', from: 'now-7d', to: 'now' }] },
  { kind: 'variable', label: 'Service', dimension: 'service' },
  { kind: 'variable', label: 'Regions', dimension: 'region', multiSelect: true },
];

export const exportConfig = {
  label: 'Export CSV',
  fields: ['service', 'amount'],
  filenameTemplate: 'rows-{date}',
};

export const activeFilters = [
  { field: 'service', operator: 'eq' as const, value: 'checkout', label: 'Service' },
];

/** Inputs for the bare DS components, used by the control experiment. */
export const dsHeatmapData = [
  { x: 'checkout', y: 'eu', value: 10 },
  { x: 'checkout', y: 'us', value: 5 },
  { x: 'billing', y: 'eu', value: 7 },
];

export const dsTreemapData = [
  {
    label: 'eu',
    value: 17,
    children: [
      { label: 'checkout', value: 10 },
      { label: 'billing', value: 7 },
    ],
  },
  { label: 'us', value: 5, children: [{ label: 'checkout', value: 5 }] },
];
