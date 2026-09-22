import { buildErrorBarsModel, type ChartAnnotation, type DashboardStore } from '@sentropic/dataviz-core';
import { BarChart, type BarChartDatum, type DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-react';
import { useDashboard } from '../adapter.js';

export type ErrorBarsChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  value: string;
  interval?: 'stdev' | 'stderr';
  width?: number;
  height?: number;
  label: string;
  annotations?: ChartAnnotation[];
  dataLabels?: ChartDataLabels;
  className?: string;
};

export function ErrorBarsChart({
  store,
  viewId,
  category,
  value,
  interval,
  width = 420,
  height = 240,
  label,
  annotations,
  dataLabels,
  className,
}: ErrorBarsChartProps) {
  const state = useDashboard(store);
  void state;
  const model = buildErrorBarsModel(store.model, store.applyCrossfilter(viewId), { category, value, interval });
  const data: BarChartDatum[] = model.items.map((item) => ({
    label: item.label,
    value: item.mean,
    errorLow: item.lower,
    errorHigh: item.upper,
  }));

  return (
    <BarChart
      data={data}
      width={width}
      height={height}
      label={label}
      annotations={annotations}
      dataLabels={dataLabels}
      className={['st-errorBarsChart', className].filter(Boolean).join(' ') || undefined}
    />
  );
}
