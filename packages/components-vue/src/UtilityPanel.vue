<script setup lang="ts">
import { classNames } from './classNames.js';

export type UtilityPanelMode = 'reserve' | 'overlay' | 'floating';
export type UtilityPanelSide = 'left' | 'right' | 'bottom';

export type UtilityPanelProps = {
  mode?: UtilityPanelMode;
  side?: UtilityPanelSide;
  title?: string;
  label?: string;
  collapsed?: boolean;
  class?: string;
};

defineOptions({ name: 'UtilityPanel', inheritAttrs: false });
const props = withDefaults(defineProps<UtilityPanelProps>(), {
  mode: 'reserve', side: 'right', title: undefined, label: undefined,
  collapsed: false, class: undefined,
});
defineSlots<{
  default?: () => unknown;
  header?: () => unknown;
  footer?: () => unknown;
}>();
</script>

<template>
  <aside
    v-bind="{ ...($attrs), class: (classNames('st-utilityPanel', `st-utilityPanel--${props.mode}`, `st-utilityPanel--${props.side}`, props.collapsed && 'st-utilityPanel--collapsed', props.class)) }"

    :aria-label="props.label ?? props.title ?? 'Utility panel'"
    :data-mode="props.mode"
    :data-side="props.side"
  >
    <header v-if="$slots.header || props.title" class="st-utilityPanel__header"><template v-if="$slots.header"><slot name="header" /></template><template v-else><h2 class="st-utilityPanel__title">{{ props.title }}</h2></template></header>
    <div v-if="!props.collapsed" class="st-utilityPanel__body"><slot /></div>
    <footer v-if="!props.collapsed && $slots.footer" class="st-utilityPanel__footer"><slot name="footer" /></footer>
  </aside>
</template>
