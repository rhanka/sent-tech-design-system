<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ForecastLineChartProps = {
    store: DashboardStore;
    viewId: string;
    x: string;
    y: string;
    periods: number;
    step?: number;
    width?: number;
    height?: number;
    label: string;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    onSelectKey?: (key: string | null) => void;
    class?: string;
  };
</script>

<script lang="ts">
  import { LineChart as DsLineChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildForecastLineData } from './analyticsDsData.js';

  let {
    store,
    viewId,
    x,
    y,
    periods,
    step,
    width = 360,
    height = 220,
    label,
    hoverKey,
    onHoverKeyChange,
    onSelectKey,
    class: className,
  }: ForecastLineChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildForecastLineData(store.model, store.applyCrossfilter(viewId), { x, y, periods, step });
  });
  const classes = $derived(['st-forecastLineChart', className].filter(Boolean).join(' '));
</script>

<DsLineChart data={model} {width} {height} {label} {hoverKey} {onHoverKeyChange} {onSelectKey} class={classes} />
