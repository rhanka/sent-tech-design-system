<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import { classNames } from './classNames.js';
import { nextPasswordInputId } from './passwordInputId.js';

export type PasswordInputSize = 'sm' | 'md' | 'lg';

export type PasswordInputProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  size?: PasswordInputSize;
  modelValue?: string;
  disabled?: boolean;
  placeholder?: string;
  showLabel?: string;
  hideLabel?: string;
  class?: string;
};

defineOptions({ name: 'PasswordInput' });
const props = withDefaults(defineProps<PasswordInputProps>(), {
  label: undefined, helperText: undefined, errorText: undefined, size: 'md', modelValue: undefined,
  disabled: false, placeholder: undefined, showLabel: 'Show password', hideLabel: 'Hide password', class: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [event: Event];
  input: [event: Event];
}>();

const attrs = useAttrs();
const inputId = ref(nextPasswordInputId());
const shown = ref(false);

const isInvalid = computed(() => Boolean(props.errorText));

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
  emit('input', event);
}
function onChange(event: Event) {
  emit('change', event);
}
const controlProps = computed(() => ({
  ...attrs,
  id: inputId.value,
  class: 'st-passwordInput__control',
  type: shown.value ? 'text' : 'password',
  'aria-invalid': isInvalid.value ? ('true' as const) : undefined,
  value: props.modelValue,
  disabled: props.disabled,
  placeholder: props.placeholder,
  onInput: onInput as (event: Event) => void,
  onChange: onChange as (event: Event) => void,
}));
</script>

<template>
  <div :class="classNames('st-field', props.class)">
    <label class="st-field__control" :for="inputId">
      <span v-if="props.label" class="st-field__label">{{ props.label }}</span>
      <span :class="classNames('st-passwordInput', `st-passwordInput--${props.size}`)">
        <input v-bind="controlProps" />
        <button
          type="button"
          class="st-passwordInput__toggle"
          :aria-label="shown ? props.hideLabel : props.showLabel"
          :aria-pressed="shown ? 'true' : 'false'"
          @click="shown = !shown"
        >
          <svg v-if="shown" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off-icon lucide-eye-off" aria-hidden="true"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
        </button>
      </span>
    </label>
    <span v-if="props.errorText" class="st-field__error">{{ props.errorText }}</span>
    <span v-else-if="props.helperText" class="st-field__help">{{ props.helperText }}</span>
  </div>
</template>
