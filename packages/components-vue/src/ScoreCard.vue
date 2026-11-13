<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type ScoreCardType = 'value' | 'complexity';
export type ScoreCardSize = 'sm' | 'md' | 'lg';

export type ScoreCardProps = {
  title: string;
  score: number;
  stars: number;
  max?: number;
  type?: ScoreCardType;
  unit?: string;
  size?: ScoreCardSize;
  class?: string;
};

const STAR_PATH =
  'm7 1.5 1.7 3.45 3.8.55-2.75 2.68.65 3.79L7 10.18 3.6 11.96l.65-3.79L1.5 5.5l3.8-.55L7 1.5Z';
const CROSS_PATH = 'M3.5 3.5l7 7M10.5 3.5l-7 7';

defineOptions({ name: 'ScoreCard', inheritAttrs: false });
const props = withDefaults(defineProps<ScoreCardProps>(), {
  max: 5, type: 'value', unit: 'points', size: 'md', class: undefined,
});

const max = computed(() => props.max ?? 5);
const symbols = computed(() => Array.from({ length: max.value }, (_unused, i) => i));
const filled = computed(() => Math.max(0, Math.min(max.value, Math.round(props.stars))));
const ariaLabel = computed(
  () => `${props.title}, ${props.score.toFixed(1)} ${props.unit ?? 'points'}, ${filled.value} sur ${max.value}`,
);
</script>

<template>
  <article
    v-bind="{ ...($attrs), class: (classNames('st-scoreCard', `st-scoreCard--${props.size ?? 'md'}`, `st-scoreCard--${props.type ?? 'value'}`, props.class)) }"

    role="group"
    :aria-label="ariaLabel"
  >
    <h3 class="st-scoreCard__title">{{ props.title }}</h3>
    <div class="st-scoreCard__row">
      <div class="st-scoreCard__symbols" aria-hidden="true">
        <svg
          v-for="i in symbols"
          :key="i"
          :class="classNames('st-scoreCard__symbol', i < filled ? 'st-scoreCard__symbol--on' : 'st-scoreCard__symbol--off')"
          width="20"
          height="20"
          viewBox="0 0 14 14"
          focusable="false"
        >
          <path
            v-if="(props.type ?? 'value') === 'value'"
            :d="STAR_PATH"
            :fill="i < filled ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="1"
            stroke-linejoin="round"
          />
          <path
            v-else
            :d="CROSS_PATH"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <span class="st-scoreCard__score">{{ `${props.score.toFixed(1)} ${props.unit ?? 'points'}` }}</span>
    </div>
  </article>
</template>
