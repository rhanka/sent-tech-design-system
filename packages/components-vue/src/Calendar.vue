<script setup lang="ts">
import Icon from './Icon.vue';
import { computed, nextTick, ref, watch } from 'vue';
import { classNames } from './classNames.js';

/**
 * En mode simple : `string | null` ("YYYY-MM-DD").
 * En mode plage (`range`) : tuple `[start, end]` où chaque borne est
 * "YYYY-MM-DD" ou null.
 */
export type CalendarValue = string | null | [string | null, string | null];

// In addition to the Vue-native `@change` emit, an `onChange` callback prop
// (parity with React/Svelte) is accepted and fired on selection.
export type CalendarProps = {
  /** Date sélectionnée ("YYYY-MM-DD") ou tuple [start,end] si `range`. */
  value?: CalendarValue;
  /** Appelé avec la nouvelle date (ou le tuple en mode plage). */
  onChange?: (value: CalendarValue) => void;
  /** Borne minimale "YYYY-MM-DD" (inclusive). */
  min?: string;
  /** Borne maximale "YYYY-MM-DD" (inclusive). */
  max?: string;
  /** Sélection d'une plage de deux dates. */
  range?: boolean;
  /** Premier jour de la semaine : 0 = dimanche, 1 = lundi. */
  weekStartsOn?: 0 | 1;
  locale?: string;
  /** Mois affiché ("YYYY-MM"), contrôlable de l'extérieur. */
  month?: string;
  /**
   * Appelé avec le nouveau mois affiché ("YYYY-MM") quand il change par une
   * navigation interne (boutons précédent/suivant, clavier qui franchit un
   * mois, PageUp/PageDown). Écouter `@month-change`. Jamais émis quand c'est
   * le parent qui change la prop `month` (pas de boucle).
   */
  onMonthChange?: (month: string) => void;
  class?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
};

function calStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function calParseISO(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(d.getTime()) ? null : calStartOfDay(d);
}

function calIsSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

defineOptions({ name: 'Calendar', inheritAttrs: false });
const props = withDefaults(defineProps<CalendarProps>(), {
  value: null,
  onChange: undefined,
  min: undefined,
  max: undefined,
  range: false,
  weekStartsOn: 1,
  locale: 'fr-FR',
  month: undefined,
  onMonthChange: undefined,
  class: undefined,
  previousMonthLabel: undefined,
  nextMonthLabel: undefined,
});
const emit = defineEmits<{
  change: [value: CalendarValue];
  'update:modelValue': [value: CalendarValue];
  monthChange: [month: string];
}>();

const internal = ref<CalendarValue>(props.value ?? null);

function pickInitialMonth(): Date {
  const parsed = calParseISO(props.month ? `${props.month}-01` : undefined);
  if (parsed) return parsed;
  const v = props.value ?? internal.value;
  if (!props.range) {
    const single = calParseISO(v as string | null);
    if (single) return single;
  } else if (Array.isArray(v)) {
    const start = calParseISO(v[0]);
    if (start) return start;
  }
  return calStartOfDay(new Date());
}

const initial = pickInitialMonth();
const viewYear = ref(initial.getFullYear());
const viewMonth = ref(initial.getMonth());

// Resynchronise le mois affiché lorsque la prop `month` change.
watch(
  () => props.month,
  (m) => {
    const parsed = calParseISO(m ? `${m}-01` : undefined);
    if (parsed) {
      viewYear.value = parsed.getFullYear();
      viewMonth.value = parsed.getMonth();
    }
  },
);

// --- Roving tabindex: focusDate ----------------------------------------
// INVARIANT : focusDate est toujours dans le mois affiché ET non-disabled.
const gridEl = ref<HTMLElement | null>(null);

function isOutOfBoundsDate(date: Date, minDate: Date | null, maxDate: Date | null): boolean {
  const d = calStartOfDay(date).getTime();
  if (minDate && d < minDate.getTime()) return true;
  if (maxDate && d > maxDate.getTime()) return true;
  return false;
}

function clampToMonth(
  preferred: Date,
  year: number,
  month: number,
  minDate: Date | null,
  maxDate: Date | null,
): Date | null {
  if (
    preferred.getFullYear() === year &&
    preferred.getMonth() === month &&
    !isOutOfBoundsDate(preferred, minDate, maxDate)
  ) {
    return preferred;
  }
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= lastDay; d++) {
    const candidate = calStartOfDay(new Date(year, month, d));
    if (!isOutOfBoundsDate(candidate, minDate, maxDate)) return candidate;
  }
  return null;
}

function computeInitialFocusDate(): Date {
  const minDate = calParseISO(props.min);
  const maxDate = calParseISO(props.max);
  const v = props.value ?? internal.value;
  const sel =
    !props.range
      ? calParseISO(v as string | null)
      : Array.isArray(v)
        ? calParseISO(v[0])
        : null;
  if (
    sel &&
    sel.getFullYear() === viewYear.value &&
    sel.getMonth() === viewMonth.value &&
    !isOutOfBoundsDate(sel, minDate, maxDate)
  ) {
    return sel;
  }
  const lastDay = new Date(viewYear.value, viewMonth.value + 1, 0).getDate();
  for (let d = 1; d <= lastDay; d++) {
    const candidate = calStartOfDay(new Date(viewYear.value, viewMonth.value, d));
    if (!isOutOfBoundsDate(candidate, minDate, maxDate)) return candidate;
  }
  return calStartOfDay(new Date(viewYear.value, viewMonth.value, 1));
}

// Initialisation synchrone (pas onMounted) pour que les tests et le SSR
// voient immédiatement la bonne cellule tabbable.
const focusDate = ref<Date>(computeInitialFocusDate());

// Resynchronise focusDate lorsque la prop value change depuis l'extérieur.
watch(
  () => props.value,
  () => {
    const minDate = calParseISO(props.min);
    const maxDate = calParseISO(props.max);
    const v = props.value ?? internal.value;
    const sel =
      !props.range
        ? calParseISO(v as string | null)
        : Array.isArray(v)
          ? calParseISO(v[0])
          : null;
    if (
      sel &&
      sel.getFullYear() === viewYear.value &&
      sel.getMonth() === viewMonth.value &&
      !isOutOfBoundsDate(sel, minDate, maxDate)
    ) {
      focusDate.value = sel;
    } else {
      const clamped = clampToMonth(focusDate.value, viewYear.value, viewMonth.value, minDate, maxDate);
      if (clamped) focusDate.value = clamped;
    }
  },
);

// Resynchronise focusDate lorsque le mois affiché change.
watch(
  [viewYear, viewMonth],
  ([y, m]) => {
    const minDate = calParseISO(props.min);
    const maxDate = calParseISO(props.max);
    if (
      focusDate.value.getFullYear() !== y ||
      focusDate.value.getMonth() !== m ||
      isOutOfBoundsDate(focusDate.value, minDate, maxDate)
    ) {
      const clamped = clampToMonth(focusDate.value, y, m, minDate, maxDate);
      if (clamped) focusDate.value = clamped;
    }
  },
);

function focusActiveCell() {
  if (!gridEl.value) return;
  const iso = calToISO(focusDate.value);
  const btn = gridEl.value.querySelector<HTMLElement>(`[data-date="${iso}"]`);
  btn?.focus();
}

const monthId = (y: number, m: number): string => `${y}-${String(m + 1).padStart(2, '0')}`;

// `emit("monthChange")` already routes to an `onMonthChange` handler prop
// (same routing as `change` → `onChange` above), so never call
// `props.onMonthChange` directly here — that would fire twice.
const notifyMonth = (y: number, m: number) => {
  emit('monthChange', monthId(y, m));
};

const previousMonth = () => {
  const minDate = calParseISO(props.min);
  const maxDate = calParseISO(props.max);
  const targetMonth = viewMonth.value === 0 ? 11 : viewMonth.value - 1;
  const targetYear = viewMonth.value === 0 ? viewYear.value - 1 : viewYear.value;
  viewMonth.value = targetMonth;
  viewYear.value = targetYear;
  const clamped = clampToMonth(focusDate.value, targetYear, targetMonth, minDate, maxDate);
  if (clamped) focusDate.value = clamped;
  notifyMonth(targetYear, targetMonth);
};

const nextMonth = () => {
  const minDate = calParseISO(props.min);
  const maxDate = calParseISO(props.max);
  const targetMonth = viewMonth.value === 11 ? 0 : viewMonth.value + 1;
  const targetYear = viewMonth.value === 11 ? viewYear.value + 1 : viewYear.value;
  viewMonth.value = targetMonth;
  viewYear.value = targetYear;
  const clamped = clampToMonth(focusDate.value, targetYear, targetMonth, minDate, maxDate);
  if (clamped) focusDate.value = clamped;
  notifyMonth(targetYear, targetMonth);
};

function moveFocus(deltaDays: number) {
  const next = new Date(focusDate.value);
  next.setDate(next.getDate() + deltaDays);
  if (next.getFullYear() !== viewYear.value || next.getMonth() !== viewMonth.value) {
    viewYear.value = next.getFullYear();
    viewMonth.value = next.getMonth();
    notifyMonth(viewYear.value, viewMonth.value);
  }
  focusDate.value = calStartOfDay(next);
  nextTick(focusActiveCell);
}

function onGridKeyDown(event: KeyboardEvent) {
  const minDate = calParseISO(props.min);
  const maxDate = calParseISO(props.max);
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      moveFocus(-1);
      break;
    case 'ArrowRight':
      event.preventDefault();
      moveFocus(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      moveFocus(-7);
      break;
    case 'ArrowDown':
      event.preventDefault();
      moveFocus(7);
      break;
    case 'Home': {
      event.preventDefault();
      const dayOfWeek = focusDate.value.getDay();
      const offset = (dayOfWeek - props.weekStartsOn + 7) % 7;
      moveFocus(-offset);
      break;
    }
    case 'End': {
      event.preventDefault();
      const dayOfWeek = focusDate.value.getDay();
      const offset = 6 - ((dayOfWeek - props.weekStartsOn + 7) % 7);
      moveFocus(offset);
      break;
    }
    case 'PageUp': {
      event.preventDefault();
      const puDay = focusDate.value.getDate();
      const puTargetMonth = viewMonth.value === 0 ? 11 : viewMonth.value - 1;
      const puTargetYear = viewMonth.value === 0 ? viewYear.value - 1 : viewYear.value;
      const puLastDay = new Date(puTargetYear, puTargetMonth + 1, 0).getDate();
      focusDate.value = calStartOfDay(new Date(puTargetYear, puTargetMonth, Math.min(puDay, puLastDay)));
      previousMonth();
      nextTick(focusActiveCell);
      break;
    }
    case 'PageDown': {
      event.preventDefault();
      const pdDay = focusDate.value.getDate();
      const pdTargetMonth = viewMonth.value === 11 ? 0 : viewMonth.value + 1;
      const pdTargetYear = viewMonth.value === 11 ? viewYear.value + 1 : viewYear.value;
      const pdLastDay = new Date(pdTargetYear, pdTargetMonth + 1, 0).getDate();
      focusDate.value = calStartOfDay(new Date(pdTargetYear, pdTargetMonth, Math.min(pdDay, pdLastDay)));
      nextMonth();
      nextTick(focusActiveCell);
      break;
    }
    case 'Enter':
    case ' ': {
      event.preventDefault();
      if (!isOutOfBoundsDate(focusDate.value, minDate, maxDate)) pickDate(focusDate.value);
      break;
    }
  }
}

function pickDate(date: Date) {
  const minDate = calParseISO(props.min);
  const maxDate = calParseISO(props.max);
  if (isOutOfBoundsDate(date, minDate, maxDate)) return;
  const picked = calStartOfDay(date);
  const iso = calToISO(picked);
  const v = props.value ?? internal.value;
  const rangeStart = props.range && Array.isArray(v) ? calParseISO(v[0]) : null;
  const rangeEnd = props.range && Array.isArray(v) ? calParseISO(v[1]) : null;

  if (!props.range) {
    commit(iso);
    return;
  }
  if (!rangeStart || (rangeStart && rangeEnd) || picked.getTime() < rangeStart.getTime()) {
    commit([iso, null]);
    return;
  }
  commit([calToISO(rangeStart), iso]);
}

function commit(next: CalendarValue) {
  if (props.value === undefined) internal.value = next;
  emit('update:modelValue', next);
  // `emit("change")` already routes to an `onChange` handler prop (Vue maps
  // emitted events to their `onX` listeners), so calling `props.onChange`
  // here as well would fire the callback twice. Emit only.
  emit('change', next);
}

const activeValue = computed(() => props.value ?? internal.value);
const isFr = computed(() => (props.locale ?? 'fr-FR').toLowerCase().startsWith('fr'));
const resolvedPrevLabel = computed(
  () => props.previousMonthLabel ?? (isFr.value ? 'Mois précédent' : 'Previous month'),
);
const resolvedNextLabel = computed(
  () => props.nextMonthLabel ?? (isFr.value ? 'Mois suivant' : 'Next month'),
);

const monthFormatter = computed(() =>
  new Intl.DateTimeFormat(props.locale, { month: 'long', year: 'numeric' }),
);
const weekdayFormatter = computed(() => new Intl.DateTimeFormat(props.locale, { weekday: 'short' }));
const cellFormatter = computed(() =>
  new Intl.DateTimeFormat(props.locale, { day: 'numeric', month: 'long', year: 'numeric' }),
);

const minDate = computed(() => calParseISO(props.min));
const maxDate = computed(() => calParseISO(props.max));

const single = computed(() => (props.range ? null : calParseISO(activeValue.value as string | null)));
const rangeStart = computed(() =>
  props.range && Array.isArray(activeValue.value) ? calParseISO(activeValue.value[0]) : null,
);
const rangeEnd = computed(() =>
  props.range && Array.isArray(activeValue.value) ? calParseISO(activeValue.value[1]) : null,
);

const today = computed(() => calStartOfDay(new Date()));

// 2024-01-07 est un dimanche : on énumère puis on tourne selon weekStartsOn.
const weekdayLabels = computed(() => {
  const sample = new Date(Date.UTC(2024, 0, 7));
  const rawLabels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sample);
    d.setUTCDate(sample.getUTCDate() + i);
    rawLabels.push(weekdayFormatter.value.format(d));
  }
  return [
    ...rawLabels.slice(props.weekStartsOn),
    ...rawLabels.slice(0, props.weekStartsOn),
  ];
});

type GridCell = {
  date: Date;
  inMonth: boolean;
  oob: boolean;
  selected: boolean;
  inRange: boolean;
  isToday: boolean;
  isActive: boolean;
  label: string;
  iso: string;
};

const weekRows = computed<GridCell[][]>(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1);
  const firstDayIdx = first.getDay();
  const offset = (firstDayIdx - props.weekStartsOn + 7) % 7;
  const start = new Date(viewYear.value, viewMonth.value, 1 - offset);
  const isSelected = (date: Date): boolean => {
    if (!props.range) return calIsSameDay(single.value, date);
    return calIsSameDay(rangeStart.value, date) || calIsSameDay(rangeEnd.value, date);
  };
  const isInRange = (date: Date): boolean => {
    if (!props.range || !rangeStart.value || !rangeEnd.value) return false;
    const d = calStartOfDay(date).getTime();
    return d > rangeStart.value.getTime() && d < rangeEnd.value.getTime();
  };
  const grid: GridCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const date = calStartOfDay(d);
    grid.push({
      date,
      inMonth: d.getMonth() === viewMonth.value,
      oob: isOutOfBoundsDate(date, minDate.value, maxDate.value),
      selected: isSelected(date),
      inRange: isInRange(date),
      isToday: calIsSameDay(date, today.value),
      isActive: calIsSameDay(date, focusDate.value),
      label: cellFormatter.value.format(date),
      iso: calToISO(date),
    });
  }
  return Array.from({ length: 6 }, (_, rowIdx) => grid.slice(rowIdx * 7, rowIdx * 7 + 7));
});

const monthLabel = computed(() => monthFormatter.value.format(new Date(viewYear.value, viewMonth.value, 1)));
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-calendar', props.class)) }" >
    <div class="st-calendar__nav">
      <button type="button" class="st-calendar__navBtn" :aria-label="resolvedPrevLabel" @click="previousMonth">
        <Icon name="chevron-left" :size="18" />
      </button>
      <span class="st-calendar__monthLabel" aria-live="polite">{{ monthLabel }}</span>
      <button type="button" class="st-calendar__navBtn" :aria-label="resolvedNextLabel" @click="nextMonth">
        <Icon name="chevron-right" :size="18" />
      </button>
    </div>
    <div ref="gridEl" class="st-calendar__grid" role="grid" :aria-label="monthLabel" @keydown="onGridKeyDown">
      <div class="st-calendar__weekdays" role="row">
        <span v-for="(wd, i) in weekdayLabels" :key="`${wd}-${i}`" class="st-calendar__weekday" role="columnheader">{{ wd }}</span>
      </div>
      <div class="st-calendar__days">
        <div v-for="(week, rowIdx) in weekRows" :key="rowIdx" class="st-calendar__week" role="row">
          <button
            v-for="(cell, colIdx) in week"
            :key="rowIdx * 7 + colIdx"
            type="button"
            :class="classNames(
              'st-calendar__day',
              !cell.inMonth && 'st-calendar__day--outside',
              cell.selected && 'st-calendar__day--selected',
              cell.inRange && 'st-calendar__day--inRange',
              cell.isToday && 'st-calendar__day--today',
            )"
            role="gridcell"
            :aria-label="cell.label"
            :aria-selected="cell.selected ? 'true' : 'false'"
            :aria-current="cell.isToday ? 'date' : undefined"
            :aria-disabled="cell.oob ? 'true' : undefined"
            :disabled="cell.oob"
            :tabindex="cell.isActive && !cell.oob ? 0 : -1"
            :data-date="cell.iso"
            @click="focusDate = calStartOfDay(cell.date); pickDate(cell.date)"
          >{{ String(cell.date.getDate()) }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
