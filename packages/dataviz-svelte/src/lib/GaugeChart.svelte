<script lang="ts" module>
  import type { DashboardStore, GaugeChartConfig } from '@sentropic/dataviz-core';

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
    size?: number;
    thickness?: number;
    startAngle?: number;
    endAngle?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { GaugeChart as DsGaugeChart } from '@sentropic/design-system-svelte';
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
    thickness,
    startAngle,
    endAngle,
    class: className,
  }: GaugeChartProps = $props();

  const dash = $derived(useDashboard(store));
  const gauge = $derived.by(() => {
    void $dash;
    return buildGaugeData(store.model, store.applyCrossfilter(viewId), { value, label, min, max, thresholds, format, unit });
  });
</script>

<DsGaugeChart
  value={gauge.displayValue}
  min={gauge.min}
  max={gauge.max}
  thresholds={gauge.thresholds}
  label={gauge.label}
  format={gauge.format}
  unit={gauge.unit}
  {size}
  {thickness}
  {startAngle}
  {endAngle}
  class={className}
/>
