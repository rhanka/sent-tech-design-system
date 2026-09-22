import {
  StreamgraphChart as DsStreamgraphChart,
  type StreamgraphChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildStreamgraphData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type StreamgraphChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the category (x-axis bucket). */
  category: string;
  /** Field id whose value becomes the series label within each category. */
  series: string;
  /** Field id whose numeric value becomes the stream height. */
  measure: string;
  /** Optional field id whose value becomes the series tone. */
  tone?: string;
  smooth?: boolean;
  showLegend?: boolean;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: string;
};

export function StreamgraphChart({
  store,
  viewId,
  category,
  series,
  measure,
  tone,
  smooth,
  showLegend,
  width,
  height,
  label,
  className,
}: StreamgraphChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildStreamgraphData(store.model, store.applyCrossfilter(viewId), {
    category,
    label: series,
    value: measure,
    tone,
  });

  return (
    <DsStreamgraphChart
      data={data as StreamgraphChartDatum[]}
      label={label}
      smooth={smooth}
      showLegend={showLegend}
      width={width}
      height={height}
      className={className}
    />
  );
}
