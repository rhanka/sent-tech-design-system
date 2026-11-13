import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
export const model: DataModel = {
  dimensions: [{ id: 'region', label: 'Region', type: 'discrete' }, { id: 'city', label: 'City', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Sales', aggregation: 'sum' }],
};
export const rows: Row[] = [
  { region: 'North', city: 'A', sales: 10 }, { region: 'North', city: 'B', sales: 15 },
  { region: 'South', city: 'C', sales: -5 }, { region: 'South', city: 'D', sales: 20 },
];
export const newStore = (data: Row[] = rows) => createDashboardStore({ model, data });
