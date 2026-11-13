<script setup lang="ts">
import { computed, useId } from 'vue';
import { classNames } from './classNames.js';

export type EventFeedPanelSeverity = 'info' | 'success' | 'warning' | 'error' | (string & {});

export type EventFeedPanelEvent = {
  /** Horodatage en millisecondes epoch (ou tout nombre croissant). */
  at: number;
  /** Catégorie libre de l'événement (« deploy », « alert »…). */
  type: string;
  /** Sévérité : pilote la couleur/pastille (sémantique feedback). */
  severity: EventFeedPanelSeverity;
  /** Message principal affiché. */
  message: string;
};

export type EventFeedPanelProps = {
  data: EventFeedPanelEvent[];
  label?: string;
  maxHeight?: number;
  height?: number;
  class?: string;
};

const KNOWN_SEVERITIES = ['info', 'success', 'warning', 'error'];

const severityTone = (severity: string): string =>
  KNOWN_SEVERITIES.includes(severity) ? severity : 'neutral';

const formatTime = (at: number): string => {
  if (!Number.isFinite(at)) return '';
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return String(at);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

defineOptions({ name: 'EventFeedPanel', inheritAttrs: false });
const props = withDefaults(defineProps<EventFeedPanelProps>(), {
  data: () => [],
  label: undefined,
  maxHeight: undefined,
  height: undefined,
  class: undefined,
});

const items = computed(() =>
  (props.data ?? [])
    .filter((d) => d && Number.isFinite(d.at) && typeof d.message === 'string')
    .map((d, index) => ({
      index,
      datum: d,
      tone: severityTone(String(d.severity)),
      time: formatTime(d.at),
    }))
    .sort((a, b) => b.datum.at - a.datum.at),
);

const resolvedMaxHeight = computed(() => props.maxHeight ?? props.height);
const labelId = `st-eventFeedPanel-${useId()}-label`;
const scrollStyle = computed(() =>
  typeof resolvedMaxHeight.value === 'number' && Number.isFinite(resolvedMaxHeight.value)
    ? { maxHeight: `${resolvedMaxHeight.value}px` }
    : undefined,
);
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-eventFeedPanel', props.class)) }" >
    <p v-if="props.label" class="st-eventFeedPanel__label" :id="labelId">{{ props.label }}</p>
    <ul class="st-eventFeedPanel__list" role="feed" :aria-label="props.label" aria-busy="false" :style="scrollStyle">
      <li v-for="item in items" :key="item.index" :class="classNames('st-eventFeedPanel__item', `st-eventFeedPanel__item--${item.tone}`)" role="article" :aria-label="`${item.datum.type} — ${item.datum.message}`">
        <span :class="classNames('st-eventFeedPanel__badge', `st-eventFeedPanel__badge--${item.tone}`)" aria-hidden="true"></span>
        <div class="st-eventFeedPanel__body">
          <div class="st-eventFeedPanel__meta">
            <span class="st-eventFeedPanel__type">{{ item.datum.type }}</span>
            <time class="st-eventFeedPanel__time">{{ item.time }}</time>
          </div>
          <p class="st-eventFeedPanel__message">{{ item.datum.message }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>
