import {
  RibbonChart as DsRibbonChart,
  type RibbonChartDatum,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildRibbonData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type RibbonChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the category (string-coerced). */
  category: string;
  /** Field id whose value becomes the period (string | number preserved). */
  period: string;
  /** Field id whose numeric value becomes the ribbon height/value. */
  value: string;
  width?: number;
  height?: number;
  size?: number;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  className?: MaybeSignal<string>;
};

export function RibbonChart({
  store,
  viewId,
  category,
  period,
  value,
  width,
  height,
  size,
  label,
  className,
}: RibbonChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);

  const data = buildRibbonData(store.model, store.applyCrossfilter(viewId), {
    category,
    period,
    value,
  });

  return (
    <DsRibbonChart
      data={data as RibbonChartDatum[]}
      label={label}
      width={width}
      height={height}
      size={size}
      className={resolvedClassName}
    />
  );
}
