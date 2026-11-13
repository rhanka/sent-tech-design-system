<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
} from 'vue';
import { classNames } from './classNames.js';
import { ContentSwitcher } from './ContentSwitcher.js';
import { SelectableList } from './SelectableList.js';
import { SelectableRow } from './SelectableRow.js';
import { Calendar, type CalendarValue } from './Calendar.js';
import TimePicker from './TimePicker.vue';
import Input from './Input.vue';
import Button from './Button.vue';
import {
  DEFAULT_TIME_RANGE_PRESETS,
  parsePresetMs,
  resolveRelative,
  splitAbsolute,
  composeAbsolute,
  formatTriggerLabel as defaultFormatTriggerLabel,
  formatPresetLabel as defaultFormatPresetLabel,
} from './timeRange.js';
import type { TimeRange, TimeRangeMode, TimeRangePreset } from './timeRange.js';
import { nextTimeRangePickerId } from './timeRangePickerId.js';

// Re-exported so consumers can `import type { TimeRange } from
// "@sentropic/design-system-vue"`, matching the Svelte convention (the value
// contract lives in timeRange.ts and is re-exported from the component too).
export type { TimeRange, TimeRangeMode, TimeRangePreset } from './timeRange.js';

export type TimeRangePickerSize = 'sm' | 'md' | 'lg';
export type TimeRangePickerPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
export type TimeRangePickerAlign = 'start' | 'end' | 'center';
export type TimeRangePickerTimeFormat = '24' | '12';

export type TimeRangePickerProps = {
  /** `v-model` value. */
  modelValue?: TimeRange;
  /** Svelte/React-canonical alias for `modelValue`. */
  value?: TimeRange;
  defaultValue?: TimeRange;
  onChange?: (value: TimeRange) => void;
  presets?: TimeRangePreset[];
  min?: number;
  max?: number;
  locale?: string;
  timeFormat?: TimeRangePickerTimeFormat;
  timeStep?: number;
  calendarMonths?: 1 | 2;
  disabled?: boolean;
  label?: string;
  placement?: TimeRangePickerPlacement;
  align?: TimeRangePickerAlign;
  size?: TimeRangePickerSize;
  class?: string;
  formatRange?: (value: TimeRange, locale: string) => string;
  formatPresetLabel?: (token: string, locale: string) => string;
};

function isFrLocale(locale: string | undefined): boolean {
  return (locale ?? 'fr-FR').toLowerCase().startsWith('fr');
}

function monthOf(iso: string, offsetMonths: number): string {
  const [y, m] = iso.split('-').map(Number);
  const d = new Date(y, m - 1 + offsetMonths, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Month coupling (two-calendar mode). Invariant: right > left, always.
// Lexicographic comparison orders padded "YYYY-MM" chronologically.
function seedMonths(fromDate: string, toDate: string): { left: string; right: string } {
  const left = monthOf(fromDate, 0);
  // Right = end month when it is after the left one, else left + 1: both
  // bounds are visible as soon as the panel opens.
  const endMonth = monthOf(toDate, 0);
  return { left, right: endMonth > left ? endMonth : monthOf(left, 1) };
}

type Draft = {
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  fromText: string;
  toText: string;
};

const EMPTY_DRAFT: Draft = { fromDate: '', fromTime: '', toDate: '', toTime: '', fromText: '', toText: '' };

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex=\'-1\'])',
].join(',');

const DATE_TIME_TEXT_RE = /^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})$/;

defineOptions({ name: 'TimeRangePicker' });
const props = withDefaults(defineProps<TimeRangePickerProps>(), {
  modelValue: undefined, value: undefined, defaultValue: undefined, onChange: undefined,
  presets: () => DEFAULT_TIME_RANGE_PRESETS, min: undefined, max: undefined, locale: 'fr-FR',
  timeFormat: '24', timeStep: 15, calendarMonths: 2, disabled: false, label: undefined,
  placement: 'bottom-start', align: undefined, size: 'md', class: undefined,
  formatRange: undefined, formatPresetLabel: undefined,
});
// `openChange` fires whenever the panel opens (true) or closes (false);
// listen with `@open-change` / `:onOpenChange`.
//
// Slot `customExtra`: optional consumer controls rendered in the Custom tab,
// directly above the From/To fields (e.g. a "date basis" radio group). The
// Custom tab is staged behind Apply, so treat whatever the slot edits as a
// DRAFT: reseed it on `openChange(true)` and commit it on `change` when the
// emitted value has `mode: "absolute"` (that emit only happens on Apply).
// Cancel / Escape / outside click emit nothing.
const emit = defineEmits<{
  'update:modelValue': [value: TimeRange];
  change: [value: TimeRange];
  openChange: [open: boolean];
}>();
defineSlots<{
  customExtra?: () => unknown;
}>();

const autoId = ref(nextTimeRangePickerId());
const fieldLabelId = `${autoId.value}-label`;
const triggerTextId = `${autoId.value}-text`;

function computeDefaultValue(): TimeRange {
  if (props.defaultValue) return props.defaultValue;
  const now = Date.now();
  const resolved = resolveRelative('30m', now, { min: props.min, max: props.max });
  return resolved ?? { mode: 'relative', relative: '30m', from: now - 30 * 60_000, to: now };
}

// Controlled when the consumer passes either `modelValue` or its `value`
// alias; otherwise the component seeds + manages its own internal state
// (mirrors the Svelte $bindable-with-self-seed pattern).
const controlled = computed(() => props.modelValue !== undefined || props.value !== undefined);
const internal = ref<TimeRange>(props.modelValue ?? props.value ?? computeDefaultValue());
const current = computed<TimeRange>(() =>
  controlled.value ? ((props.modelValue ?? props.value) as TimeRange) : internal.value,
);

function commit(next: TimeRange) {
  if (!controlled.value) internal.value = next;
  // `emit("change", next)` already routes to a listener passed as the
  // `onChange` prop (Vue resolves an emitted event to its matching
  // `onXxx` handler in the raw vnode props, regardless of whether that
  // handler arrived via `@change=` or `:onChange=`). Calling
  // `props.onChange?.(next)` here too would fire the callback twice.
  emit('update:modelValue', next);
  emit('change', next);
}

const isFr = computed(() => isFrLocale(props.locale));

const triggerLabel = computed(() =>
  props.formatRange
    ? props.formatRange(current.value, props.locale)
    : defaultFormatTriggerLabel(current.value, props.locale),
);

function resolvePresetLabel(token: string): string {
  return props.formatPresetLabel
    ? props.formatPresetLabel(token, props.locale)
    : defaultFormatPresetLabel(token, props.locale);
}

function resolvePresetEntry(preset: TimeRangePreset, now: number): TimeRange | null {
  const token = typeof preset === 'string' ? preset : preset.token;
  const durationMs =
    typeof preset === 'string' ? parsePresetMs(token) : (preset.durationMs ?? parsePresetMs(token));
  if (durationMs == null) return null;
  let to = now;
  let from = now - durationMs;
  if (props.max != null) to = Math.min(to, props.max);
  if (props.min != null) from = Math.max(from, props.min);
  if (from > to) return null;
  return { mode: 'relative', relative: token, from, to };
}

type NormalizedPreset = { token: string; label: string; disabled: boolean };

const resolvedPresets = computed<NormalizedPreset[]>(() => {
  const now = Date.now();
  return props.presets.map((p) => {
    const token = typeof p === 'string' ? p : p.token;
    const customLabel = typeof p === 'string' ? undefined : p.label;
    const label = customLabel ?? resolvePresetLabel(token);
    const resolved = resolvePresetEntry(p, now);
    return { token, label, disabled: resolved === null };
  });
});

const selectedPresetValue = computed<string | null>(() =>
  current.value.mode === 'relative' ? (current.value.relative ?? null) : null,
);

function onPresetSelect(next: string | string[] | null) {
  const nextToken = Array.isArray(next) ? (next[0] ?? null) : next;
  // SelectableList (single-select) toggles OFF when re-activating the row
  // that is already selected, emitting null. Re-clicking the currently
  // active preset is exactly that case here — recover the token from the
  // current value so it still resolves+closes rather than no-op.
  const token = nextToken ?? (current.value.mode === 'relative' ? current.value.relative : undefined);
  if (!token) return;
  const preset = props.presets.find((p) => (typeof p === 'string' ? p : p.token) === token) ?? token;
  const resolved = resolvePresetEntry(preset, Date.now());
  if (!resolved) return;
  commit(resolved);
  panelOpen.value = false;
}

// --- Panel open state + focus management --------------------------------
const panelOpen = ref(false);
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLDivElement | null>(null);
const activeTab = ref<TimeRangeMode>('relative');
const leftMonth = ref('');
const rightMonth = ref('');
const draft = ref<Draft>({ ...EMPTY_DRAFT });
let previousFocus: HTMLElement | null = null;

function seedDraft() {
  const split = splitAbsolute(current.value.from, current.value.to);
  draft.value = {
    fromDate: split.fromDate,
    fromTime: split.fromTime,
    toDate: split.toDate,
    toTime: split.toTime,
    fromText: `${split.fromDate} ${split.fromTime}`,
    toText: `${split.toDate} ${split.toTime}`,
  };
  const seeded = seedMonths(split.fromDate, split.toDate);
  leftMonth.value = seeded.left;
  rightMonth.value = seeded.right;
}

function onLeftMonthChange(next: string) {
  leftMonth.value = next;
  if (rightMonth.value <= next) rightMonth.value = monthOf(next, 1);
}

function onRightMonthChange(next: string) {
  rightMonth.value = next;
  if (leftMonth.value >= next) leftMonth.value = monthOf(next, -1);
}

function focusFirstInPanel() {
  if (!panelRef.value) return;
  const focusable = panelRef.value.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
  (focusable ?? panelRef.value).focus();
}

function trapFocus(event: KeyboardEvent) {
  if (!panelRef.value || event.key !== 'Tab') return;
  const focusable = Array.from(panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (!panelRef.value.contains(active)) {
    event.preventDefault();
    first.focus();
    return;
  }
  if (event.shiftKey && active === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

function onWindowPointerDown(event: PointerEvent) {
  if (!panelOpen.value) return;
  const target = event.target as Node | null;
  if (panelRef.value && target && panelRef.value.contains(target)) return;
  if (triggerRef.value && target && triggerRef.value.contains(target)) return;
  panelOpen.value = false;
}

function onWindowKeydown(event: KeyboardEvent) {
  if (!panelOpen.value) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    panelOpen.value = false;
    return;
  }
  trapFocus(event);
}

onMounted(() => {
  window.addEventListener('pointerdown', onWindowPointerDown);
  window.addEventListener('keydown', onWindowKeydown);
});
onUnmounted(() => {
  window.removeEventListener('pointerdown', onWindowPointerDown);
  window.removeEventListener('keydown', onWindowKeydown);
});

// Open transition: seed the tab + draft from the current value, capture
// the element to restore focus to, then move focus into the panel. Close
// transition: restore focus to whatever had it before opening (the
// trigger, in the overwhelming majority of cases).
watch(panelOpen, (isOpen) => {
  emit('openChange', isOpen);
  if (isOpen) {
    activeTab.value = current.value.mode;
    seedDraft();
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    nextTick(focusFirstInPanel);
  } else {
    const el = previousFocus;
    previousFocus = null;
    if (el) nextTick(() => el.focus());
  }
});

function toggle() {
  if (props.disabled) return;
  panelOpen.value = !panelOpen.value;
}

function onCalendarChange(next: CalendarValue) {
  if (!Array.isArray(next)) return;
  const [startIso, endIso] = next;
  const d = draft.value;
  d.fromDate = startIso ?? '';
  d.toDate = endIso ?? '';
  d.fromText = d.fromDate ? `${d.fromDate} ${d.fromTime || '00:00'}` : '';
  d.toText = d.toDate ? `${d.toDate} ${d.toTime || '00:00'}` : '';
}

const calendarValue = computed<CalendarValue>(() => [draft.value.fromDate || null, draft.value.toDate || null]);
const calendarMinIso = computed(() =>
  props.min != null ? splitAbsolute(props.min, props.min).fromDate : undefined,
);
const calendarMaxIso = computed(() =>
  props.max != null ? splitAbsolute(props.max, props.max).fromDate : undefined,
);

function onFromTimeChange(v: string) {
  draft.value.fromTime = v;
  if (draft.value.fromDate) draft.value.fromText = `${draft.value.fromDate} ${v}`;
}
function onToTimeChange(v: string) {
  draft.value.toTime = v;
  if (draft.value.toDate) draft.value.toText = `${draft.value.toDate} ${v}`;
}

function parseDateTimeText(text: string): { date: string; time: string } | null {
  const match = DATE_TIME_TEXT_RE.exec(text.trim());
  if (!match) return null;
  return { date: match[1], time: match[2] };
}

function commitTypedFrom() {
  const parsed = parseDateTimeText(draft.value.fromText);
  if (!parsed) return;
  draft.value.fromDate = parsed.date;
  draft.value.fromTime = parsed.time;
}
function commitTypedTo() {
  const parsed = parseDateTimeText(draft.value.toText);
  if (!parsed) return;
  draft.value.toDate = parsed.date;
  draft.value.toTime = parsed.time;
}
function onFromTextKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault();
    commitTypedFrom();
  }
}
function onToTextKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault();
    commitTypedTo();
  }
}

const composedDraft = computed(() =>
  composeAbsolute({
    fromDate: draft.value.fromDate,
    fromTime: draft.value.fromTime,
    toDate: draft.value.toDate,
    toTime: draft.value.toTime,
  }),
);
const draftValid = computed(() => composedDraft.value !== null);
const draftIncomplete = computed(
  () => !draft.value.fromDate || !draft.value.fromTime || !draft.value.toDate || !draft.value.toTime,
);
const draftError = computed<string | null>(() => {
  if (draftValid.value) return null;
  if (draftIncomplete.value) {
    return isFr.value
      ? 'Renseignez une date et une heure pour le début et la fin.'
      : 'Provide a date and time for both the start and the end.';
  }
  return isFr.value
    ? 'La date de début doit précéder la date de fin.'
    : 'The start date must be before the end date.';
});

function onApply() {
  if (!composedDraft.value) return;
  commit({ mode: 'absolute', from: composedDraft.value.from, to: composedDraft.value.to });
  panelOpen.value = false;
}
function onCancel() {
  panelOpen.value = false;
}

function onTabChange(next: string) {
  activeTab.value = next === 'absolute' ? 'absolute' : 'relative';
}

const panelLabel = computed(() => props.label ?? (isFr.value ? 'Sélecteur de plage temporelle' : 'Time range selector'));
const relativeTabLabel = computed(() => isFr.value ? 'Relatif' : 'Relative');
const customTabLabel = computed(() => isFr.value ? 'Personnalisé' : 'Custom');
const relativeListLabel = computed(() => isFr.value ? 'Plages relatives' : 'Relative ranges');
const fromLabel = computed(() => isFr.value ? 'Début' : 'From');
const toLabel = computed(() => isFr.value ? 'Fin' : 'To');
const applyLabel = computed(() => isFr.value ? 'Appliquer' : 'Apply');
const cancelLabel = computed(() => isFr.value ? 'Annuler' : 'Cancel');
const dateTimePlaceholder = 'AAAA-MM-JJ HH:mm';

const tabItems = computed(() => [
  { value: 'relative', label: relativeTabLabel.value },
  { value: 'absolute', label: customTabLabel.value },
]);

const rootClasses = computed(() => classNames('st-timeRangePicker', `st-timeRangePicker--${props.size}`, props.class));
const popoverClass = computed(() => classNames(
  'st-timeRangePicker__popover',
  `st-timeRangePicker__popover--${props.placement}`,
  props.align ? `st-timeRangePicker__popover--align${props.align[0].toUpperCase()}${props.align.slice(1)}` : null,
));
</script>

<template>
  <div :class="rootClasses">
    <span v-if="props.label" class="st-timeRangePicker__label" :id="fieldLabelId">{{ props.label }}</span>
    <button
      ref="triggerRef"
      type="button"
      class="st-timeRangePicker__trigger"
      aria-haspopup="dialog"
      :aria-expanded="panelOpen ? 'true' : 'false'"
      :aria-labelledby="props.label ? `${fieldLabelId} ${triggerTextId}` : undefined"
      :disabled="props.disabled"
      @click="toggle"
    >
      <svg aria-hidden="true" class="lucide lucide-clock-icon lucide-clock" fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="10" /></svg>
      <span class="st-timeRangePicker__triggerLabel" :id="triggerTextId">{{ triggerLabel }}</span>
      <svg aria-hidden="true" class="lucide lucide-chevron-down-icon lucide-chevron-down" fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    <div v-if="panelOpen" :class="popoverClass" role="dialog" :aria-label="panelLabel">
      <div ref="panelRef" class="st-timeRangePicker__panel" tabindex="-1">
        <ContentSwitcher :items="tabItems" :value="activeTab" :onchange="onTabChange" size="sm" :label="panelLabel" />
        <SelectableList v-if="activeTab === 'relative'" :label="relativeListLabel" :value="selectedPresetValue" @change="onPresetSelect">
          <SelectableRow v-for="preset in resolvedPresets" :key="preset.token" :value="preset.token" :disabled="preset.disabled">{{ preset.label }}</SelectableRow>
        </SelectableList>
        <div v-else class="st-timeRangePicker__custom">
          <div class="st-timeRangePicker__calendars">
            <Calendar
              range
              :value="calendarValue"
              @change="onCalendarChange"
              @month-change="onLeftMonthChange"
              :min="calendarMinIso"
              :max="calendarMaxIso"
              :locale="props.locale"
              :month="leftMonth"
            />
            <Calendar
              v-if="props.calendarMonths === 2"
              range
              :value="calendarValue"
              @change="onCalendarChange"
              @month-change="onRightMonthChange"
              :min="calendarMinIso"
              :max="calendarMaxIso"
              :locale="props.locale"
              :month="rightMonth"
            />
          </div>
          <div v-if="$slots.customExtra" class="st-timeRangePicker__customExtra"><slot name="customExtra" /></div>
          <div class="st-timeRangePicker__bounds">
            <div class="st-timeRangePicker__bound" @blur-capture="commitTypedFrom">
              <Input
                :label="fromLabel"
                :model-value="draft.fromText"
                @update:model-value="(v: string) => draft.fromText = v"
                :placeholder="dateTimePlaceholder"
                :size="props.size"
                @keydown="onFromTextKeydown"
              />
              <TimePicker :value="draft.fromTime" @change="onFromTimeChange" :step="props.timeStep" :format="props.timeFormat" :size="props.size" />
            </div>
            <div class="st-timeRangePicker__bound" @blur-capture="commitTypedTo">
              <Input
                :label="toLabel"
                :model-value="draft.toText"
                @update:model-value="(v: string) => draft.toText = v"
                :placeholder="dateTimePlaceholder"
                :size="props.size"
                @keydown="onToTextKeydown"
              />
              <TimePicker :value="draft.toTime" @change="onToTimeChange" :step="props.timeStep" :format="props.timeFormat" :size="props.size" />
            </div>
          </div>
          <p v-if="draftError" class="st-timeRangePicker__error" role="alert">{{ draftError }}</p>
          <div class="st-timeRangePicker__actions">
            <Button type="button" variant="ghost" :size="props.size" @click="onCancel">{{ cancelLabel }}</Button>
            <Button type="button" variant="primary" :size="props.size" :disabled="!draftValid" @click="onApply">{{ applyLabel }}</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
