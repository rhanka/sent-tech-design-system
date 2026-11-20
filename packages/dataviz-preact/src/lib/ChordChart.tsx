import { ChordDiagram as DsChordDiagram } from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
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
  className?: MaybeSignal<string>;
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

  const resolvedClassName = useValue(className);

  const { data, labels } = toFlowData(
    buildSafeFlowModel(store.model, store.applyCrossfilter(viewId), { source, target, measure }),
  );

  return (
    <DsChordDiagram data={data} labels={labels} label={label} width={width} height={height} className={resolvedClassName} />
  );
}
