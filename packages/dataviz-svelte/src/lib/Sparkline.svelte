<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type SparklineTone = 'neutral' | 'success' | 'warning' | 'error';

  export type SparklineProps = {
    store: DashboardStore;
    viewId: string;
    /** Dimension (e.g. 'month') over which values are ordered. */
    dimension: string;
    /** Measure whose aggregated per-key values form the sparkline series. */
    measure: string;
    tone?: SparklineTone;
    strokeWidth?: number;
    area?: boolean;
    width?: number;
    height?: number;
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { Sparkline as DsSparkline } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSimpleCategoricalSeries } from './categoricalData.js';

  let {
    store,
    viewId,
    dimension,
    measure,
    tone,
    strokeWidth,
    area,
    width,
    height,
    label,
    class: className,
  }: SparklineProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by((): number[] => {
    void $dash;
    const seriesModel = buildSimpleCategoricalSeries(store.model, store.applyCrossfilter(viewId), dimension, measure);
    return seriesModel.series[0]?.values ?? [];
  });
</script>

<DsSparkline {data} {tone} {strokeWidth} {area} {width} {height} {label} class={className} />
