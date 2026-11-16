<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { classNames } from './classNames.js';

export type FormGroupProps = {
  legend?: string | number;
  helperText?: string | number;
  class?: string;
};

defineOptions({ name: 'FormGroup', inheritAttrs: false });
const props = withDefaults(defineProps<FormGroupProps>(), {
  helperText: undefined, class: undefined,
});
defineSlots<{
  /** @deprecated Use helper-text. */
  helperText?: () => unknown; legend?: () => unknown; 'helper-text'?: () => unknown; default?: () => unknown }>();
</script>

<template>
  <fieldset v-bind="{ ...($attrs), class: (classNames('st-form-group st-formGroup', props.class)) }" >
    <legend v-if="$slots.legend || props.legend" class="st-form-group__legend st-formGroup__legend"><template v-if="$slots.legend"><slot name="legend" /></template><template v-else>{{ scalarContent(props.legend) }}</template></legend>
    <div class="st-form-group__body st-formGroup__body"><slot /></div>
    <p v-if="($slots['helper-text'] || $slots.helperText) || props.helperText" class="st-form-group__help st-formGroup__help"><template v-if="($slots['helper-text'] || $slots.helperText)"><slot name="helper-text"><slot name="helperText" /></slot></template><template v-else>{{ scalarContent(props.helperText) }}</template></p>
  </fieldset>
</template>
