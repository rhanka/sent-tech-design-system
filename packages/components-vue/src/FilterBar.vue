<script setup lang="ts">
import { classNames } from './classNames.js';

export type FilterBarProps = {
  /** Aria-label du groupe de filtres, ex "Filtres actifs". */
  label: string;
  /** Callback "tout effacer" — le bouton n'est rendu que si ce callback est fourni. */
  onClearAll?: () => void;
  /** Libellé du bouton "tout effacer". Défaut "Tout effacer". */
  clearAllLabel?: string;
  class?: string;
};

defineOptions({ name: 'FilterBar', inheritAttrs: false });
const props = withDefaults(defineProps<FilterBarProps>(), {
  onClearAll: undefined,
  clearAllLabel: 'Tout effacer',
  class: undefined,
});
defineSlots<{ default?: () => unknown }>();

const onClearClicked = () => props.onClearAll?.();
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-filterBar', props.class)" role="group" :aria-label="props.label">
    <div class="st-filterBar__pills"><slot /></div>
    <button v-if="props.onClearAll" type="button" class="st-filterBar__clearAll" @click="onClearClicked">{{ props.clearAllLabel }}</button>
  </div>
</template>
