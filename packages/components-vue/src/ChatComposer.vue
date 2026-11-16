<script setup lang="ts">
import Icon from './Icon.vue';
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { scalarContent } from './slotContent.js';

export type ChatComposerProps = {
  value?: string;
  placeholder?: string;
  submitLabel?: string | number;
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
          <Icon name="send" :size="16" /><slot name="submit-label">{{ submitText }}</slot>
        </button>
      </div>
    </div>
  </form>
</template>
