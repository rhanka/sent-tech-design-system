import {
  ContourChart as DsContourChart,
  type ContourChartDatum as DsContourChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildContourData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ContourChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose numeric value becomes the point's x coordinate. */
  x: string;
  /** Field id whose numeric value becomes the point's y coordinate. */
  y: string;
  /** Field id whose numeric value drives the cell's colour band. */
  value: string;
  /** Number of colour bands / levels (pass-through to the DS component). */
  levels?: number;
  width?: number;
  height?: number;
  size?: number;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  className?: string;
};

export function ContourChart({
  store,
  viewId,
  x,
  y,
  value,
  levels,
  width,
  height,
  size,
  label,
  className,
}: ContourChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildContourData(store.model, store.applyCrossfilter(viewId), {
    x,
    y,
    value,
  });

  return (
    <DsContourChart
      data={data as DsContourChartDatum[]}
      levels={levels}
      label={label}
      width={width}
      height={height}
      size={size}
      className={className}
    />
  );
}
