import { RoseChart as DsRoseChart } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeRoseModel, toRoseData } from './partOfWholeData.js';

export type RoseChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function RoseChart({
  store,
  viewId,
  category,
  measure,
  width = 360,
  height = 360,
  label,
  className,
}: RoseChartProps) {
  const state = useDashboard(store);
  void state;

  const data = toRoseData(buildSafeRoseModel(store.model, store.applyCrossfilter(viewId), { category, measure }));

  return <DsRoseChart data={data} label={label} width={width} height={height} className={className} />;
}
