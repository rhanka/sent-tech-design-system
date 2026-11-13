<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type AutosaveLabels = {
  idle?: string;
  saving?: string;
  saved?: string;
  error?: string;
};

// In addition to the Vue-native `@retry` emit, an `onRetry` callback prop
// (parity with React/Svelte) is accepted and fired on the retry button.
export type AutosaveProps = {
  status?: AutosaveStatus;
  /** Horodatage de la dernière sauvegarde réussie. */
  lastSaved?: string | Date;
  /** Affiche un bouton « Réessayer » sur le statut `error`. */
  onRetry?: () => void;
  /** Surcharge des libellés par statut. */
  labels?: AutosaveLabels;
  /** Étiquette du bouton de relance. */
  retryLabel?: string;
  locale?: string;
  class?: string;
};

defineOptions({ name: 'Autosave', inheritAttrs: false });
const props = withDefaults(defineProps<AutosaveProps>(), {
  status: 'idle',
  lastSaved: undefined,
  onRetry: undefined,
  labels: undefined,
  retryLabel: undefined,
  locale: 'fr-FR',
  class: undefined,
});
const emit = defineEmits<{ retry: [] }>();

const isFr = computed(() => (props.locale ?? 'fr-FR').toLowerCase().startsWith('fr'));
const defaultLabels = computed<Required<AutosaveLabels>>(() =>
  isFr.value
    ? {
        idle: "Modifications enregistrées",
        saving: 'Enregistrement…',
        saved: 'Enregistré',
        error: "Échec de l'enregistrement",
      }
    : {
        idle: 'All changes saved',
        saving: 'Saving…',
        saved: 'Saved',
        error: 'Failed to save',
      },
);
const resolvedRetryLabel = computed(() => props.retryLabel ?? (isFr.value ? 'Réessayer' : 'Retry'));
const statusLabel = computed(() => props.labels?.[props.status] ?? defaultLabels.value[props.status]);
const role = computed(() => (props.status === 'error' ? 'alert' : 'status'));

// Heure relative de la dernière sauvegarde (rendu uniquement sur idle/saved).
const relativeTime = computed(() => {
  if (!props.lastSaved) return '';
  const date = props.lastSaved instanceof Date ? props.lastSaved : new Date(props.lastSaved);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat(props.locale, { numeric: 'auto' });
  if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, 'second');
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, 'minute');
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(-diffHour, 'hour');
  const diffDay = Math.round(diffHour / 24);
  return rtf.format(-diffDay, 'day');
});
const showRelative = computed(() => (props.status === 'saved' || props.status === 'idle') && relativeTime.value !== '');

function triggerRetry() {
  emit('retry');
  props.onRetry?.();
}
</script>

<template>
  <div
    v-bind="$attrs"
    :class="classNames('st-autosave', `st-autosave--${props.status}`, props.class)"
    :role="role"
    aria-live="polite"
  >
    <span class="st-autosave__icon" aria-hidden="true">
      <span v-if="props.status === 'saving'" class="st-autosave__spinner">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle-icon lucide-loader-circle" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
      </span>
      <svg v-else-if="props.status === 'saved'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-icon lucide-circle-check" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
      <svg v-else-if="props.status === 'error'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert-icon lucide-circle-alert" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
    </span>
    <span class="st-autosave__label">{{ statusLabel }}</span>
    <span v-if="showRelative" class="st-autosave__time">{{ relativeTime }}</span>
    <button
      v-if="props.status === 'error' && props.onRetry"
      type="button"
      class="st-autosave__retry"
      @click="triggerRetry"
    >{{ resolvedRetryLabel }}</button>
  </div>
</template>
