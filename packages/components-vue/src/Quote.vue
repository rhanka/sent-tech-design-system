<script setup lang="ts">
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
</script>

<template>
  <blockquote v-bind="$attrs" :class="classNames('st-quote', props.class)">
    <p class="st-quote__text"><slot /></p>
    <footer v-if="props.author || props.source" class="st-quote__attribution">
      <span v-if="props.author" class="st-quote__author">{{ props.author }}</span>
      <span v-if="props.source" class="st-quote__source">{{ props.source }}</span>
    </footer>
  </blockquote>
</template>
