import { defineComponent, h, onBeforeUnmount, onMounted, ref } from "vue";
import { classNames } from "./classNames.js";

export type TimePickerFormat = "24" | "12";
export type TimePickerSize = "sm" | "md" | "lg";

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

let _tpCounter = 0;
function nextTpId(): string {
  return `st-timepicker-${++_tpCounter}`;
}

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
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function ClockIcon(size: number) {
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
    [
      h("circle", { cx: "12", cy: "12", r: "10" }),
      h("polyline", { points: "12 6 12 12 16 14" }),
    ],
  );
}

export const TimePicker = defineComponent({
  name: "TimePicker",
  props: {
    value: { type: String, default: undefined },
    onChange: {
      type: Function as unknown as () => (value: string) => void,
      default: undefined,
    },
    step: { type: Number, default: 15 },
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    format: { type: String as () => TimePickerFormat, default: "24" },
    size: { type: String as () => TimePickerSize, default: "md" },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
    id: { type: String, default: undefined },
  },
  emits: ["change", "update:modelValue"],
  setup(props, { emit, attrs }) {
    const autoId = ref(nextTpId());
    const internal = ref(props.value ?? "");
    const open = ref(false);
    const hostEl = ref<HTMLDivElement | null>(null);

    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!open.value) return;
      const target = event.target as Node | null;
      if (hostEl.value && target && !hostEl.value.contains(target)) {
        open.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener("mousedown", onDocumentMouseDown);
    });
    onBeforeUnmount(() => {
      document.removeEventListener("mousedown", onDocumentMouseDown);
    });

    const display = (hhmm: string): string => {
      if (props.format === "24") return hhmm;
      const total = timeToMinutes(hhmm);
      if (total === null) return hhmm;
      const h24 = Math.floor(total / 60);
      const m = total % 60;
      const period = h24 < 12 ? "AM" : "PM";
      let h12 = h24 % 12;
      if (h12 === 0) h12 = 12;
      return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
    };

    return () => {
      const current = props.value ?? internal.value;
      const fieldId = props.id ?? autoId.value;
      const listId = `${fieldId}-list`;

      const safeStep = props.step > 0 ? props.step : 15;
      const lower = timeToMinutes(props.min) ?? 0;
      const upper = timeToMinutes(props.max) ?? 23 * 60 + 59;
      const slots: string[] = [];
      for (let t = lower; t <= upper; t += safeStep) {
        slots.push(timeFromMinutes(t));
      }

      const displayValue = current ? display(current) : "";

      const toggleOpen = () => {
        if (props.disabled) return;
        open.value = !open.value;
      };

      const pick = (slot: string) => {
        if (props.value === undefined) internal.value = slot;
        emit("update:modelValue", slot);
        emit("change", slot);
        props.onChange?.(slot);
        open.value = false;
      };

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-field", props.class),
          ref: hostEl,
        },
        [
          h("div", { class: "st-field__control" }, [
            props.label
              ? h("label", { class: "st-field__label", for: fieldId }, props.label)
              : null,
            h(
              "span",
              { class: classNames("st-timepicker", `st-timepicker--${props.size}`) },
              [
                h("input", {
                  id: fieldId,
                  type: "text",
                  readonly: true,
                  class: "st-timepicker__control",
                  value: displayValue,
                  placeholder: props.format === "24" ? "HH:mm" : "hh:mm AM",
                  disabled: props.disabled,
                  role: "combobox",
                  "aria-haspopup": "listbox",
                  "aria-controls": listId,
                  "aria-expanded": open.value ? "true" : "false",
                  onClick: toggleOpen,
                }),
                h(
                  "button",
                  {
                    type: "button",
                    class: "st-timepicker__trigger",
                    "aria-label": "Ouvrir la liste des horaires",
                    "aria-haspopup": "listbox",
                    "aria-expanded": open.value ? "true" : "false",
                    disabled: props.disabled,
                    onClick: toggleOpen,
                  },
                  [ClockIcon(16)],
                ),
              ],
            ),
          ]),
          open.value
            ? h(
                "ul",
                {
                  id: listId,
                  class: "st-timepicker__list",
                  role: "listbox",
                  "aria-label": props.label ?? "Horaires",
                  tabindex: -1,
                  onKeydown: (event: KeyboardEvent) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      open.value = false;
                    }
                  },
                },
                slots.map((slot) =>
                  h("li", { key: slot, role: "presentation" }, [
                    h(
                      "button",
                      {
                        type: "button",
                        class: classNames(
                          "st-timepicker__option",
                          slot === current && "st-timepicker__option--selected",
                        ),
                        role: "option",
                        "aria-selected": slot === current ? "true" : "false",
                        onClick: () => pick(slot),
                      },
                      display(slot),
                    ),
                  ]),
                ),
              )
            : null,
        ],
      );
    };
  },
});
