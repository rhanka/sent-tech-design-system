<script setup lang="ts">
import { ref, computed, useId } from 'vue';
import { classNames } from './classNames.js';
import Icon from './Icon.vue';


export type CollapsibleProps = {
  /** État ouvert (contrôlable). */
  open?: boolean;
  title: string;
  disabled?: boolean;
  onToggle?: (open: boolean) => void;
  class?: string;
};
defineOptions({ name: 'Collapsible', inheritAttrs: false });
const props = withDefaults(defineProps<CollapsibleProps>(), { open: undefined, disabled: false, onToggle: undefined, class: undefined });
defineSlots<{ default?: () => unknown; trailing?: () => unknown }>();
const emit = defineEmits<{ toggle: [open: boolean] }>();
const uid = `st-collapsible-${useId()}`;
const internalOpen = ref(props.open ?? false);
const open = computed(() => props.open !== undefined ? props.open : internalOpen.value);
function toggle() { if (props.disabled) return; const next = !open.value; if (props.open === undefined) internalOpen.value = next; emit('toggle', next); }
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-collapsible', open && 'st-collapsible--open', props.class)) }" ><button type="button" class="st-collapsible__trigger" :aria-expanded="open ? 'true' : 'false'" :aria-controls="`${uid}-region`" :id="`${uid}-trigger`" :disabled="props.disabled" @click="toggle"><span class="st-collapsible__title">{{ props.title }}</span><span v-if="$slots.trailing" class="st-collapsible__trailing"><slot name="trailing" /></span><span class="st-collapsible__icon" aria-hidden="true"><Icon name="chevron-down" bare :size="18" :stroke-width="2.25" aria-hidden="true" /></span></button><div v-if="open" class="st-collapsible__region" role="region" :id="`${uid}-region`" :aria-labelledby="`${uid}-trigger`"><slot /></div></div>
</template>
