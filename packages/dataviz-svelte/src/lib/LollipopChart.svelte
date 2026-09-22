<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';
  import type { LollipopChartTone } from '@sentropic/design-system-svelte';

  export type LollipopChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    measure: string;
    tone?: LollipopChartTone;
    orientation?: 'vertical' | 'horizontal';
    domain?: [number, number];
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import {
    LollipopChart as DsLollipopChart,
    type LollipopChartDatum,
  } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import {
    buildSimpleCategoricalSeries,
    toSimpleCategoricalData,
  } from './categoricalData.js';

  let {
    store,
    viewId,
    category,
    measure,
    tone,
    orientation = 'vertical',
    domain,
    width,
    height,
    label,
    class: className,
  }: LollipopChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by((): LollipopChartDatum[] => {
    void $dash;
    const seriesModel = buildSimpleCategoricalSeries(store.model, store.applyCrossfilter(viewId), category, measure);
    return toSimpleCategoricalData(seriesModel).map((item) => (tone ? { ...item, tone } : item));
  });
</script>

<DsLollipopChart {data} {label} {orientation} {domain} {width} {height} class={className} />
