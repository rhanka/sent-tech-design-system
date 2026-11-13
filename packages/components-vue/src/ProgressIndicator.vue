<script setup lang="ts">
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
  label?: unknown;

  /** @slot item-description */
  description?: unknown;
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
          <svg v-if="itemStatus(item) === 'complete'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
          <svg v-else-if="itemStatus(item) === 'invalid'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
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
