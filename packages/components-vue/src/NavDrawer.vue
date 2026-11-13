<script setup lang="ts">
import NavShell from './NavShell.vue';
import type { NavShellProps } from './NavShell.vue';
export type NavDrawerProps = Omit<NavShellProps, 'variant'>;
defineOptions({ name: 'NavDrawer', inheritAttrs: false });
defineSlots<{ [name: string]: () => unknown }>();
</script>
<template>
  <NavShell v-bind="$attrs" variant="drawer"
    ><template v-for="(_, name) in $slots" #[name]
      ><slot :name="name" /></template
  ></NavShell>
</template>
