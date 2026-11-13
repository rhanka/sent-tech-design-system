<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type FooterLink = { label: unknown; href: string };
export type FooterColumn = { title?: unknown; links: FooterLink[] };

export type FooterProps = {
  brand?: unknown;
  columns?: FooterColumn[];
  links?: FooterLink[];
  legalLinks?: FooterLink[];
  copyright?: unknown;
  class?: string;
};

defineOptions({ name: 'Footer', inheritAttrs: false });
const props = withDefaults(defineProps<FooterProps>(), {
  brand: undefined, columns: undefined, links: undefined, legalLinks: undefined,
  copyright: undefined, class: undefined,
});
defineSlots<{ brand?: () => unknown; copyright?: () => unknown }>();

const groups = computed<FooterColumn[]>(() =>
  props.columns ?? (props.links ? [{ links: props.links }] : []),
);
const hasTop = computed(() => props.brand || groups.value.length > 0);
const hasBottom = computed(() =>
  props.copyright || (props.legalLinks && props.legalLinks.length > 0),
);
</script>

<template>
  <footer v-bind="$attrs" :class="classNames('st-footer', props.class)">
    <div v-if="hasTop || $slots.brand" class="st-footer__top">
      <div v-if="$slots.brand || props.brand" class="st-footer__brand"><template v-if="$slots.brand"><slot name="brand" /></template><template v-else>{{ props.brand }}</template></div>
      <div class="st-footer__columns">
        <nav v-for="(group, index) in groups" :key="index">
          <h2 v-if="group.title">{{ group.title }}</h2>
          <a v-for="link in group.links" :key="link.href" :href="link.href">{{ link.label }}</a>
        </nav>
      </div>
    </div>
    <div v-if="hasBottom || $slots.copyright" class="st-footer__bottom">
      <span v-if="$slots.copyright || props.copyright" class="st-footer__copyright"><template v-if="$slots.copyright"><slot name="copyright" /></template><template v-else>{{ props.copyright }}</template></span>
      <nav v-if="props.legalLinks && props.legalLinks.length > 0" class="st-footer__legal" aria-label="Legal links">
        <a v-for="link in props.legalLinks" :key="link.href" :href="link.href">{{ link.label }}</a>
      </nav>
    </div>
  </footer>
</template>
