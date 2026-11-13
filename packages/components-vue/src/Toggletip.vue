<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { computed, onUnmounted, ref, watch } from 'vue';
import { classNames } from './classNames.js';

export type ToggletipPlacement = 'top' | 'bottom' | 'start' | 'end';

export type ToggletipProps = {
  label?: unknown;
  content?: unknown;
  open?: boolean;
  placement?: ToggletipPlacement;
  class?: string;
};

defineOptions({ name: 'Toggletip', inheritAttrs: false });
const props = withDefaults(defineProps<ToggletipProps>(), {
  content: undefined, open: undefined, placement: 'top', class: undefined,
});
const emit = defineEmits<{ 'update:open': [open: boolean] }>();
defineSlots<{
  default?: () => unknown;
  label?: () => unknown;
  content?: () => unknown;
}>();

const localOpen = ref(false);

const open = computed(() => (props.open !== undefined ? props.open : localOpen.value));

function setOpen(val: boolean) {
  if (props.open === undefined) localOpen.value = val;
  emit('update:open', val);
}

function toggle() {
  setOpen(!open.value);
}

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    setOpen(false);
  }
};

watch(
  open,
  (isOpen) => {
    if (isOpen) document.addEventListener('keydown', onKeyDown);
    else document.removeEventListener('keydown', onKeyDown);
  },
);

onUnmounted(() => document.removeEventListener('keydown', onKeyDown));
</script>

<template>
  <span v-bind="{ ...($attrs), class: (classNames('st-toggletip', `st-toggletip--${props.placement}`, props.class)) }" >
    <button type="button" class="st-toggletip__trigger" :aria-expanded="open" @click="toggle"><template v-if="$slots.label"><slot name="label" /></template><template v-else>{{ scalarContent(props.label) }}</template></button>
    <span v-if="open" class="st-toggletip__bubble" role="status">
      <span class="st-toggletip__content"><template v-if="$slots.content"><slot name="content" /></template><template v-else-if="props.content != null">{{ scalarContent(props.content) }}</template><template v-else><slot /></template></span>
    </span>
  </span>
</template>
