<script setup lang="ts">
import { computed } from 'vue';
import { X } from 'lucide-vue-next';
import { classNames } from './classNames.js';

export type SelectionChipTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

export type SelectionChipProps = {
  /** Libellé de la dimension sélectionnée. */
  label: string;
  /** Nombre d'éléments sélectionnés — affiché "(N)" si fourni et Number.isFinite. */
  count?: number;
  tone?: SelectionChipTone;
  /** Callback effacement — affiche le bouton ✕ si fourni. */
  onClear?: () => void;
  disabled?: boolean;
  class?: string;
};

defineOptions({ name: 'SelectionChip', inheritAttrs: false });
const props = withDefaults(defineProps<SelectionChipProps>(), {
  count: undefined, tone: 'neutral', onClear: undefined, disabled: false, class: undefined,
});

const showCount = computed(() => props.count !== undefined && Number.isFinite(props.count));

function handleClear(e: MouseEvent) {
  e.stopPropagation();
  if (props.disabled) return;
  props.onClear?.();
}
</script>

<template>
  <span
    v-bind="$attrs"
    :class="classNames(
      'st-selectionChip',
      `st-selectionChip--${props.tone}`,
      props.disabled ? 'st-selectionChip--disabled' : undefined,
      props.class,
    )"
    :aria-disabled="props.disabled ? 'true' : undefined"
  >
    <span class="st-selectionChip__label">{{ props.label }}</span>
    <span v-if="showCount" class="st-selectionChip__count" :aria-label="`(${props.count})`">{{ `(${props.count})` }}</span>
    <button
      v-if="props.onClear"
      type="button"
      class="st-selectionChip__clear"
      :aria-label="`Effacer ${props.label}`"
      :disabled="props.disabled"
      @click="handleClear"
    >
      <X :size="11" :stroke-width="2.5" aria-hidden="true" />
    </button>
  </span>
</template>
