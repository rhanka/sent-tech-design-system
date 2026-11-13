<script setup lang="ts">
import { classNames } from './classNames.js';

export type FormStatus = 'idle' | 'submitting' | 'submitted' | 'error';

export type FormProps = {
  status?: FormStatus;
  message?: string;
  class?: string;
};

defineOptions({ name: 'Form', inheritAttrs: false });
const props = withDefaults(defineProps<FormProps>(), {
  status: 'idle', message: undefined, class: undefined,
});
const emit = defineEmits<{ submit: [event: Event] }>();
function onSubmit(event: Event) {
  emit('submit', event);
}
</script>

<template>
  <form v-bind="$attrs" :class="classNames('st-form', props.class)" @submit="onSubmit">
    <div class="st-form__body"><slot /></div>
    <p v-if="props.message" :class="classNames('st-form__message', `st-form__message--${props.status === 'submitted' ? 'success' : props.status === 'error' ? 'error' : 'help'}`)">{{ props.message }}</p>
  </form>
</template>
