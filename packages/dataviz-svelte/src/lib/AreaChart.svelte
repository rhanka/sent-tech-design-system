<script lang="ts" module>
  import type { ChartAnnotation, DashboardStore } from '@sentropic/dataviz-core';
  import type { AreaChartTone, DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-svelte';

  export type AreaChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    measure: string;
    tone?: AreaChartTone;
    smooth?: boolean;
    width?: number;
    height?: number;
    label: string;
    annotations?: ChartAnnotation[];
    dataLabels?: ChartDataLabels;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    onSelectKey?: (key: string | null) => void;
    class?: string;
  };
</script>

<script lang="ts">
  import { AreaChart as DsAreaChart } from '@sentropic/design-system-svelte';
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
    smooth = false,
    width,
    height,
    label,
    annotations,
    dataLabels,
    hoverKey,
    onHoverKeyChange,
    onSelectKey,
    class: className,
  }: AreaChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    const seriesModel = buildSimpleCategoricalSeries(store.model, store.applyCrossfilter(viewId), category, measure);
    return toSimpleCategoricalPoints(seriesModel);
  });
</script>

<DsAreaChart {data} {label} {tone} {smooth} {width} {height} {annotations} {dataLabels} {hoverKey} {onHoverKeyChange} {onSelectKey} class={className} />
