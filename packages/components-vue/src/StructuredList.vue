<script setup lang="ts">
import { classNames } from './classNames.js';

export type StructuredListItem = {
  term?: unknown;
  label?: unknown;
  description?: unknown;
  value?: unknown;
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
</script>

<template>
  <dl
    v-bind="$attrs"
    :class="classNames(
      'st-structuredList',
      props.bordered && 'st-structuredList--bordered',
      props.class,
    )"
  >
    <div v-for="(item, index) in props.items" :key="index" class="st-structuredList__row">
      <dt class="st-structuredList__term">{{ item.term ?? item.label }}</dt>
      <dd class="st-structuredList__definition">{{ item.description ?? item.value }}</dd>
    </div>
  </dl>
</template>
