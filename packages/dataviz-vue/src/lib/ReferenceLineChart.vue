<script setup lang="ts">
import { computed } from 'vue';
import { buildReferenceLineModel, type DashboardStore } from '@sentropic/dataviz-core';
import { LineChart, type LineChartDatum } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';

export type ReferenceLineChartProps = {
  store: DashboardStore;
  viewId: string;
  value?: number;
  measure?: string;
  referenceId?: string;
  referenceLabel?: string;
  domainMin?: number;
  domainMax?: number;
  width?: number;
  height?: number;
  label: string;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

function xDomain(value: number, domainMin: number | undefined, domainMax: number | undefined): [number, number] {
  const min = domainMin ?? Math.min(0, value);
  const max = domainMax ?? Math.max(1, value);
  return min < max ? [min, max] : [min, min + 1];
}

defineOptions({ name: 'ReferenceLineChart' });
const props = withDefaults(defineProps<ReferenceLineChartProps>(), {
  value: undefined, measure: undefined, referenceId: undefined, referenceLabel: undefined, domainMin: undefined, domainMax: undefined, width: 360, height: 96, hoverKey: undefined, onHoverKeyChange: undefined, onSelectKey: undefined, class: undefined,
});
const state = useDashboard(props.store);
const model = computed(() => {
  void state.value;
  return buildReferenceLineModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
    id: props.referenceId,
    label: props.referenceLabel,
    value: props.value,
    measure: props.measure,
  });
});
const data = computed<LineChartDatum[]>(() => {
  const [min, max] = xDomain(model.value.value, props.domainMin, props.domainMax);
  return [
    { x: min, y: 0 },
    { x: max, y: 0 },
  ];
});
</script>

<template>
  <LineChart :data="data" :width="props.width" :height="props.height" :label="props.label"
    :reference-lines="[{ axis: 'x', value: model.value, label: model.label, tone: 'info' }]"
    :hover-key="props.hoverKey" :on-hover-key-change="props.onHoverKeyChange" :on-select-key="props.onSelectKey"
    :class="['st-referenceLineChart', props.class].filter(Boolean).join(' ')" />
</template>
