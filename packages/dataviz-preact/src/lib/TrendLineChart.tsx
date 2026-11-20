import { buildTrendLineModel, type ChartAnnotation, type DashboardStore } from '@sentropic/dataviz-core';
import { LineChart, type LineChartDatum, type DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-preact';
import { useDashboard } from '../adapter.js';
import { classNames } from '../classNames.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type TrendLineChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
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

export function TrendLineChart({ store, viewId, x, y, width = 360, height = 220, label, annotations, dataLabels, hoverKey, onHoverKeyChange, onSelectKey, className }: TrendLineChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedHoverKey = useValue(hoverKey);
  const resolvedClassName = useValue(className);
  const model = buildTrendLineModel(store.model, store.applyCrossfilter(viewId), { x, y });
  const data: LineChartDatum[] = model.points.map((point) => ({ x: point.x, y: point.y }));

  return (
    <LineChart
      data={data}
      width={width}
      height={height}
      label={label}
      annotations={annotations}
      dataLabels={dataLabels}
      trend
      hoverKey={resolvedHoverKey}
      onHoverKeyChange={onHoverKeyChange}
      onSelectKey={onSelectKey}
      className={classNames('st-trendLineChart', resolvedClassName)}
    />
  );
}
