import { ChordDiagram as DsChordDiagram } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeFlowModel, toFlowData } from './partOfWholeData.js';

export type ChordChartProps = {
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

export function ChordChart({
  store,
  viewId,
  source,
  target,
  measure,
  width = 480,
  height = 360,
  label,
  className,
}: ChordChartProps) {
  const state = useDashboard(store);
  void state;

  const { data, labels } = toFlowData(
    buildSafeFlowModel(store.model, store.applyCrossfilter(viewId), { source, target, measure }),
  );

  return (
    <DsChordDiagram data={data} labels={labels} label={label} width={width} height={height} className={className} />
  );
}
