import {
  StackedBarChart as DsStackedBarChart,
  type DataLabelsProp as ChartDataLabels,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
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
  showLegend?: MaybeSignal<boolean>;
  width?: number;
  height?: number;
  label: string;
  dataLabels?: ChartDataLabels;
  hiddenSeries?: MaybeSignal<string[]>;
  onToggleSeries?: (seriesId: string) => void;
  className?: MaybeSignal<string>;
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

  const resolvedShowLegend = useValue(showLegend);
  const resolvedHiddenSeries = useValue(hiddenSeries);
  const resolvedClassName = useValue(className);

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
      showLegend={resolvedShowLegend}
      width={width}
      height={height}
      dataLabels={dataLabels}
      hiddenSeries={resolvedHiddenSeries}
      onToggleSeries={onToggleSeries}
      className={resolvedClassName}
    />
  );
}
