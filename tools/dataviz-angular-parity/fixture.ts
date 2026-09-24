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

// ---------------------------------------------------------------------------
// Wide fixture: geo coordinates, geometries and OHLC measures, for the lot 2
// families. `buildGeoJsonLayerModel` reads a geometry OBJECT from the cell.
// ---------------------------------------------------------------------------
const polygon = (lon: number, lat: number) =>
  ({
    type: 'Polygon',
    coordinates: [[[lon, lat], [lon + 1, lat], [lon + 1, lat + 1], [lon, lat]]],
  }) as unknown as Row[string];

export const wideModel: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'shape', label: 'Shape', type: 'discrete' },
    { id: 'ts', label: 'Timestamp', type: 'continuous' },
    { id: 'lat', label: 'Latitude', type: 'continuous' },
    { id: 'lon', label: 'Longitude', type: 'continuous' },
    { id: 'dstLat', label: 'Target latitude', type: 'continuous' },
    { id: 'dstLon', label: 'Target longitude', type: 'continuous' },
  ],
  measures: [
    { id: 'amount', label: 'Amount', aggregation: 'sum' },
    { id: 'open', label: 'Open', aggregation: 'avg' },
    { id: 'high', label: 'High', aggregation: 'max' },
    { id: 'low', label: 'Low', aggregation: 'min' },
    { id: 'close', label: 'Close', aggregation: 'avg' },
  ],
};

export const wideRows: Row[] = [
  { service: 'checkout', region: 'eu', shape: polygon(2, 48), ts: T0, lat: 48.85, lon: 2.35, dstLat: 51.5, dstLon: -0.12, amount: 10, open: 100, high: 110, low: 95, close: 105 },
  { service: 'checkout', region: 'us', shape: polygon(-74, 40), ts: T0 + DAY, lat: 40.71, lon: -74.0, dstLat: 34.05, dstLon: -118.24, amount: 5, open: 105, high: 112, low: 101, close: 102 },
  { service: 'billing', region: 'eu', shape: polygon(13, 52), ts: T0 + 2 * DAY, lat: 52.52, lon: 13.4, dstLat: 41.9, dstLon: 12.5, amount: 7, open: 102, high: 108, low: 99, close: 107 },
];

export const hierarchy = ['region', 'service'];

export function newWideStore(): DashboardStore {
  return createDashboardStore({
    model: wideModel,
    data: wideRows,
    crossfilter: { views: { v: { field: 'service' }, other: { field: 'service' } } },
  });
}
