<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { nextComboboxId } from './comboboxId.js';

export type ComboboxOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type ComboboxSize = 'sm' | 'md' | 'lg';

export type ComboboxProps = {
  label?: unknown;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  options: ComboboxOption[];
  value?: string;
  size?: ComboboxSize;
  placeholder?: string;
  disabled?: boolean;
  open?: boolean;
  allowCustomValue?: boolean;
  noResultsLabel?: unknown;
  listLabel?: string;
  clearLabel?: string;
  toggleLabel?: string;
  class?: string;
};

function moveIndex(index: number, max: number, delta: number): number {
  if (max <= 0) return -1;
  return (index + delta + max) % max;
}

defineOptions({ name: 'Combobox', inheritAttrs: false });
const props = withDefaults(defineProps<ComboboxProps>(), {
  label: undefined,
  helperText: undefined,
  errorText: undefined,
  invalid: false,
  value: undefined,
  size: 'md',
  placeholder: 'Select or type',
  disabled: false,
  open: undefined,
  allowCustomValue: true,
  noResultsLabel: undefined,
  listLabel: undefined,
  clearLabel: 'Clear selection',
  toggleLabel: 'Toggle options',
  class: undefined,
});
const emit = defineEmits<{
  change: [value: string];
  select: [value: string];
  'update:open': [value: boolean];
  'update:modelValue': [value: string];
}>();

const instanceId = nextComboboxId();
const inputId = `${instanceId}-input`;
const listId = `${instanceId}-list`;

const getInitialInput = () => {
  const found = props.options.find((opt) => opt.value === props.value);
  return found ? String(found.label) : (props.value ?? '');
};

const inputValue = ref(getInitialInput());
const localOpen = ref(false);
const activeIndex = ref(-1);

const open = computed(() => (props.open !== undefined ? props.open : localOpen.value));

function setOpen(val: boolean) {
  if (props.open === undefined) localOpen.value = val;
  emit('update:open', val);
}

const filtered = computed(() => {
  const query = inputValue.value.trim().toLowerCase();
  if (!query) return props.options;
  return props.options.filter((opt) => String(opt.label).toLowerCase().includes(query));
});

function selectOption(option: ComboboxOption) {
  if (option.disabled) return;
  inputValue.value = String(option.label);
  setOpen(false);
  activeIndex.value = -1;
  emit('select', option.value);
  emit('change', option.value);
  emit('update:modelValue', option.value);
}

const selected = computed(() => props.options.find((opt) => opt.value === props.value));
const displayValue = computed(() => (selected.value ? String(selected.value.label) : inputValue.value));
const isInvalid = computed(() => props.invalid || Boolean(props.errorText));
const activeDescendant = computed(() =>
  activeIndex.value >= 0 && filtered.value[activeIndex.value]
    ? `${listId}-${filtered.value[activeIndex.value].value}`
    : undefined,
);
const listLabel = computed(() => props.listLabel ?? (props.label ? String(props.label) : 'Options'));
const noResults = computed(() => String(props.noResultsLabel ?? 'No results'));
const toggleIconClass = computed(() => {
  const cls = classNames('st-combobox__toggleIcon', open.value && 'st-combobox__toggleIcon--open');
  return `lucide ${cls} lucide-chevron-down-icon lucide-chevron-down ${cls}`;
});

function onFocus() {
  if (!props.disabled) setOpen(true);
}
function onInput(event: Event) {
  const val = (event.target as HTMLInputElement).value;
  inputValue.value = val;
  setOpen(true);
  activeIndex.value = -1;
  if (props.allowCustomValue) {
    emit('change', val);
    emit('update:modelValue', val);
  }
}
function onKeydown(event: KeyboardEvent) {
  const f = filtered.value;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    setOpen(true);
    activeIndex.value = moveIndex(activeIndex.value, f.length, 1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    setOpen(true);
    activeIndex.value = moveIndex(activeIndex.value < 0 ? f.length : activeIndex.value, f.length, -1);
  } else if (event.key === 'Enter' && open.value && activeIndex.value >= 0 && f[activeIndex.value]) {
    event.preventDefault();
    selectOption(f[activeIndex.value]);
  } else if (event.key === 'Escape' && open.value) {
    event.preventDefault();
    setOpen(false);
    activeIndex.value = -1;
  }
}
function onClear() {
  inputValue.value = '';
  activeIndex.value = -1;
  emit('change', '');
  emit('update:modelValue', '');
}
function onToggle() {
  setOpen(!open.value);
}
function onOptionMousedown(event: MouseEvent, option: ComboboxOption) {
  event.preventDefault();
  selectOption(option);
}
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-field', props.class)">
    <label class="st-field__control" :for="inputId">
      <span v-if="props.label" class="st-field__label">{{ props.label }}</span>
      <span :class="classNames('st-combobox', `st-combobox--${props.size}`)">
        <input :id="inputId" class="st-combobox__control" role="combobox" :aria-expanded="open" aria-autocomplete="list" :aria-controls="listId" :aria-invalid="isInvalid ? 'true' : undefined" :aria-activedescendant="activeDescendant" :placeholder="props.placeholder" :disabled="props.disabled" :value="displayValue" @focus="onFocus" @input="onInput" @keydown="onKeydown" />
        <button v-if="displayValue" type="button" class="st-combobox__clear" :aria-label="props.clearLabel" :disabled="props.disabled" @click="onClear"><svg aria-hidden="true" class="lucide lucide-x-icon lucide-x" fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.25" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>
        <button type="button" class="st-combobox__toggle" :aria-label="props.toggleLabel" :aria-expanded="open" :disabled="props.disabled" @click="onToggle"><svg aria-hidden="true" :class="toggleIconClass" fill="none" height="18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.25" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="m6 9 6 6 6-6"></path></svg></button>
      </span>
    </label>
    <div v-if="open" :id="listId" class="st-combobox__list" role="listbox" :aria-label="listLabel">
      <template v-if="filtered.length">
        <button v-for="(option, index) in filtered" :key="option.value" :id="`${listId}-${option.value}`" type="button" :class="classNames('st-combobox__option', index === activeIndex && 'st-combobox__option--active')" role="option" :aria-selected="displayValue === String(option.label) ? 'true' : 'false'" :aria-disabled="option.disabled ? 'true' : undefined" :disabled="option.disabled" @mousedown="onOptionMousedown($event, option)">{{ String(option.label) }}</button>
      </template>
      <div v-else class="st-combobox__empty" role="option" aria-disabled="true" aria-selected="false">{{ noResults }}</div>
    </div>
    <span v-if="props.errorText" class="st-field__error">{{ props.errorText }}</span>
    <span v-else-if="props.helperText" class="st-field__help">{{ props.helperText }}</span>
  </div>
</template>
