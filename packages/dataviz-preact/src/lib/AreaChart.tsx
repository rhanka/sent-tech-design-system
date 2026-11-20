import {
  AreaChart as DsAreaChart,
  type AreaChartTone,
  type DataLabelsProp as ChartDataLabels,
} from '@sentropic/design-system-preact';
import type { ChartAnnotation, DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import {
  buildSimpleCategoricalSeries,
  toSimpleCategoricalPoints,
} from './categoricalData.js';

export type AreaChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  tone?: AreaChartTone;
  smooth?: MaybeSignal<boolean>;
  width?: number;
  height?: number;
  label: string;
  annotations?: ChartAnnotation[];
  dataLabels?: ChartDataLabels;
  hoverKey?: MaybeSignal<string | null>;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  className?: MaybeSignal<string>;
};

export function AreaChart({
  store,
  viewId,
  category,
  measure,
  tone,
  smooth = false,
  width,
  height,
  label,
  annotations,
  dataLabels,
  hoverKey,
  onHoverKeyChange,
  onSelectKey,
  className,
}: AreaChartProps) {
  const state = useDashboard(store);
  void state;

  const resolvedSmooth = useValue(smooth);
  const resolvedHoverKey = useValue(hoverKey);
  const resolvedClassName = useValue(className);

  const seriesModel = buildSimpleCategoricalSeries(store.model, store.applyCrossfilter(viewId), category, measure);
  const data = toSimpleCategoricalPoints(seriesModel);

  return (
    <DsAreaChart
      data={data}
      label={label}
      tone={tone}
      smooth={resolvedSmooth}
      width={width}
      height={height}
      annotations={annotations}
      dataLabels={dataLabels}
      hoverKey={resolvedHoverKey}
      onHoverKeyChange={onHoverKeyChange}
      onSelectKey={onSelectKey}
      className={resolvedClassName}
    />
  );
}
