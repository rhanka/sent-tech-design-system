<script setup lang="ts">
import { classNames } from './classNames.js';
export type PortalProps = {
  /**
   * Where to teleport the children. A CSS selector string or an actual
   * `HTMLElement`. Defaults to the document `<body>`.
   */
  target?: string | HTMLElement;
  /** When `true`, render inline in place (no teleportation). */
  disabled?: boolean;
  /** Optional class applied to the portal container element. */
  class?: string;
};
defineOptions({ name: 'Portal' });
const props = withDefaults(defineProps<PortalProps>(), { target: 'body', disabled: false, class: undefined });
defineSlots<{ default?: () => unknown }>();


</script>

<template>

  <Teleport :to="props.target" :disabled="props.disabled">
    <div :class="classNames('st-portal', props.class)" :data-st-portal="props.disabled ? 'inline' : 'teleported'"><slot /></div>
  </Teleport>

</template>
