import { BulletChart as DsBulletChart, type BulletChartProps as DsBulletChartProps } from '@sentropic/design-system-preact';
import type { BulletChartConfig, DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildBulletData } from './distributionData.js';

export type BulletChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: BulletChartConfig['value'];
  target: BulletChartConfig['target'];
  category?: BulletChartConfig['category'];
  ranges?: BulletChartConfig['ranges'];
  label: string;
  orientation?: DsBulletChartProps['orientation'];
  width?: DsBulletChartProps['width'];
  height?: DsBulletChartProps['height'];
  className?: MaybeSignal<string>;
};

export function BulletChart({ store, viewId, value, target, category, ranges, label, orientation, width, height, className }: BulletChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);
  const data = buildBulletData(store.model, store.applyCrossfilter(viewId), { value, target, category, ranges, label });
  return <DsBulletChart data={data} label={label} orientation={orientation} width={width} height={height} className={resolvedClassName} />;
}
