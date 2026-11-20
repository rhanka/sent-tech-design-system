import { MarimekkoChart as DsMarimekkoChart } from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildSafeMekkoModel, toMarimekkoData } from './partOfWholeData.js';

export type MekkoChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  className?: MaybeSignal<string>;
};

export function MekkoChart({
  store,
  viewId,
  category,
  series,
  measure,
  width,
  height,
  label,
  className,
}: MekkoChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);

  const model = buildSafeMekkoModel(store.model, store.applyCrossfilter(viewId), {
    category,
    series,
    measure,
  });

  return (
    <DsMarimekkoChart
      data={toMarimekkoData(model)}
      width={width}
      height={height}
      label={label}
      className={resolvedClassName}
    />
  );
}
