<script setup lang="ts">
import { classNames } from './classNames.js';

export type FormGroupProps = {
  legend: unknown;
  helperText?: unknown;
  class?: string;
};

defineOptions({ name: 'FormGroup', inheritAttrs: false });
const props = withDefaults(defineProps<FormGroupProps>(), {
  helperText: undefined, class: undefined,
});
defineSlots<{ legend?: () => unknown; helperText?: () => unknown; default?: () => unknown }>();
</script>

<template>
  <fieldset v-bind="$attrs" :class="classNames('st-form-group st-formGroup', props.class)">
    <legend v-if="$slots.legend || props.legend" class="st-form-group__legend st-formGroup__legend"><template v-if="$slots.legend"><slot name="legend" /></template><template v-else>{{ props.legend }}</template></legend>
    <div class="st-form-group__body st-formGroup__body"><slot /></div>
    <p v-if="$slots.helperText || props.helperText" class="st-form-group__help st-formGroup__help"><template v-if="$slots.helperText"><slot name="helperText" /></template><template v-else>{{ props.helperText }}</template></p>
  </fieldset>
</template>
