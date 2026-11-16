<script setup lang="ts">
import Icon from './Icon.vue';
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { scalarContent } from './slotContent.js';

export type AccordionItem = {
  id?: string;
  title: string;
  /** @slot item-content */
  content?: string | number | (() => string | number);
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
defineSlots<{ 'item-content'?: (scope: { item: AccordionItem; index: number }) => unknown }>();

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

function contentText(item: AccordionItem): string | number {
  return scalarContent(typeof item.content === 'function' ? item.content() : item.content);
}
</script>

<template>
  <div
    v-bind="{ ...($attrs), class: (classNames('st-accordion', `st-accordion--${props.size}`, `st-accordion--align-${props.align}`, props.class)) }"

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
            <span class="st-accordion__icon" aria-hidden="true"><Icon name="chevron-down" :size="18" /></span>
            <span class="st-accordion__title">{{ item.title }}</span>
          </template>
          <template v-else>
            <span class="st-accordion__title">{{ item.title }}</span>
            <span class="st-accordion__icon" aria-hidden="true"><Icon name="chevron-down" :size="18" /></span>
          </template>
        </button>
      </h3>
      <div
        v-if="open.includes(idFrom(item, index, 'accordion'))"
        class="st-accordion__panel"
        :id="`st-accordion-panel-${idFrom(item, index, 'accordion')}`"
        role="region"
        :aria-labelledby="`st-accordion-trigger-${idFrom(item, index, 'accordion')}`"
      ><slot name="item-content" :item="item" :index="index">{{ contentText(item) }}</slot></div>
    </div>
  </div>
</template>
