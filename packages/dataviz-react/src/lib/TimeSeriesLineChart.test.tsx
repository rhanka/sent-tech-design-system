import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { TimeSeriesLineChart } from './TimeSeriesLineChart.js';

const model: DataModel = {
  dimensions: [
    { id: 'ts', label: 'Time', type: 'continuous' },
    { id: 'api', label: 'API', type: 'discrete' },
  ],
  measures: [{ id: 'users', label: 'Users', aggregation: 'sum' }],
};

const rows: Row[] = Array.from({ length: 32 }, (_value, index) => [
  {
    ts: Date.UTC(2026, 4, 10 + index),
    api: 'search',
    users: index === 0 ? 0 : 7_000 + index * 120,
  },
  {
    ts: Date.UTC(2026, 4, 10 + index),
    api: 'auth',
    users: index === 0 ? 0 : 2_000 + index * 80,
  },
]).flat();

describe('TimeSeriesLineChart', () => {
  it('renders a dense month series with sampled readable time ticks', () => {
    const { container } = render(
      <TimeSeriesLineChart
        store={createDashboardStore({ model, data: rows })}
        viewId="users"
        time="ts"
        measure="users"
        label="Users per day"
        width={400}
      />,
    );

    expect(screen.getByRole('img', { name: 'Users per day' })).toBeTruthy();
    expect(container.querySelectorAll('.st-timeSeriesLineChart__line')).toHaveLength(1);
    expect(container.querySelectorAll('.st-timeSeriesLineChart__xTickLabel').length).toBeLessThanOrEqual(6);
    expect([...container.querySelectorAll('.st-timeSeriesLineChart__yTickLabel')].some((tick) => tick.textContent?.trim().startsWith('-'))).toBe(false);
    expect(screen.queryByRole('button', { name: /May 10: 0/ })).toBeNull();
  });

  it('renders faceted New Relic-like time series as multiple native line series', () => {
    const { container } = render(
      <TimeSeriesLineChart
        store={createDashboardStore({ model, data: rows })}
        viewId="api"
        time="ts"
        series="api"
        measure="users"
        label="API users"
      />,
    );

    expect(container.querySelectorAll('.st-timeSeriesLineChart__line')).toHaveLength(2);
    expect(screen.getByText('search')).toBeTruthy();
    expect(screen.getByText('auth')).toBeTruthy();
  });
});
