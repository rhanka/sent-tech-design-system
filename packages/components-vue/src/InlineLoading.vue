<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { classNames } from './classNames.js';

export type InlineLoadingStatus = 'active' | 'inactive' | 'success' | 'error';

export type InlineLoadingProps = {
  label?: unknown;
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
// Canon Svelte : le libellé visible n'est rendu que s'il est fourni ;
// sinon un aria-label de repli porte l'accessibilité (aucun texte anglais
// visible sur une page localisée).
const ariaLabel = computed(() => {
  const isFr = (props.locale ?? 'fr-FR').toLowerCase().startsWith('fr');
  const FALLBACK_LABELS: Record<InlineLoadingStatus, string> = {
    active: isFr ? 'Chargement' : 'Loading',
    success: isFr ? 'Terminé' : 'Completed',
    error: isFr ? 'Erreur' : 'Error',
    inactive: isFr ? 'Inactif' : 'Inactive',
  };
  return (attrs['aria-label'] as string | undefined) ?? (props.label ? undefined : FALLBACK_LABELS[props.status]);
});
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-inlineLoading', `st-inlineLoading--${props.status}`, props.class)" :role="props.status === 'error' ? 'alert' : 'status'" :aria-label="ariaLabel" aria-live="polite">
    <span class="st-inlineLoading__icon" aria-hidden="true"><template v-if="props.status === 'active'"><span class="st-inlineLoading__spinner"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="lucide lucide-loader-circle-icon lucide-loader-circle"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg></span></template><svg v-else-if="props.status === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg><svg v-else-if="props.status === 'error'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="lucide lucide-circle-alert-icon lucide-circle-alert"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg></span>
    <span v-if="$slots.label || props.label" class="st-inlineLoading__label"><template v-if="$slots.label"><slot name="label" /></template><template v-else>{{ props.label }}</template></span>
  </div>
</template>
