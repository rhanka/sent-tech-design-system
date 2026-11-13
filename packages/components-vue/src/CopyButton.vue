<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type CopyButtonSize = 'sm' | 'md' | 'lg';

export type CopyButtonProps = {
  text?: string;
  value?: string;
  locale?: string;
  label?: string;
  copiedLabel?: string;
  size?: CopyButtonSize;
  class?: string;
};

defineOptions({ name: 'CopyButton', inheritAttrs: false });
const props = withDefaults(defineProps<CopyButtonProps>(), {
  text: undefined,
  value: undefined,
  locale: 'fr-FR',
  label: undefined,
  copiedLabel: undefined,
  size: 'md',
  class: undefined,
});
const emit = defineEmits<{ click: [event: MouseEvent] }>();

const copied = ref(false);

const isFr = computed(() => (props.locale ?? 'fr-FR').toLowerCase().startsWith('fr'));
const resolvedLabel = computed(() => props.label ?? (isFr.value ? 'Copier' : 'Copy'));
const resolvedCopiedLabel = computed(() => props.copiedLabel ?? (isFr.value ? 'Copié' : 'Copied'));

function onClick(event: MouseEvent) {
  copied.value = true;
  void navigator.clipboard?.writeText(props.value ?? props.text ?? '');
  emit('click', event);
}
</script>

<template>
  <button v-bind="{ ...($attrs), class: (classNames('st-copyButton', `st-copyButton--${props.size}`, copied && 'st-copyButton--copied', props.class)) }" type="button"  @click="onClick">
    <span class="st-copyButton__icon" aria-hidden="true"><svg v-if="copied" aria-hidden="true" class="lucide lucide-check-icon lucide-check" fill="none" height="14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M20 6 9 17l-5-5"></path></svg><svg v-else aria-hidden="true" class="lucide lucide-copy-icon lucide-copy" fill="none" height="14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><rect height="14" rx="2" ry="2" width="14" x="8" y="8"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></span>
    <span class="st-copyButton__label">{{ copied ? resolvedCopiedLabel : resolvedLabel }}</span>
  </button>
</template>
