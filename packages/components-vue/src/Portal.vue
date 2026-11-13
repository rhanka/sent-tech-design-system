<script setup lang="ts">
import type { PropType } from 'vue';
import { classNames } from './classNames.js';
defineOptions({ name: 'Portal' });
const props = defineProps({
  target: { type: [String, Object] as PropType<string | HTMLElement>, default: 'body' },
  disabled: { type: Boolean, default: false },
  class: { type: String, default: undefined },
});
</script>

<template>
  <Teleport :to="props.target" :disabled="props.disabled">
    <div :class="classNames('st-portal', props.class)" :data-st-portal="props.disabled ? 'inline' : 'teleported'"><slot /></div>
  </Teleport>
</template>
