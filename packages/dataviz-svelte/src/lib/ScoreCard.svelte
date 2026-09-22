<script lang="ts" module>
  import type { DashboardStore, Row } from '@sentropic/dataviz-core';
  import type {
    KpiCardDeltaFormat,
    KpiCardFormat,
    KpiCardSize,
    KpiCardTone,
  } from '@sentropic/design-system-svelte';

  export type ScoreCardProps = {
    store: DashboardStore;
    viewId?: string;
    /** The measure to aggregate and display as the primary value. */
    measure: string;
    /** Display label for the card. Defaults to the measure's label. */
    label?: string;
    /** Optional goal value; enables progress display when set. */
    goal?: number;
    /** Dimension used to build the inline sparkline (e.g. 'month'). */
    sparklineDimension?: string;
    /** Previous-period rows for delta computation. */
    comparisonData?: readonly Row[];
    format?: KpiCardFormat;
    deltaFormat?: KpiCardDeltaFormat;
    unit?: string;
    currency?: string;
    locale?: string;
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
    measure,
    label,
    goal,
    sparklineDimension,
    comparisonData,
    format,
    deltaFormat = 'percent',
    unit,
    currency,
    locale,
    size,
    tone,
    class: className,
  }: ScoreCardProps = $props();

  const dash = $derived(useDashboard(store));
  const card = $derived.by(() => {
    void $dash;
    const [c] = buildKpiCards(
      store.model,
      store.applyCrossfilter(viewId),
      [{ id: 'card', label, measure, goal, sparklineDimension }],
      { comparisonData },
    );
    return c!;
  });

  const finite = (value: number | undefined): number | undefined =>
    value === undefined || !Number.isFinite(value) ? undefined : value;
</script>

<KpiCard
  value={card.value}
  label={card.label}
  delta={finite(deltaFormat === 'absolute' ? card.delta : card.deltaPercent)}
  {deltaFormat}
  {unit}
  {currency}
  {locale}
  {format}
  {size}
  {tone}
  sparkline={card.sparkline?.map((point) => point.value)}
  class={className}
/>
