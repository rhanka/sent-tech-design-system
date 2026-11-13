<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type SlideIndicatorVariant = 'dots' | 'bars';
export type SlideIndicatorSize = 'sm' | 'md' | 'lg';

// In addition to the Vue-native `@change` emit, an `onChange` callback prop
// (parity with React/Svelte) is accepted and fired on selection.
export type SlideIndicatorProps = {
  /** Nombre total de diapositives. */
  count: number;
  /** Index de la diapositive courante (0-based). */
  current?: number;
  /** Appelé avec l'index ciblé au clic ou au clavier. */
  onChange?: (index: number) => void;
  size?: SlideIndicatorSize;
  variant?: SlideIndicatorVariant;
  /** Préfixe d'étiquette accessible de chaque point ("Diapositive 1"...). */
  label?: string;
  class?: string;
};

defineOptions({ name: 'SlideIndicator', inheritAttrs: false });
const props = withDefaults(defineProps<SlideIndicatorProps>(), {
  current: 0, onChange: undefined, size: 'md', variant: 'dots', label: 'Diapositive', class: undefined,
});
const emit = defineEmits<{
  change: [index: number];
  'update:modelValue': [index: number];
}>();

// Refs des boutons pour déplacer le focus DOM programmatiquement (roving).
const buttonRefs = ref<Record<number, HTMLElement | null>>({});

const current = computed(() => props.current ?? 0);
const items = computed(() => Array.from({ length: Math.max(0, props.count) }, (_, i) => i));

function setButtonRef(el: unknown, index: number) {
  buttonRefs.value[index] = el as HTMLElement | null;
}

function select(index: number) {
  if (index < 0 || index >= props.count || index === current.value) return;
  emit('update:modelValue', index);
  emit('change', index);

}

function onKeyDown(event: KeyboardEvent, index: number) {
  let target = index;
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      target = Math.min(props.count - 1, index + 1);
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      target = Math.max(0, index - 1);
      break;
    case 'Home':
      target = 0;
      break;
    case 'End':
      target = props.count - 1;
      break;
    default:
      return;
  }
  event.preventDefault();
  const targetEl = buttonRefs.value[target];
  if (targetEl) targetEl.focus();
  select(target);
}
</script>

<template>
  <div
    v-bind="{ ...($attrs), class: (classNames(
      'st-slideIndicator',
      `st-slideIndicator--${props.size}`,
      `st-slideIndicator--${props.variant}`,
      props.class,
    )) }"

    role="group"
    :aria-label="props.label"
  >
    <button
      v-for="index in items"
      :key="index"
      :ref="(el) => setButtonRef(el, index)"
      type="button"
      :class="classNames(
        'st-slideIndicator__dot',
        index === current && 'st-slideIndicator__dot--current',
      )"
      :aria-current="index === current ? 'true' : undefined"
      :aria-label="`${props.label} ${index + 1}`"
      :tabindex="index === current ? 0 : -1"
      @click="() => select(index)"
      @keydown="(event: KeyboardEvent) => onKeyDown(event, index)"
    />
  </div>
</template>
