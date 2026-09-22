import {
  VectorFieldChart as DsVectorFieldChart,
  type VectorFieldChartDatum as DsVectorFieldChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildVectorFieldData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type VectorFieldChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose numeric value becomes the vector's x coordinate. */
  x: string;
  /** Field id whose numeric value becomes the vector's y coordinate. */
  y: string;
  /** Field id whose numeric value becomes the vector's magnitude (≥ 0). */
  length: string;
  /** Field id whose numeric value becomes the direction in degrees. */
  direction: string;
  width?: number;
  height?: number;
  size?: number;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  className?: string;
};

export function VectorFieldChart({
  store,
  viewId,
  x,
  y,
  length,
  direction,
  width,
  height,
  size,
  label,
  className,
}: VectorFieldChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildVectorFieldData(store.model, store.applyCrossfilter(viewId), {
    x,
    y,
    length,
    direction,
  });

  return (
    <DsVectorFieldChart
      data={data as DsVectorFieldChartDatum[]}
      label={label}
      width={width}
      height={height}
      size={size}
      className={className}
    />
  );
}
