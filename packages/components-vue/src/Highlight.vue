<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { classNames } from './classNames.js';

export type HighlightTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export type HighlightProps = {
  tone?: HighlightTone;
  title?: string | number;
  class?: string;
};

defineOptions({ name: 'Highlight', inheritAttrs: false });
const props = withDefaults(defineProps<HighlightProps>(), {
  tone: 'neutral', title: undefined, class: undefined,
});
defineSlots<{ title?: () => unknown; default?: () => unknown }>();
</script>

<template>
  <aside v-bind="{ ...($attrs), class: (classNames('st-highlight', `st-highlight--${props.tone}`, props.class)) }" >
    <h3 v-if="$slots.title || props.title" class="st-highlight__title"><template v-if="$slots.title"><slot name="title" /></template><template v-else>{{ scalarContent(props.title) }}</template></h3>
    <div class="st-highlight__body"><slot /></div>
  </aside>
</template>
