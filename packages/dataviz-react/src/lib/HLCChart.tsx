import {
  HLCChart as DsHLCChart,
  type HLCChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildHlcData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type HLCChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes each bar's label (typically a date or session dimension). */
  label_field: string;
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

export function HLCChart({
  store,
  viewId,
  label_field,
  high,
  low,
  close,
  width,
  height,
  label,
  className,
}: HLCChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildHlcData(store.model, store.applyCrossfilter(viewId), {
    label: label_field,
    high,
    low,
    close,
  });

  return (
    <DsHLCChart
      data={data as HLCChartDatum[]}
      label={label}
      width={width}
      height={height}
      className={className}
    />
  );
}
