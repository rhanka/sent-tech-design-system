<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type FieldCardVariant = 'plain' | 'bordered' | 'accent';
export type FieldCardTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type FieldCardProps = {
  label: string;
  variant?: FieldCardVariant;
  tone?: FieldCardTone;
  commentCount?: number;
  onOpenComments?: () => void;
  class?: string;
};

const COMMENT_PATH =
  'M2.5 4.25A1.25 1.25 0 0 1 3.75 3h8.5A1.25 1.25 0 0 1 13.5 4.25v5A1.25 1.25 0 0 1 12.25 10.5H6.5L3.5 13v-2.5h-.75A.25.25 0 0 1 2.5 10.25v-6Z';

defineOptions({ name: 'FieldCard', inheritAttrs: false });
const props = withDefaults(defineProps<FieldCardProps>(), {
  variant: 'bordered',
  tone: undefined,
  commentCount: 0,
  onOpenComments: undefined,
  class: undefined,
});
defineSlots<{ default?: () => unknown }>();

const variant = computed(() => props.variant ?? 'bordered');
const showBadge = computed(() => props.commentCount > 0 || !!props.onOpenComments);

const onOpenClicked = () => props.onOpenComments?.();
</script>

<template>
  <section v-bind="{ ...($attrs), class: (classNames('st-fieldCard', `st-fieldCard--${variant}`, variant === 'accent' && props.tone && `st-fieldCard--${props.tone}`, props.class)) }" >
    <header class="st-fieldCard__header">
      <h3 class="st-fieldCard__label">{{ props.label }}</h3>
      <template v-if="showBadge">
        <button v-if="props.onOpenComments" type="button" class="st-fieldCard__comments" :aria-label="`Commentaires (${props.commentCount})`" @click="onOpenClicked">
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path :d="COMMENT_PATH" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          <span v-if="props.commentCount > 0" class="st-fieldCard__commentCount">{{ String(props.commentCount) }}</span>
        </button>
        <span v-else class="st-fieldCard__comments st-fieldCard__comments--static">
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path :d="COMMENT_PATH" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          <span class="st-fieldCard__commentCount">{{ String(props.commentCount) }}</span>
        </span>
      </template>
    </header>
    <div class="st-fieldCard__body"><slot /></div>
  </section>
</template>
