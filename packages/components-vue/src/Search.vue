<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { computed, useId } from 'vue';
import { ref } from 'vue';
import { classNames } from './classNames.js';

export type SearchSize = 'sm' | 'md' | 'lg';
export type SearchProps = {
  label?: unknown;
  size?: SearchSize;
  modelValue?: string;
  /** Svelte/React-canonical alias for `modelValue`. */
  value?: string;
  placeholder?: string;
  clearLabel?: string;
  disabled?: boolean;
  /** Lift the field max-width cap so it fills a narrow drawer/rail (width 100%). */
  fluid?: boolean;
  id?: string;
  class?: string;
};
defineOptions({ name: 'Search', inheritAttrs: false });
defineSlots<{ label?: () => unknown }>();
const props = withDefaults(defineProps<SearchProps>(), {
  label: undefined,
  size: 'md',
  modelValue: undefined,
  value: undefined,
  placeholder: undefined,
  clearLabel: 'Clear search',
  disabled: false,
  fluid: false,
  id: undefined,
  class: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [event: Event];
  input: [event: Event];
  clear: [];
}>();


const autoId = ref(`st-search-${useId()}`);
const controlBindings = computed(() => ({

  id: props.id ?? autoId.value,
  class: 'st-search__control st-search__input',
  type: 'search',
  value: props.modelValue ?? props.value ?? '',
  placeholder: props.placeholder,
  disabled: props.disabled,
  onInput: (event: Event) => {
    emit('update:modelValue', (event.target as HTMLInputElement).value);
    emit('input', event);
  },
  onChange: (event: Event) => emit('change', event),
}));
const inputId = computed(() => props.id ?? autoId.value);
const currentValue = computed(() => props.modelValue ?? props.value ?? '');
</script>

<template>
  <div
    :class="
      classNames(
        'st-search',
        `st-search--${props.size}`,
        props.fluid ? 'st-search--fluid' : undefined,
        props.class,
      )
    "
  >
    <template v-if="props.label || $slots.label"
      ><label :class="'st-field__label'" :for="inputId"><slot v-if="$slots.label" name="label" /><template v-else>{{ scalarContent(props.label) }}</template></label></template
    ><template v-else></template>
    <span :class="'st-search__icon'" :aria-hidden="'true'"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        :width="16"
        :height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-search-icon lucide-search"
        :aria-hidden="'true'"
      >
        <path d="m21 21-4.34-4.34" />
        <circle cx="11" cy="11" r="8" /></svg
    ></span>
    <input v-bind="{ ...$attrs, ...controlBindings }" />
    <template v-if="currentValue"
      ><button
        :type="'button'"
        :class="'st-search__clear'"
        :aria-label="props.clearLabel"
        :disabled="props.disabled"
        @click="
          () => {
            emit('update:modelValue', '');
            emit('clear');
          }
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :width="16"
          :height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-x-icon lucide-x"
          :aria-hidden="'true'"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg></button></template
    ><template v-else></template>
  </div>
</template>
