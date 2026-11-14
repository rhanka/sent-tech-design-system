<script setup lang="ts">
import Icon from './Icon.vue';
import { ref, watch } from 'vue';
import { classNames } from './classNames.js';

export type FilterPillTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

export type FilterPillProps = {
  /** Nom du champ/dimension affiché à gauche. */
  field: string;
  /** Résumé de la valeur sélectionnée, ex "France, Italie" ou "> 100". */
  value: string;
  /** Opérateur optionnel affiché entre field et value, ex "=", "in", "entre". */
  operator?: string;
  /** Pilule active (aria-pressed). Défaut true. */
  active?: boolean;
  /** Affiche le bouton ✕. Défaut true. */
  removable?: boolean;
  disabled?: boolean;
  tone?: FilterPillTone;
  onClick?: () => void;
  onRemove?: () => void;
  class?: string;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex=\'-1\'])';

defineOptions({ name: 'FilterPill' });
const props = withDefaults(defineProps<FilterPillProps>(), {
  operator: undefined,
  active: true,
  removable: true,
  disabled: false,
  tone: 'neutral',
  onClick: undefined,
  onRemove: undefined,
  class: undefined,
});

const containerRef = ref<HTMLElement | null>(null);

// Fix #5 : transfert de focus quand le corps-bouton focalisé devient disabled.
watch(
  () => props.disabled,
  (newVal, oldVal) => {
    if (newVal && !oldVal) {
      const container = containerRef.value;
      if (container && container.contains(document.activeElement)) {
        const focusable = document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        let transferred = false;
        for (const el of Array.from(focusable)) {
          if (!container.contains(el)) {
            el.focus();
            transferred = true;
            break;
          }
        }
        if (!transferred) (document.body as HTMLElement).focus();
      }
    }
  },
);

const handleClick = () => {
  if (props.disabled) return;
  props.onClick?.();
};
const handleRemove = () => {
  if (props.disabled) return;
  props.onRemove?.();
};
const handleBodyKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  if ((event.key === 'Delete' || event.key === 'Backspace') && props.removable) {
    event.preventDefault();
    props.onRemove?.();
  }
};
</script>

<template>
  <span ref="containerRef" :class="classNames('st-filterPill', `st-filterPill--${props.tone}`, props.active ? 'st-filterPill--active' : undefined, props.disabled ? 'st-filterPill--disabled' : undefined, props.class)" role="group" :aria-label="`Filtre ${props.field}`">
    <button v-if="props.onClick" type="button" class="st-filterPill__body" :aria-pressed="props.active" :disabled="props.disabled || undefined" @click="handleClick" @keydown="handleBodyKeydown">
      <span class="st-filterPill__field">{{ props.field }}</span>
      <span v-if="props.operator" class="st-filterPill__operator" aria-hidden="true">{{ props.operator }}</span>
      <span class="st-filterPill__value">{{ props.value }}</span>
    </button>
    <span v-else class="st-filterPill__body st-filterPill__body--static">
      <span class="st-filterPill__field">{{ props.field }}</span>
      <span v-if="props.operator" class="st-filterPill__operator" aria-hidden="true">{{ props.operator }}</span>
      <span class="st-filterPill__value">{{ props.value }}</span>
    </span>
    <button v-if="props.removable" type="button" class="st-filterPill__remove" :aria-label="`Retirer le filtre ${props.field}`" :disabled="props.disabled || undefined" @click="handleRemove"><Icon name="x" :size="12" /></button>
  </span>
</template>
