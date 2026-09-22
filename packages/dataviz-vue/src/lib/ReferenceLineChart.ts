import { defineComponent, h, type PropType } from 'vue';
import { buildReferenceLineModel, type DashboardStore } from '@sentropic/dataviz-core';
import { LineChart, type LineChartDatum } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';

export type ReferenceLineChartProps = {
  store: DashboardStore;
  viewId: string;
  value?: number;
  measure?: string;
  referenceId?: string;
  referenceLabel?: string;
  domainMin?: number;
  domainMax?: number;
  width?: number;
  height?: number;
  label: string;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

function xDomain(value: number, domainMin: number | undefined, domainMax: number | undefined): [number, number] {
  const min = domainMin ?? Math.min(0, value);
  const max = domainMax ?? Math.max(1, value);
  return min < max ? [min, max] : [min, min + 1];
}

export const ReferenceLineChart = defineComponent({
  name: 'ReferenceLineChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    value: { type: Number, default: undefined },
    measure: { type: String, default: undefined },
    referenceId: { type: String, default: undefined },
    referenceLabel: { type: String, default: undefined },
    domainMin: { type: Number, default: undefined },
    domainMax: { type: Number, default: undefined },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 96 },
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
      const model = buildReferenceLineModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        id: props.referenceId,
        label: props.referenceLabel,
        value: props.value,
        measure: props.measure,
      });
      const [min, max] = xDomain(model.value, props.domainMin, props.domainMax);
      const data: LineChartDatum[] = [
        { x: min, y: 0 },
        { x: max, y: 0 },
      ];

      return h(LineChart, {
        data,
        width: props.width,
        height: props.height,
        label: props.label,
        referenceLines: [{ axis: 'x', value: model.value, label: model.label, tone: 'info' }],
        hoverKey: props.hoverKey,
        onHoverKeyChange: props.onHoverKeyChange,
        onSelectKey: props.onSelectKey,
        class: ['st-referenceLineChart', props.class].filter(Boolean).join(' '),
      });
    };
  },
});
