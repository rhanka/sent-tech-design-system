import { defineComponent, h, type PropType } from 'vue';
import {
  ParallelCoordinatesChart as DsParallelCoordinatesChart,
  type ParallelAxis,
  type ParallelCoordinatesChartTone,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildParallelCoordinatesModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ParallelCoordinatesChartProps = {
  store: DashboardStore;
  viewId: string;
  /** List of measure field ids that become the parallel axes (left to right). */
  measures: string[];
  /** Optional dimension field id used to assign a tone per row. */
  series?: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  class?: string;
};

export const ParallelCoordinatesChart = defineComponent({
  name: 'ParallelCoordinatesChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    measures: { type: Array as PropType<string[]>, required: true },
    series: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const pcModel = buildParallelCoordinatesModel(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          measures: props.measures,
          series: props.series,
        },
      );
      return h(DsParallelCoordinatesChart, {
        axes: pcModel.axes as ParallelAxis[],
        data: pcModel.data,
        tones: pcModel.tones as ParallelCoordinatesChartTone[] | undefined,
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
