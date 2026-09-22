import {
  Density2DChart as DsDensity2DChart,
  type Density2DPoint as DsDensity2DPoint,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildDensity2DData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type Density2DChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose numeric value becomes the point's x coordinate. */
  x: string;
  /** Field id whose numeric value becomes the point's y coordinate. */
  y: string;
  /** Optional field id whose numeric value weights the point's density. */
  weight?: string;
  /** Number of bins per axis (pass-through to the DS component). */
  bins?: number;
  width?: number;
  height?: number;
  size?: number;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  className?: string;
};

export function Density2DChart({
  store,
  viewId,
  x,
  y,
  weight,
  bins,
  width,
  height,
  size,
  label,
  className,
}: Density2DChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildDensity2DData(store.model, store.applyCrossfilter(viewId), {
    x,
    y,
    weight,
  });

  return (
    <DsDensity2DChart
      data={data as DsDensity2DPoint[]}
      bins={bins}
      label={label}
      width={width}
      height={height}
      size={size}
      className={className}
    />
  );
}
