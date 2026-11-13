<script setup lang="ts">
import { computed } from 'vue';
import {
  EventFeedPanel as DsEventFeedPanel,
  type EventFeedPanelEvent as DsEventFeedPanelEvent,
} from '@sentropic/design-system-vue';
import { buildEventFeedData, type DashboardStore } from '@sentropic/dataviz-core';
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

defineOptions({ name: 'EventFeedPanel' });
const props = withDefaults(defineProps<EventFeedPanelProps>(), {
  maxHeight: undefined, height: undefined, label: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<DsEventFeedPanelEvent[]>(() => {
  void state.value;
  return buildEventFeedData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      at: props.at,
      type: props.type,
      severity: props.severity,
      message: props.message,
    },
  ) as DsEventFeedPanelEvent[];
});
</script>

<template>
  <DsEventFeedPanel :data="data" :label="props.label" :max-height="props.maxHeight" :height="props.height" :class="props.class" />
</template>
