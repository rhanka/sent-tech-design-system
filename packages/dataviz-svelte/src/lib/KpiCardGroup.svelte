<script lang="ts" module>
  import type { DashboardStore, KpiCardConfig, Row } from '@sentropic/dataviz-core';
  import type {
    KpiCardDeltaFormat,
    KpiCardFormat,
    KpiCardSize,
    KpiCardTone,
  } from '@sentropic/design-system-svelte';

  export type KpiCardGroupProps = {
    store: DashboardStore;
    viewId?: string;
    configs: KpiCardConfig[];
    comparisonData?: readonly Row[];
    format?: KpiCardFormat;
    deltaFormat?: KpiCardDeltaFormat;
    size?: KpiCardSize;
    tone?: KpiCardTone;
    class?: string;
  };
</script>

<script lang="ts">
  import { KpiCard } from '@sentropic/design-system-svelte';
  import { buildKpiCards } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    configs,
    comparisonData,
    format,
    deltaFormat = 'percent',
    size,
    tone,
    class: className,
  }: KpiCardGroupProps = $props();

  const dash = $derived(useDashboard(store));
  const cards = $derived.by(() => {
    void $dash;
    return buildKpiCards(store.model, store.applyCrossfilter(viewId), configs, { comparisonData });
  });

  const finite = (value: number | undefined): number | undefined =>
    value === undefined || !Number.isFinite(value) ? undefined : value;
</script>

<div class={className}>
  {#each cards as card (card.id)}
    <KpiCard
      value={card.value}
      label={card.label}
      delta={finite(deltaFormat === 'absolute' ? card.delta : card.deltaPercent)}
      {deltaFormat}
      {format}
      {size}
      {tone}
      sparkline={card.sparkline?.map((point) => point.value)}
    />
  {/each}
</div>
