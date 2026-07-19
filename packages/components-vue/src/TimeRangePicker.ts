import {
  defineComponent,
  h,
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  type PropType,
} from "vue";
import { Clock, ChevronDown } from "lucide-vue-next";
import { classNames } from "./classNames.js";
import { ContentSwitcher } from "./ContentSwitcher.js";
import { SelectableList } from "./SelectableList.js";
import { SelectableRow } from "./SelectableRow.js";
import { Calendar } from "./Calendar.js";
import type { CalendarValue } from "./Calendar.js";
import { TimePicker } from "./TimePicker.js";
import { Input } from "./Input.js";
import { Button } from "./Button.js";
import {
  DEFAULT_TIME_RANGE_PRESETS,
  parsePresetMs,
  resolveRelative,
  splitAbsolute,
  composeAbsolute,
  formatTriggerLabel as defaultFormatTriggerLabel,
  formatPresetLabel as defaultFormatPresetLabel,
} from "./timeRange.js";
import type { TimeRange, TimeRangeMode, TimeRangePreset } from "./timeRange.js";

// Re-exported so consumers can `import type { TimeRange } from
// "@sentropic/design-system-vue"`, matching the Svelte convention (the value
// contract lives in timeRange.ts and is re-exported from the component too).
export type { TimeRange, TimeRangeMode, TimeRangePreset } from "./timeRange.js";

export type TimeRangePickerSize = "sm" | "md" | "lg";
export type TimeRangePickerPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";
export type TimeRangePickerAlign = "start" | "end" | "center";
export type TimeRangePickerTimeFormat = "24" | "12";

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

let _trpCounter = 0;
function nextTrpId(): string {
  return `st-timerangepicker-${++_trpCounter}`;
}

function isFrLocale(locale: string | undefined): boolean {
  return (locale ?? "fr-FR").toLowerCase().startsWith("fr");
}

function monthOf(iso: string, offsetMonths: number): string {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y, m - 1 + offsetMonths, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

type Draft = {
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  fromText: string;
  toText: string;
};

const EMPTY_DRAFT: Draft = { fromDate: "", fromTime: "", toDate: "", toTime: "", fromText: "", toText: "" };

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const DATE_TIME_TEXT_RE = /^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})$/;

/**
 * New-Relic-style time range selector. Trigger button showing the current
 * range → popover with two tabs (Relative | Custom). Relative = preset list,
 * resolves+emits+closes immediately. Custom = absolute range editor (calendar
 * range + a time picker per bound + typed inputs), STAGED behind Apply.
 *
 * Ported from TimeRangePicker.svelte. Composes EXISTING Vue DS primitives:
 * ContentSwitcher, SelectableList/SelectableRow, Calendar, TimePicker, Input,
 * Button. DEVIATION from the Svelte reference: MenuPopover.ts in this package
 * is a self-contained trigger+dialog widget (no `trigger` prop, no
 * JS-computed viewport positioning, no outside-click/Escape auto-dismiss, and
 * it renders its role="dialog" wrapper unconditionally) — it does not support
 * the "external trigger + positioned panel" shape this component needs. So,
 * like DatePicker.ts and Dropdown.ts in this same package, TimeRangePicker
 * owns its own open state, outside-pointerdown + Escape dismissal, and a
 * CSS-positioned (position:absolute) panel — this mirrors MenuPopover's ROLE
 * (dialog panel, placement classes) without depending on its component API.
 * Focus trap + focus-return to the trigger are implemented here too (Vue's
 * MenuPopover/Modal don't trap focus either, matching the Svelte doc note).
 */
export const TimeRangePicker = defineComponent({
  name: "TimeRangePicker",
  props: {
    modelValue: { type: Object as unknown as PropType<TimeRange>, default: undefined },
    value: { type: Object as unknown as PropType<TimeRange>, default: undefined },
    defaultValue: { type: Object as unknown as PropType<TimeRange>, default: undefined },
    onChange: { type: Function as unknown as PropType<(value: TimeRange) => void>, default: undefined },
    presets: { type: Array as unknown as PropType<TimeRangePreset[]>, default: () => DEFAULT_TIME_RANGE_PRESETS },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    locale: { type: String, default: "fr-FR" },
    timeFormat: { type: String as PropType<TimeRangePickerTimeFormat>, default: "24" },
    timeStep: { type: Number, default: 15 },
    calendarMonths: { type: Number as PropType<1 | 2>, default: 2 },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: undefined },
    placement: { type: String as PropType<TimeRangePickerPlacement>, default: "bottom-start" },
    align: { type: String as PropType<TimeRangePickerAlign>, default: undefined },
    size: { type: String as PropType<TimeRangePickerSize>, default: "md" },
    class: { type: String, default: undefined },
    formatRange: {
      type: Function as unknown as PropType<(value: TimeRange, locale: string) => string>,
      default: undefined,
    },
    formatPresetLabel: {
      type: Function as unknown as PropType<(token: string, locale: string) => string>,
      default: undefined,
    },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {
    const autoId = ref(nextTrpId());
    const fieldLabelId = `${autoId.value}-label`;
    const triggerTextId = `${autoId.value}-text`;

    function computeDefaultValue(): TimeRange {
      if (props.defaultValue) return props.defaultValue;
      const now = Date.now();
      const resolved = resolveRelative("30m", now, { min: props.min, max: props.max });
      return resolved ?? { mode: "relative", relative: "30m", from: now - 30 * 60_000, to: now };
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
      emit("update:modelValue", next);
      emit("change", next);
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
      const token = typeof preset === "string" ? preset : preset.token;
      const durationMs =
        typeof preset === "string" ? parsePresetMs(token) : (preset.durationMs ?? parsePresetMs(token));
      if (durationMs == null) return null;
      let to = now;
      let from = now - durationMs;
      if (props.max != null) to = Math.min(to, props.max);
      if (props.min != null) from = Math.max(from, props.min);
      if (from > to) return null;
      return { mode: "relative", relative: token, from, to };
    }

    type NormalizedPreset = { token: string; label: string; disabled: boolean };

    const resolvedPresets = computed<NormalizedPreset[]>(() => {
      const now = Date.now();
      return props.presets.map((p) => {
        const token = typeof p === "string" ? p : p.token;
        const customLabel = typeof p === "string" ? undefined : p.label;
        const label = customLabel ?? resolvePresetLabel(token);
        const resolved = resolvePresetEntry(p, now);
        return { token, label, disabled: resolved === null };
      });
    });

    const selectedPresetValue = computed<string | null>(() =>
      current.value.mode === "relative" ? (current.value.relative ?? null) : null,
    );

    function onPresetSelect(next: string | string[] | null) {
      const nextToken = Array.isArray(next) ? (next[0] ?? null) : next;
      // SelectableList (single-select) toggles OFF when re-activating the row
      // that is already selected, emitting null. Re-clicking the currently
      // active preset is exactly that case here — recover the token from the
      // current value so it still resolves+closes rather than no-op.
      const token = nextToken ?? (current.value.mode === "relative" ? current.value.relative : undefined);
      if (!token) return;
      const preset = props.presets.find((p) => (typeof p === "string" ? p : p.token) === token) ?? token;
      const resolved = resolvePresetEntry(preset, Date.now());
      if (!resolved) return;
      commit(resolved);
      panelOpen.value = false;
    }

    // --- Panel open state + focus management --------------------------------
    const panelOpen = ref(false);
    const triggerRef = ref<HTMLButtonElement | null>(null);
    const panelRef = ref<HTMLDivElement | null>(null);
    const activeTab = ref<TimeRangeMode>("relative");
    const leftMonth = ref("");
    const rightMonth = ref("");
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
      leftMonth.value = monthOf(split.fromDate, 0);
      rightMonth.value = monthOf(split.fromDate, 1);
    }

    function focusFirstInPanel() {
      if (!panelRef.value) return;
      const focusable = panelRef.value.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable ?? panelRef.value).focus();
    }

    function trapFocus(event: KeyboardEvent) {
      if (!panelRef.value || event.key !== "Tab") return;
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
      if (event.key === "Escape") {
        event.preventDefault();
        panelOpen.value = false;
        return;
      }
      trapFocus(event);
    }

    onMounted(() => {
      window.addEventListener("pointerdown", onWindowPointerDown);
      window.addEventListener("keydown", onWindowKeydown);
    });
    onUnmounted(() => {
      window.removeEventListener("pointerdown", onWindowPointerDown);
      window.removeEventListener("keydown", onWindowKeydown);
    });

    // Open transition: seed the tab + draft from the current value, capture
    // the element to restore focus to, then move focus into the panel. Close
    // transition: restore focus to whatever had it before opening (the
    // trigger, in the overwhelming majority of cases).
    watch(panelOpen, (isOpen) => {
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
      d.fromDate = startIso ?? "";
      d.toDate = endIso ?? "";
      d.fromText = d.fromDate ? `${d.fromDate} ${d.fromTime || "00:00"}` : "";
      d.toText = d.toDate ? `${d.toDate} ${d.toTime || "00:00"}` : "";
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
      if (event.key === "Enter") {
        event.preventDefault();
        commitTypedFrom();
      }
    }
    function onToTextKeydown(event: KeyboardEvent) {
      if (event.key === "Enter") {
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
          ? "Renseignez une date et une heure pour le début et la fin."
          : "Provide a date and time for both the start and the end.";
      }
      return isFr.value
        ? "La date de début doit précéder la date de fin."
        : "The start date must be before the end date.";
    });

    function onApply() {
      if (!composedDraft.value) return;
      commit({ mode: "absolute", from: composedDraft.value.from, to: composedDraft.value.to });
      panelOpen.value = false;
    }
    function onCancel() {
      panelOpen.value = false;
    }

    function onTabChange(next: string) {
      activeTab.value = next === "absolute" ? "absolute" : "relative";
    }

    return () => {
      const isOpen = panelOpen.value;
      const label = props.label;
      const panelLabel = label ?? (isFr.value ? "Sélecteur de plage temporelle" : "Time range selector");
      const relativeTabLabel = isFr.value ? "Relatif" : "Relative";
      const customTabLabel = isFr.value ? "Personnalisé" : "Custom";
      const relativeListLabel = isFr.value ? "Plages relatives" : "Relative ranges";
      const fromLabel = isFr.value ? "Début" : "From";
      const toLabel = isFr.value ? "Fin" : "To";
      const applyLabel = isFr.value ? "Appliquer" : "Apply";
      const cancelLabel = isFr.value ? "Annuler" : "Cancel";
      const dateTimePlaceholder = "AAAA-MM-JJ HH:mm";

      const tabItems = [
        { value: "relative", label: relativeTabLabel },
        { value: "absolute", label: customTabLabel },
      ];

      const rootClasses = classNames("st-timeRangePicker", `st-timeRangePicker--${props.size}`, props.class);

      const triggerButton = h(
        "button",
        {
          ref: triggerRef,
          type: "button",
          class: "st-timeRangePicker__trigger",
          "aria-haspopup": "dialog",
          "aria-expanded": isOpen ? "true" : "false",
          "aria-labelledby": label ? `${fieldLabelId} ${triggerTextId}` : undefined,
          disabled: props.disabled,
          onClick: toggle,
        },
        [
          h(Clock, { size: 16, "aria-hidden": "true" }),
          h("span", { class: "st-timeRangePicker__triggerLabel", id: triggerTextId }, triggerLabel.value),
          h(ChevronDown, { size: 16, "aria-hidden": "true" }),
        ],
      );

      let panel: ReturnType<typeof h> | null = null;

      if (isOpen) {
        const relativePanel = h(
          SelectableList,
          {
            label: relativeListLabel,
            value: selectedPresetValue.value,
            onChange: onPresetSelect,
          },
          {
            default: () =>
              resolvedPresets.value.map((preset) =>
                h(
                  SelectableRow,
                  { key: preset.token, value: preset.token, disabled: preset.disabled },
                  { default: () => preset.label },
                ),
              ),
          },
        );

        const customPanel = h("div", { class: "st-timeRangePicker__custom" }, [
          h("div", { class: "st-timeRangePicker__calendars" }, [
            h(Calendar, {
              range: true,
              value: calendarValue.value,
              onChange: onCalendarChange,
              min: calendarMinIso.value,
              max: calendarMaxIso.value,
              locale: props.locale,
              month: leftMonth.value,
            }),
            props.calendarMonths === 2
              ? h(Calendar, {
                  range: true,
                  value: calendarValue.value,
                  onChange: onCalendarChange,
                  min: calendarMinIso.value,
                  max: calendarMaxIso.value,
                  locale: props.locale,
                  month: rightMonth.value,
                })
              : null,
          ]),
          h("div", { class: "st-timeRangePicker__bounds" }, [
            h(
              "div",
              {
                class: "st-timeRangePicker__bound",
                // `blur` doesn't bubble, but capture-phase listeners on an
                // ancestor still see it (capture always runs top-down
                // regardless of `bubbles`) — Input.ts declares "blur" in its
                // own `emits`, which silently swallows a plain `onBlur` prop
                // (Vue routes declared-emit listener props away from
                // attrs-fallthrough, and Input never actually emits "blur"),
                // so a normal `onBlur` on <Input> would never fire.
                onBlurCapture: commitTypedFrom,
              },
              [
                h(Input, {
                  label: fromLabel,
                  modelValue: draft.value.fromText,
                  "onUpdate:modelValue": (v: string) => {
                    draft.value.fromText = v;
                  },
                  placeholder: dateTimePlaceholder,
                  size: props.size,
                  onKeydown: onFromTextKeydown,
                }),
                h(TimePicker, {
                  value: draft.value.fromTime,
                  onChange: onFromTimeChange,
                  step: props.timeStep,
                  format: props.timeFormat,
                  size: props.size,
                }),
              ],
            ),
            h(
              "div",
              { class: "st-timeRangePicker__bound", onBlurCapture: commitTypedTo },
              [
                h(Input, {
                  label: toLabel,
                  modelValue: draft.value.toText,
                  "onUpdate:modelValue": (v: string) => {
                    draft.value.toText = v;
                  },
                  placeholder: dateTimePlaceholder,
                  size: props.size,
                  onKeydown: onToTextKeydown,
                }),
                h(TimePicker, {
                  value: draft.value.toTime,
                  onChange: onToTimeChange,
                  step: props.timeStep,
                  format: props.timeFormat,
                  size: props.size,
                }),
              ],
            ),
          ]),
          draftError.value ? h("p", { class: "st-timeRangePicker__error", role: "alert" }, draftError.value) : null,
          h("div", { class: "st-timeRangePicker__actions" }, [
            h(Button, { type: "button", variant: "ghost", size: props.size, onClick: onCancel }, { default: () => cancelLabel }),
            h(
              Button,
              { type: "button", variant: "primary", size: props.size, disabled: !draftValid.value, onClick: onApply },
              { default: () => applyLabel },
            ),
          ]),
        ]);

        panel = h(
          "div",
          {
            class: classNames(
              "st-timeRangePicker__popover",
              `st-timeRangePicker__popover--${props.placement}`,
              props.align ? `st-timeRangePicker__popover--align${props.align[0].toUpperCase()}${props.align.slice(1)}` : null,
            ),
            role: "dialog",
            "aria-label": panelLabel,
          },
          [
            h("div", { ref: panelRef, class: "st-timeRangePicker__panel", tabindex: -1 }, [
              h(ContentSwitcher, {
                items: tabItems,
                value: activeTab.value,
                onchange: onTabChange,
                size: "sm",
                label: panelLabel,
              }),
              activeTab.value === "relative" ? relativePanel : customPanel,
            ]),
          ],
        );
      }

      return h("div", { class: rootClasses }, [
        label ? h("span", { class: "st-timeRangePicker__label", id: fieldLabelId }, label) : null,
        triggerButton,
        panel,
      ]);
    };
  },
});
