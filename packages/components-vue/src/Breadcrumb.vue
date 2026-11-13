<script setup lang="ts">
import { classNames } from './classNames.js';
import { scalarContent } from './slotContent.js';

export interface BreadcrumbItem {

  /** @slot item-label */
  label?: string | number;
  href?: string;
  current?: boolean;
}

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  label?: string;
  class?: string;
};

defineOptions({ name: 'Breadcrumb', inheritAttrs: false });
const props = withDefaults(defineProps<BreadcrumbProps>(), {
  label: 'Breadcrumb',
  class: undefined,
});

defineSlots<{ 'item-label'?: (scope: { item: BreadcrumbItem; index: number }) => unknown }>();
</script>

<template>
  <nav
    v-bind="{ ...($attrs), class: (classNames('st-breadcrumb', props.class)) }"

    :aria-label="props.label"
  >
    <ol>
      <li v-for="(item, index) in props.items" :key="index">
        <a v-if="item.href && !item.current" :href="item.href"><slot name="item-label" :item="item" :index="index">{{ scalarContent(item.label) }}</slot></a>
        <span v-else :aria-current="item.current ? 'page' : undefined"><slot name="item-label" :item="item" :index="index">{{ scalarContent(item.label) }}</slot></span>
        <span v-if="index < props.items.length - 1" class="st-breadcrumb__separator">/</span>
      </li>
    </ol>
  </nav>
</template>
