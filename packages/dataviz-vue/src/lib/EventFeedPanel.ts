import { defineComponent, h, type PropType } from 'vue';
import {
  EventFeedPanel as DsEventFeedPanel,
  type EventFeedPanelEvent as DsEventFeedPanelEvent,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildEventFeedData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type EventFeedPanelProps = {
  store: DashboardStore;
  viewId: string;
  at: string;
  type: string;
  severity: string;
  message: string;
  maxHeight?: number;
  height?: number;
  label?: string;
  class?: string;
};

export const EventFeedPanel = defineComponent({
  name: 'EventFeedPanel',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    at: { type: String, required: true },
    type: { type: String, required: true },
    severity: { type: String, required: true },
    message: { type: String, required: true },
    maxHeight: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildEventFeedData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          at: props.at,
          type: props.type,
          severity: props.severity,
          message: props.message,
        },
      );
      return h(DsEventFeedPanel, {
        data: data as DsEventFeedPanelEvent[],
        label: props.label,
        maxHeight: props.maxHeight as any,
        height: props.height as any,
        class: props.class as any,
      });
    };
  },
});
