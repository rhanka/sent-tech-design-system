import {
  TreegraphChart as DsTreegraphChart,
  type TreegraphChartNode,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildHierarchyData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type TreegraphChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the node's unique identifier. */
  id_field: string;
  /** Field id whose value references the parent node id. */
  parent_field: string;
  /** Field id whose value becomes the node's display label. */
  label_field: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function TreegraphChart({
  store,
  viewId,
  id_field,
  parent_field,
  label_field,
  width,
  height,
  label,
  className,
}: TreegraphChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);

  const data = buildHierarchyData(store.model, store.applyCrossfilter(viewId), {
    id: id_field,
    parentId: parent_field,
    label: label_field,
  });

  return (
    <DsTreegraphChart
      data={data as TreegraphChartNode[]}
      label={label}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
