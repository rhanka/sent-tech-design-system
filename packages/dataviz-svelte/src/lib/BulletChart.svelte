<script lang="ts" module>
  import type { BulletChartConfig, DashboardStore } from '@sentropic/dataviz-core';

  export type BulletChartProps = {
    store: DashboardStore;
    viewId?: string;
    value: BulletChartConfig['value'];
    target: BulletChartConfig['target'];
    category?: BulletChartConfig['category'];
    ranges?: BulletChartConfig['ranges'];
    label: string;
    orientation?: 'horizontal' | 'vertical';
    width?: number;
    height?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { BulletChart as DsBulletChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildBulletData } from './distributionData.js';

  let { store, viewId, value, target, category, ranges, label, orientation, width, height, class: className }: BulletChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildBulletData(store.model, store.applyCrossfilter(viewId), { value, target, category, ranges, label });
  });
</script>

<DsBulletChart {data} {label} {orientation} {width} {height} class={className} />
