<script setup lang="ts">
import { classNames } from './classNames.js';

export type SideNavItem = {
  label: unknown;
  href: string;
  active?: boolean;
  children?: SideNavItem[];
};

export type SideNavProps = {
  items: SideNavItem[];
  label?: string;
  class?: string;
};

defineOptions({ name: 'SideNav', inheritAttrs: false });
const props = withDefaults(defineProps<SideNavProps>(), {
  label: 'Navigation', class: undefined,
});
</script>

<template>
  <nav
    v-bind="$attrs"
    :class="classNames('st-sidenav st-sideNav', props.class)"
    :aria-label="props.label"
  >
    <a
      v-for="item in props.items"
      :key="item.href"
      :href="item.href"
      :class="classNames(
        'st-sidenav__link st-sideNav__link',
        item.active && 'st-sidenav__link--active st-sideNav__link--active',
      )"
    >{{ item.label }}</a>
  </nav>
</template>
