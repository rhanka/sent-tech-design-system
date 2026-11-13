import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import type { Fixture } from './types.js';
const model: DataModel = {
  dimensions: [{ id: 'day', label: 'Day', type: 'temporal' }],
  measures: [{ id: 'sales', label: 'Sales', aggregation: 'sum' }],
};
const day = 86400000;
const t0 = Date.UTC(2024, 0, 1);
const rows: Row[] = [{ day: t0, sales: 10 }, { day: t0 + day, sales: 15 }];
const newStore = (data: Row[] = rows) => createDashboardStore({ model, data });
const base = () => ({ store: newStore(), dimension: 'day' });
const filtered = newStore(); filtered.setFilter('day', { kind: 'range', min: t0, max: t0 + day });
export default [
  { id: 'default', props: base() },
  { id: 'custom-label', props: { ...base(), label: 'Period' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'timerange' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
