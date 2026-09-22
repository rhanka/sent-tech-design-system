import {
  FlamegraphChart as DsFlamegraphChart,
  type FlamegraphNode as DsFlamegraphNode,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildFlamegraphData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type FlamegraphChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value is the node id (string-coerced). */
  id: string;
  /** Field id whose value references the parent node id (empty ⇒ root). */
  parentId: string;
  /** Field id whose value becomes the node label (string-coerced). */
  name: string;
  /** Field id whose numeric value becomes the node weight (non-finite ⇒ 0). */
  value: string;
  width?: number;
  height?: number;
  size?: number;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  className?: string;
};

export function FlamegraphChart({
  store,
  viewId,
  id,
  parentId,
  name,
  value,
  width,
  height,
  size,
  label,
  className,
}: FlamegraphChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildFlamegraphData(store.model, store.applyCrossfilter(viewId), {
    id,
    parentId,
    name,
    value,
  });

  return (
    <DsFlamegraphChart
      data={data as DsFlamegraphNode}
      label={label}
      width={width}
      height={height}
      size={size}
      className={className}
    />
  );
}
