<script lang="ts" module>
  import type { ChartAnnotation, DashboardStore } from '@sentropic/dataviz-core';
  import type { DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-svelte';

  export type ErrorBarsChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    value: string;
    interval?: 'stdev' | 'stderr';
    width?: number;
    height?: number;
    label: string;
    annotations?: ChartAnnotation[];
    dataLabels?: ChartDataLabels;
    class?: string;
  };
</script>

<script lang="ts">
  import { buildErrorBarsModel } from '@sentropic/dataviz-core';
  import { BarChart as DsBarChart, type BarChartDatum } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    category,
    value,
    interval,
    width = 420,
    height = 240,
    label,
    annotations,
    dataLabels,
    class: className,
  }: ErrorBarsChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildErrorBarsModel(store.model, store.applyCrossfilter(viewId), { category, value, interval });
  });
  const data = $derived.by(
    (): BarChartDatum[] =>
      model.items.map((item) => ({
        label: item.label,
        value: item.mean,
        errorLow: item.lower,
        errorHigh: item.upper,
      })),
  );
  const classes = $derived(['st-errorBarsChart', className].filter(Boolean).join(' '));
</script>

<DsBarChart {data} {width} {height} {label} {annotations} {dataLabels} class={classes} />
