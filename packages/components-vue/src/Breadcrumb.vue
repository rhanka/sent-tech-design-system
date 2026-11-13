<script setup lang="ts">
import { classNames } from './classNames.js';

export interface BreadcrumbItem {
  label: unknown;
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

function labelText(item: BreadcrumbItem): string {
  return item.label as string;
}
</script>

<template>
  <nav
    v-bind="{ ...($attrs), class: (classNames('st-breadcrumb', props.class)) }"

    :aria-label="props.label"
  >
    <ol>
      <li v-for="(item, index) in props.items" :key="index">
        <a v-if="item.href && !item.current" :href="item.href">{{ labelText(item) }}</a>
        <span v-else :aria-current="item.current ? 'page' : undefined">{{ labelText(item) }}</span>
        <span v-if="index < props.items.length - 1" class="st-breadcrumb__separator">/</span>
      </li>
    </ol>
  </nav>
</template>
