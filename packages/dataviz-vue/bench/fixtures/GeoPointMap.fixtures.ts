import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import type { Fixture } from './types.js';
const model: DataModel = {
  dimensions: [
    { id: 'lat', label: 'Latitude', type: 'continuous' },
    { id: 'lon', label: 'Longitude', type: 'continuous' },
  ],
  measures: [{ id: 'sales', label: 'Sales', aggregation: 'sum' }],
};
const rows: Row[] = [
  { lat: 48.85, lon: 2.35, sales: 10 }, { lat: 45.76, lon: 4.83, sales: 15 },
  { lat: 43.3, lon: 5.37, sales: 8 }, { lat: 47.21, lon: -1.55, sales: 22 },
];
const newStore = (data: Row[] = rows) => createDashboardStore({ model, data });
const base = () => ({ store: newStore(), viewId: 'points', latitude: 'lat', longitude: 'lon', label: 'Point map' });
export default [
  { id: 'default', props: base() },
  { id: 'id-labelfield', props: { ...base(), id: 'lat', labelField: 'lon', value: 'sales' } },
  { id: 'sized', props: { ...base(), width: 600, height: 400 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'points' } },
] satisfies Fixture[];
