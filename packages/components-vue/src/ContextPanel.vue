<script setup lang="ts">
import { classNames } from './classNames.js';

export type ContextPanelProps = {
  title?: string;
  subtitle?: string;
  label?: string;
  class?: string;
};

defineOptions({ name: 'ContextPanel', inheritAttrs: false });
const props = withDefaults(defineProps<ContextPanelProps>(), {
  title: undefined,
  subtitle: undefined,
  label: undefined,
  class: undefined,
});
defineSlots<{
  default?: () => unknown;
  actions?: () => unknown;
  footer?: () => unknown;
}>();
</script>

<template>
  <aside v-bind="{ ...($attrs), class: (classNames('st-contextPanel', props.class)) }"  :aria-label="props.label ?? props.title ?? 'Context panel'">
    <header v-if="props.title || props.subtitle || $slots.actions" class="st-contextPanel__header">
      <div class="st-contextPanel__heading">
        <h2 v-if="props.title" class="st-contextPanel__title">{{ props.title }}</h2>
        <p v-if="props.subtitle" class="st-contextPanel__subtitle">{{ props.subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="st-contextPanel__actions"><slot name="actions" /></div>
    </header>
    <div class="st-contextPanel__body"><slot /></div>
    <footer v-if="$slots.footer" class="st-contextPanel__footer"><slot name="footer" /></footer>
  </aside>
</template>
