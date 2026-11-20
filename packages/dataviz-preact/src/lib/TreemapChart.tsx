import { TreemapChart as DsTreemapChart } from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildSafePartWholeHierarchy, toTreemapData } from './partOfWholeData.js';

export type TreemapChartProps = {
  store: DashboardStore;
  viewId: string;
  hierarchy: string[];
  measure: string;
  showLabels?: MaybeSignal<boolean>;
  legend?: MaybeSignal<boolean>;
  width?: number;
  height?: number;
  label: string;
  className?: MaybeSignal<string>;
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

  const resolvedShowLabels = useValue(showLabels);
  const resolvedLegend = useValue(legend);
  const resolvedClassName = useValue(className);

  const model = buildSafePartWholeHierarchy(store.model, store.applyCrossfilter(viewId), { hierarchy, measure });
  const data = toTreemapData(model);

  return (
    <DsTreemapChart
      data={data}
      label={label}
      showLabels={resolvedShowLabels}
      legend={resolvedLegend}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
