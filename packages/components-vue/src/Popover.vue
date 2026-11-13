<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';
import { classNames } from './classNames.js';

export type PopoverPlacement = 'top' | 'right' | 'bottom' | 'left';

export type PopoverProps = {
  content?: string;
  label?: string;
  open?: boolean;
  placement?: PopoverPlacement;
  class?: string;
};

defineOptions({ name: 'Popover', inheritAttrs: false });
const props = withDefaults(defineProps<PopoverProps>(), {
  content: undefined, label: undefined, open: undefined, placement: 'bottom', class: undefined,
});
const emit = defineEmits<{ 'update:open': [value: boolean] }>();

const localOpen = ref(false);
const hostRef = ref<HTMLElement | null>(null);

const isOpen = () => (props.open !== undefined ? props.open : localOpen.value);

function setOpen(val: boolean) {
  if (props.open === undefined) localOpen.value = val;
  emit('update:open', val);
}

function onMouseDown(event: MouseEvent) {
  const target = event.target as Node | null;
  if (target && hostRef.value && !hostRef.value.contains(target)) setOpen(false);
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    setOpen(false);
  }
}

watch(
  () => isOpen(),
  (open) => {
    if (open) {
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('keydown', onKeyDown);
    } else {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    }
  },
);

onUnmounted(() => {
  document.removeEventListener('mousedown', onMouseDown);
  document.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <span v-bind="$attrs" ref="hostRef" :class="classNames('st-popover-host', props.class)" @click="setOpen(true)">
    <slot v-if="$slots.trigger" name="trigger" />
    <slot v-else />
    <section
      v-if="isOpen()"
      :class="classNames('st-popover', `st-popover--${props.placement}`)"
      role="dialog"
      :aria-label="props.label ?? props.content ?? 'Popover'"
    >
      <template v-if="props.content">{{ props.content }}</template>
      <slot v-else name="content" />
    </section>
  </span>
</template>
