import {
  ParetoChart as DsParetoChart,
  type ParetoChartDatum,
  type ParetoChartTone,
} from '@sentropic/design-system-react';
import {
  buildParetoModel,
  findDimension,
  findMeasure,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ParetoChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This chart's view id in the cross-filter graph. */
  viewId: string;
  /** Dimension id used as Pareto categories. */
  category: string;
  /** Measure id aggregated per category. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  /** Optional design-system tone applied to every Pareto bar. */
  tone?: ParetoChartTone;
  width?: number;
  height?: number;
  className?: string;
};

/**
 * Cross-filter-aware Pareto chart built from the core Pareto model and rendered
 * by the design-system chart component.
 */
export function ParetoChart({
  store,
  viewId,
  category,
  measure,
  label,
  tone,
  width,
  height,
  className,
}: ParetoChartProps) {
  const state = useDashboard(store);
  void state;

  const dim = findDimension(store.model, category);
  const m = findMeasure(store.model, measure);
  const data: ParetoChartDatum[] =
    dim && m
      ? buildParetoModel(store.model, store.applyCrossfilter(viewId), { category, measure }).items.map(
          (item) => (tone ? { label: item.label, value: item.value, tone } : { label: item.label, value: item.value }),
        )
      : [];

  return <DsParetoChart data={data} label={label} width={width} height={height} className={className} />;
}
