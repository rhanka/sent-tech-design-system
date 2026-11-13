<script setup lang="ts">
import { classNames } from './classNames.js';

export type SkipLinkProps = {
  href?: string;
  class?: string;
};

defineOptions({ name: 'SkipLink', inheritAttrs: false });
const props = withDefaults(defineProps<SkipLinkProps>(), {
  href: '#main', class: undefined,
});
</script>

<template>
  <a v-bind="{ ...($attrs), class: (classNames('st-skipLink', props.class)) }" :href="props.href" >
    <slot v-if="$slots.default" />
    <template v-else>Skip to content</template>
  </a>
</template>
