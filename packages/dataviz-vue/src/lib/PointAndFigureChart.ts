import { defineComponent, h, type PropType } from 'vue';
import {
  PointAndFigureChart as DsPointAndFigureChart,
  type PointAndFigureChartDatum as DsPointAndFigureChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildPointAndFigureData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type PointAndFigureChartProps = {
  store: DashboardStore;
  viewId: string;
  date: string;
  close: string;
  boxSize?: number;
  reversal?: number;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

export const PointAndFigureChart = defineComponent({
  name: 'PointAndFigureChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    date: { type: String, required: true },
    close: { type: String, required: true },
    boxSize: { type: Number, default: undefined },
    reversal: { type: Number, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    size: { type: Number, default: undefined },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildPointAndFigureData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          date: props.date,
          close: props.close,
        },
      );
      return h(DsPointAndFigureChart, {
        data: data as DsPointAndFigureChartDatum[],
        boxSize: props.boxSize as any,
        reversal: props.reversal as any,
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        size: props.size as any,
        class: props.class as any,
      });
    };
  },
});
