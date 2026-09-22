<script lang="ts" module>
  import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';

  export type FunnelChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    measure: string;
    sort?: PartWholeSort;
    orientation?: 'vertical' | 'horizontal';
    showPercentages?: boolean;
    percentMode?: 'ofFirst' | 'ofPrevious';
    legend?: boolean;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { FunnelChart as DsFunnelChart, type FunnelChartDatum } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafePartWholeModel, toPartWholeData } from './partOfWholeData.js';

  let {
    store,
    viewId,
    category,
    measure,
    sort = 'value-desc',
    orientation = 'vertical',
    showPercentages = true,
    percentMode = 'ofFirst',
    legend = true,
    width,
    height,
    label,
    class: className,
  }: FunnelChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by((): FunnelChartDatum[] => {
    void $dash;
    const model = buildSafePartWholeModel(store.model, store.applyCrossfilter(viewId), { category, measure, sort });
    return toPartWholeData(model.items);
  });
</script>

<DsFunnelChart
  {data}
  {label}
  {orientation}
  {showPercentages}
  {percentMode}
  {legend}
  {width}
  {height}
  class={className}
/>
