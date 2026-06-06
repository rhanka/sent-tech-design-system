import { defineComponent, h, ref, watch, onUnmounted } from "vue";
import { classNames } from "./classNames.js";

export type DatePickerSize = "sm" | "md" | "lg";

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
  mode?: "single" | "range";
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

let _dpCounter = 0;
function nextDpId(): string {
  return `st-datepicker-${++_dpCounter}`;
}

function dpStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dpIsSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dpIsRange(value: DatePickerValue): value is DatePickerRange {
  return value !== null && value !== undefined && typeof value === "object" && !(value instanceof Date) && "start" in value;
}

function dpFirstDayOfWeek(locale: string): number {
  try {
    // @ts-expect-error: weekInfo is recent and not in all TS lib versions.
    const info = new Intl.Locale(locale).weekInfo;
    if (info && typeof info.firstDay === "number") {
      return info.firstDay === 7 ? 0 : info.firstDay;
    }
  } catch {
    // Ignore — fall back below.
  }
  return locale.toLowerCase().startsWith("en-us") ? 0 : 1;
}

export const DatePicker = defineComponent({
  name: "DatePicker",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
    helperText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    errorText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    invalid: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    mode: { type: String as () => "single" | "range", default: "single" },
    modelValue: { type: [Object, Date] as unknown as () => DatePickerValue, default: undefined },
    min: { type: Date as unknown as () => Date, default: undefined },
    max: { type: Date as unknown as () => Date, default: undefined },
    locale: { type: String, default: "fr-FR" },
    placeholder: { type: String, default: undefined },
    size: { type: String as () => DatePickerSize, default: "md" },
    id: { type: String, default: undefined },
    openLabel: { type: String, default: undefined },
    previousMonthLabel: { type: String, default: undefined },
    nextMonthLabel: { type: String, default: undefined },
    todayLabel: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit, attrs }) {
    const autoId = ref(nextDpId());
    const hostRef = ref<HTMLElement | null>(null);
    const open = ref(false);

    // Uncontrolled fallback when `modelValue` is omitted (parity with the
    // Svelte $bindable default normalisation by mode).
    const emptyValue = (): DatePickerValue => (props.mode === "range" ? { start: null, end: null } : null);
    const internal = ref<DatePickerValue>(props.modelValue ?? emptyValue());

    const activeValue = (): DatePickerValue => (props.modelValue !== undefined ? props.modelValue : internal.value);

    const pickInitialMonth = (): Date => {
      const v = activeValue();
      if (props.mode === "single" && v instanceof Date) return dpStartOfDay(v);
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
      emit("update:modelValue", next);
      emit("change", next);
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
          document.addEventListener("mousedown", onMouseDown);
        } else {
          document.removeEventListener("mousedown", onMouseDown);
        }
      },
    );

    onUnmounted(() => document.removeEventListener("mousedown", onMouseDown));

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
      if (props.mode === "single") {
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
      if (event.key === "Escape" && open.value) {
        event.preventDefault();
        setOpen(false);
      }
    };

    return () => {
      const inputId = props.id ?? autoId.value;
      const locale = props.locale;
      const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");
      const v = activeValue();

      const resolvedOpenLabel = props.openLabel ?? (isFr ? "Ouvrir le calendrier" : "Open calendar");
      const resolvedPrevLabel = props.previousMonthLabel ?? (isFr ? "Mois précédent" : "Previous month");
      const resolvedNextLabel = props.nextMonthLabel ?? (isFr ? "Mois suivant" : "Next month");
      const resolvedTodayLabel = props.todayLabel ?? (isFr ? "Aujourd'hui" : "Today");
      const resolvedPlaceholder =
        props.placeholder ??
        (isFr
          ? props.mode === "range"
            ? "jj/mm/aaaa - jj/mm/aaaa"
            : "jj/mm/aaaa"
          : props.mode === "range"
            ? "mm/dd/yyyy - mm/dd/yyyy"
            : "mm/dd/yyyy");

      const dateFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
      const monthFormatter = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
      const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
      const cellFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" });

      const weekStart = dpFirstDayOfWeek(locale);

      const sample = new Date(Date.UTC(2024, 0, 7)); // a Sunday
      const rawLabels: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(sample);
        d.setUTCDate(sample.getUTCDate() + i);
        rawLabels.push(weekdayFormatter.format(d));
      }
      const weekdayLabels = [...rawLabels.slice(weekStart), ...rawLabels.slice(0, weekStart)];

      const first = new Date(viewYear.value, viewMonth.value, 1);
      const offset = (first.getDay() - weekStart + 7) % 7;
      const start = new Date(viewYear.value, viewMonth.value, 1 - offset);
      const grid: Array<{ date: Date; inMonth: boolean }> = [];
      for (let i = 0; i < 42; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        grid.push({ date: dpStartOfDay(d), inMonth: d.getMonth() === viewMonth.value });
      }

      const isSelected = (date: Date): boolean => {
        if (props.mode === "single") return v instanceof Date && dpIsSameDay(v, date);
        if (dpIsRange(v)) return dpIsSameDay(v.start, date) || dpIsSameDay(v.end, date);
        return false;
      };
      const isInRange = (date: Date): boolean => {
        if (props.mode !== "range" || !dpIsRange(v)) return false;
        const { start: rs, end: re } = v;
        if (!rs || !re) return false;
        const d = dpStartOfDay(date).getTime();
        return d > dpStartOfDay(rs).getTime() && d < dpStartOfDay(re).getTime();
      };

      const formattedValue = (): string => {
        if (props.mode === "single") return v instanceof Date ? dateFormatter.format(v) : "";
        if (dpIsRange(v)) {
          const s = v.start ? dateFormatter.format(v.start) : "";
          const e = v.end ? dateFormatter.format(v.end) : "";
          if (!s && !e) return "";
          return `${s} - ${e}`;
        }
        return "";
      };

      const isInvalid = props.invalid || Boolean(props.errorText);
      const monthLabel = monthFormatter.format(new Date(viewYear.value, viewMonth.value, 1));

      const panel = open.value
        ? h(
            "div",
            {
              class: "st-datepicker__panel",
              role: "dialog",
              tabindex: -1,
              "aria-label": (props.label as unknown as string) || resolvedOpenLabel,
              onKeydown: onPanelKeyDown,
            },
            [
              h("div", { class: "st-datepicker__nav" }, [
                h(
                  "button",
                  {
                    type: "button",
                    class: "st-datepicker__navBtn",
                    "aria-label": resolvedPrevLabel,
                    onClick: previousMonth,
                  },
                  [h("span", { "aria-hidden": "true" }, "‹")],
                ),
                h("span", { class: "st-datepicker__monthLabel", "aria-live": "polite" }, monthLabel),
                h(
                  "button",
                  {
                    type: "button",
                    class: "st-datepicker__navBtn",
                    "aria-label": resolvedNextLabel,
                    onClick: nextMonth,
                  },
                  [h("span", { "aria-hidden": "true" }, "›")],
                ),
              ]),
              h("div", { class: "st-datepicker__grid", role: "grid" }, [
                h(
                  "div",
                  { class: "st-datepicker__weekdays", role: "row" },
                  weekdayLabels.map((wd, i) =>
                    h("span", { key: `${wd}-${i}`, class: "st-datepicker__weekday", role: "columnheader" }, wd),
                  ),
                ),
                h(
                  "div",
                  { class: "st-datepicker__days" },
                  grid.map((cell, i) => {
                    const oob = isOutOfBounds(cell.date);
                    const selected = isSelected(cell.date);
                    const inRange = isInRange(cell.date);
                    return h(
                      "button",
                      {
                        key: i,
                        type: "button",
                        class: classNames(
                          "st-datepicker__day",
                          !cell.inMonth && "st-datepicker__day--outside",
                          selected && "st-datepicker__day--selected",
                          inRange && "st-datepicker__day--inRange",
                        ),
                        "aria-label": cellFormatter.format(cell.date),
                        "aria-pressed": selected ? "true" : "false",
                        "aria-disabled": oob ? "true" : undefined,
                        disabled: oob,
                        onClick: () => pickDate(cell.date),
                      },
                      String(cell.date.getDate()),
                    );
                  }),
                ),
              ]),
              h("div", { class: "st-datepicker__footer" }, [
                h(
                  "button",
                  {
                    type: "button",
                    class: "st-datepicker__todayBtn",
                    disabled: isOutOfBounds(new Date()),
                    onClick: () => pickDate(new Date()),
                  },
                  resolvedTodayLabel,
                ),
              ]),
            ],
          )
        : null;

      const trailing = props.errorText
        ? h("span", { class: "st-field__error" }, props.errorText as string)
        : props.helperText
          ? h("span", { class: "st-field__help" }, props.helperText as string)
          : null;

      return h(
        "div",
        {
          ...attrs,
          ref: hostRef,
          class: classNames("st-field", props.class),
        },
        [
          h("label", { class: "st-field__control", for: inputId }, [
            props.label ? h("span", { class: "st-field__label" }, props.label as string) : null,
            h("span", { class: classNames("st-datepicker", `st-datepicker--${props.size}`) }, [
              h("input", {
                id: inputId,
                type: "text",
                readonly: true,
                class: "st-datepicker__control",
                value: formattedValue(),
                placeholder: resolvedPlaceholder,
                disabled: props.disabled,
                "aria-invalid": isInvalid ? "true" : undefined,
                onClick: toggleOpen,
              }),
              h(
                "button",
                {
                  type: "button",
                  class: "st-datepicker__trigger",
                  "aria-label": resolvedOpenLabel,
                  "aria-haspopup": "dialog",
                  "aria-expanded": open.value ? "true" : "false",
                  disabled: props.disabled,
                  onClick: toggleOpen,
                },
                [h("span", { "aria-hidden": "true" }, "📅")],
              ),
            ]),
          ]),
          panel,
          trailing,
        ],
      );
    };
  },
});
