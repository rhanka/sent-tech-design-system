import { SankeyChart as DsSankeyChart } from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
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
  className?: MaybeSignal<string>;
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
  const resolvedClassName = useValue(className);

  const model = buildSafeFlowModel(store.model, store.applyCrossfilter(viewId), { source, target, measure });

  return (
    <DsSankeyChart
      nodes={model.nodes}
      links={model.links}
      label={label}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
