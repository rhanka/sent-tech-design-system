import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import {
  createDashboardStore,
  rangeSelectionKey,
  type DataModel,
  type DateHistogramBin,
  type Row,
} from '@sentropic/dataviz-core';
import { DateHistogramChart } from '../../dist/lib/DateHistogramChart.js';

const DAY = 24 * 60 * 60 * 1000;
const start = Date.UTC(2026, 0, 1);

const model: DataModel = {
  dimensions: [{ id: 'ts', label: 'Timestamp', type: 'continuous' }],
  measures: [],
};

const rows: Row[] = [
  { ts: start + 1_000 },
  { ts: start + 2_000 },
  { ts: start + DAY + 1_000 },
];

const formatLabel = (bin: DateHistogramBin) => `day ${bin.index + 1}`;

describe('DateHistogramChart (angular)', () => {
  it('maps date buckets to DS BarChart data and stores a scoped range selection', () => {
    const store = createDashboardStore({
      model,
      data: rows,
      crossfilter: {
        views: {
          events: { field: 'ts', selection: 'range' },
          table: { field: 'ts' },
        },
      },
    });
    const component = new DateHistogramChart();
    component.store = store;
    component.viewId = 'events';
    component.date = 'ts';
    component.interval = 'day';
    component.label = 'Events by day';
    component.formatLabel = formatLabel;

    expect(component.data).toEqual([
      { label: 'day 1', value: 2 },
      { label: 'day 2', value: 1 },
    ]);
    expect(component.chartSelectedKeys).toEqual([]);

    component.handleBarSelect('day 1');
    expect(store.getState().filters.ts).toBeUndefined();
    expect(store.getState().selections.events).toEqual([rangeSelectionKey(start, start + DAY - 1)]);
    expect(component.chartSelectedKeys).toEqual(['day 1']);
    expect(store.applyCrossfilter('events').map((row) => row.ts)).toEqual([
      start + 1_000,
      start + 2_000,
      start + DAY + 1_000,
    ]);
    expect(store.applyCrossfilter('table').map((row) => row.ts)).toEqual([start + 1_000, start + 2_000]);
  });
});
