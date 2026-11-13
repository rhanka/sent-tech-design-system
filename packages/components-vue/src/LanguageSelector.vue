<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type LanguageOption = {
  value: string;
  label: unknown;
};

export type LanguageSelectorProps = {
  options: LanguageOption[];
  value?: string;
  open?: boolean;
  class?: string;
};

defineOptions({ name: 'LanguageSelector', inheritAttrs: false });
const props = withDefaults(defineProps<LanguageSelectorProps>(), {
  value: undefined, open: false, class: undefined,
});
const emit = defineEmits<{ change: [value: string] }>();

const current = computed(() =>
  props.options.find((opt) => opt.value === props.value) ?? props.options[0],
);
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-languageSelector', props.class)">
    <button type="button" class="st-languageSelector__trigger">
      <span class="st-languageSelector__current">{{ current?.label }}</span>
    </button>
    <ul v-if="props.open" class="st-languageSelector__menu">
      <li v-for="option in props.options" :key="option.value">
        <button type="button" :class="classNames('st-languageSelector__option', option.value === props.value && 'st-languageSelector__option--active')" @click="emit('change', option.value)">{{ option.label }}</button>
      </li>
    </ul>
  </div>
</template>
