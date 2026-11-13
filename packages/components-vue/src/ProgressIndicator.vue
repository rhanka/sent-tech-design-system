<script setup lang="ts">
import Icon from './Icon.vue';
import { scalarContent } from './slotContent.js';
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type ProgressIndicatorStatus =
  | 'complete'
  | 'current'
  | 'upcoming'
  | 'disabled'
  | 'invalid'
  | 'incomplete';

export interface ProgressIndicatorItem {
  id?: string;
  /** Svelte-canonical alias for the React/Vue `id`. */
  value?: string;

  /** @slot item-label */
  label?: string | number;

  /** @slot item-description */
  description?: string | number;
  status?: ProgressIndicatorStatus;
}

export type ProgressIndicatorOrientation = 'horizontal' | 'vertical';

export type ProgressIndicatorProps = {
  items: ProgressIndicatorItem[];
  orientation?: ProgressIndicatorOrientation;
  /** Svelte-canonical alias: `vertical` sets `orientation="vertical"`. */
  vertical?: boolean;
  label?: string;
  class?: string;
};

defineOptions({ name: 'ProgressIndicator', inheritAttrs: false });
const props = withDefaults(defineProps<ProgressIndicatorProps>(), {
  orientation: 'horizontal', vertical: false, label: 'Progress', class: undefined,
});

const resolvedOrientation = computed(() => (props.vertical ? 'vertical' : props.orientation));

function itemStatus(item: ProgressIndicatorItem): ProgressIndicatorStatus {
  return item.status ?? 'upcoming';
}
defineSlots<{
  'item-description'?: (scope: { item: ProgressIndicatorItem; index: number }) => unknown;
  'item-label'?: (scope: { item: ProgressIndicatorItem; index: number }) => unknown;
}>();
</script>

<template>
  <ol
    v-bind="{ ...($attrs), class: (classNames('st-progressIndicator', `st-progressIndicator--${resolvedOrientation}`, props.class)) }"
    :aria-label="props.label"

  >
    <li
      v-for="(item, index) in props.items"
      :key="item.id ?? item.value ?? index"
      :class="classNames('st-progressIndicator__step', `st-progressIndicator__step--${itemStatus(item)}`)"
      :aria-current="itemStatus(item) === 'current' ? 'step' : undefined"
    >
      <span class="st-progressIndicator__indicator">
        <span class="st-progressIndicator__circle">
          <Icon v-if="itemStatus(item) === 'complete'" name="check" :size="14" />
          <Icon v-else-if="itemStatus(item) === 'invalid'" name="x" :size="14" />
          <span v-else-if="itemStatus(item) === 'current'" class="st-progressIndicator__dot" />
          <span v-else class="st-progressIndicator__index">{{ String(index + 1) }}</span>
        </span>
        <span v-if="index !== props.items.length - 1" class="st-progressIndicator__connector" />
      </span>
      <span class="st-progressIndicator__text">
        <span class="st-progressIndicator__label"><slot v-if="$slots['item-label']" name="item-label" :item="item" :index="index" /><template v-else>{{ scalarContent(item.label) }}</template></span>
        <span v-if="$slots['item-description'] || item.description" class="st-progressIndicator__description"><slot v-if="$slots['item-description']" name="item-description" :item="item" :index="index" /><template v-else>{{ scalarContent(item.description) }}</template></span>
      </span>
    </li>
  </ol>
</template>
