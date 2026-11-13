<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { classNames } from './classNames.js';
import { nextDatepickerId } from './datepickerId.js';

export type DatePickerSize = 'sm' | 'md' | 'lg';

// Range value shape mirrors the Svelte canonical contract: both bounds are
// `Date | null` (`null` = not yet picked).
export type DatePickerRange = { start: Date | null; end: Date | null };
// Canonical value type, identical to the Svelte DatePicker.
export type DatePickerValue = Date | DatePickerRange | null;

export type DatePickerProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  disabled?: boolean;
  mode?: 'single' | 'range';
  /** `v-model` value (`Date | {start,end} | null`). */
  modelValue?: DatePickerValue;
  min?: Date;
  max?: Date;
  locale?: string;
  placeholder?: string;
  size?: DatePickerSize;
  id?: string;
  openLabel?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  todayLabel?: string;
  class?: string;
};

const dpStartOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const dpIsSameDay = (a: Date | null | undefined, b: Date | null | undefined): boolean => {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

const dpIsRange = (value: DatePickerValue): value is DatePickerRange =>
  value !== null && value !== undefined && typeof value === 'object' && !(value instanceof Date) && 'start' in value;

const dpFirstDayOfWeek = (locale: string): number => {
  try {
    // @ts-expect-error: weekInfo is recent and not in all TS lib versions.
    const info = new Intl.Locale(locale).weekInfo;
    if (info && typeof info.firstDay === 'number') {
      return info.firstDay === 7 ? 0 : info.firstDay;
    }
  } catch {
    // Ignore — fall back below.
  }
  return locale.toLowerCase().startsWith('en-us') ? 0 : 1;
};

defineOptions({ name: 'DatePicker', inheritAttrs: false });
const props = withDefaults(defineProps<DatePickerProps>(), {
  label: undefined,
  helperText: undefined,
  errorText: undefined,
  invalid: false,
  disabled: false,
  mode: 'single',
  modelValue: undefined,
  min: undefined,
  max: undefined,
  locale: 'fr-FR',
  placeholder: undefined,
  size: 'md',
  id: undefined,
  openLabel: undefined,
  previousMonthLabel: undefined,
  nextMonthLabel: undefined,
  todayLabel: undefined,
  class: undefined,
});
const emit = defineEmits<{
  'update:modelValue': [value: DatePickerValue];
  change: [value: DatePickerValue];
}>();

const autoId = ref(nextDatepickerId());
const hostRef = ref<HTMLElement | null>(null);
const open = ref(false);

// Uncontrolled fallback when `modelValue` is omitted (parity with the
// Svelte $bindable default normalisation by mode).
const emptyValue = (): DatePickerValue => (props.mode === 'range' ? { start: null, end: null } : null);
const internal = ref<DatePickerValue>(props.modelValue ?? emptyValue());

const activeValue = (): DatePickerValue => (props.modelValue !== undefined ? props.modelValue : internal.value);

const pickInitialMonth = (): Date => {
  const v = activeValue();
  if (props.mode === 'single' && v instanceof Date) return dpStartOfDay(v);
  if (dpIsRange(v) && v.start) return dpStartOfDay(v.start);
  return dpStartOfDay(new Date());
};

const initial = pickInitialMonth();
const viewYear = ref(initial.getFullYear());
const viewMonth = ref(initial.getMonth());

const setOpen = (val: boolean) => {
  open.value = val;
};

const commit = (next: DatePickerValue) => {
  if (props.modelValue === undefined) internal.value = next;
  emit('update:modelValue', next);
  emit('change', next);
};

const onMouseDown = (event: MouseEvent) => {
  const target = event.target as Node | null;
  if (target && hostRef.value && !hostRef.value.contains(target)) setOpen(false);
};

watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      // Re-sync the visible month when the calendar reopens.
      const m = pickInitialMonth();
      viewYear.value = m.getFullYear();
      viewMonth.value = m.getMonth();
      document.addEventListener('mousedown', onMouseDown);
    } else {
      document.removeEventListener('mousedown', onMouseDown);
    }
  },
);

onUnmounted(() => document.removeEventListener('mousedown', onMouseDown));

const isOutOfBounds = (date: Date): boolean => {
  const d = dpStartOfDay(date).getTime();
  if (props.min && d < dpStartOfDay(props.min).getTime()) return true;
  if (props.max && d > dpStartOfDay(props.max).getTime()) return true;
  return false;
};

const previousMonth = () => {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value -= 1;
  } else {
    viewMonth.value -= 1;
  }
};

const nextMonth = () => {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value += 1;
  } else {
    viewMonth.value += 1;
  }
};

const pickDate = (date: Date) => {
  if (isOutOfBounds(date)) return;
  const picked = dpStartOfDay(date);
  if (props.mode === 'single') {
    commit(picked);
    setOpen(false);
    return;
  }
  const v = activeValue();
  const range = dpIsRange(v) ? v : { start: null, end: null };
  if (!range.start || (range.start && range.end)) {
    commit({ start: picked, end: null });
    return;
  }
  if (picked.getTime() < dpStartOfDay(range.start).getTime()) {
    commit({ start: picked, end: null });
    return;
  }
  commit({ start: range.start, end: picked });
  setOpen(false);
};

const toggleOpen = () => {
  if (props.disabled) return;
  setOpen(!open.value);
};

const onPanelKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && open.value) {
    event.preventDefault();
    setOpen(false);
  }
};

const inputId = computed(() => props.id ?? autoId.value);
const locale = computed(() => props.locale ?? 'fr-FR');
const isFr = computed(() => (locale.value ?? 'fr-FR').toLowerCase().startsWith('fr'));

const resolvedOpenLabel = computed(() => props.openLabel ?? (isFr.value ? 'Ouvrir le calendrier' : 'Open calendar'));
const resolvedPrevLabel = computed(() => props.previousMonthLabel ?? (isFr.value ? 'Mois précédent' : 'Previous month'));
const resolvedNextLabel = computed(() => props.nextMonthLabel ?? (isFr.value ? 'Mois suivant' : 'Next month'));
const resolvedTodayLabel = computed(() => props.todayLabel ?? (isFr.value ? "Aujourd'hui" : 'Today'));
const resolvedPlaceholder = computed(() =>
  props.placeholder ??
  (isFr.value
    ? props.mode === 'range'
      ? 'jj/mm/aaaa - jj/mm/aaaa'
      : 'jj/mm/aaaa'
    : props.mode === 'range'
      ? 'mm/dd/yyyy - mm/dd/yyyy'
      : 'mm/dd/yyyy'),
);

const dateFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: '2-digit', year: 'numeric' }));
const monthFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }));
const weekdayFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { weekday: 'short' }));
const cellFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long', year: 'numeric' }));

const weekStart = computed(() => dpFirstDayOfWeek(locale.value));

const weekdayLabels = computed(() => {
  const sample = new Date(Date.UTC(2024, 0, 7)); // a Sunday
  const rawLabels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sample);
    d.setUTCDate(sample.getUTCDate() + i);
    rawLabels.push(weekdayFormatter.value.format(d));
  }
  const start = weekStart.value;
  return [...rawLabels.slice(start), ...rawLabels.slice(0, start)];
});

type GridCell = { date: Date; inMonth: boolean };
const grid = computed<GridCell[]>(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1);
  const offset = (first.getDay() - weekStart.value + 7) % 7;
  const start = new Date(viewYear.value, viewMonth.value, 1 - offset);
  const cells: GridCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: dpStartOfDay(d), inMonth: d.getMonth() === viewMonth.value });
  }
  return cells;
});

const isSelected = (date: Date): boolean => {
  const v = activeValue();
  if (props.mode === 'single') return v instanceof Date && dpIsSameDay(v, date);
  if (dpIsRange(v)) return dpIsSameDay(v.start, date) || dpIsSameDay(v.end, date);
  return false;
};
const isInRange = (date: Date): boolean => {
  const v = activeValue();
  if (props.mode !== 'range' || !dpIsRange(v)) return false;
  const { start: rs, end: re } = v;
  if (!rs || !re) return false;
  const d = dpStartOfDay(date).getTime();
  return d > dpStartOfDay(rs).getTime() && d < dpStartOfDay(re).getTime();
};

const formattedValue = computed((): string => {
  const v = activeValue();
  if (props.mode === 'single') return v instanceof Date ? dateFormatter.value.format(v) : '';
  if (dpIsRange(v)) {
    const s = v.start ? dateFormatter.value.format(v.start) : '';
    const e = v.end ? dateFormatter.value.format(v.end) : '';
    if (!s && !e) return '';
    return `${s} - ${e}`;
  }
  return '';
});

const isInvalid = computed(() => props.invalid || Boolean(props.errorText));
const monthLabel = computed(() => monthFormatter.value.format(new Date(viewYear.value, viewMonth.value, 1)));
</script>

<template>
  <div ref="hostRef" v-bind="$attrs" :class="classNames('st-field', props.class)">
    <label class="st-field__control" :for="inputId">
      <span v-if="props.label" class="st-field__label">{{ props.label }}</span>
      <span :class="classNames('st-datepicker', `st-datepicker--${props.size}`)">
        <input :id="inputId" type="text" readonly class="st-datepicker__control" :value="formattedValue" :placeholder="resolvedPlaceholder" :disabled="props.disabled" :aria-invalid="isInvalid ? 'true' : undefined" @click="toggleOpen" />
        <button type="button" class="st-datepicker__trigger" :aria-label="resolvedOpenLabel" aria-haspopup="dialog" :aria-expanded="open ? 'true' : 'false'" :disabled="props.disabled" @click="toggleOpen"><span aria-hidden="true">📅</span></button>
      </span>
    </label>
    <div v-if="open" class="st-datepicker__panel" role="dialog" :tabindex="-1" :aria-label="String(props.label ?? resolvedOpenLabel)" @keydown="onPanelKeyDown">
      <div class="st-datepicker__nav">
        <button type="button" class="st-datepicker__navBtn" :aria-label="resolvedPrevLabel" @click="previousMonth"><span aria-hidden="true">‹</span></button>
        <span class="st-datepicker__monthLabel" aria-live="polite">{{ monthLabel }}</span>
        <button type="button" class="st-datepicker__navBtn" :aria-label="resolvedNextLabel" @click="nextMonth"><span aria-hidden="true">›</span></button>
      </div>
      <div class="st-datepicker__grid" role="grid">
        <div class="st-datepicker__weekdays" role="row">
          <span v-for="(wd, i) in weekdayLabels" :key="`${wd}-${i}`" class="st-datepicker__weekday" role="columnheader">{{ wd }}</span>
        </div>
        <div class="st-datepicker__days">
          <button v-for="(cell, i) in grid" :key="i" type="button" :class="classNames('st-datepicker__day', !cell.inMonth && 'st-datepicker__day--outside', isSelected(cell.date) && 'st-datepicker__day--selected', isInRange(cell.date) && 'st-datepicker__day--inRange')" :aria-label="cellFormatter.format(cell.date)" :aria-pressed="isSelected(cell.date) ? 'true' : 'false'" :aria-disabled="isOutOfBounds(cell.date) ? 'true' : undefined" :disabled="isOutOfBounds(cell.date)" @click="() => pickDate(cell.date)">{{ String(cell.date.getDate()) }}</button>
        </div>
      </div>
      <div class="st-datepicker__footer">
        <button type="button" class="st-datepicker__todayBtn" :disabled="isOutOfBounds(new Date())" @click="() => pickDate(new Date())">{{ resolvedTodayLabel }}</button>
      </div>
    </div>
    <span v-if="props.errorText" class="st-field__error">{{ props.errorText }}</span>
    <span v-else-if="props.helperText" class="st-field__help">{{ props.helperText }}</span>
  </div>
</template>
