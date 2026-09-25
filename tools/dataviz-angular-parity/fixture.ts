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
    // CalendarHeatmapChart's DS component only accepts YYYY-MM-DD, so the epoch
    // `ts` dimension cannot feed it: this is the ISO day it reads instead.
    { id: 'day', label: 'Day', type: 'discrete' },
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
  { service: 'checkout', region: 'eu', shape: polygon(2, 48), day: '2026-01-01', ts: T0, lat: 48.85, lon: 2.35, dstLat: 51.5, dstLon: -0.12, amount: 10, open: 100, high: 110, low: 95, close: 105 },
  { service: 'checkout', region: 'us', shape: polygon(-74, 40), day: '2026-01-02', ts: T0 + DAY, lat: 40.71, lon: -74.0, dstLat: 34.05, dstLon: -118.24, amount: 5, open: 105, high: 112, low: 101, close: 102 },
  { service: 'billing', region: 'eu', shape: polygon(13, 52), day: '2026-01-03', ts: T0 + 2 * DAY, lat: 52.52, lon: 13.4, dstLat: 41.9, dstLon: 12.5, amount: 7, open: 102, high: 108, low: 99, close: 107 },
];

export const hierarchy = ['region', 'service'];

export function newWideStore(): DashboardStore {
  return createDashboardStore({
    model: wideModel,
    data: wideRows,
    crossfilter: { views: { v: { field: 'service' }, other: { field: 'service' } } },
  });
}

/**
 * Bare-DS control inputs for the lot 4 residues: the adapter must produce the
 * SAME diff count as the DS components fed these values directly.
 */
export const dsVectorFieldData = [
  { x: 10, y: 105, length: 95, direction: 110 },
  { x: 5, y: 102, length: 101, direction: 112 },
  { x: 7, y: 107, length: 99, direction: 108 },
];

export const dsWindBarbData = [
  { at: T0, speed: 10, direction: 105 },
  { at: T0 + DAY, speed: 5, direction: 102 },
  { at: T0 + 2 * DAY, speed: 7, direction: 107 },
];

export const dsForceGraph = {
  // Exactly what `buildForceGraphData` derives from wideRows for source=region,
  // target=service: same order, same labels, same tones. The control is only a
  // control if the DS component receives what the adapter hands it.
  nodes: [
    { id: 'eu', label: 'eu', tone: 'category1' },
    { id: 'checkout', label: 'checkout', tone: 'category2' },
    { id: 'us', label: 'us', tone: 'category3' },
    { id: 'billing', label: 'billing', tone: 'category4' },
  ],
  edges: [
    { source: 'eu', target: 'checkout' },
    { source: 'us', target: 'checkout' },
    { source: 'eu', target: 'billing' },
  ],
};

/**
 * Bare-DS control input for the lot 5 Sparkline residue: exactly the numbers
 * `buildSimpleCategoricalSeries` derives from wideRows for dimension=region,
 * measure=amount (eu = 10 + 7, us = 5).
 */
export const dsSparklineData = [17, 5];

/**
 * Bare-DS control inputs for the other two lot 5 residues: exactly what the
 * adapters hand their DS component for dimension=region, measure=amount over
 * wideRows (eu = 10 + 7, us = 5). `dsDivergingBarDomain` is the core model's own
 * domain, which the adapter passes when the caller sets none.
 */
export const dsStepLinePoints = [
  { x: 'eu', y: 17 },
  { x: 'us', y: 5 },
];

export const dsDivergingBarData = [
  { label: 'eu', value: 17, tone: 'positive' as const },
  { label: 'us', value: 5, tone: 'positive' as const },
];

export const dsDivergingBarDomain: [number, number] = [0, 17];

/**
 * Bare-DS control input for the lot 7 ComboChart residue: exactly what the
 * adapter hands the DS component for category=region,
 * measures=['amount', { id: 'close', mark: 'line' }] over wideRows (eu =
 * 10 + 7 summed / (105 + 107) / 2 averaged, us = 5 / 102).
 */
export const dsComboCategories = ['eu', 'us'];
export const dsComboBars = [{ label: 'Amount', data: [17, 5] }];
export const dsComboLines = [{ label: 'Close', data: [106, 102] }];

/** Lot 8: `VennChart` takes no store, so its areas are a plain fixture. */
export const vennAreas = [
  { sets: ['eu'], value: 17 },
  { sets: ['us'], value: 5 },
  { sets: ['eu', 'us'], value: 2 },
];
