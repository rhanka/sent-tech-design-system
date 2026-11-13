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
  type KpiCardConfig,
  type Row,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

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

function finite(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}

defineOptions({ name: 'KpiCardGroup' });
const props = withDefaults(defineProps<KpiCardGroupProps>(), {
  viewId: undefined, comparisonData: undefined, format: undefined, deltaFormat: 'percent', size: undefined, tone: undefined, class: undefined,
});
const state = useDashboard(props.store);
const cards = computed(() => {
  void state.value;
  return buildKpiCards(props.store.model, props.store.applyCrossfilter(props.viewId), props.configs, {
    comparisonData: props.comparisonData,
  });
});
</script>

<template>
  <div :class="props.class">
    <KpiCard v-for="card in cards" :key="card.id"
      :value="card.value" :label="card.label"
      :delta="finite(props.deltaFormat === 'absolute' ? card.delta : card.deltaPercent)"
      :delta-format="props.deltaFormat" :format="props.format" :size="props.size" :tone="props.tone"
      :sparkline="card.sparkline?.map((point) => point.value)" />
  </div>
</template>
