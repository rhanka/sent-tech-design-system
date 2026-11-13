<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { classNames } from './classNames.js';

export type QuoteProps = {
  author?: unknown;
  source?: unknown;
  class?: string;
};

defineOptions({ name: 'Quote', inheritAttrs: false });
const props = withDefaults(defineProps<QuoteProps>(), {
  author: undefined, source: undefined, class: undefined,
});
defineSlots<{
default?: () => unknown;
  'source'?: () => unknown;
  'author'?: () => unknown;
}>();
</script>

<template>
  <blockquote v-bind="{ ...($attrs), class: (classNames('st-quote', props.class)) }" >
    <p class="st-quote__text"><slot /></p>
    <footer v-if="$slots.author || $slots.source || props.author || props.source" class="st-quote__attribution">
      <span v-if="$slots['author'] || props.author" class="st-quote__author"><slot v-if="$slots['author']" name="author" /><template v-else>{{ scalarContent(props.author) }}</template></span>
      <span v-if="$slots['source'] || props.source" class="st-quote__source"><slot v-if="$slots['source']" name="source" /><template v-else>{{ scalarContent(props.source) }}</template></span>
    </footer>
  </blockquote>
</template>
