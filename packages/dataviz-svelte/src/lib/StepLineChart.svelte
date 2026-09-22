<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';
  import type { StepLineChartTone } from '@sentropic/design-system-svelte';

  export type StepLineChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    measure: string;
    tone?: StepLineChartTone;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { StepLineChart as DsStepLineChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import {
    buildSimpleCategoricalSeries,
    toSimpleCategoricalPoints,
  } from './categoricalData.js';

  let {
    store,
    viewId,
    category,
    measure,
    tone,
    width,
    height,
    label,
    class: className,
  }: StepLineChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    const seriesModel = buildSimpleCategoricalSeries(store.model, store.applyCrossfilter(viewId), category, measure);
    return toSimpleCategoricalPoints(seriesModel);
  });
</script>

<DsStepLineChart {data} {label} {tone} {width} {height} class={className} />
