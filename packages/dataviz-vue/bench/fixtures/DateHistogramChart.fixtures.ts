import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import type { Fixture } from './types.js';
const model: DataModel = {
  dimensions: [{ id: 'day', label: 'Day', type: 'temporal' }],
  measures: [{ id: 'sales', label: 'Sales', aggregation: 'sum' }],
};
const day = 86400000;
const t0 = Date.UTC(2024, 0, 1);
const rows: Row[] = [
  { day: t0, sales: 10 }, { day: t0 + day, sales: 15 }, { day: t0 + 2 * day, sales: 8 },
  { day: t0 + 3 * day, sales: 22 }, { day: t0 + 4 * day, sales: 5 },
];
const newStore = (data: Row[] = rows) => createDashboardStore({ model, data });
const base = () => ({ store: newStore(), date: 'day', label: 'Sales histogram' });
export default [
  { id: 'default', props: base() },
  { id: 'bins-tone', props: { ...base(), bins: 3, tone: 'category2' } },
  { id: 'selectable-off', props: { ...base(), selectable: false } },
  { id: 'brush', props: { ...base(), enableBrush: true } },
  { id: 'sized', props: { ...base(), width: 520, height: 280 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'hist' } },
] satisfies Fixture[];
