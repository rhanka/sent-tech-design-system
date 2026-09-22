import {
  PointAndFigureChart as DsPointAndFigureChart,
  type PointAndFigureChartDatum as DsPointAndFigureChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildPointAndFigureData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type PointAndFigureChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose numeric value becomes the point's temporal position. */
  date: string;
  /** Field id whose numeric value becomes the point's closing price. */
  close: string;
  /** Box size — price granularity of the grid (pass-through to the DS component). */
  boxSize?: number;
  /** Number of boxes required to reverse the column (pass-through to the DS component). */
  reversal?: number;
  width?: number;
  height?: number;
  size?: number;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  className?: string;
};

export function PointAndFigureChart({
  store,
  viewId,
  date,
  close,
  boxSize,
  reversal,
  width,
  height,
  size,
  label,
  className,
}: PointAndFigureChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildPointAndFigureData(store.model, store.applyCrossfilter(viewId), {
    date,
    close,
  });

  return (
    <DsPointAndFigureChart
      data={data as DsPointAndFigureChartDatum[]}
      boxSize={boxSize}
      reversal={reversal}
      label={label}
      width={width}
      height={height}
      size={size}
      className={className}
    />
  );
}
