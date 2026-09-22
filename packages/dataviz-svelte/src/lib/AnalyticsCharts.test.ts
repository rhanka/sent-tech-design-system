import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import AnalyticsClusterPlot from './AnalyticsClusterPlot.svelte';
import ErrorBarsChart from './ErrorBarsChart.svelte';
import ForecastLineChart from './ForecastLineChart.svelte';
import PercentileBandChart from './PercentileBandChart.svelte';
import ReferenceLineChart from './ReferenceLineChart.svelte';
import TrendLineChart from './TrendLineChart.svelte';

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

describe('analytics charts (svelte)', () => {
  it('renders analytic models through DS charts where available', () => {
    const store = newStore();
    const reference = render(ReferenceLineChart, {
      props: { store, viewId: 'ref', value: 30, referenceLabel: 'Goal', label: 'Goal line' },
    });
    const band = render(PercentileBandChart, {
      props: { store, viewId: 'band', value: 'value', lower: 0.25, upper: 0.75, label: 'Band' },
    });
    const trend = render(TrendLineChart, { props: { store, viewId: 'trend', x: 'x', y: 'y', label: 'Trend' } });
    const forecast = render(ForecastLineChart, {
      props: { store, viewId: 'forecast', x: 'x', y: 'y', periods: 2, label: 'Forecast' },
    });
    const errors = render(ErrorBarsChart, {
      props: { store, viewId: 'errors', category: 'category', value: 'value', label: 'Errors' },
    });
    const clusters = render(AnalyticsClusterPlot, {
      props: { store, viewId: 'clusters', fields: ['x', 'y'], k: 2, label: 'Clusters' },
    });

    expect(reference.getByRole('img', { name: 'Goal line' })).toBeTruthy();
    expect(band.getByRole('img', { name: 'Band' })).toBeTruthy();
    expect(trend.getByRole('img', { name: 'Trend' })).toBeTruthy();
    expect(forecast.getByRole('img', { name: 'Forecast' })).toBeTruthy();
    expect(errors.getByRole('img', { name: 'Errors' })).toBeTruthy();
    expect(clusters.getByRole('img', { name: 'Clusters' })).toBeTruthy();
    expect(reference.container.querySelectorAll('.st-lineChart__refLine')).toHaveLength(1);
    expect(reference.container.querySelectorAll('.st-referenceLineChart__line')).toHaveLength(0);
    expect(band.container.querySelectorAll('.st-lineChart__band')).toHaveLength(1);
    expect(band.container.querySelectorAll('.st-lineChart__refLine')).toHaveLength(1);
    expect(band.container.querySelectorAll('.st-percentileBandChart__band')).toHaveLength(0);
    expect(trend.container.querySelectorAll('.st-lineChart__trend')).toHaveLength(1);
    expect(trend.container.querySelectorAll('.st-trendLineChart__line')).toHaveLength(0);
    expect(forecast.container.querySelectorAll('.st-lineChart__line--forecast').length).toBeGreaterThan(0);
    expect(forecast.container.querySelectorAll('.st-forecastLineChart__point')).toHaveLength(0);
    expect(errors.container.querySelectorAll('.st-barChart__errorBar')).toHaveLength(2);
    expect(errors.container.querySelectorAll('.st-errorBarsChart__bar')).toHaveLength(0);
    expect(clusters.container.querySelectorAll('.st-scatterPlot__point')).toHaveLength(4);
    expect(clusters.container.querySelectorAll('.st-scatterPlot__centroid')).toHaveLength(2);
    expect(clusters.container.querySelectorAll('.st-analyticsClusterPlot__centroid')).toHaveLength(0);
    expect(reference.container.textContent).toContain('Goal');
    expect(errors.container.querySelectorAll('.st-barChart__bar')).toHaveLength(2);
  });
});
