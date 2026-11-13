<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { nextCollapsibleUid } from './collapsibleCounter.js';

export type CollapsibleProps = {
  /** État ouvert (contrôlable). */
  open?: boolean;
  title: string;
  disabled?: boolean;
  onToggle?: (open: boolean) => void;
  class?: string;
};

defineOptions({ name: 'Collapsible', inheritAttrs: false });
const props = withDefaults(defineProps<CollapsibleProps>(), {
  open: undefined,
  disabled: false,
  onToggle: undefined,
  class: undefined,
});
const emit = defineEmits<{ toggle: [open: boolean] }>();
defineSlots<{
  default?: () => unknown;
  trailing?: () => unknown;
}>();

const uid = nextCollapsibleUid();
const internalOpen = ref(props.open ?? false);

const isControlled = computed(() => props.open !== undefined);
const open = computed(() => (isControlled.value ? props.open! : internalOpen.value));

function toggle() {
  if (props.disabled) return;
  const next = !open.value;
  if (!isControlled.value) internalOpen.value = next;
  props.onToggle?.(next);
  emit('toggle', next);
}
</script>

<template>
  <div
    v-bind="$attrs"
    :class="classNames('st-collapsible', open && 'st-collapsible--open', props.class)"
  >
    <button
      type="button"
      class="st-collapsible__trigger"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="`${uid}-region`"
      :id="`${uid}-trigger`"
      :disabled="props.disabled"
      @click="toggle"
    >
      <span class="st-collapsible__title">{{ props.title }}</span>
      <span v-if="$slots.trailing" class="st-collapsible__trailing"><slot name="trailing" /></span>
      <span class="st-collapsible__icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </span>
    </button>
    <div v-if="open" class="st-collapsible__region" role="region" :id="`${uid}-region`" :aria-labelledby="`${uid}-trigger`">
      <slot />
    </div>
  </div>
</template>
