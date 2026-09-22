import { defineComponent, h, type PropType } from 'vue';
import {
  WordCloudChart as DsWordCloudChart,
  type WordCloudChartWord,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildWordCloudData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type WordCloudChartProps = {
  store: DashboardStore;
  viewId: string;
  word_field: string;
  weight: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const WordCloudChart = defineComponent({
  name: 'WordCloudChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    word_field: { type: String, required: true },
    weight: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildWordCloudData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        { word: props.word_field, weight: props.weight },
      );
      return h(DsWordCloudChart, {
        data: data as WordCloudChartWord[],
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        class: props.class as any,
      });
    };
  },
});
