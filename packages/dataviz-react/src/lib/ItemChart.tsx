import {
  ItemChart as DsItemChart,
  type ItemChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildItemChartData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ItemChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes each item's label. */
  label_field: string;
  /** Field id whose numeric value becomes the item count. */
  value: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: string;
};

export function ItemChart({
  store,
  viewId,
  label_field,
  value,
  width,
  height,
  label,
  className,
}: ItemChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildItemChartData(store.model, store.applyCrossfilter(viewId), {
    label: label_field,
    value,
  });

  return (
    <DsItemChart
      data={data as ItemChartDatum[]}
      label={label}
      width={width}
      height={height}
      className={className}
    />
  );
}
