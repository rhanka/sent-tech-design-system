import {
  OrganizationChart as DsOrganizationChart,
  type OrganizationChartNode,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildHierarchyData, type HierarchyNode } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type OrganizationChartProps = {
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

export function OrganizationChart({
  store,
  viewId,
  id_field,
  parent_field,
  label_field,
  width,
  height,
  label,
  className,
}: OrganizationChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildHierarchyData(store.model, store.applyCrossfilter(viewId), {
    id: id_field,
    parentId: parent_field,
    label: label_field,
  });

  return (
    <DsOrganizationChart
      data={data as OrganizationChartNode[]}
      label={label}
      width={width}
      height={height}
      className={className}
    />
  );
}
