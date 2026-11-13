<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';

export type MultiSelectOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type MultiSelectSize = 'sm' | 'md' | 'lg';

export type MultiSelectProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  options: MultiSelectOption[];
  value?: string[];
  values?: string[];
  /** Svelte-canonical alias for the selected values. */
  selected?: string[];
  size?: MultiSelectSize;
  open?: boolean;
  locale?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  toggleLabel?: string;
  removeLabel?: string;
  listLabel?: string;
  disabled?: boolean;
  class?: string;
};

defineOptions({ name: 'MultiSelect', inheritAttrs: false });
const props = withDefaults(defineProps<MultiSelectProps>(), {
  label: undefined, helperText: undefined, errorText: undefined, invalid: false,
  value: undefined, values: undefined, selected: undefined, size: 'md', open: undefined,
  locale: 'fr-FR', placeholder: undefined, searchPlaceholder: undefined, noResultsLabel: undefined,
  toggleLabel: undefined, removeLabel: undefined, listLabel: undefined, disabled: false, class: undefined,
});
const emit = defineEmits<{
  change: [values: string[]];
  'update:open': [value: boolean];
  'update:modelValue': [values: string[]];
}>();

const localOpen = ref(false);
const localSelected = ref<string[]>(props.value ?? props.values ?? props.selected ?? []);
const query = ref('');

const isOpen = computed(() => (props.open !== undefined ? props.open : localOpen.value));
const selected = computed(() => props.value ?? props.values ?? props.selected ?? localSelected.value);
const controlled = computed(() => props.value !== undefined || props.values !== undefined || props.selected !== undefined);
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((opt) => String(opt.label).toLowerCase().includes(q));
});
const isFr = computed(() => (props.locale ?? 'fr-FR').toLowerCase().startsWith('fr'));
const resolvedPlaceholder = computed(() => props.placeholder ?? (isFr.value ? 'Sélectionner des éléments' : 'Select items'));
const resolvedSearchPlaceholder = computed(() => props.searchPlaceholder ?? (isFr.value ? 'Filtrer' : 'Filter'));
const resolvedNoResultsLabel = computed(() => props.noResultsLabel ?? (isFr.value ? 'Aucun résultat' : 'No results'));
const resolvedToggleLabel = computed(() => props.toggleLabel ?? (isFr.value ? 'Afficher les options' : 'Toggle options'));
const resolvedRemoveLabel = computed(() => props.removeLabel ?? (isFr.value ? 'Supprimer' : 'Remove'));
const selectedOptions = computed(() =>
  selected.value
    .map((value) => props.options.find((opt) => opt.value === value))
    .filter((opt): opt is MultiSelectOption => Boolean(opt)),
);
const isInvalid = computed(() => props.invalid || Boolean(props.errorText));
const caretIconClass = computed(() => {
  const custom = `st-multiSelect__caretIcon${isOpen.value ? ' st-multiSelect__caretIcon--open' : ''}`;
  return `lucide ${custom} lucide-chevron-down-icon lucide-chevron-down ${custom}`;
});

function setOpen(val: boolean) {
  if (props.open === undefined) localOpen.value = val;
  emit('update:open', val);
}
function commit(next: string[]) {
  if (!controlled.value) localSelected.value = next;
  emit('change', next);
  emit('update:modelValue', next);
}
function toggleOption(option: MultiSelectOption) {
  if (option.disabled) return;
  const current = selected.value;
  const next = current.includes(option.value)
    ? current.filter((v) => v !== option.value)
    : [...current, option.value];
  commit(next);
}
function removeOption(value: string) {
  commit(selected.value.filter((v) => v !== value));
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault();
    setOpen(false);
  }
}
function onSearchInput(event: Event) {
  query.value = (event.currentTarget as HTMLInputElement).value;
}
</script>

<template>
  <div
    v-bind="$attrs"
    :class="classNames('st-field', props.class)"
    role="group"
    :aria-label="props.label ? String(props.label) : undefined"
    @keydown="onKeydown"
  >
    <span v-if="props.label" class="st-field__label">{{ props.label }}</span>
    <span v-if="selectedOptions.length > 0" class="st-multiSelect__tags">
      <span v-for="option in selectedOptions" :key="option.value" class="st-multiSelect__tag">
        <span class="st-multiSelect__tagLabel">{{ String(option.label) }}</span>
        <button
          type="button"
          class="st-multiSelect__tagRemove"
          :aria-label="`${resolvedRemoveLabel} ${String(option.label)}`"
          :disabled="props.disabled"
          @click="removeOption(option.value)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </button>
      </span>
    </span>
    <span :class="classNames('st-multiSelect', `st-multiSelect--${props.size}`)" :data-invalid="isInvalid ? 'true' : undefined">
      <button
        type="button"
        class="st-multiSelect__trigger"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        :disabled="props.disabled"
        @click="setOpen(!isOpen)"
      >
        <span v-if="selectedOptions.length === 0" class="st-multiSelect__placeholder">{{ resolvedPlaceholder }}</span>
        <span v-else class="st-multiSelect__count">{{ `${selectedOptions.length} ${isFr ? 'sélectionné(s)' : 'selected'}` }}</span>
        <span class="st-multiSelect__caret" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" :class="caretIconClass" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </span>
        <span class="st-visually-hidden">{{ resolvedToggleLabel }}</span>
      </button>
    </span>
    <div v-if="isOpen" class="st-multiSelect__panel">
      <input
        type="search"
        class="st-multiSelect__search"
        :placeholder="resolvedSearchPlaceholder"
        :value="query"
        :aria-label="resolvedSearchPlaceholder"
        @input="onSearchInput"
      />
      <div
        class="st-multiSelect__list"
        role="listbox"
        :aria-label="props.listLabel ?? (props.label ? String(props.label) : 'Options')"
        aria-multiselectable="true"
      >
        <div v-if="filtered.length === 0" class="st-multiSelect__empty">{{ resolvedNoResultsLabel }}</div>
        <button
          v-for="option in filtered"
          v-else
          :key="option.value"
          class="st-multiSelect__option"
          type="button"
          role="option"
          :aria-selected="selected.includes(option.value) ? 'true' : 'false'"
          :aria-disabled="option.disabled ? 'true' : undefined"
          :disabled="option.disabled"
          @click="toggleOption(option)"
        >
          <span class="st-multiSelect__check" aria-hidden="true">{{ selected.includes(option.value) ? '✓' : '' }}</span>
          <span>{{ String(option.label) }}</span>
        </button>
      </div>
    </div>
    <span v-if="props.errorText" class="st-field__error">{{ props.errorText }}</span>
    <span v-else-if="props.helperText" class="st-field__help">{{ props.helperText }}</span>
  </div>
</template>
