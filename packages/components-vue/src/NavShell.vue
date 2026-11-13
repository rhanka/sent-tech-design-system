<script setup lang="ts">
import Drawer from './Drawer.vue';
import { classNames } from './classNames.js';

export type NavShellVariant = 'rail' | 'drawer';
export type NavShellSide = 'left' | 'right' | 'bottom';

export type NavShellProps = {
  variant?: NavShellVariant;
  title?: string;
  subtitle?: string;
  back?: boolean;
  backLabel?: string;
  label?: string;
  open?: boolean;
  side?: NavShellSide;
  class?: string;
};

defineOptions({ name: 'NavShell' });
const props = withDefaults(defineProps<NavShellProps>(), {
  variant: 'rail', title: undefined, subtitle: undefined, back: false, backLabel: 'Back',
  label: undefined, open: false, side: 'left', class: undefined,
});
const emit = defineEmits<{ back: []; close: [] }>();
</script>

<template>
  <Drawer
    v-if="props.variant === 'drawer'"
    :open="props.open"
    :title="props.title ?? props.label ?? 'Navigation'"
    :placement="props.side"
    :class="classNames('st-navShell st-navShell--drawer', props.class)"
    @close="emit('close')"
  >
    <header v-if="props.back || props.title || props.subtitle" class="st-navShell__header">
      <button v-if="props.back" type="button" class="st-navShell__back" :aria-label="props.backLabel" @click="emit('back')">←</button>
      <div v-if="props.title || props.subtitle" class="st-navShell__heading">
        <p v-if="props.title" class="st-navShell__title">{{ props.title }}</p>
        <p v-if="props.subtitle" class="st-navShell__subtitle">{{ props.subtitle }}</p>
      </div>
    </header>
    <div v-if="$slots.search" class="st-navShell__search"><slot name="search" /></div>
    <div class="st-navShell__body"><slot /></div>
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </Drawer>
  <aside
    v-else
    :class="classNames('st-navShell st-navShell--rail', props.class)"
    :aria-label="props.label ?? props.title"
  >
    <header v-if="props.back || props.title || props.subtitle" class="st-navShell__header">
      <button v-if="props.back" type="button" class="st-navShell__back" :aria-label="props.backLabel" @click="emit('back')">←</button>
      <div v-if="props.title || props.subtitle" class="st-navShell__heading">
        <p v-if="props.title" class="st-navShell__title">{{ props.title }}</p>
        <p v-if="props.subtitle" class="st-navShell__subtitle">{{ props.subtitle }}</p>
      </div>
    </header>
    <div v-if="$slots.search" class="st-navShell__search"><slot name="search" /></div>
    <div class="st-navShell__body"><slot /></div>
    <footer v-if="$slots.footer" class="st-navShell__footer"><slot name="footer" /></footer>
  </aside>
</template>
