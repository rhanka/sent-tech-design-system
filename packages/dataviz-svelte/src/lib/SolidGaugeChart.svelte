<script lang="ts" module>
  import type { DashboardStore, GaugeChartConfig } from '@sentropic/dataviz-core';

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
    size?: number;
    innerRadius?: number;
    startAngle?: number;
    endAngle?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { SolidGaugeChart as DsSolidGaugeChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildGaugeData } from './distributionData.js';

  let {
    store,
    viewId,
    value,
    label,
    min,
    max,
    thresholds,
    format,
    unit,
    size,
    innerRadius,
    startAngle,
    endAngle,
    class: className,
  }: SolidGaugeChartProps = $props();

  const dash = $derived(useDashboard(store));
  const gauge = $derived.by(() => {
    void $dash;
    return buildGaugeData(store.model, store.applyCrossfilter(viewId), { value, label, min, max, thresholds, format, unit });
  });
</script>

<DsSolidGaugeChart
  value={gauge.displayValue}
  min={gauge.min}
  max={gauge.max}
  thresholds={gauge.thresholds}
  label={gauge.label}
  format={gauge.format}
  unit={gauge.unit}
  {size}
  {innerRadius}
  {startAngle}
  {endAngle}
  class={className}
/>
