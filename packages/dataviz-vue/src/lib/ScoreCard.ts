import { defineComponent, h, type PropType } from 'vue';
import {
  KpiCard,
  type KpiCardDeltaFormat,
  type KpiCardFormat,
  type KpiCardSize,
  type KpiCardTone,
} from '@sentropic/design-system-vue';
import {
  buildKpiCards,
  type DashboardStore,
  type Row,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ScoreCardProps = {
  store: DashboardStore;
  viewId?: string;
  measure: string;
  label?: string;
  goal?: number;
  sparklineDimension?: string;
  comparisonData?: readonly Row[];
  format?: KpiCardFormat;
  deltaFormat?: KpiCardDeltaFormat;
  unit?: string;
  currency?: string;
  locale?: string;
  size?: KpiCardSize;
  tone?: KpiCardTone;
  class?: string;
};

function finite(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}

export const ScoreCard = defineComponent({
  name: 'ScoreCard',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    measure: { type: String, required: true },
    label: { type: String, default: undefined },
    goal: { type: Number, default: undefined },
    sparklineDimension: { type: String, default: undefined },
    comparisonData: { type: Array as unknown as PropType<readonly Row[]>, default: undefined },
    format: { type: String as PropType<KpiCardFormat>, default: undefined },
    deltaFormat: { type: String as PropType<KpiCardDeltaFormat>, default: 'percent' },
    unit: { type: String, default: undefined },
    currency: { type: String, default: undefined },
    locale: { type: String, default: undefined },
    size: { type: String as PropType<KpiCardSize>, default: undefined },
    tone: { type: String as PropType<KpiCardTone>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const [card] = buildKpiCards(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        [{ id: 'card', label: props.label, measure: props.measure, goal: props.goal, sparklineDimension: props.sparklineDimension }],
        { comparisonData: props.comparisonData },
      );
      return h(KpiCard, {
        value: card!.value,
        label: card!.label,
        delta: finite(props.deltaFormat === 'absolute' ? card!.delta : card!.deltaPercent),
        deltaFormat: props.deltaFormat,
        unit: props.unit,
        currency: props.currency,
        locale: props.locale,
        format: props.format,
        size: props.size,
        tone: props.tone,
        sparkline: card!.sparkline?.map((point) => point.value),
        class: props.class,
      });
    };
  },
});
