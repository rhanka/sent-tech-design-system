<script setup lang="ts">
import Icon from './Icon.vue';
import IconButton from './IconButton.vue';
import { ICONS, type IconName } from './icon-data.js';
import { classNames } from './classNames.js';

export type LabelledIconButtonProps = {
  /** Hover/focus label and accessible name. */
  label: string;
  icon: IconName;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'secondary' | 'danger';
  disabled?: boolean;
  tooltipPlacement?: 'top' | 'bottom';
  /** Compatibility spelling for the Svelte click callback. */
  onclick?: (event: MouseEvent) => void;
  class?: string;
  pressed?: boolean;
  ariaKeyshortcuts?: string;
  tooltipContent?: string;
};

defineOptions({ name: 'LabelledIconButton', inheritAttrs: false });
const props = withDefaults(defineProps<LabelledIconButtonProps>(), {
  size: 'md', variant: 'ghost', disabled: false, tooltipPlacement: 'top', pressed: undefined,
});
const emit = defineEmits<{ click: [event: MouseEvent] }>();
function clicked(event: MouseEvent) {
  props.onclick?.(event);
  emit('click', event);
}
</script>

<template>
  <span :class="classNames('st-tooltip', 'st-tooltip--' + props.tooltipPlacement, props.class)">
    <span class="st-tooltip__trigger">
      <IconButton :aria-label="props.label" :size="props.size" :variant="props.variant" :disabled="props.disabled" :aria-pressed="props.pressed" :aria-keyshortcuts="props.ariaKeyshortcuts" @click="clicked">
        <Icon :name="props.icon" :svg-class="`lucide-icon lucide lucide-${ICONS[props.icon].name} st-icon`" />
      </IconButton>
    </span>
    <span class="st-tooltip__content" role="tooltip">{{ props.tooltipContent ?? props.label }}</span>
  </span>
</template>
