import { defineComponent, h, ref, watch } from "vue";
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
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    [h("polyline", { points: "15 18 9 12 15 6" })],
  );
}

function ChevronRightIcon(size: number) {
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    [h("polyline", { points: "9 18 15 12 9 6" })],
  );
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

      const minDate = calParseISO(props.min);
      const maxDate = calParseISO(props.max);

      const isOutOfBounds = (date: Date): boolean => {
        const d = calStartOfDay(date).getTime();
        if (minDate && d < minDate.getTime()) return true;
        if (maxDate && d > maxDate.getTime()) return true;
        return false;
      };
      const isSelected = (date: Date): boolean => {
        if (!props.range) return calIsSameDay(single, date);
        return calIsSameDay(rangeStart, date) || calIsSameDay(rangeEnd, date);
      };
      const isInRange = (date: Date): boolean => {
        if (!props.range || !rangeStart || !rangeEnd) return false;
        const d = calStartOfDay(date).getTime();
        return d > rangeStart.getTime() && d < rangeEnd.getTime();
      };

      const commit = (next: CalendarValue) => {
        if (props.value === undefined) internal.value = next;
        emit("update:modelValue", next);
        emit("change", next);
        props.onChange?.(next);
      };

      const pickDate = (date: Date) => {
        if (isOutOfBounds(date)) return;
        const picked = calStartOfDay(date);
        const iso = calToISO(picked);
        if (!props.range) {
          commit(iso);
          return;
        }
        // Mode plage : (re)démarrage si pas de début, ou si plage déjà complète,
        // ou si la date est antérieure au début courant.
        if (!rangeStart || (rangeStart && rangeEnd) || picked.getTime() < rangeStart.getTime()) {
          commit([iso, null]);
          return;
        }
        commit([calToISO(rangeStart), iso]);
      };

      const monthLabel = monthFormatter.format(
        new Date(viewYear.value, viewMonth.value, 1),
      );

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
              class: "st-calendar__grid",
              role: "grid",
              tabindex: -1,
              "aria-label": monthLabel,
              onKeydown: (event: KeyboardEvent) => {
                if (event.key === "PageUp") {
                  event.preventDefault();
                  previousMonth();
                } else if (event.key === "PageDown") {
                  event.preventDefault();
                  nextMonth();
                }
              },
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
              h(
                "div",
                { class: "st-calendar__days" },
                grid.map((cell, i) => {
                  const oob = isOutOfBounds(cell.date);
                  const selected = isSelected(cell.date);
                  const inRange = isInRange(cell.date);
                  const isToday = calIsSameDay(cell.date, today);
                  return h(
                    "button",
                    {
                      key: i,
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
                      onClick: () => pickDate(cell.date),
                    },
                    String(cell.date.getDate()),
                  );
                }),
              ),
            ],
          ),
        ],
      );
    };
  },
});
