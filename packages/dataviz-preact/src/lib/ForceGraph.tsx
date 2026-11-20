import { ForceGraph as DsForceGraph } from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildForceGraphData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type ForceGraphProps = {
  store: DashboardStore;
  viewId: string;
  source: string;
  target: string;
  weight?: string;
  label: string;
  width?: number;
  height?: number;
  className?: MaybeSignal<string>;
};

export function ForceGraph({
  store,
  viewId,
  source,
  target,
  weight,
  label,
  width,
  height,
  className,
}: ForceGraphProps) {
  const state = useDashboard(store);
  void state;

  const resolvedClassName = useValue(className);
  const graph = buildForceGraphData(store.model, store.applyCrossfilter(viewId), { source, target, weight });

  return (
    <DsForceGraph
      nodes={graph.nodes}
      edges={graph.edges}
      label={label}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
