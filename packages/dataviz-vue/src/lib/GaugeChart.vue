<script setup lang="ts">
import { computed } from 'vue';
import { GaugeChart as DsGaugeChart } from '@sentropic/design-system-vue';
import type { DashboardStore, GaugeChartConfig, GaugeChartFormat, GaugeChartThreshold } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildGaugeData } from './distributionData.js';

export type GaugeChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: GaugeChartConfig['value'];
  label?: GaugeChartConfig['label'];
  min?: GaugeChartConfig['min'];
  max?: GaugeChartConfig['max'];
  thresholds?: GaugeChartConfig['thresholds'];
  format?: GaugeChartConfig['format'];
  unit?: GaugeChartConfig['unit'];
  size?: number;
  thickness?: number;
  startAngle?: number;
  endAngle?: number;
  class?: string;
};

defineOptions({ name: 'GaugeChart' });
const props = withDefaults(defineProps<GaugeChartProps>(), {
  viewId: undefined, label: undefined, min: undefined, max: undefined, thresholds: undefined, format: undefined, unit: undefined, size: undefined, thickness: undefined, startAngle: undefined, endAngle: undefined, class: undefined,
});
const state = useDashboard(props.store);
const gauge = computed(() => {
  void state.value;
  return buildGaugeData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    value: props.value,
    label: props.label,
    min: props.min,
    max: props.max,
    thresholds: props.thresholds,
    format: props.format,
    unit: props.unit,
  });
});
</script>

<template>
  <DsGaugeChart :value="gauge.displayValue" :min="gauge.min" :max="gauge.max" :thresholds="(gauge.thresholds as unknown as GaugeChartThreshold[])" :label="gauge.label" :format="(gauge.format as GaugeChartFormat)" :unit="gauge.unit" :size="props.size" :thickness="props.thickness" :start-angle="props.startAngle" :end-angle="props.endAngle" :class="props.class" />
</template>
