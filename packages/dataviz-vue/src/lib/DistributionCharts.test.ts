import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { BoxPlotChart } from './BoxPlotChart.js';
import { BulletChart } from './BulletChart.js';
import { CalendarHeatmapChart } from './CalendarHeatmapChart.js';
import { GaugeChart } from './GaugeChart.js';
import { HeatmapChart } from './HeatmapChart.js';
import { HistogramChart } from './HistogramChart.js';

const model: DataModel = {
  dimensions: [
    { id: 'segment', label: 'Segment', type: 'discrete' },
    { id: 'day', label: 'Day', type: 'discrete' },
    { id: 'slot', label: 'Slot', type: 'discrete' },
    { id: 'date', label: 'Date', type: 'temporal' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
    { id: 'target', label: 'Target', aggregation: 'max' },
  ],
};

const data: Row[] = [
  { segment: 'Enterprise', day: 'Mon', slot: 'AM', date: '2026-01-01', revenue: 10, target: 30 },
  { segment: 'Enterprise', day: 'Mon', slot: 'PM', date: '2026-01-02', revenue: 20, target: 30 },
  { segment: 'SMB', day: 'Tue', slot: 'AM', date: '2026-01-01', revenue: 5, target: 10 },
  { segment: 'SMB', day: 'Tue', slot: 'PM', date: '2026-01-03', revenue: 15, target: 10 },
];

const newStore = () => createDashboardStore({ model, data });

describe('distribution charts (vue)', () => {
  it('renders DS statistical charts from core distribution models', () => {
    const store = newStore();
    const histogram = mount(HistogramChart, {
      props: { store, viewId: 'hist', value: 'revenue', bins: 2, label: 'Revenue histogram' },
    });
    const box = mount(BoxPlotChart, {
      props: { store, viewId: 'box', value: 'revenue', group: 'segment', label: 'Revenue box' },
    });
    const heat = mount(HeatmapChart, {
      props: { store, viewId: 'heat', x: 'day', y: 'slot', measure: 'revenue', label: 'Revenue heat' },
    });
    const calendar = mount(CalendarHeatmapChart, {
      props: { store, viewId: 'calendar', date: 'date', measure: 'revenue', label: 'Revenue calendar' },
    });
    const bullet = mount(BulletChart, {
      props: {
        store,
        viewId: 'bullet',
        value: 'revenue',
        target: 'target',
        category: 'segment',
        ranges: [10, 25, 40],
        label: 'Revenue bullet',
      },
    });
    const gauge = mount(GaugeChart, {
      props: {
        store,
        viewId: 'gauge',
        value: 'revenue',
        min: 0,
        max: 50,
        thresholds: [{ value: 25, tone: 'warning' }],
        label: 'Revenue gauge',
      },
    });

    expect(histogram.findAll('.st-histogramChart__bar')).toHaveLength(2);
    expect(box.findAll('.st-boxPlotChart__box')).toHaveLength(2);
    expect(heat.findAll('.st-heatmapChart__cell')).toHaveLength(4);
    expect(calendar.findAll('.st-calendarHeatmapChart__cell').length).toBeGreaterThanOrEqual(3);
    expect(bullet.findAll('.st-bulletChart__bar')).toHaveLength(2);
    expect(gauge.find('.st-gaugeChart__visual').exists()).toBe(true);
    expect(histogram.text()).toContain('5-12.5: 2');
    expect(box.text()).toContain('Enterprise: min 10, q1 12.5, median 15, q3 17.5, max 20');
    expect(heat.text()).toContain('AM, Mon: 10');
    expect(calendar.text()).toContain('2026-01-01: 15');
    expect(bullet.text()).toContain('Enterprise: value 30, target 30');
  });

  it('rebuilds histogram bins from this view cross-filter scope', async () => {
    const store = newStore();
    const w = mount(HistogramChart, {
      props: { store, viewId: 'hist', value: 'revenue', bins: 2, label: 'Revenue histogram' },
    });
    expect(w.text()).toContain('5-12.5: 2');

    store.setFilter('segment', { kind: 'include', values: ['Enterprise'] });
    await nextTick();

    expect(w.text()).toContain('10-15: 1');
    expect(w.text()).not.toContain('5-12.5: 2');
  });

  it('renders no histogram bars when fields are unknown', () => {
    const w = mount(HistogramChart, {
      props: { store: newStore(), viewId: 'hist', value: 'missing', bins: 2, label: 'Empty histogram' },
    });

    expect(w.find('[role="img"]').attributes('aria-label')).toBe('Empty histogram');
    expect(w.findAll('.st-histogramChart__bar')).toHaveLength(0);
  });
});
