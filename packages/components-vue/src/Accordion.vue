<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type AccordionItem = {
  id?: string;
  title: string;
  content: string | (() => unknown);
  disabled?: boolean;
};

export type AccordionAlign = 'start' | 'end';
export type AccordionSize = 'sm' | 'md' | 'lg';

export type AccordionProps = {
  items: AccordionItem[];
  openIds?: string[];
  defaultOpenIds?: string[];
  allowMultiple?: boolean;
  /** Svelte-canonical alias for `defaultOpenIds` (initially open item ids). */
  open?: string[];
  /** Svelte-canonical alias for `allowMultiple`. */
  multiple?: boolean;
  align?: AccordionAlign;
  size?: AccordionSize;
  class?: string;
};

defineOptions({ name: 'Accordion', inheritAttrs: false });
const props = withDefaults(defineProps<AccordionProps>(), {
  openIds: undefined,
  defaultOpenIds: undefined,
  allowMultiple: undefined,
  open: undefined,
  multiple: undefined,
  align: 'end',
  size: 'md',
  class: undefined,
});
const emit = defineEmits<{ change: [value: string[]] }>();

const localOpen = ref<string[]>(props.defaultOpenIds ?? props.open ?? []);
const open = computed(() => props.openIds ?? localOpen.value);
const allowMultiple = computed(() => props.allowMultiple ?? props.multiple ?? false);

function idFrom(item: { id?: string }, index: number, prefix: string): string {
  return item.id ?? `${prefix}-${index}`;
}

function toggle(id: string) {
  const next = open.value.includes(id)
    ? open.value.filter(v => v !== id)
    : allowMultiple.value
      ? [...open.value, id]
      : [id];
  if (props.openIds === undefined) {
    localOpen.value = next;
  }
  emit('change', next);
}

function contentText(item: AccordionItem): string {
  return typeof item.content === 'function' ? String(item.content()) : item.content;
}
</script>

<template>
  <div
    v-bind="$attrs"
    :class="classNames('st-accordion', `st-accordion--${props.size}`, `st-accordion--align-${props.align}`, props.class)"
  >
    <div
      v-for="(item, index) in props.items"
      :key="idFrom(item, index, 'accordion')"
      :class="classNames('st-accordion__item', open.includes(idFrom(item, index, 'accordion')) && 'st-accordion__item--open')"
    >
      <h3 class="st-accordion__heading">
        <button
          :id="`st-accordion-trigger-${idFrom(item, index, 'accordion')}`"
          type="button"
          class="st-accordion__trigger"
          :disabled="item.disabled"
          :aria-expanded="open.includes(idFrom(item, index, 'accordion'))"
          :aria-controls="`st-accordion-panel-${idFrom(item, index, 'accordion')}`"
          @click="toggle(idFrom(item, index, 'accordion'))"
        >
          <template v-if="props.align === 'start'">
            <span class="st-accordion__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></span>
            <span class="st-accordion__title">{{ item.title }}</span>
          </template>
          <template v-else>
            <span class="st-accordion__title">{{ item.title }}</span>
            <span class="st-accordion__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></span>
          </template>
        </button>
      </h3>
      <div
        v-if="open.includes(idFrom(item, index, 'accordion'))"
        class="st-accordion__panel"
        :id="`st-accordion-panel-${idFrom(item, index, 'accordion')}`"
        role="region"
        :aria-labelledby="`st-accordion-trigger-${idFrom(item, index, 'accordion')}`"
      >{{ contentText(item) }}</div>
    </div>
  </div>
</template>
