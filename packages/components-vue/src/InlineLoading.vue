<script setup lang="ts">
import Icon from './Icon.vue';
import { scalarContent } from './slotContent.js';
import { useAttrs, useSlots } from 'vue';
import { classNames } from './classNames.js';

export type InlineLoadingStatus = 'active' | 'inactive' | 'success' | 'error';

export type InlineLoadingProps = {
  label?: string | number;
  status?: InlineLoadingStatus;
  locale?: string;
  class?: string;
};

defineOptions({ name: 'InlineLoading', inheritAttrs: false });
const props = withDefaults(defineProps<InlineLoadingProps>(), {
  label: undefined, status: 'active', locale: 'fr-FR', class: undefined,
});
defineSlots<{ label?: () => unknown }>();

const attrs = useAttrs();
const slots = useSlots();
// Canon Svelte : le libellé visible n'est rendu que s'il est fourni ;
// sinon un aria-label de repli porte l'accessibilité (aucun texte anglais
// visible sur une page localisée).
const ariaLabel = () => {
  const isFr = (props.locale ?? 'fr-FR').toLowerCase().startsWith('fr');
  const FALLBACK_LABELS: Record<InlineLoadingStatus, string> = {
    active: isFr ? 'Chargement' : 'Loading',
    success: isFr ? 'Terminé' : 'Completed',
    error: isFr ? 'Erreur' : 'Error',
    inactive: isFr ? 'Inactif' : 'Inactive',
  };
  return (attrs['aria-label'] as string | undefined) ?? (props.label || slots.label ? undefined : FALLBACK_LABELS[props.status]);
};
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-inlineLoading', `st-inlineLoading--${props.status}`, props.class)) }"  :role="props.status === 'error' ? 'alert' : 'status'" :aria-label="ariaLabel()" aria-live="polite">
    <span class="st-inlineLoading__icon" aria-hidden="true"><template v-if="props.status === 'active'"><span class="st-inlineLoading__spinner"><Icon name="loader-circle" :size="16" /></span></template><Icon v-else-if="props.status === 'success'" name="circle-check" :size="16" /><Icon v-else-if="props.status === 'error'" name="circle-alert" :size="16" /></span>
    <span v-if="$slots.label || props.label" class="st-inlineLoading__label"><template v-if="$slots.label"><slot name="label" /></template><template v-else>{{ scalarContent(props.label) }}</template></span>
  </div>
</template>
