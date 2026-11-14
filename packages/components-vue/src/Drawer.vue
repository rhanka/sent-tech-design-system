<script setup lang="ts">
import { onUnmounted, useAttrs, watch } from 'vue';
import { classNames } from './classNames.js';

export type DrawerPlacement = 'left' | 'right' | 'bottom';

export type DrawerProps = {
  open?: boolean;
  title?: string;
  description?: string;
  placement?: DrawerPlacement;
  class?: string;
  closeLabel?: string;
};

defineOptions({ name: 'Drawer', inheritAttrs: false });
const props = withDefaults(defineProps<DrawerProps>(), {
  open: false,
  title: undefined,
  description: undefined,
  placement: 'right',
  class: undefined,
  closeLabel: 'Close',
});
const emit = defineEmits<{ close: [] }>();
defineSlots<{
  default?: () => unknown;
  footer?: () => unknown;
}>();

const attrs = useAttrs();
const asideProps = () => {
  const { style: rawStyle, ...rest } = attrs;
  return {
    ...rest,
    ...(rawStyle !== undefined ? { style: rawStyle } : {}),
    class: classNames('st-drawer', `st-drawer--${props.placement}`, props.class),
    role: 'dialog',
    'aria-modal': true,
    'aria-label': props.title || (attrs['aria-labelledby'] ? undefined : (attrs['aria-label'] as string | undefined) ?? 'Drawer'),
    tabindex: -1,
  };
};

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
  }
};

let previousOverflow: string | undefined;
function cleanup() {
  if (typeof document === 'undefined' || previousOverflow === undefined) return;
  document.body.style.overflow = previousOverflow;
  previousOverflow = undefined;
  document.removeEventListener('keydown', onKeyDown);
}
watch(
  () => props.open,
  (open) => {
    if (typeof document === 'undefined') return;
    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKeyDown);
    } else {
      cleanup();
    }
  },
  { immediate: true },
);

onUnmounted(cleanup);

const onBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) emit('close');
};
const onCloseClick = () => emit('close');
</script>

<template>
  <div v-if="props.open" class="st-drawer__backdrop" data-testid="st-drawer-backdrop" role="presentation" @click="onBackdropClick">
    <aside v-bind="asideProps()">
      <div class="st-drawer__header">
        <h2 v-if="props.title" class="st-drawer__title">{{ props.title }}</h2>
        <button type="button" class="st-drawer__close" :aria-label="props.closeLabel" @click="onCloseClick">x</button>
      </div>
      <p v-if="props.description" class="st-drawer__description">{{ props.description }}</p>
      <div class="st-drawer__body"><slot /></div>
      <div v-if="$slots.footer" class="st-drawer__footer"><slot name="footer" /></div>
    </aside>
  </div>
</template>
