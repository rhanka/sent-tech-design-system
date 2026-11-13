<script setup lang="ts">
import { classNames } from './classNames.js';

export interface NavRailItem {
  id: string;
  label: unknown;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: unknown;
  icon?: unknown;
}

export type NavRailProps = {
  items?: NavRailItem[];
  label?: string;
  activeItemId?: string;
  class?: string;
};

defineOptions({ name: 'NavRail', inheritAttrs: false });
const props = withDefaults(defineProps<NavRailProps>(), {
  items: () => [], label: 'Primary navigation', activeItemId: undefined, class: undefined,
});
const emit = defineEmits<{ itemSelect: [id: string] }>();

function isActive(item: NavRailItem) {
  return item.active === true || item.id === props.activeItemId;
}
function onItemClick(item: NavRailItem) {
  if (!item.disabled) emit('itemSelect', item.id);
}
</script>

<template>
  <nav v-bind="$attrs" :class="classNames('st-navRail', props.class)" :aria-label="props.label">
    <div class="st-navRail__items">
      <template v-for="item in props.items" :key="item.id">
        <a
          v-if="item.href && !item.disabled"
          :href="item.href"
          :class="classNames('st-navRail__item', isActive(item) && 'st-navRail__item--active')"
          :aria-current="isActive(item) ? 'page' : undefined"
          @click="onItemClick(item)"
        >
          <span v-if="item.icon" class="st-navRail__icon">{{ String(item.icon) }}</span>
          <span class="st-navRail__label">{{ item.label }}</span>
          <span v-if="item.badge != null" class="st-navRail__badge">{{ String(item.badge) }}</span>
        </a>
        <button
          v-else
          type="button"
          :class="classNames('st-navRail__item', isActive(item) && 'st-navRail__item--active')"
          :aria-current="isActive(item) ? 'page' : undefined"
          :disabled="item.disabled"
          @click="onItemClick(item)"
        >
          <span v-if="item.icon" class="st-navRail__icon">{{ String(item.icon) }}</span>
          <span class="st-navRail__label">{{ item.label }}</span>
          <span v-if="item.badge != null" class="st-navRail__badge">{{ String(item.badge) }}</span>
        </button>
      </template>
      <slot />
    </div>
    <footer v-if="$slots.footer" class="st-navRail__footer"><slot name="footer" /></footer>
  </nav>
</template>
