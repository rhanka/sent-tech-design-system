import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import BoxPlotChart from './BoxPlotChart.svelte';
import BulletChart from './BulletChart.svelte';
import CalendarHeatmapChart from './CalendarHeatmapChart.svelte';
import GaugeChart from './GaugeChart.svelte';
import HeatmapChart from './HeatmapChart.svelte';
import HistogramChart from './HistogramChart.svelte';

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

describe('distribution charts (svelte)', () => {
  it('renders DS statistical charts from core distribution models', () => {
    const store = newStore();
    const histogram = render(HistogramChart, {
      props: { store, viewId: 'hist', value: 'revenue', bins: 2, label: 'Revenue histogram' },
    });
    const box = render(BoxPlotChart, {
      props: { store, viewId: 'box', value: 'revenue', group: 'segment', label: 'Revenue box' },
    });
    const heat = render(HeatmapChart, {
      props: { store, viewId: 'heat', x: 'day', y: 'slot', measure: 'revenue', label: 'Revenue heat' },
    });
    const calendar = render(CalendarHeatmapChart, {
      props: { store, viewId: 'calendar', date: 'date', measure: 'revenue', label: 'Revenue calendar' },
    });
    const bullet = render(BulletChart, {
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
    const gauge = render(GaugeChart, {
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

    expect(histogram.container.querySelectorAll('.st-histogramChart__bar')).toHaveLength(2);
    expect(box.container.querySelectorAll('.st-boxPlotChart__box')).toHaveLength(2);
    expect(heat.container.querySelectorAll('.st-heatmapChart__cell')).toHaveLength(4);
    expect(calendar.container.querySelectorAll('.st-calendarHeatmapChart__cell').length).toBeGreaterThanOrEqual(3);
    expect(bullet.container.querySelectorAll('.st-bulletChart__bar')).toHaveLength(2);
    expect(gauge.container.querySelector('.st-gaugeChart__visual')).toBeTruthy();
    expect(histogram.container.textContent).toContain('5-12.5: 2');
    expect(box.container.textContent).toContain('Enterprise: min 10, q1 12.5, median 15, q3 17.5, max 20');
    expect(heat.container.textContent).toContain('AM, Mon: 10');
    expect(calendar.container.textContent).toContain('2026-01-01: 15');
    expect(bullet.container.textContent).toContain('Enterprise: value 30, target 30');
  });

  it('rebuilds histogram bins from this view cross-filter scope', async () => {
    const store = newStore();
    const { container } = render(HistogramChart, {
      props: { store, viewId: 'hist', value: 'revenue', bins: 2, label: 'Revenue histogram' },
    });
    expect(container.textContent).toContain('5-12.5: 2');

    store.setFilter('segment', { kind: 'include', values: ['Enterprise'] });
    await tick();

    expect(container.textContent).toContain('10-15: 1');
    expect(container.textContent).not.toContain('5-12.5: 2');
  });

  it('renders no histogram bars when fields are unknown', () => {
    const { container, getByRole } = render(HistogramChart, {
      props: { store: newStore(), viewId: 'hist', value: 'missing', bins: 2, label: 'Empty histogram' },
    });

    expect(getByRole('img', { name: 'Empty histogram' })).toBeTruthy();
    expect(container.querySelectorAll('.st-histogramChart__bar')).toHaveLength(0);
  });
});
