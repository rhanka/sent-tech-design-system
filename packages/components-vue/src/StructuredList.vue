<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { classNames } from './classNames.js';

export type StructuredListItem = {
  term?: string | number;

  /** @slot term */
  label?: string | number;

  /** @slot definition */
  description?: string | number;

  /** @slot definition */
  value?: string | number;
};

export type StructuredListProps = {
  items: StructuredListItem[];
  bordered?: boolean;
  class?: string;
};

defineOptions({ name: 'StructuredList', inheritAttrs: false });
const props = withDefaults(defineProps<StructuredListProps>(), {
  bordered: false, class: undefined,
});
defineSlots<{
  'definition'?: (scope: { item: StructuredListItem; index: number }) => unknown;
  'term'?: (scope: { item: StructuredListItem; index: number }) => unknown;
}>();
</script>

<template>
  <dl
    v-bind="{ ...($attrs), class: (classNames(
      'st-structuredList',
      props.bordered && 'st-structuredList--bordered',
      props.class,
    )) }"

  >
    <div v-for="(item, index) in props.items" :key="index" class="st-structuredList__row">
      <dt class="st-structuredList__term"><slot v-if="$slots['term']" name="term" :item="item" :index="index" /><template v-else>{{ scalarContent(item.term ?? item.label) }}</template></dt>
      <dd class="st-structuredList__definition"><slot v-if="$slots['definition']" name="definition" :item="item" :index="index" /><template v-else>{{ scalarContent(item.description ?? item.value) }}</template></dd>
    </div>
  </dl>
</template>
