<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { classNames } from './classNames.js';
import { spacingToken } from './Flex.js';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed';

export type DividerProps = {
  orientation?: DividerOrientation;
  /** Spacing scale step (0..12) applied as margin around the divider. */
  spacing?: number;
  /** Optional label centered on a horizontal divider line. */
  label?: string;
  variant?: DividerVariant;
  class?: string;
};

defineOptions({ name: 'Divider', inheritAttrs: false });
const props = withDefaults(defineProps<DividerProps>(), {
  orientation: 'horizontal',
  spacing: undefined,
  label: undefined,
  variant: 'solid',
  class: undefined,
});

const attrs = useAttrs();
const isVertical = computed(() => props.orientation === 'vertical');
const hasLabel = computed(() => !isVertical.value && props.label != null && props.label !== '');
const margin = computed(() => spacingToken(props.spacing));

const classes = computed(() => classNames(
  'st-divider',
  `st-divider--${props.orientation}`,
  `st-divider--${props.variant}`,
  hasLabel.value && 'st-divider--labeled',
  props.class,
));

const callerStyle = computed(() => attrs.style as Record<string, string> | undefined);
const rootStyle = computed(() => ({
  marginBlock: isVertical.value ? undefined : margin.value,
  marginInline: isVertical.value ? margin.value : undefined,
  ...(callerStyle.value ?? {}),
}));
</script>

<template>
  <div :style="rootStyle" v-bind="$attrs" :class="classes" role="separator" :aria-orientation="hasLabel ? 'horizontal' : props.orientation">
    <template v-if="hasLabel">
      <span class="st-divider__line" aria-hidden="true"></span>
      <span class="st-divider__label">{{ props.label }}</span>
      <span class="st-divider__line" aria-hidden="true"></span>
    </template>
  </div>
</template>
