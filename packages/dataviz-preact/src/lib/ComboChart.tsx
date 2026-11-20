import {
  ComboChart as DsComboChart,
  type ComboChartBarSeries,
  type ComboChartLineSeries,
  type DataLabelsProp,
} from '@sentropic/design-system-preact';
import type {
  ChartAnnotation,
  CategoricalMeasureInput,
  CategoricalMode,
  DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
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
  legend?: MaybeSignal<boolean>;
  hiddenSeries?: MaybeSignal<string[]>;
  onToggleSeries?: (seriesId: string) => void;
  annotations?: ChartAnnotation[];
  dataLabels?: DataLabelsProp;
  hoverKey?: MaybeSignal<string | null>;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  width?: number;
  height?: number;
  label: string;
  className?: MaybeSignal<string>;
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

  const resolvedLegend = useValue(legend);
  const resolvedHiddenSeries = useValue(hiddenSeries);
  const resolvedHoverKey = useValue(hoverKey);
  const resolvedClassName = useValue(className);

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
      legend={resolvedLegend}
      hiddenSeries={resolvedHiddenSeries}
      onToggleSeries={onToggleSeries}
      annotations={annotations}
      dataLabels={dataLabels}
      hoverKey={resolvedHoverKey}
      onHoverKeyChange={onHoverKeyChange}
      onSelectKey={onSelectKey}
      width={width}
      height={height}
      label={label}
      className={resolvedClassName}
    />
  );
}
