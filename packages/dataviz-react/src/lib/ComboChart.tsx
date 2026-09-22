import {
  ComboChart as DsComboChart,
  type ComboChartBarSeries,
  type ComboChartLineSeries,
  type DataLabelsProp,
} from '@sentropic/design-system-react';
import type {
  ChartAnnotation,
  CategoricalMeasureInput,
  CategoricalMode,
  DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeCategoricalSeries } from './categoricalData.js';

export type ComboChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measures: CategoricalMeasureInput[];
  series?: string;
  mode?: CategoricalMode;
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  legend?: boolean;
  hiddenSeries?: string[];
  onToggleSeries?: (seriesId: string) => void;
  annotations?: ChartAnnotation[];
  dataLabels?: DataLabelsProp;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function ComboChart({
  store,
  viewId,
  category,
  measures,
  series,
  mode = 'grouped',
  leftAxisLabel,
  rightAxisLabel,
  legend = true,
  hiddenSeries,
  onToggleSeries,
  annotations,
  dataLabels,
  hoverKey,
  onHoverKeyChange,
  onSelectKey,
  width,
  height,
  label,
  className,
}: ComboChartProps) {
  const state = useDashboard(store);
  void state;

  const seriesModel = buildSafeCategoricalSeries(store.model, store.applyCrossfilter(viewId), {
    category,
    series,
    measures,
    mode,
  });
  const bars: ComboChartBarSeries[] = seriesModel.series
    .filter((item) => item.mark === 'bar')
    .map((item) => ({ label: item.label, data: item.values }));
  const lines: ComboChartLineSeries[] = seriesModel.series
    .filter((item) => item.mark === 'line')
    .map((item) => ({ label: item.label, data: item.values }));

  return (
    <DsComboChart
      categories={seriesModel.categories}
      bars={bars}
      lines={lines}
      leftAxisLabel={leftAxisLabel}
      rightAxisLabel={rightAxisLabel}
      legend={legend}
      hiddenSeries={hiddenSeries}
      onToggleSeries={onToggleSeries}
      annotations={annotations}
      dataLabels={dataLabels}
      hoverKey={hoverKey}
      onHoverKeyChange={onHoverKeyChange}
      onSelectKey={onSelectKey}
      width={width}
      height={height}
      label={label}
      className={className}
    />
  );
}
