import {
  AreaSplineRangeChart as DsAreaSplineRangeChart,
  type AreaSplineRangeChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildAreaRangeData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type AreaSplineRangeChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the x-axis position. */
  x_field: string;
  /** Field id whose numeric value becomes the low boundary. */
  low: string;
  /** Field id whose numeric value becomes the high boundary. */
  high: string;
  tone?: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: string;
};

export function AreaSplineRangeChart({
  store,
  viewId,
  x_field,
  low,
  high,
  tone,
  width,
  height,
  label,
  className,
}: AreaSplineRangeChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildAreaRangeData(store.model, store.applyCrossfilter(viewId), {
    x: x_field,
    low,
    high,
  });

  return (
    <DsAreaSplineRangeChart
      data={data as AreaSplineRangeChartDatum[]}
      label={label}
      width={width}
      height={height}
      tone={tone as any}
      className={className}
    />
  );
}
