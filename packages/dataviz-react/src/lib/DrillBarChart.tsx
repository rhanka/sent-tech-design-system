import {
  BarChart,
  type BarChartDatum,
  type BarChartTone,
} from '@sentropic/design-system-react';
import { findMeasure, groupAggregate, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DrillBarChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id (drill state + cross-filter scope live under it). */
  viewId: string;
  /** Ordered dimension hierarchy; bars group by the current drill level. */
  hierarchy: string[];
  /** Measure id aggregated into each bar's value. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  tone?: BarChartTone;
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  className?: string;
};

/**
 * A bar chart that drills through a dimension hierarchy: clicking a bar filters
 * the clicked value and pushes the next level as group-by. At the deepest level
 * a click toggles this view's selection (brushing) instead.
 */
export function DrillBarChart({
  store,
  viewId,
  hierarchy,
  measure,
  label,
  tone,
  orientation = 'vertical',
  width,
  height,
  className,
}: DrillBarChartProps) {
  const state = useDashboard(store);
  const level = Math.min((state.drill[viewId] ?? []).length, Math.max(hierarchy.length - 1, 0));
  const currentDim = hierarchy[level];
  const canDrill = level < hierarchy.length - 1;
  const m = findMeasure(store.model, measure);
  const data: BarChartDatum[] =
    m && currentDim
      ? groupAggregate(store.applyCrossfilter(viewId), currentDim, m).map(({ key, value }) =>
          tone ? { label: key, value, tone } : { label: key, value },
        )
      : [];
  const onSelect = (key: string) => {
    if (canDrill) {
      store.setFilter(currentDim, { kind: 'include', values: [key] });
      store.drillDown(viewId, hierarchy[level + 1]);
    } else {
      store.toggleSelection(viewId, key);
    }
  };
  return (
    <BarChart
      data={data}
      label={label}
      orientation={orientation}
      width={width}
      height={height}
      className={className}
      selectedKeys={canDrill ? [] : (state.selections[viewId] ?? [])}
      onSelect={onSelect}
    />
  );
}
