<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type ContentSwitcherSize = 'sm' | 'md' | 'lg';

export type ContentSwitcherItem = {
  id?: string;
  value?: string;
  label: unknown;
  disabled?: boolean;
};

// In addition to the Vue-native `@change` emit (which already routes to an
// `onChange` listener), an `onchange` callback prop (Svelte-canonical,
// lowercase) is accepted and fired on change.
export type ContentSwitcherProps = {
  items: ContentSwitcherItem[];
  value?: string;
  activeId?: string;
  size?: ContentSwitcherSize;
  onchange?: (value: string) => void;
  class?: string;
};

function idFrom(
  item: { id?: string; value?: string },
  index: number,
  prefix: string,
): string {
  return item.id ?? item.value ?? `${prefix}-${index}`;
}

defineOptions({ name: 'ContentSwitcher', inheritAttrs: false });
const props = withDefaults(defineProps<ContentSwitcherProps>(), {
  value: undefined,
  activeId: undefined,
  size: 'md',
  onchange: undefined,
  class: undefined,
});
const emit = defineEmits<{ change: [value: string] }>();

const current = computed(() =>
  props.value ??
  props.activeId ??
  idFrom(props.items[0] ?? {}, 0, 'content'),
);

function itemId(item: ContentSwitcherItem, index: number): string {
  return idFrom(item, index, 'content');
}
function onClick(item: ContentSwitcherItem, index: number) {
  const id = idFrom(item, index, 'content');
  emit('change', id);
  props.onchange?.(id);
}
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-contentSwitcher', `st-contentSwitcher--${props.size}`, props.class)" role="group">
    <button v-for="(item, index) in props.items" :key="itemId(item, index)" type="button" :class="classNames('st-contentSwitcher__option st-contentSwitcher__button', itemId(item, index) === current && 'st-contentSwitcher__option--selected')" :disabled="item.disabled" :aria-pressed="itemId(item, index) === current" @click="onClick(item, index)">{{ item.label }}</button>
  </div>
</template>
