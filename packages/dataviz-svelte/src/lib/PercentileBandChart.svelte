<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type PercentileBandChartProps = {
    store: DashboardStore;
    viewId: string;
    value: string;
    lower: number;
    upper: number;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { buildPercentileBandModel } from '@sentropic/dataviz-core';
  import { LineChart as DsLineChart, type LineChartDatum } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    value,
    lower,
    upper,
    width = 360,
    height = 96,
    label,
    class: className,
  }: PercentileBandChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildPercentileBandModel(store.model, store.applyCrossfilter(viewId), { value, lower, upper });
  });
  const data = $derived.by(
    (): LineChartDatum[] => [
      { x: `${Math.round(lower * 100)}%`, y: model.lowerValue },
      { x: 'median', y: model.median },
      { x: `${Math.round(upper * 100)}%`, y: model.upperValue },
    ],
  );
  const bands = $derived([{ from: model.lowerValue, to: model.upperValue, label: 'Percentiles', tone: 'success' as const }]);
  const referenceLines = $derived([{ value: model.median, label: 'Median', tone: 'success' as const }]);
  const classes = $derived(['st-percentileBandChart', className].filter(Boolean).join(' '));
</script>

<DsLineChart {data} {width} {height} {label} {bands} {referenceLines} class={classes} />
