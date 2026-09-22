import { SankeyChart as DsSankeyChart } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeFlowModel } from './partOfWholeData.js';

export type SankeyChartProps = {
  store: DashboardStore;
  viewId: string;
  source: string;
  target: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function SankeyChart({
  store,
  viewId,
  source,
  target,
  measure,
  width,
  height,
  label,
  className,
}: SankeyChartProps) {
  const state = useDashboard(store);
  void state;

  const model = buildSafeFlowModel(store.model, store.applyCrossfilter(viewId), { source, target, measure });

  return (
    <DsSankeyChart
      nodes={model.nodes}
      links={model.links}
      label={label}
      width={width}
      height={height}
      className={className}
    />
  );
}
