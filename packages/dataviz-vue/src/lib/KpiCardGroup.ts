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
  type KpiCardConfig,
  type Row,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type KpiCardGroupProps = {
  store: DashboardStore;
  viewId?: string;
  configs: KpiCardConfig[];
  comparisonData?: readonly Row[];
  format?: KpiCardFormat;
  deltaFormat?: KpiCardDeltaFormat;
  size?: KpiCardSize;
  tone?: KpiCardTone;
  class?: string;
};

function finite(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}

export const KpiCardGroup = defineComponent({
  name: 'KpiCardGroup',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    configs: { type: Array as unknown as PropType<KpiCardConfig[]>, required: true },
    comparisonData: { type: Array as unknown as PropType<readonly Row[]>, default: undefined },
    format: { type: String as PropType<KpiCardFormat>, default: undefined },
    deltaFormat: { type: String as PropType<KpiCardDeltaFormat>, default: 'percent' },
    size: { type: String as PropType<KpiCardSize>, default: undefined },
    tone: { type: String as PropType<KpiCardTone>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const cards = buildKpiCards(props.store.model, props.store.applyCrossfilter(props.viewId), props.configs, {
        comparisonData: props.comparisonData,
      });
      return h(
        'div',
        { class: props.class },
        cards.map((card) =>
          h(KpiCard, {
            key: card.id,
            value: card.value,
            label: card.label,
            delta: finite(props.deltaFormat === 'absolute' ? card.delta : card.deltaPercent),
            deltaFormat: props.deltaFormat,
            format: props.format,
            size: props.size,
            tone: props.tone,
            sparkline: card.sparkline?.map((point) => point.value),
          }),
        ),
      );
    };
  },
});
