<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { classNames } from './classNames.js';

export type TimelineTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type TimelineOrientation = 'vertical' | 'horizontal';

export type TimelineItem = {
  title: string;
  meta?: string;
  description?: string;
  tone?: TimelineTone;
};

export type TimelineProps = {
  items: TimelineItem[];
  orientation?: TimelineOrientation;
  class?: string;
};

/**
 * Timeline — liste d'événements datés reliés par une ligne de connexion (façon
 * Ant Design / MUI Timeline). Sémantique <ol>/<li>, pastilles aria-hidden, style
 * token-only. Distinct de TimelineChart (dataviz à échelle temporelle).
 */
defineOptions({ name: 'Timeline' });
const props = withDefaults(defineProps<TimelineProps>(), {
  orientation: 'vertical', class: undefined,
});

const attrs = useAttrs();
const orientation = computed(() => props.orientation ?? 'vertical');
const items = computed(() => Array.isArray(props.items) ? props.items : []);
const rootProps = computed(() => ({
  ...attrs,
  class: classNames('st-timeline', `st-timeline--${orientation.value}`, props.class),
}));
</script>

<template>
  <ol v-bind="rootProps">
    <li v-for="(item, i) in items" :key="i" :class="classNames('st-timeline__item', `st-timeline__item--${item.tone ?? 'neutral'}`)">
      <span class="st-timeline__rail" aria-hidden="true"><span class="st-timeline__dot" /><span class="st-timeline__line" /></span>
      <div class="st-timeline__content">
        <span v-if="item.meta" class="st-timeline__meta">{{ item.meta }}</span>
        <span class="st-timeline__title">{{ item.title }}</span>
        <span v-if="item.description" class="st-timeline__description">{{ item.description }}</span>
      </div>
    </li>
  </ol>
</template>
