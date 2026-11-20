import {
  DivergentBarChart,
  type DivergentBarChartDatum,
} from '@sentropic/design-system-preact';
import {
  buildDivergingBarModel,
  findDimension,
  findMeasure,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type DivergingBarChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This chart's view id in the cross-filter graph. */
  viewId: string;
  /** Dimension id used as diverging bar categories. */
  category: string;
  /** Measure id aggregated per category. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  /** Optional fixed value-axis domain. Defaults to the core model domain. */
  domain?: [number, number];
  format?: (value: number) => string;
  showLegend?: MaybeSignal<boolean>;
  width?: number;
  height?: number;
  className?: MaybeSignal<string>;
};

/**
 * Cross-filter-aware diverging bar chart built from the core diverging model
 * and rendered by the design-system chart component.
 */
export function DivergingBarChart({
  store,
  viewId,
  category,
  measure,
  label,
  domain,
  format,
  showLegend = true,
  width,
  height,
  className,
}: DivergingBarChartProps) {
  const state = useDashboard(store);
  void state;

  const resolvedShowLegend = useValue(showLegend);
  const resolvedClassName = useValue(className);

  const dim = findDimension(store.model, category);
  const m = findMeasure(store.model, measure);
  const model =
    dim && m
      ? buildDivergingBarModel(store.model, store.applyCrossfilter(viewId), { category, measure })
      : undefined;
  const data: DivergentBarChartDatum[] =
    model?.items.map((item) => ({ label: item.label, value: item.value, tone: item.direction })) ?? [];

  return (
    <DivergentBarChart
      data={data}
      label={label}
      width={width}
      height={height}
      domain={domain ?? model?.domain}
      format={format}
      showLegend={resolvedShowLegend}
      className={resolvedClassName}
    />
  );
}
