import { buildTrendLineModel, type ChartAnnotation, type DashboardStore } from '@sentropic/dataviz-core';
import { LineChart, type LineChartDatum, type DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-react';
import { useDashboard } from '../adapter.js';

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
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  className?: string;
};

export function TrendLineChart({ store, viewId, x, y, width = 360, height = 220, label, annotations, dataLabels, hoverKey, onHoverKeyChange, onSelectKey, className }: TrendLineChartProps) {
  const state = useDashboard(store);
  void state;
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
      hoverKey={hoverKey}
      onHoverKeyChange={onHoverKeyChange}
      onSelectKey={onSelectKey}
      className={['st-trendLineChart', className].filter(Boolean).join(' ') || undefined}
    />
  );
}
