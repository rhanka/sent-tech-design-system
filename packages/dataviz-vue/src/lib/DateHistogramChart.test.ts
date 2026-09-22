import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import {
  createDashboardStore,
  rangeSelectionKey,
  type DataModel,
  type DateHistogramBin,
  type Row,
} from '@sentropic/dataviz-core';
import { DateHistogramChart } from './DateHistogramChart.js';

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

describe('DateHistogramChart (vue)', () => {
  it('renders date buckets through DS BarChart and stores a scoped range selection', async () => {
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
    const w = mount(DateHistogramChart, {
      props: { store, viewId: 'events', date: 'ts', interval: 'day', label: 'Events by day', formatLabel },
    });

    expect(w.find('[role="img"]').attributes('aria-label')).toBe('Events by day');
    expect(w.findAll('.st-dateHistogramChart .st-barChart__bar')).toHaveLength(2);

    const chip = w.findAll('button.st-barChart__filterChip').find((button) => button.text().startsWith('day 1:'));
    await chip!.trigger('click');
    expect(store.getState().filters.ts).toBeUndefined();
    expect(store.getState().selections.events).toEqual([rangeSelectionKey(start, start + DAY - 1)]);
    expect(store.applyCrossfilter('events').map((row) => row.ts)).toEqual([
      start + 1_000,
      start + 2_000,
      start + DAY + 1_000,
    ]);
    expect(store.applyCrossfilter('table').map((row) => row.ts)).toEqual([start + 1_000, start + 2_000]);
  });
});
