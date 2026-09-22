import { defineComponent, h, type PropType } from 'vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { LineChart } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';
import { buildForecastLineData } from './analyticsDsData.js';

export type ForecastLineChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  periods: number;
  step?: number;
  width?: number;
  height?: number;
  label: string;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

export const ForecastLineChart = defineComponent({
  name: 'ForecastLineChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    x: { type: String, required: true },
    y: { type: String, required: true },
    periods: { type: Number, required: true },
    step: { type: Number, default: undefined },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 220 },
    label: { type: String, required: true },
    hoverKey: { type: [String, null] as unknown as PropType<string | null>, default: undefined },
    onHoverKeyChange: { type: Function as PropType<(key: string | null) => void>, default: undefined },
    onSelectKey: { type: Function as PropType<(key: string | null) => void>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildForecastLineData(props.store.model, props.store.applyCrossfilter(props.viewId), {
        x: props.x,
        y: props.y,
        periods: props.periods,
        step: props.step,
      });

      return h(LineChart, {
        data,
        width: props.width,
        height: props.height,
        label: props.label,
        hoverKey: props.hoverKey,
        onHoverKeyChange: props.onHoverKeyChange,
        onSelectKey: props.onSelectKey,
        class: ['st-forecastLineChart', props.class].filter(Boolean).join(' '),
      });
    };
  },
});
