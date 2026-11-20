import { SunburstChart as DsSunburstChart } from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildSafePartWholeHierarchy, toHierarchyDatum } from './partOfWholeData.js';

export type SunburstChartProps = {
  store: DashboardStore;
  viewId: string;
  hierarchy: string[];
  measure: string;
  legend?: MaybeSignal<boolean>;
  width?: number;
  height?: number;
  label: string;
  className?: MaybeSignal<string>;
};

export function SunburstChart({
  store,
  viewId,
  hierarchy,
  measure,
  legend = true,
  width,
  height,
  label,
  className,
}: SunburstChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedLegend = useValue(legend);
  const resolvedClassName = useValue(className);

  const model = buildSafePartWholeHierarchy(store.model, store.applyCrossfilter(viewId), { hierarchy, measure });
  const data = toHierarchyDatum(model);

  return (
    <DsSunburstChart
      data={data}
      label={label}
      legend={resolvedLegend}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
