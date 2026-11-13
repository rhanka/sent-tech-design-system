<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { scalarContent } from './slotContent.js';

export type ChatComposerProps = {
  value?: string;
  placeholder?: string;
  submitLabel?: unknown;
  class?: string;
};

defineOptions({ name: 'ChatComposer', inheritAttrs: false });
const props = withDefaults(defineProps<ChatComposerProps>(), {
  value: '',
  placeholder: 'Message',
  submitLabel: () => 'Send',
  class: undefined,
});
const emit = defineEmits<{ submit: [payload: { value: string }] }>();

const draft = ref(props.value ?? '');

const placeholder = computed(() => props.placeholder ?? 'Message');
const submitText = computed(() => scalarContent(props.submitLabel ?? 'Send'));

function onSubmit(event: Event) {
  event.preventDefault();
  emit('submit', { value: draft.value });
}

function onInput(event: Event) {
  draft.value = (event.currentTarget as HTMLTextAreaElement).value;
}
defineSlots<{default?: () => unknown; 'submit-label'?: () => unknown;}>();
</script>

<template>
  <form v-bind="{ ...($attrs), class: (classNames('st-chatComposer', props.class)) }"  @submit="onSubmit">
    <div class="st-chatComposer__body">
      <div class="st-chatComposer__inputShell">
        <textarea class="st-chatComposer__textarea st-chatComposer__input" :placeholder="placeholder" :value="draft" @input="onInput" />
      </div>
    </div>
    <div class="st-chatComposer__toolbar">
      <div class="st-chatComposer__actions st-chatComposer__actions--left"><slot /></div>
      <div class="st-chatComposer__actions st-chatComposer__actions--right">
        <button type="submit" class="st-button st-button--primary st-button--md" :disabled="draft.trim().length === 0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send-icon lucide-send" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></svg><slot name="submit-label">{{ submitText }}</slot>
        </button>
      </div>
    </div>
  </form>
</template>
