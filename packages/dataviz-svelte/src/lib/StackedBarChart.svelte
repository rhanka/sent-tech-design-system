<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';
  import type { DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-svelte';
  import type { StackedMode } from './categoricalData.js';

  export type StackedBarChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    series: string;
    measure: string;
    mode?: StackedMode;
    showLegend?: boolean;
    width?: number;
    height?: number;
    label: string;
    dataLabels?: ChartDataLabels;
    hiddenSeries?: string[];
    onToggleSeries?: (seriesId: string) => void;
    class?: string;
  };
</script>

<script lang="ts">
  import { StackedBarChart as DsStackedBarChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafeCategoricalSeries, toStackedCategoricalData } from './categoricalData.js';

  let {
    store,
    viewId,
    category,
    series,
    measure,
    mode = 'stacked',
    showLegend = true,
    width,
    height,
    label,
    dataLabels,
    hiddenSeries,
    onToggleSeries,
    class: className,
  }: StackedBarChartProps = $props();

  const dash = $derived(useDashboard(store));
  const seriesModel = $derived.by(() => {
    void $dash;
    return buildSafeCategoricalSeries(store.model, store.applyCrossfilter(viewId), {
      category,
      series,
      measures: [measure],
      mode,
    });
  });
  const data = $derived(toStackedCategoricalData(seriesModel));
</script>

<DsStackedBarChart {data} {label} {showLegend} {width} {height} {dataLabels} {hiddenSeries} {onToggleSeries} class={className} />
