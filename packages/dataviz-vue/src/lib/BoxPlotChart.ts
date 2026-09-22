import { defineComponent, h, type PropType } from 'vue';
import { BoxPlotChart as DsBoxPlotChart } from '@sentropic/design-system-vue';
import type { BoxPlotConfig, DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildBoxPlotData } from './distributionData.js';

export type BoxPlotChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: BoxPlotConfig['value'];
  group?: BoxPlotConfig['group'];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

export const BoxPlotChart = defineComponent({
  name: 'BoxPlotChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    value: { type: String, required: true },
    group: { type: String, default: undefined },
    label: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      return h(DsBoxPlotChart, {
        data: buildBoxPlotData(props.store.model, props.store.applyCrossfilter(props.viewId), {
          value: props.value,
          group: props.group,
        }),
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
