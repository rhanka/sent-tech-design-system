import { defineComponent, h, type PropType } from 'vue';
import { RadarChart as DsRadarChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeRadarModel, toRadarAxes, toRadarSeries } from './partOfWholeData.js';

export type RadarChartProps = {
  store: DashboardStore;
  viewId: string;
  axes: string[];
  series?: string;
  maxValue?: number;
  levels?: number;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const RadarChart = defineComponent({
  name: 'RadarChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    axes: { type: Array as PropType<string[]>, required: true },
    series: { type: String, default: undefined },
    maxValue: { type: Number, default: undefined },
    levels: { type: Number, default: undefined },
    legend: { type: Boolean, default: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildSafeRadarModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        axes: props.axes,
        series: props.series,
      });
      return h(DsRadarChart, {
        axes: toRadarAxes(model),
        series: toRadarSeries(model),
        maxValue: props.maxValue,
        levels: props.levels,
        legend: props.legend,
        width: props.width,
        height: props.height,
        label: props.label,
        class: props.class,
      });
    };
  },
});
