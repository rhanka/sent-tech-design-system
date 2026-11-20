import { RoseChart as DsRoseChart } from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildSafeRoseModel, toRoseData } from './partOfWholeData.js';

export type RoseChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  className?: MaybeSignal<string>;
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
  const resolvedClassName = useValue(className);

  const data = toRoseData(buildSafeRoseModel(store.model, store.applyCrossfilter(viewId), { category, measure }));

  return <DsRoseChart data={data} label={label} width={width} height={height} className={resolvedClassName} />;
}
