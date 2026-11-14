<script setup lang="ts">
import { computed } from 'vue';
import {
  KpiCard,
  type KpiCardDeltaFormat,
  type KpiCardFormat,
  type KpiCardSize,
  type KpiCardTone,
} from '@sentropic/design-system-vue';
import {
  buildKpiCards,
  type DashboardStore,
  type Row,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type ScoreCardProps = {
  store: DashboardStore;
  viewId?: string;
  measure: string;
  label?: string;
  goal?: number;
  sparklineDimension?: string;
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
defineOptions({ name: 'ScoreCard' });
const props = withDefaults(defineProps<ScoreCardProps>(), {
  viewId: undefined, label: undefined, goal: undefined, sparklineDimension: undefined, comparisonData: undefined, format: undefined, deltaFormat: 'percent', unit: undefined, currency: undefined, locale: undefined, size: undefined, tone: undefined, class: undefined,
});
const state = useDashboard(props.store);
function finite(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}
const cardData = computed(() => {
  void state.value;
  const [card] = buildKpiCards(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    [{ id: 'card', label: props.label, measure: props.measure, goal: props.goal, sparklineDimension: props.sparklineDimension }],
    { comparisonData: props.comparisonData },
  );
  return {
    value: card!.value,
    label: card!.label,
    delta: finite(props.deltaFormat === 'absolute' ? card!.delta : card!.deltaPercent),
    sparkline: card!.sparkline?.map((point) => point.value),
  };
});
</script>

<template>
  <KpiCard :value="cardData.value" :label="cardData.label" :delta="cardData.delta" :delta-format="props.deltaFormat" :unit="props.unit" :currency="props.currency" :locale="props.locale" :format="props.format" :size="props.size" :tone="props.tone" :sparkline="cardData.sparkline" :class="props.class" />
</template>
