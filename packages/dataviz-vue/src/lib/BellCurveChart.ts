import { defineComponent, h, type PropType } from 'vue';
import {
  BellCurveChart as DsBellCurveChart,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildBellCurveData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type BellCurveChartProps = {
  store: DashboardStore;
  viewId: string;
  measure: string;
  tone?: string;
  smooth?: boolean;
  intervals?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const BellCurveChart = defineComponent({
  name: 'BellCurveChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    measure: { type: String, required: true },
    tone: { type: String, default: undefined },
    smooth: { type: Boolean, default: undefined },
    intervals: { type: Number, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildBellCurveData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        { measure: props.measure },
      );
      return h(DsBellCurveChart, {
        data,
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        tone: props.tone as any,
        smooth: props.smooth as any,
        intervals: props.intervals as any,
        class: props.class as any,
      });
    };
  },
});
