import {
  ColumnRangeChart as DsColumnRangeChart,
  type ColumnRangeChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildColumnRangeData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ColumnRangeChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the category label. */
  category: string;
  /** Field id whose numeric value becomes the low boundary. */
  low: string;
  /** Field id whose numeric value becomes the high boundary. */
  high: string;
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: string;
};

export function ColumnRangeChart({
  store,
  viewId,
  category,
  low,
  high,
  orientation,
  width,
  height,
  label,
  className,
}: ColumnRangeChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildColumnRangeData(store.model, store.applyCrossfilter(viewId), {
    category,
    low,
    high,
  });

  return (
    <DsColumnRangeChart
      data={data as ColumnRangeChartDatum[]}
      label={label}
      width={width}
      height={height}
      orientation={orientation}
      className={className}
    />
  );
}
