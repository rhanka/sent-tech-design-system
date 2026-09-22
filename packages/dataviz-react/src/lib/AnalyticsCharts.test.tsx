import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { AnalyticsClusterPlot } from './AnalyticsClusterPlot.js';
import { ErrorBarsChart } from './ErrorBarsChart.js';
import { ForecastLineChart } from './ForecastLineChart.js';
import { PercentileBandChart } from './PercentileBandChart.js';
import { ReferenceLineChart } from './ReferenceLineChart.js';
import { TrendLineChart } from './TrendLineChart.js';

const model: DataModel = {
  dimensions: [
    { id: 'category', label: 'Category', type: 'discrete' },
    { id: 'x', label: 'X', type: 'continuous' },
  ],
  measures: [
    { id: 'y', label: 'Y', aggregation: 'sum' },
    { id: 'value', label: 'Value', aggregation: 'avg' },
    { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
  ],
};

const data: Row[] = [
  { category: 'A', x: 1, y: 10, value: 8, revenue: 100 },
  { category: 'A', x: 2, y: 20, value: 12, revenue: 150 },
  { category: 'B', x: 3, y: 25, value: 24, revenue: 200 },
  { category: 'B', x: 4, y: 35, value: 26, revenue: 250 },
];

const newStore = () => createDashboardStore({ model, data });

describe('analytics charts (react)', () => {
  it('renders analytic models through DS charts where available', () => {
    const store = newStore();
    const { container } = render(
      <>
        <ReferenceLineChart store={store} viewId="ref" value={30} referenceLabel="Goal" label="Goal line" />
        <PercentileBandChart store={store} viewId="band" value="value" lower={0.25} upper={0.75} label="Band" />
        <TrendLineChart store={store} viewId="trend" x="x" y="y" label="Trend" />
        <ForecastLineChart store={store} viewId="forecast" x="x" y="y" periods={2} label="Forecast" />
        <ErrorBarsChart store={store} viewId="errors" category="category" value="value" label="Errors" />
        <AnalyticsClusterPlot store={store} viewId="clusters" fields={['x', 'y']} k={2} label="Clusters" />
      </>,
    );

    expect(screen.getByRole('img', { name: 'Goal line' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Band' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Trend' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Forecast' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Errors' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Clusters' })).toBeTruthy();
    expect(container.querySelectorAll('.st-referenceLineChart .st-lineChart__refLine')).toHaveLength(1);
    expect(container.querySelectorAll('.st-referenceLineChart__line')).toHaveLength(0);
    expect(container.querySelectorAll('.st-percentileBandChart .st-lineChart__band')).toHaveLength(1);
    expect(container.querySelectorAll('.st-percentileBandChart .st-lineChart__refLine')).toHaveLength(1);
    expect(container.querySelectorAll('.st-percentileBandChart__band')).toHaveLength(0);
    expect(container.querySelectorAll('.st-trendLineChart .st-lineChart__trend')).toHaveLength(1);
    expect(container.querySelectorAll('.st-trendLineChart__line')).toHaveLength(0);
    expect(container.querySelectorAll('.st-forecastLineChart .st-lineChart__line--forecast').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('.st-forecastLineChart__point')).toHaveLength(0);
    expect(container.querySelectorAll('.st-errorBarsChart .st-barChart__errorBar')).toHaveLength(2);
    expect(container.querySelectorAll('.st-errorBarsChart__bar')).toHaveLength(0);
    expect(container.querySelectorAll('.st-analyticsClusterPlot .st-scatterPlot__point')).toHaveLength(4);
    expect(container.querySelectorAll('.st-analyticsClusterPlot .st-scatterPlot__centroid')).toHaveLength(2);
    expect(container.querySelectorAll('.st-analyticsClusterPlot__centroid')).toHaveLength(0);
    expect(container.querySelector('.st-lineChart')?.textContent).toContain('Goal');
    expect(container.querySelectorAll('.st-errorBarsChart .st-barChart__bar')).toHaveLength(2);
  });
});
