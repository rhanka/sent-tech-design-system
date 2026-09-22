<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type CalendarHeatmapChartProps = {
    store: DashboardStore;
    viewId?: string;
    date: string;
    measure: string;
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { CalendarHeatmapChart as DsCalendarHeatmapChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildCalendarHeatmapData } from './distributionData.js';

  let { store, viewId, date, measure, label, width, height, class: className }: CalendarHeatmapChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildCalendarHeatmapData(store.model, store.applyCrossfilter(viewId), date, measure);
  });
</script>

<DsCalendarHeatmapChart {data} {label} {width} {height} class={className} />
