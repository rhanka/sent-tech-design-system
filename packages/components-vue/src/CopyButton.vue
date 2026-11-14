<script setup lang="ts">
import Icon from './Icon.vue';
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
    <span class="st-copyButton__icon" aria-hidden="true"><Icon v-if="copied" name="check" :size="14" /><Icon v-else name="copy" :size="14" /></span>
    <span class="st-copyButton__label">{{ copied ? resolvedCopiedLabel : resolvedLabel }}</span>
  </button>
</template>
