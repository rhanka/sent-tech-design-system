<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type RadarChartProps = {
    store: DashboardStore;
    viewId: string;
    axes: string[];
    series?: string;
    maxValue?: number;
    levels?: number;
    legend?: boolean;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { RadarChart as DsRadarChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafeRadarModel, toRadarAxes, toRadarSeries } from './partOfWholeData.js';

  let {
    store,
    viewId,
    axes,
    series,
    maxValue,
    levels,
    legend = true,
    width,
    height,
    label,
    class: className,
  }: RadarChartProps = $props();

  const dash = $derived(useDashboard(store));
  const radar = $derived.by(() => {
    void $dash;
    return buildSafeRadarModel(store.model, store.applyCrossfilter(viewId), { axes, series });
  });
  const dsAxes = $derived(toRadarAxes(radar));
  const dsSeries = $derived(toRadarSeries(radar));
</script>

<DsRadarChart
  axes={dsAxes}
  series={dsSeries}
  {maxValue}
  {levels}
  {legend}
  {width}
  {height}
  {label}
  class={className}
/>
