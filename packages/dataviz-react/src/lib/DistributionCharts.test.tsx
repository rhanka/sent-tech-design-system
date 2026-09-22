import { act, render, screen } from '@testing-library/react';
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

describe('distribution charts (react)', () => {
  it('renders DS statistical charts from core distribution models', () => {
    const { container } = render(
      <>
        <HistogramChart store={newStore()} viewId="hist" value="revenue" bins={2} label="Revenue histogram" />
        <BoxPlotChart store={newStore()} viewId="box" value="revenue" group="segment" label="Revenue box" />
        <HeatmapChart store={newStore()} viewId="heat" x="day" y="slot" measure="revenue" label="Revenue heat" />
        <CalendarHeatmapChart store={newStore()} viewId="calendar" date="date" measure="revenue" label="Revenue calendar" />
        <BulletChart
          store={newStore()}
          viewId="bullet"
          value="revenue"
          target="target"
          category="segment"
          ranges={[10, 25, 40]}
          label="Revenue bullet"
        />
        <GaugeChart
          store={newStore()}
          viewId="gauge"
          value="revenue"
          min={0}
          max={50}
          thresholds={[{ value: 25, tone: 'warning' }]}
          label="Revenue gauge"
        />
      </>,
    );

    expect(screen.getByRole('img', { name: 'Revenue histogram' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Revenue box' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Revenue heat' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Revenue calendar' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Revenue bullet' })).toBeTruthy();
    expect(screen.getByRole('meter', { name: 'Revenue gauge' })).toBeTruthy();
    expect(container.querySelectorAll('.st-histogramChart__bar')).toHaveLength(2);
    expect(container.querySelectorAll('.st-boxPlotChart__box')).toHaveLength(2);
    expect(container.querySelectorAll('.st-heatmapChart__cell')).toHaveLength(4);
    expect(container.querySelectorAll('.st-calendarHeatmapChart__cell').length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll('.st-bulletChart__bar')).toHaveLength(2);
    expect(container.querySelector('.st-gaugeChart__visual')).toBeTruthy();
    expect(container.textContent).toContain('5-12.5: 2');
    expect(container.textContent).toContain('Enterprise: min 10, q1 12.5, median 15, q3 17.5, max 20');
    expect(container.textContent).toContain('AM, Mon: 10');
    expect(container.textContent).toContain('2026-01-01: 15');
    expect(container.textContent).toContain('Enterprise: value 30, target 30');
  });

  it('rebuilds histogram bins from this view cross-filter scope', () => {
    const store = newStore();
    const { container } = render(
      <HistogramChart store={store} viewId="hist" value="revenue" bins={2} label="Revenue histogram" />,
    );
    expect(container.textContent).toContain('5-12.5: 2');

    act(() => {
      store.setFilter('segment', { kind: 'include', values: ['Enterprise'] });
    });

    expect(container.textContent).toContain('10-15: 1');
    expect(container.textContent).not.toContain('5-12.5: 2');
  });

  it('renders no histogram bars when fields are unknown', () => {
    const { container } = render(
      <HistogramChart store={newStore()} viewId="hist" value="missing" bins={2} label="Empty histogram" />,
    );

    expect(screen.getByRole('img', { name: 'Empty histogram' })).toBeTruthy();
    expect(container.querySelectorAll('.st-histogramChart__bar')).toHaveLength(0);
  });
});
