<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { useSlots, useAttrs } from 'vue';
import { classNames } from './classNames.js';
export type HeaderNavItem = { label: unknown; href: string };
export type HeaderAccount = {
  name?: string;
  email?: string;
  avatarUrl?: string;
};
export type HeaderProps = {
  brand?: unknown;
  title?: unknown;
  navigation?: HeaderNavItem[];
  navItems?: HeaderNavItem[];
  account?: HeaderAccount;
  sticky?: boolean;
  class?: string;
};
import { deriveInitials } from './header-initials.js';
defineOptions({ name: 'Header', inheritAttrs: false });
const props = withDefaults(defineProps<HeaderProps>(), {
  brand: undefined,
  title: undefined,
  navigation: undefined,
  navItems: undefined,
  account: undefined,
  sticky: false,
  class: undefined,
});
const slots = useSlots();
defineSlots<{
  brand?: () => unknown;
  title?: () => unknown;
  'nav-label'?: (scope: { item: HeaderNavItem }) => unknown;
}>();
const attrs = useAttrs();
</script>

<template>
  <template v-for="links in [props.navigation ?? props.navItems ?? []]"
    ><header
      v-bind="{ ...(attrs), class: (
        classNames(
          'st-header',
          props.sticky && 'st-header--sticky',
          props.class,
        )
      ) }"

    >
      <div :class="'st-header__leading'">
        <template v-if="props.brand"
          ><a :class="'st-header__logo'" :href="'/'"
            ><slot v-if="$slots['brand']" name="brand" /><template v-else>{{ scalarContent(props.brand) }}</template></a
          ></template
        ><template v-else
          ><template v-if="slots.brand"
            ><a :class="'st-header__logo'" :href="'/'"
              ><slot name="brand" /></a></template
          ><template v-else></template
        ></template>
        <template v-if="$slots.title || props.title"
          ><span :class="'st-header__title'"
            ><slot v-if="$slots['title']" name="title" /><template v-else>{{ scalarContent(props.title) }}</template></span
          ></template
        ><template v-else></template>
      </div>
      <nav :class="'st-header__navigation'">
        <template v-for="link in links" :key="link.href"
          ><a :href="link.href"
            ><slot
              v-if="$slots['nav-label']"
              name="nav-label"
              :item="link"
            /><template v-else>{{ scalarContent(link.label) }}</template></a
          ></template
        >
      </nav>
      <template v-if="props.account"
        ><div :class="'st-header__account'">
          <span :class="'st-header__avatar st-header__avatar--initials'">{{
            deriveInitials(props.account.name)
          }}</span>
          <span :class="'st-header__account-name'">{{
            props.account.name
          }}</span>
          <template v-if="props.account.email"
            ><span :class="'st-header__account-email'">{{
              props.account.email
            }}</span></template
          ><template v-else></template></div></template
      ><template v-else></template></header
  ></template>
</template>
