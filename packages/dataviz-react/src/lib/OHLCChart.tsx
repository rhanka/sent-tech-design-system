import {
  OHLCChart as DsOHLCChart,
  type OHLCChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildOhlcData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type OHLCChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes each bar's label. */
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

export function OHLCChart({
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
}: OHLCChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildOhlcData(store.model, store.applyCrossfilter(viewId), {
    label: label_field,
    open,
    high,
    low,
    close,
  });

  return (
    <DsOHLCChart
      data={data as OHLCChartDatum[]}
      label={label}
      width={width}
      height={height}
      className={className}
    />
  );
}
