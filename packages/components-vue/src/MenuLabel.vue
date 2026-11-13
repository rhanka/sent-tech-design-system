<script setup lang="ts">
import { scalarContent } from './slotContent.js';
export type MenuLabelProps = { label?: unknown };
defineOptions({ name: 'MenuLabel' });
const props = withDefaults(defineProps<MenuLabelProps>(), { label: undefined });
defineSlots<{ label?: () => unknown; default?: () => unknown }>();


</script>

<template>
  <slot name="label"><slot>{{ scalarContent(props.label) }}</slot></slot>
</template>
