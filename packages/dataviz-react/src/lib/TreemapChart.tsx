import { TreemapChart as DsTreemapChart } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePartWholeHierarchy, toTreemapData } from './partOfWholeData.js';

export type TreemapChartProps = {
  store: DashboardStore;
  viewId: string;
  hierarchy: string[];
  measure: string;
  showLabels?: boolean;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function TreemapChart({
  store,
  viewId,
  hierarchy,
  measure,
  showLabels = true,
  legend = true,
  width,
  height,
  label,
  className,
}: TreemapChartProps) {
  const state = useDashboard(store);
  void state;

  const model = buildSafePartWholeHierarchy(store.model, store.applyCrossfilter(viewId), { hierarchy, measure });
  const data = toTreemapData(model);

  return (
    <DsTreemapChart
      data={data}
      label={label}
      showLabels={showLabels}
      legend={legend}
      width={width}
      height={height}
      className={className}
    />
  );
}
