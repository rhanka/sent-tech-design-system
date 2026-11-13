<script setup lang="ts">
import { computed, useId } from 'vue';
import { classNames } from './classNames.js';


export type AppHeaderProps = {
  compact?: boolean;
  menuOpen?: boolean;
  menuLabel?: string;
  /**
   * Id du tiroir, partagé entre `aria-controls` (burger) et `id` (drawer).
   * Auto-généré et stable si non fourni.
   */
  drawerId?: string;
  /**
   * Marque structurée (décision actée : logo SENT + sous-titre). Rend le bloc
   * canonique « logo carré + nom + sous-titre produit ». Si le slot `logo` est
   * fourni, il a priorité (contrôle total).
   */
  brandName?: string;
  /** Sous-titre produit affiché sous le nom (ex. « Design System », « dataviz »). */
  productName?: string;
  /** Source de l'image du logo carré (ex. `/SENT-logo-squared.svg`). */
  logoSrc?: string;
  /** Texte alternatif du logo (décoratif par défaut). */
  logoAlt?: string;
  /** Cible du lien de la marque. Défaut : `/`. */
  brandHref?: string;
  /** aria-label du lien de marque (sinon dérivé de `brandName` + `productName`). */
  brandLabel?: string;
  class?: string;
};
defineOptions({ name: 'AppHeader', inheritAttrs: false });
const props = withDefaults(defineProps<AppHeaderProps>(), { compact: false, menuOpen: false, menuLabel: "Menu", drawerId: undefined, brandName: undefined, productName: undefined, logoSrc: undefined, logoAlt: "", brandHref: "/", brandLabel: undefined, class: undefined });
defineSlots<{ logo?: () => unknown; nav?: () => unknown; actions?: () => unknown; drawer?: () => unknown }>();
const emit = defineEmits<{ menuToggle: [] }>();
const uid = useId();
const resolvedDrawerId = props.drawerId ?? `st-appHeader-drawer-${uid}`;
const resolvedBrandLabel = computed(() => props.brandLabel ?? [props.brandName, props.productName].filter(Boolean).join(' '));
</script>

<template>
  <header v-bind="props.compact && props.menuOpen && $slots.drawer ? {} : $attrs" :class="classNames('st-appHeader', props.class)"><div class="st-appHeader__bar">
    <div v-if="$slots.logo" class="st-appHeader__logo"><slot name="logo" /></div><a v-else-if="props.brandName || props.productName || props.logoSrc" class="st-appHeader__brand" :href="props.brandHref" :aria-label="resolvedBrandLabel || undefined"><img v-if="props.logoSrc" class="st-appHeader__brandMark" :src="props.logoSrc" :alt="props.logoAlt" :aria-hidden="props.logoAlt ? undefined : 'true'" /><span v-if="props.brandName || props.productName" class="st-appHeader__brandCopy"><span v-if="props.brandName" class="st-appHeader__brandName">{{ props.brandName }}</span><span v-if="props.productName" class="st-appHeader__brandProduct">{{ props.productName }}</span></span></a>
    <nav v-if="!props.compact" class="st-appHeader__nav" aria-label="Primary"><slot name="nav" /></nav><div v-if="!props.compact" class="st-appHeader__actions"><slot name="actions" /></div>
    <div v-if="props.compact" class="st-appHeader__burger"><button type="button" class="st-appHeader__burgerButton" :aria-label="props.menuLabel" :aria-expanded="props.menuOpen ? 'true' : 'false'" :aria-controls="resolvedDrawerId" aria-haspopup="menu" @click="emit('menuToggle')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="st-appHeader__burgerIcon"><template v-if="props.menuOpen"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></template><template v-else><path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" /></template></svg></button></div>
  </div></header>
  <template v-if="props.compact && props.menuOpen && $slots.drawer"><button type="button" class="st-appHeader__scrim" :aria-label="props.menuLabel" @click="emit('menuToggle')" /><aside :id="resolvedDrawerId" class="st-appHeader__drawer"><slot name="drawer" /></aside></template>
</template>
