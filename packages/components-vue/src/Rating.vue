<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type RatingSize = 'sm' | 'md' | 'lg';

// In addition to the Vue-native `@change` emit (routed to an `onChange`
// listener by Vue), an `onChange` callback prop (parity with React/Svelte) is
// accepted and fired on change.
export type RatingProps = {
  /** Note courante (0..max). Pas de 1, ou 0.5 si `allowHalf`. */
  value?: number;
  /** Nombre d'étoiles. */
  max?: number;
  /** Appelé avec la nouvelle note au clic ou au clavier. */
  onChange?: (value: number) => void;
  /** Affichage seul : ni clic ni clavier n'émettent. */
  readonly?: boolean;
  /** Autorise les demi-étoiles (sélection au demi-point). */
  allowHalf?: boolean;
  size?: RatingSize;
  /** Attribut name (utile dans un formulaire / pour la sémantique radio). */
  name?: string;
  /** Étiquette accessible du groupe. */
  label?: string;
  class?: string;
};

defineOptions({ name: 'Rating', inheritAttrs: false });
const props = withDefaults(defineProps<RatingProps>(), {
  value: undefined, max: 5, onChange: undefined, readonly: false, allowHalf: false,
  size: 'md', name: undefined, label: undefined, class: undefined,
});
const emit = defineEmits<{
  change: [value: number];
  'update:modelValue': [value: number];
}>();

const internal = ref(props.value ?? 0);
// Refs des boutons radio pour déplacer le focus programmatiquement (mode entier).
const radioRefs = ref<Record<number, HTMLElement | null>>({});

const current = computed(() => props.value ?? internal.value);
const max = computed(() => props.max);
const iconSize = computed(() => (props.size === 'sm' ? 16 : props.size === 'lg' ? 28 : 22));
const stars = computed(() => Array.from({ length: max.value }, (_, i) => i + 1));
// L'étoile « focusable » (tabindex 0) suit la valeur ; à 0 c'est la première.
const focusedStar = computed(() => (current.value > 0 ? Math.ceil(current.value) : 1));
const valueText = computed(() => `${current.value} / ${max.value}`);
const baseClass = computed(() =>
  classNames('st-rating', `st-rating--${props.size}`, props.readonly && 'st-rating--readonly', props.class),
);
const readonlyLabel = computed(() =>
  props.label ? `${props.label} : ${valueText.value}` : valueText.value,
);

function fill(star: number): 'full' | 'half' | 'empty' {
  if (current.value >= star) return 'full';
  if (props.allowHalf && current.value >= star - 0.5) return 'half';
  return 'empty';
}

function setRadioRef(el: unknown, star: number) {
  radioRefs.value[star] = el as HTMLElement | null;
}

function commit(next: number) {
  if (props.readonly) return;
  const clamped = Math.max(0, Math.min(max.value, next));
  if (props.value === undefined) internal.value = clamped;
  emit('update:modelValue', clamped);
  emit('change', clamped);
  props.onChange?.(clamped);
}

function onStarClick(event: MouseEvent, star: number) {
  if (props.readonly) return;
  let next = star;
  if (props.allowHalf) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const isLeftHalf = event.clientX - rect.left < rect.width / 2;
    next = isLeftHalf ? star - 0.5 : star;
  }
  // Re-cliquer la valeur déjà sélectionnée remet à zéro.
  if (next === current.value) {
    commit(0);
    return;
  }
  commit(next);
}

// Clavier pour le mode entier (radiogroup) : déplace le focus DOM.
function onRadioKeyDown(event: KeyboardEvent) {
  if (props.readonly) return;
  const step = 1;
  let handled = true;
  let next: number | null = null;
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      next = Math.min(max.value, current.value + step);
      break;
    case 'ArrowLeft':
    case 'ArrowDown':
      // Ne pas descendre sous 1 (pas de radio "0").
      next = Math.max(1, current.value - step);
      break;
    case 'Home':
      // Home → première étoile (1), pas 0.
      next = 1;
      break;
    case 'End':
      next = max.value;
      break;
    default:
      handled = false;
  }
  if (handled) {
    event.preventDefault();
    if (next !== null) {
      commit(next);
      const targetStar = next > 0 ? Math.ceil(next) : 1;
      const targetEl = radioRefs.value[targetStar];
      if (targetEl) targetEl.focus();
    }
  }
}

// Clavier pour le mode slider (allowHalf).
function onSliderKeyDown(event: KeyboardEvent) {
  if (props.readonly) return;
  const step = 0.5;
  let handled = true;
  let next: number | null = null;
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      next = Math.min(max.value, current.value + step);
      break;
    case 'ArrowLeft':
    case 'ArrowDown':
      next = Math.max(0, current.value - step);
      break;
    case 'Home':
      next = 0;
      break;
    case 'End':
      next = max.value;
      break;
    default:
      handled = false;
  }
  if (handled) {
    event.preventDefault();
    if (next !== null) commit(next);
  }
}
</script>

<template>
  <div
    v-if="props.readonly"
    v-bind="$attrs"
    :class="baseClass"
    role="img"
    :aria-label="readonlyLabel"
  >
    <span
      v-for="star in stars"
      :key="star"
      :class="classNames('st-rating__star', fill(star) === 'full' && 'st-rating__star--full', fill(star) === 'half' && 'st-rating__star--half')"
      aria-hidden="true"
    >
      <svg
        v-if="fill(star) === 'half'"
        :width="iconSize"
        :height="iconSize"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2v15.77z" fill="currentColor" />
        <path d="M12 2v15.77l6.18 3.25L17 14.14 22 9.27l-6.91-1.01L12 2z" />
      </svg>
      <svg
        v-else
        :width="iconSize"
        :height="iconSize"
        viewBox="0 0 24 24"
        :fill="fill(star) === 'full' ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </span>
  </div>
  <div
    v-else-if="props.allowHalf"
    v-bind="$attrs"
    :class="baseClass"
    role="slider"
    :aria-label="props.label"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="current"
    :aria-valuetext="valueText"
    :tabindex="0"
    @keydown="onSliderKeyDown"
  >
    <span
      v-for="star in stars"
      :key="star"
      :class="classNames('st-rating__star', fill(star) === 'full' && 'st-rating__star--full', fill(star) === 'half' && 'st-rating__star--half')"
      aria-hidden="true"
      @click="(event: MouseEvent) => onStarClick(event, star)"
    >
      <svg
        v-if="fill(star) === 'half'"
        :width="iconSize"
        :height="iconSize"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2v15.77z" fill="currentColor" />
        <path d="M12 2v15.77l6.18 3.25L17 14.14 22 9.27l-6.91-1.01L12 2z" />
      </svg>
      <svg
        v-else
        :width="iconSize"
        :height="iconSize"
        viewBox="0 0 24 24"
        :fill="fill(star) === 'full' ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </span>
  </div>
  <div
    v-else
    v-bind="$attrs"
    :class="baseClass"
    role="radiogroup"
    :aria-label="props.label"
    @keydown="onRadioKeyDown"
  >
    <button
      v-for="star in stars"
      :key="star"
      :ref="(el) => setRadioRef(el, star)"
      type="button"
      :class="classNames('st-rating__star', fill(star) === 'full' && 'st-rating__star--full', fill(star) === 'half' && 'st-rating__star--half')"
      role="radio"
      :name="props.name"
      :aria-checked="current === star ? 'true' : 'false'"
      :aria-label="`${star} / ${max}`"
      :tabindex="star === focusedStar ? 0 : -1"
      @click="(event: MouseEvent) => onStarClick(event, star)"
      @keydown="onRadioKeyDown"
    >
      <svg
        :width="iconSize"
        :height="iconSize"
        viewBox="0 0 24 24"
        :fill="fill(star) === 'full' ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  </div>
</template>
