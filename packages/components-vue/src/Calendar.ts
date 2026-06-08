import { defineComponent, h, nextTick, ref, watch } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { classNames } from "./classNames.js";

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
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
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

function ChevronLeftIcon(size: number) {
  return h(ChevronLeft, { size, "aria-hidden": "true" });
}

function ChevronRightIcon(size: number) {
  return h(ChevronRight, { size, "aria-hidden": "true" });
}

export const Calendar = defineComponent({
  name: "Calendar",
  props: {
    value: {
      type: [String, Array, Object] as unknown as () => CalendarValue,
      default: null,
    },
    onChange: {
      type: Function as unknown as () => (value: CalendarValue) => void,
      default: undefined,
    },
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    range: { type: Boolean, default: false },
    weekStartsOn: { type: Number as () => 0 | 1, default: 1 },
    locale: { type: String, default: "fr-FR" },
    month: { type: String, default: undefined },
    class: { type: String, default: undefined },
    previousMonthLabel: { type: String, default: undefined },
    nextMonthLabel: { type: String, default: undefined },
  },
  emits: ["change", "update:modelValue"],
  setup(props, { emit, attrs }) {
    const internal = ref<CalendarValue>(props.value ?? null);

    const pickInitialMonth = (): Date => {
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
    };

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
      const sel = !props.range ? calParseISO(v as string | null) :
        (Array.isArray(v) ? calParseISO(v[0]) : null);
      if (sel && sel.getFullYear() === viewYear.value && sel.getMonth() === viewMonth.value && !isOutOfBoundsDate(sel, minDate, maxDate)) {
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
        const sel = !props.range ? calParseISO(v as string | null) :
          (Array.isArray(v) ? calParseISO(v[0]) : null);
        if (sel && sel.getFullYear() === viewYear.value && sel.getMonth() === viewMonth.value && !isOutOfBoundsDate(sel, minDate, maxDate)) {
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
        if (focusDate.value.getFullYear() !== y || focusDate.value.getMonth() !== m || isOutOfBoundsDate(focusDate.value, minDate, maxDate)) {
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

    const previousMonth = () => {
      const minDate = calParseISO(props.min);
      const maxDate = calParseISO(props.max);
      const targetMonth = viewMonth.value === 0 ? 11 : viewMonth.value - 1;
      const targetYear = viewMonth.value === 0 ? viewYear.value - 1 : viewYear.value;
      viewMonth.value = targetMonth;
      viewYear.value = targetYear;
      const clamped = clampToMonth(focusDate.value, targetYear, targetMonth, minDate, maxDate);
      if (clamped) focusDate.value = clamped;
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
    };

    function moveFocus(deltaDays: number) {
      const next = new Date(focusDate.value);
      next.setDate(next.getDate() + deltaDays);
      if (next.getFullYear() !== viewYear.value || next.getMonth() !== viewMonth.value) {
        viewYear.value = next.getFullYear();
        viewMonth.value = next.getMonth();
      }
      focusDate.value = calStartOfDay(next);
      nextTick(focusActiveCell);
    }

    const onGridKeyDown = (event: KeyboardEvent) => {
      const minDate = calParseISO(props.min);
      const maxDate = calParseISO(props.max);
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          moveFocus(-1);
          break;
        case "ArrowRight":
          event.preventDefault();
          moveFocus(1);
          break;
        case "ArrowUp":
          event.preventDefault();
          moveFocus(-7);
          break;
        case "ArrowDown":
          event.preventDefault();
          moveFocus(7);
          break;
        case "Home": {
          event.preventDefault();
          const dayOfWeek = focusDate.value.getDay();
          const offset = (dayOfWeek - props.weekStartsOn + 7) % 7;
          moveFocus(-offset);
          break;
        }
        case "End": {
          event.preventDefault();
          const dayOfWeek = focusDate.value.getDay();
          const offset = 6 - ((dayOfWeek - props.weekStartsOn + 7) % 7);
          moveFocus(offset);
          break;
        }
        case "PageUp": {
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
        case "PageDown": {
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
        case "Enter":
        case " ": {
          event.preventDefault();
          if (!isOutOfBoundsDate(focusDate.value, minDate, maxDate)) pickDate(focusDate.value);
          break;
        }
      }
    };

    const pickDate = (date: Date) => {
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
    };

    const commit = (next: CalendarValue) => {
      if (props.value === undefined) internal.value = next;
      emit("update:modelValue", next);
      emit("change", next);
      props.onChange?.(next);
    };

    return () => {
      const activeValue = props.value ?? internal.value;
      const locale = props.locale;
      const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");
      const resolvedPrevLabel =
        props.previousMonthLabel ?? (isFr ? "Mois précédent" : "Previous month");
      const resolvedNextLabel =
        props.nextMonthLabel ?? (isFr ? "Mois suivant" : "Next month");

      const monthFormatter = new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      });
      const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
      const cellFormatter = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const minDate = calParseISO(props.min);
      const maxDate = calParseISO(props.max);

      const single = props.range ? null : calParseISO(activeValue as string | null);
      const rangeStart =
        props.range && Array.isArray(activeValue) ? calParseISO(activeValue[0]) : null;
      const rangeEnd =
        props.range && Array.isArray(activeValue) ? calParseISO(activeValue[1]) : null;

      const today = calStartOfDay(new Date());

      // 2024-01-07 est un dimanche : on énumère puis on tourne selon weekStartsOn.
      const sample = new Date(Date.UTC(2024, 0, 7));
      const rawLabels: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(sample);
        d.setUTCDate(sample.getUTCDate() + i);
        rawLabels.push(weekdayFormatter.format(d));
      }
      const weekdayLabels = [
        ...rawLabels.slice(props.weekStartsOn),
        ...rawLabels.slice(0, props.weekStartsOn),
      ];

      const first = new Date(viewYear.value, viewMonth.value, 1);
      const firstDayIdx = first.getDay();
      const offset = (firstDayIdx - props.weekStartsOn + 7) % 7;
      const start = new Date(viewYear.value, viewMonth.value, 1 - offset);
      const grid: Array<{ date: Date; inMonth: boolean }> = [];
      for (let i = 0; i < 42; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        grid.push({ date: calStartOfDay(d), inMonth: d.getMonth() === viewMonth.value });
      }

      const isOutOfBounds = (date: Date): boolean =>
        isOutOfBoundsDate(date, minDate, maxDate);

      const isSelected = (date: Date): boolean => {
        if (!props.range) return calIsSameDay(single, date);
        return calIsSameDay(rangeStart, date) || calIsSameDay(rangeEnd, date);
      };
      const isInRange = (date: Date): boolean => {
        if (!props.range || !rangeStart || !rangeEnd) return false;
        const d = calStartOfDay(date).getTime();
        return d > rangeStart.getTime() && d < rangeEnd.getTime();
      };

      const monthLabel = monthFormatter.format(
        new Date(viewYear.value, viewMonth.value, 1),
      );

      // Construire les 6 semaines avec role="row" (ARIA grid pattern).
      const weekRows = Array.from({ length: 6 }, (_, rowIdx) => {
        const cells = grid.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
          const oob = isOutOfBounds(cell.date);
          const selected = isSelected(cell.date);
          const inRange = isInRange(cell.date);
          const isToday = calIsSameDay(cell.date, today);
          const isActive = calIsSameDay(cell.date, focusDate.value);
          return h("button", {
            key: rowIdx * 7 + colIdx,
            type: "button",
            class: classNames(
              "st-calendar__day",
              !cell.inMonth && "st-calendar__day--outside",
              selected && "st-calendar__day--selected",
              inRange && "st-calendar__day--inRange",
              isToday && "st-calendar__day--today",
            ),
            role: "gridcell",
            "aria-label": cellFormatter.format(cell.date),
            "aria-selected": selected ? "true" : "false",
            "aria-current": isToday ? "date" : undefined,
            "aria-disabled": oob ? "true" : undefined,
            disabled: oob,
            tabindex: isActive && !oob ? 0 : -1,
            "data-date": calToISO(cell.date),
            onClick: () => {
              if (!oob) {
                focusDate.value = calStartOfDay(cell.date);
                pickDate(cell.date);
              }
            },
          }, String(cell.date.getDate()));
        });
        return h("div", {
          key: rowIdx,
          class: "st-calendar__week",
          role: "row",
        }, cells);
      });

      return h(
        "div",
        { ...attrs, class: classNames("st-calendar", props.class) },
        [
          h("div", { class: "st-calendar__nav" }, [
            h(
              "button",
              {
                type: "button",
                class: "st-calendar__navBtn",
                "aria-label": resolvedPrevLabel,
                onClick: previousMonth,
              },
              [ChevronLeftIcon(18)],
            ),
            h(
              "span",
              { class: "st-calendar__monthLabel", "aria-live": "polite" },
              monthLabel,
            ),
            h(
              "button",
              {
                type: "button",
                class: "st-calendar__navBtn",
                "aria-label": resolvedNextLabel,
                onClick: nextMonth,
              },
              [ChevronRightIcon(18)],
            ),
          ]),
          h(
            "div",
            {
              ref: gridEl,
              class: "st-calendar__grid",
              role: "grid",
              "aria-label": monthLabel,
              onKeydown: onGridKeyDown,
            },
            [
              h(
                "div",
                { class: "st-calendar__weekdays", role: "row" },
                weekdayLabels.map((wd, i) =>
                  h(
                    "span",
                    {
                      key: `${wd}-${i}`,
                      class: "st-calendar__weekday",
                      role: "columnheader",
                    },
                    wd,
                  ),
                ),
              ),
              h("div", { class: "st-calendar__days" }, weekRows),
            ],
          ),
        ],
      );
    };
  },
});
