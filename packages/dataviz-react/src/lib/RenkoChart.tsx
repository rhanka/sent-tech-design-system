import {
  RenkoChart as DsRenkoChart,
  type RenkoChartDatum as DsRenkoChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildRenkoData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type RenkoChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose numeric value becomes the point's date (timestamp/index). */
  date: string;
  /** Field id whose numeric value becomes the point's close price. */
  close: string;
  /** Brick size (pass-through to the DS component). */
  boxSize?: number;
  width?: number;
  height?: number;
  size?: number;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  className?: string;
};

export function RenkoChart({
  store,
  viewId,
  date,
  close,
  boxSize,
  width,
  height,
  size,
  label,
  className,
}: RenkoChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildRenkoData(store.model, store.applyCrossfilter(viewId), {
    date,
    close,
  });

  return (
    <DsRenkoChart
      data={data as DsRenkoChartDatum[]}
      boxSize={boxSize}
      label={label}
      width={width}
      height={height}
      size={size}
      className={className}
    />
  );
}
