<script setup lang="ts">
import { classNames } from './classNames.js';


/** Balise rendue. `span`/`div` = inline/bloc neutre ; `h2`/`h3` quand l'overline
 * sert d'en-tête de région (sémantique de titre). */
export type OverlineAs = "span" | "div" | "h2" | "h3";


export type OverlineProps = {
  /** Balise : `span` (défaut) inline, `div` bloc, `h2`/`h3` pour un en-tête de région. */
  as?: OverlineAs;
  class?: string;
};
defineOptions({ name: 'Overline', inheritAttrs: false });
const props = withDefaults(defineProps<OverlineProps>(), { as: "span", class: undefined });
defineSlots<{ default?: () => unknown }>();


</script>

<template>
  <component :is="props.as ?? 'span'" v-bind="$attrs" :class="classNames('st-overline', props.class)"><slot /></component>
</template>
