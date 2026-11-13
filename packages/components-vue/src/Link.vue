<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { classNames } from './classNames.js';

export type LinkProps = {
  href?: string;
  /** Style du lien ; API canonique (alignée sur le canon Svelte). */
  variant?: 'inline' | 'standalone' | 'muted';
  /** @deprecated Raccourci pour variant="standalone". Utilisez `variant`. */
  standalone?: boolean;
  /** @deprecated Raccourci pour variant="muted". Utilisez `variant`. */
  muted?: boolean;
  disabled?: boolean;
  /** Lien externe : pose target="_blank" rel="noreferrer" (sauf target/rel explicites). */
  external?: boolean;
  class?: string;
};

defineOptions({ name: 'Link', inheritAttrs: false });
const props = withDefaults(defineProps<LinkProps>(), {
  href: undefined, variant: 'inline', standalone: false, muted: false, disabled: false,
  external: false, class: undefined,
});

const attrs = useAttrs();
// `variant` est canonique ; les booléens standalone/muted sont des
// raccourcis dépréciés (parité Svelte/React). `variant` explicite l'emporte.
const effective = computed(() =>
  props.variant !== 'inline'
    ? props.variant
    : props.standalone
      ? 'standalone'
      : props.muted
        ? 'muted'
        : 'inline',
);
const resolvedTarget = computed(
  () => (attrs.target as string | undefined) ?? (props.external ? '_blank' : undefined),
);
const resolvedRel = computed(
  () => (attrs.rel as string | undefined) ?? (props.external ? 'noreferrer' : undefined),
);
// Retire onClick du spread : Vue fusionne sinon le handler attrs avec le
// nôtre (tableau de listeners), ce qui rappellerait l'utilisateur même en
// disabled. On le rappelle nous-mêmes, et seulement quand non-disabled.
const restAttrs = computed(() => {
  const { onClick, ...rest } = attrs as Record<string, unknown>;
  return rest;
});
function onClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  (attrs.onClick as ((event: MouseEvent) => void) | undefined)?.(event);
}
</script>

<template>
  <a v-bind="restAttrs" :href="props.disabled ? undefined : props.href" :target="resolvedTarget" :rel="resolvedRel" :class="classNames('st-link', `st-link--${effective}`, props.disabled && 'st-link--disabled', props.class)" :aria-disabled="props.disabled || undefined" @click="onClick"><slot /></a>
</template>
