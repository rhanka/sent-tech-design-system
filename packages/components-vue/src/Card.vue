<script setup lang="ts">
import { classNames } from './classNames.js';

export type CardProps = {
  interactive?: boolean;
  class?: string;
};

defineOptions({ name: 'Card', inheritAttrs: false });
const props = withDefaults(defineProps<CardProps>(), {
  interactive: false,
  class: undefined,
});
</script>

<template>
  <section
    v-bind="{ ...($attrs), class: (classNames('st-card', props.interactive && 'st-card--interactive', props.class)) }"

  ><slot /></section>
</template>
