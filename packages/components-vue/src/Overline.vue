<script setup lang="ts">
import { classNames } from './classNames.js';

/** Balise rendue. `span`/`div` = inline/bloc neutre ; `h2`/`h3` quand l'overline
 * sert d'en-tête de région (sémantique de titre). */
export type OverlineAs = 'span' | 'div' | 'h2' | 'h3';

export type OverlineProps = {
  /** Balise : `span` (défaut) inline, `div` bloc, `h2`/`h3` pour un en-tête de région. */
  as?: OverlineAs;
  class?: string;
};

/**
 * Overline — étiquette de section discrète en small-caps (les « DOCUMENTATION »,
 * « COMMUNITIES », « SIGNAUX », « DOCUMENTS SOURCES » des maquettes). Rôle :
 * libellé de groupe de niveau 0, muted, au-dessus d'un bloc. Style token-only :
 * chaque token --st-component-overline-* retombe sur un littéral, de sorte qu'un
 * thème qui n'émet rien rend à l'identique. AUCUN hex en dur.
 */
defineOptions({ name: 'Overline', inheritAttrs: false });
const props = withDefaults(defineProps<OverlineProps>(), {
  as: 'span', class: undefined,
});
</script>

<template>
  <span v-if="props.as === 'span'" v-bind="$attrs" :class="classNames('st-overline', props.class)"><slot /></span>
  <div v-else-if="props.as === 'div'" v-bind="$attrs" :class="classNames('st-overline', props.class)"><slot /></div>
  <h2 v-else-if="props.as === 'h2'" v-bind="$attrs" :class="classNames('st-overline', props.class)"><slot /></h2>
  <h3 v-else v-bind="$attrs" :class="classNames('st-overline', props.class)"><slot /></h3>
</template>
