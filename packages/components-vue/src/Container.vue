<script setup lang="ts">
import { classNames } from './classNames.js';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ContainerProps = {
  size?: ContainerSize;
  /** Apply horizontal padding using the spacing scale. */
  padding?: boolean;
  as?: string;
  class?: string;
};

defineOptions({ name: 'Container', inheritAttrs: false });
const props = withDefaults(defineProps<ContainerProps>(), {
  size: 'lg',
  padding: true,
  as: 'div',
  class: undefined,
});
</script>

<template>
  <component :is="props.as" v-bind="$attrs" :class="classNames('st-container', `st-container--${props.size}`, props.padding && 'st-container--padded', props.class)"><slot /></component>
</template>
