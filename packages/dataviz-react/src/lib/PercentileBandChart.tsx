import { buildPercentileBandModel, type DashboardStore } from '@sentropic/dataviz-core';
import { LineChart, type LineChartDatum } from '@sentropic/design-system-react';
import { useDashboard } from '../adapter.js';

export type PercentileBandChartProps = {
  store: DashboardStore;
  viewId: string;
  value: string;
  lower: number;
  upper: number;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function PercentileBandChart({
  store,
  viewId,
  value,
  lower,
  upper,
  width = 360,
  height = 96,
  label,
  className,
}: PercentileBandChartProps) {
  const state = useDashboard(store);
  void state;
  const model = buildPercentileBandModel(store.model, store.applyCrossfilter(viewId), { value, lower, upper });
  const data: LineChartDatum[] = [
    { x: `${Math.round(lower * 100)}%`, y: model.lowerValue },
    { x: 'median', y: model.median },
    { x: `${Math.round(upper * 100)}%`, y: model.upperValue },
  ];

  return (
    <LineChart
      data={data}
      width={width}
      height={height}
      label={label}
      bands={[{ from: model.lowerValue, to: model.upperValue, label: 'Percentiles', tone: 'success' }]}
      referenceLines={[{ value: model.median, label: 'Median', tone: 'success' }]}
      className={['st-percentileBandChart', className].filter(Boolean).join(' ') || undefined}
    />
  );
}
