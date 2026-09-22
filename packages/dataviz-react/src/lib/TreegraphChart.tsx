import {
  TreegraphChart as DsTreegraphChart,
  type TreegraphChartNode,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildHierarchyData, type HierarchyNode } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

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
  className?: string;
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
      className={className}
    />
  );
}
