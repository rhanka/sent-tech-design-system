import { StackedBarChart as DsStackedBarChart, type DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import {
  buildSafeCategoricalSeries,
  toStackedCategoricalData,
  type StackedMode,
} from './categoricalData.js';

export type StackedBarChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  mode?: StackedMode;
  showLegend?: boolean;
  width?: number;
  height?: number;
  label: string;
  dataLabels?: ChartDataLabels;
  hiddenSeries?: string[];
  onToggleSeries?: (seriesId: string) => void;
  className?: string;
};

export function StackedBarChart({
  store,
  viewId,
  category,
  series,
  measure,
  mode = 'stacked',
  showLegend = true,
  width,
  height,
  label,
  dataLabels,
  hiddenSeries,
  onToggleSeries,
  className,
}: StackedBarChartProps) {
  const state = useDashboard(store);
  void state;

  const seriesModel = buildSafeCategoricalSeries(store.model, store.applyCrossfilter(viewId), {
    category,
    series,
    measures: [measure],
    mode,
  });
  const data = toStackedCategoricalData(seriesModel);

  return (
    <DsStackedBarChart
      data={data}
      label={label}
      showLegend={showLegend}
      width={width}
      height={height}
      dataLabels={dataLabels}
      hiddenSeries={hiddenSeries}
      onToggleSeries={onToggleSeries}
      className={className}
    />
  );
}
