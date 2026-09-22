import { defineComponent, h, type PropType } from 'vue';
import { SolidGaugeChart as DsSolidGaugeChart } from '@sentropic/design-system-vue';
import type { DashboardStore, GaugeChartConfig, GaugeChartFormat, GaugeChartThreshold } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildGaugeData } from './distributionData.js';

export type SolidGaugeChartProps = {
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
  innerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  class?: string;
};

export const SolidGaugeChart = defineComponent({
  name: 'SolidGaugeChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    value: { type: String, required: true },
    label: { type: String, default: undefined },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    thresholds: { type: Array as unknown as PropType<readonly GaugeChartThreshold[]>, default: undefined },
    format: { type: String as PropType<GaugeChartFormat>, default: undefined },
    unit: { type: String, default: undefined },
    size: { type: Number, default: undefined },
    innerRadius: { type: Number, default: undefined },
    startAngle: { type: Number, default: undefined },
    endAngle: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const gauge = buildGaugeData(props.store.model, props.store.applyCrossfilter(props.viewId), {
        value: props.value,
        label: props.label,
        min: props.min,
        max: props.max,
        thresholds: props.thresholds,
        format: props.format,
        unit: props.unit,
      });
      return h(DsSolidGaugeChart, {
        value: gauge.displayValue,
        min: gauge.min,
        max: gauge.max,
        thresholds: gauge.thresholds,
        label: gauge.label,
        format: gauge.format,
        unit: gauge.unit,
        size: props.size,
        innerRadius: props.innerRadius,
        startAngle: props.startAngle,
        endAngle: props.endAngle,
        class: props.class,
      });
    };
  },
});
