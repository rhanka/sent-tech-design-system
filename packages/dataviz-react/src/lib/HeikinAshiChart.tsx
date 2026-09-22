import {
  HeikinAshiChart as DsHeikinAshiChart,
  type HeikinAshiChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildCandlestickData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type HeikinAshiChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes each bar's label (typically a date or session dimension). */
  label_field: string;
  /** Field id whose numeric value becomes the open price. */
  open: string;
  /** Field id whose numeric value becomes the high price. */
  high: string;
  /** Field id whose numeric value becomes the low price. */
  low: string;
  /** Field id whose numeric value becomes the close price. */
  close: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: string;
};

export function HeikinAshiChart({
  store,
  viewId,
  label_field,
  open,
  high,
  low,
  close,
  width,
  height,
  label,
  className,
}: HeikinAshiChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildCandlestickData(store.model, store.applyCrossfilter(viewId), {
    label: label_field,
    open,
    high,
    low,
    close,
  });

  return (
    <DsHeikinAshiChart
      data={data as HeikinAshiChartDatum[]}
      label={label}
      width={width}
      height={height}
      className={className}
    />
  );
}
