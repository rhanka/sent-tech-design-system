import {
  StreamgraphChart as DsStreamgraphChart,
  type StreamgraphChartDatum,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildStreamgraphData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

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
  smooth?: MaybeSignal<boolean>;
  showLegend?: MaybeSignal<boolean>;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
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
  const resolvedSmooth = useValue(smooth);
  const resolvedShowLegend = useValue(showLegend);
  const resolvedClassName = useValue(className);

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
      smooth={resolvedSmooth}
      showLegend={resolvedShowLegend}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
