<script setup lang="ts">
import { scalarContent } from './slotContent.js';
export type MenuLabelProps = { label?: unknown };
defineOptions({ name: 'MenuLabel' });
const props = withDefaults(defineProps<MenuLabelProps>(), { label: undefined });
defineSlots<{ default?: () => unknown }>();


</script>

<template>
  <slot v-if="$slots.default" /><template v-else>{{ scalarContent(props.label) }}</template>
</template>
