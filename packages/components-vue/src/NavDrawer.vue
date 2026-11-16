<script setup lang="ts">
import NavShell from './NavShell.vue';
import type { NavShellProps } from './NavShell.vue';
export type NavDrawerProps = Omit<NavShellProps, 'variant'>;
defineOptions({ name: 'NavDrawer', inheritAttrs: false });
defineSlots<Record<string, (props?: Record<string, unknown>) => unknown>>();
</script>
<template>
  <NavShell v-bind="$attrs" variant="drawer"
    ><template v-for="(_, name) in $slots" #[name]="slotData"
      ><slot :name="name" v-bind="slotData ?? {}" /></template
  ></NavShell>
</template>
