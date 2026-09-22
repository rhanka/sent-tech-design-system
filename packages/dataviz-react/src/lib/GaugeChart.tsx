import { GaugeChart as DsGaugeChart, type GaugeChartProps as DsGaugeChartProps } from '@sentropic/design-system-react';
import type { DashboardStore, GaugeChartConfig } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildGaugeData } from './distributionData.js';

export type GaugeChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: GaugeChartConfig['value'];
  label?: GaugeChartConfig['label'];
  min?: GaugeChartConfig['min'];
  max?: GaugeChartConfig['max'];
  thresholds?: GaugeChartConfig['thresholds'];
  format?: GaugeChartConfig['format'];
  unit?: GaugeChartConfig['unit'];
  size?: DsGaugeChartProps['size'];
  thickness?: DsGaugeChartProps['thickness'];
  startAngle?: DsGaugeChartProps['startAngle'];
  endAngle?: DsGaugeChartProps['endAngle'];
  className?: string;
};

export function GaugeChart({ store, viewId, value, label, min, max, thresholds, format, unit, size, thickness, startAngle, endAngle, className }: GaugeChartProps) {
  const state = useDashboard(store);
  void state;
  const gauge = buildGaugeData(store.model, store.applyCrossfilter(viewId), { value, label, min, max, thresholds, format, unit });
  return (
    <DsGaugeChart
      value={gauge.displayValue}
      min={gauge.min}
      max={gauge.max}
      thresholds={gauge.thresholds}
      label={gauge.label}
      format={gauge.format}
      unit={gauge.unit}
      size={size}
      thickness={thickness}
      startAngle={startAngle}
      endAngle={endAngle}
      className={className}
    />
  );
}
