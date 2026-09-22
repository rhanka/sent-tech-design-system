import { SolidGaugeChart as DsSolidGaugeChart, type SolidGaugeChartProps as DsSolidGaugeChartProps } from '@sentropic/design-system-react';
import type { DashboardStore, GaugeChartConfig } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
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
  className?: string;
};

export function SolidGaugeChart({ store, viewId, value, label, min, max, thresholds, format, unit, size, innerRadius, startAngle, endAngle, className }: SolidGaugeChartProps) {
  const state = useDashboard(store);
  void state;
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
      className={className}
    />
  );
}
