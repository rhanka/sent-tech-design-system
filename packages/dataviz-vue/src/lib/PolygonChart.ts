import { defineComponent, h, type PropType } from 'vue';
import {
  PolygonChart as DsPolygonChart,
  type PolygonChartPoint,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildPolygonData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type PolygonChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  tone?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const PolygonChart = defineComponent({
  name: 'PolygonChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    x: { type: String, required: true },
    y: { type: String, required: true },
    tone: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildPolygonData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        { x: props.x, y: props.y },
      );
      return h(DsPolygonChart, {
        data: data as PolygonChartPoint[],
        label: props.label,
        tone: props.tone as any,
        width: props.width as any,
        height: props.height as any,
        class: props.class as any,
      });
    };
  },
});
