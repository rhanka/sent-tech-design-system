import { SolidGaugeChart as DsSolidGaugeChart, type SolidGaugeChartProps as DsSolidGaugeChartProps } from '@sentropic/design-system-preact';
import type { DashboardStore, GaugeChartConfig } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildGaugeData } from './distributionData.js';

export type SolidGaugeChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: GaugeChartConfig['value'];
  label?: GaugeChartConfig['label'];
  min?: GaugeChartConfig['min'];
  max?: GaugeChartConfig['max'];
  thresholds?: GaugeChartConfig['thresholds'];
  format?: GaugeChartConfig['format'];
  unit?: GaugeChartConfig['unit'];
  size?: DsSolidGaugeChartProps['size'];
  innerRadius?: DsSolidGaugeChartProps['innerRadius'];
  startAngle?: DsSolidGaugeChartProps['startAngle'];
  endAngle?: DsSolidGaugeChartProps['endAngle'];
  className?: MaybeSignal<string>;
};

export function SolidGaugeChart({ store, viewId, value, label, min, max, thresholds, format, unit, size, innerRadius, startAngle, endAngle, className }: SolidGaugeChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);
  const gauge = buildGaugeData(store.model, store.applyCrossfilter(viewId), { value, label, min, max, thresholds, format, unit });
  return (
    <DsSolidGaugeChart
      value={gauge.displayValue}
      min={gauge.min}
      max={gauge.max}
      thresholds={gauge.thresholds}
      label={gauge.label}
      format={gauge.format}
      unit={gauge.unit}
      size={size}
      innerRadius={innerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      className={resolvedClassName}
    />
  );
}
