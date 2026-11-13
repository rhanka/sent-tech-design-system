<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { classNames } from './classNames.js';

export interface TableOfContentsItem {
  id: string;
  label: string;
  level?: number;
}

export type TableOfContentsProps = {
  title?: string;
  items: TableOfContentsItem[];
  activeId?: string;
  class?: string;
};

const normalizeItemId = (value: string) => value.replace(/^#/, '');

defineOptions({ name: 'TableOfContents' });
const props = withDefaults(defineProps<TableOfContentsProps>(), {
  title: undefined, activeId: '', class: undefined,
});

const attrs = useAttrs();
const navProps = computed(() => ({
  ...attrs,
  class: classNames('st-tableOfContents', props.class),
  'aria-label': props.title ?? 'Table des matières',
}));
const normalizedActive = computed(() => normalizeItemId(props.activeId));
const normalizedItems = computed(() => props.items.map(item => ({
  ...item,
  id: normalizeItemId(item.id),
  level: Math.max(item.level ?? 1, 1),
})));
</script>

<template>
  <nav v-bind="navProps">
    <p v-if="props.title" class="st-tableOfContents__title">{{ props.title }}</p>
    <ol class="st-tableOfContents__list">
      <li v-for="item in normalizedItems" :key="item.id" class="st-tableOfContents__item" :style="{ '--st-tableOfContents-level': String(item.level - 1) }">
        <a class="st-tableOfContents__link" :href="`#${item.id}`" :aria-current="item.id === normalizedActive ? 'location' : undefined">{{ item.label }}</a>
      </li>
    </ol>
  </nav>
</template>
