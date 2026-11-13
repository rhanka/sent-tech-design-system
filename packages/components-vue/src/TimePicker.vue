<script setup lang="ts">
import Icon from './Icon.vue';
import { useId, computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { classNames } from './classNames.js';

export type TimePickerFormat = '24' | '12';
export type TimePickerSize = 'sm' | 'md' | 'lg';

// In addition to the Vue-native `@change` emit, an `onChange` callback prop
// (parity with React/Svelte) is accepted and fired on selection.
export type TimePickerProps = {
  /** Heure courante au format "HH:mm" (24h, toujours). Vide = non renseigné. */
  value?: string;
  /** Appelé avec "HH:mm" lors d'une sélection. */
  onChange?: (value: string) => void;
  /** Pas (en minutes) entre deux créneaux générés. */
  step?: number;
  /** Borne minimale "HH:mm" (inclusive). */
  min?: string;
  /** Borne maximale "HH:mm" (inclusive). */
  max?: string;
  /** Affichage 24h (par défaut) ou 12h (AM/PM). La valeur émise reste "HH:mm". */
  format?: TimePickerFormat;
  size?: TimePickerSize;
  disabled?: boolean;
  label?: string;
  class?: string;
  id?: string;
};

function timeToMinutes(hhmm: string | undefined): number | null {
  if (!hhmm) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function timeFromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

defineOptions({ name: 'TimePicker', inheritAttrs: false });
const props = withDefaults(defineProps<TimePickerProps>(), {
  value: undefined, onChange: undefined, step: 15, min: undefined, max: undefined,
  format: '24', size: 'md', disabled: false, label: undefined, class: undefined, id: undefined,
});
const emit = defineEmits<{
  change: [value: string];
  'update:modelValue': [value: string];
}>();

const autoId = ref(`st-timepicker-${useId()}`);
const internal = ref(props.value ?? '');
const open = ref(false);
const activeIndex = ref(-1);
const hostEl = ref<HTMLDivElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);
const listEl = ref<HTMLUListElement | null>(null);

const onDocumentMouseDown = (event: MouseEvent) => {
  if (!open.value) return;
  const target = event.target as Node | null;
  if (hostEl.value && target && !hostEl.value.contains(target)) {
    open.value = false;
    activeIndex.value = -1;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMouseDown);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentMouseDown);
});

const display = (hhmm: string): string => {
  if (props.format === '24') return hhmm;
  const total = timeToMinutes(hhmm);
  if (total === null) return hhmm;
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const period = h24 < 12 ? 'AM' : 'PM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
};

function scrollActiveIntoView(listId: string) {
  if (!listEl.value || activeIndex.value < 0) return;
  const optEl = listEl.value.querySelector<HTMLElement>(
    `#${listId}-opt-${activeIndex.value}`,
  );
  if (optEl && typeof optEl.scrollIntoView === 'function') {
    optEl.scrollIntoView({ block: 'nearest' });
  }
}

const current = computed(() => props.value ?? internal.value);
const fieldId = computed(() => props.id ?? autoId.value);
const listId = computed(() => `${fieldId.value}-list`);
// Keep `listId` reactive reads inside template handlers through the computed above.

const slotTimes = computed(() => {
  const safeStep = props.step > 0 ? props.step : 15;
  const lower = timeToMinutes(props.min) ?? 0;
  const upper = timeToMinutes(props.max) ?? 23 * 60 + 59;
  const times: string[] = [];
  for (let t = lower; t <= upper; t += safeStep) {
    times.push(timeFromMinutes(t));
  }
  return times;
});

const displayValue = computed(() => current.value ? display(current.value) : '');

const activeDescendant = computed(() =>
  open.value && activeIndex.value >= 0
    ? `${listId.value}-opt-${activeIndex.value}`
    : undefined,
);

function openList() {
  if (props.disabled) return;
  open.value = true;
  const idx = current.value ? slotTimes.value.indexOf(current.value) : -1;
  activeIndex.value = idx >= 0 ? idx : 0;
  // Focus reste sur l'input (pattern aria-activedescendant).
}

function closeList(returnFocus = true) {
  open.value = false;
  activeIndex.value = -1;
  if (returnFocus && inputEl.value) inputEl.value.focus();
}

function toggleOpen() {
  if (props.disabled) return;
  if (open.value) closeList(true);
  else openList();
}

const pick = (slot: string) => {
  if (props.value === undefined) internal.value = slot;
  emit('update:modelValue', slot);
  // `emit("change")` already routes to an `onChange` handler prop (Vue maps
  // emitted events to their `onX` listeners), so calling `props.onChange`
  // here as well would fire the callback twice. Emit only.
  emit('change', slot);
  closeList(true);
};

const onInputKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (!open.value) {
        openList();
      } else {
        activeIndex.value = Math.min(activeIndex.value + 1, slotTimes.value.length - 1);
        scrollActiveIntoView(listId.value);
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (!open.value) {
        openList();
      } else {
        activeIndex.value = Math.max(activeIndex.value - 1, 0);
        scrollActiveIntoView(listId.value);
      }
      break;
    case 'Home':
      event.preventDefault();
      if (!open.value) {
        openList();
      } else {
        activeIndex.value = 0;
        scrollActiveIntoView(listId.value);
      }
      break;
    case 'End':
      event.preventDefault();
      if (!open.value) {
        openList();
      } else {
        activeIndex.value = slotTimes.value.length - 1;
        scrollActiveIntoView(listId.value);
      }
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (!open.value) {
        openList();
      } else {
        if (activeIndex.value >= 0 && activeIndex.value < slotTimes.value.length) {
          pick(slotTimes.value[activeIndex.value]);
        }
      }
      break;
    case 'Escape':
      if (open.value) {
        event.preventDefault();
        closeList(true);
      }
      break;
  }
};

const onListKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      activeIndex.value = Math.min(activeIndex.value + 1, slotTimes.value.length - 1);
      scrollActiveIntoView(listId.value);
      break;
    case 'ArrowUp':
      event.preventDefault();
      activeIndex.value = Math.max(activeIndex.value - 1, 0);
      scrollActiveIntoView(listId.value);
      break;
    case 'Home':
      event.preventDefault();
      activeIndex.value = 0;
      scrollActiveIntoView(listId.value);
      break;
    case 'End':
      event.preventDefault();
      activeIndex.value = slotTimes.value.length - 1;
      scrollActiveIntoView(listId.value);
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (activeIndex.value >= 0 && activeIndex.value < slotTimes.value.length) {
        pick(slotTimes.value[activeIndex.value]);
      }
      break;
    case 'Escape':
      event.preventDefault();
      closeList(true);
      break;
  }
};
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-field', props.class)) }"  ref="hostEl">
    <div class="st-field__control">
      <label v-if="props.label" class="st-field__label" :for="fieldId">{{ props.label }}</label>
      <span :class="classNames('st-timepicker', `st-timepicker--${props.size}`)">
        <input
          ref="inputEl"
          :id="fieldId"
          type="text"
          readonly
          class="st-timepicker__control"
          :value="displayValue"
          :placeholder="props.format === '24' ? 'HH:mm' : 'hh:mm AM'"
          :disabled="props.disabled"
          role="combobox"
          aria-haspopup="listbox"
          :aria-controls="listId"
          :aria-expanded="open ? 'true' : 'false'"
          :aria-activedescendant="activeDescendant"
          aria-autocomplete="none"
          :tabindex="0"
          @click="toggleOpen"
          @keydown="onInputKeyDown"
        />
        <button
          type="button"
          class="st-timepicker__trigger"
          aria-label="Ouvrir la liste des horaires"
          aria-haspopup="listbox"
          :aria-expanded="open ? 'true' : 'false'"
          :tabindex="-1"
          :disabled="props.disabled"
          @click="toggleOpen"
        >
          <Icon name="clock" :size="16" />
        </button>
      </span>
    </div>
    <ul
      v-if="open"
      ref="listEl"
      :id="listId"
      class="st-timepicker__list"
      role="listbox"
      :aria-label="props.label ?? 'Horaires'"
      :tabindex="-1"
      @keydown="onListKeyDown"
    >
      <li v-for="(slot, i) in slotTimes" :key="slot" role="presentation">
        <div
          :id="`${listId}-opt-${i}`"
          :class="classNames(
            'st-timepicker__option',
            slot === current && 'st-timepicker__option--selected',
            i === activeIndex && 'st-timepicker__option--active',
          )"
          role="option"
          :aria-selected="slot === current ? 'true' : 'false'"
          :tabindex="-1"
          @mousedown="(e: MouseEvent) => e.preventDefault()"
          @click="pick(slot)"
          @mouseenter="activeIndex = i"
        >{{ display(slot) }}</div>
      </li>
    </ul>
  </div>
</template>
