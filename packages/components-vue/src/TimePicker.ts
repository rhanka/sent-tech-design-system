import { defineComponent, h, onBeforeUnmount, onMounted, ref } from "vue";
import { Clock } from "lucide-vue-next";
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
  return h(Clock, { size, "aria-hidden": "true" });
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

    function scrollActiveIntoView(listId: string) {
      if (!listEl.value || activeIndex.value < 0) return;
      const optEl = listEl.value.querySelector<HTMLElement>(
        `#${listId}-opt-${activeIndex.value}`,
      );
      if (optEl && typeof optEl.scrollIntoView === "function") {
        optEl.scrollIntoView({ block: "nearest" });
      }
    }

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

      const activeDescendant =
        open.value && activeIndex.value >= 0
          ? `${listId}-opt-${activeIndex.value}`
          : undefined;

      function openList() {
        if (props.disabled) return;
        open.value = true;
        const idx = current ? slots.indexOf(current) : -1;
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
        emit("update:modelValue", slot);
        // `emit("change")` already routes to an `onChange` handler prop (Vue maps
        // emitted events to their `onX` listeners), so calling `props.onChange`
        // here as well would fire the callback twice. Emit only.
        emit("change", slot);
        closeList(true);
      };

      const onInputKeyDown = (event: KeyboardEvent) => {
        if (props.disabled) return;
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            if (!open.value) {
              openList();
            } else {
              activeIndex.value = Math.min(activeIndex.value + 1, slots.length - 1);
              scrollActiveIntoView(listId);
            }
            break;
          case "ArrowUp":
            event.preventDefault();
            if (!open.value) {
              openList();
            } else {
              activeIndex.value = Math.max(activeIndex.value - 1, 0);
              scrollActiveIntoView(listId);
            }
            break;
          case "Home":
            event.preventDefault();
            if (!open.value) {
              openList();
            } else {
              activeIndex.value = 0;
              scrollActiveIntoView(listId);
            }
            break;
          case "End":
            event.preventDefault();
            if (!open.value) {
              openList();
            } else {
              activeIndex.value = slots.length - 1;
              scrollActiveIntoView(listId);
            }
            break;
          case "Enter":
          case " ":
            event.preventDefault();
            if (!open.value) {
              openList();
            } else {
              if (activeIndex.value >= 0 && activeIndex.value < slots.length) {
                pick(slots[activeIndex.value]);
              }
            }
            break;
          case "Escape":
            if (open.value) {
              event.preventDefault();
              closeList(true);
            }
            break;
        }
      };

      const onListKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            activeIndex.value = Math.min(activeIndex.value + 1, slots.length - 1);
            scrollActiveIntoView(listId);
            break;
          case "ArrowUp":
            event.preventDefault();
            activeIndex.value = Math.max(activeIndex.value - 1, 0);
            scrollActiveIntoView(listId);
            break;
          case "Home":
            event.preventDefault();
            activeIndex.value = 0;
            scrollActiveIntoView(listId);
            break;
          case "End":
            event.preventDefault();
            activeIndex.value = slots.length - 1;
            scrollActiveIntoView(listId);
            break;
          case "Enter":
          case " ":
            event.preventDefault();
            if (activeIndex.value >= 0 && activeIndex.value < slots.length) {
              pick(slots[activeIndex.value]);
            }
            break;
          case "Escape":
            event.preventDefault();
            closeList(true);
            break;
        }
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
                  ref: inputEl,
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
                  "aria-activedescendant": activeDescendant,
                  "aria-autocomplete": "none",
                  tabindex: 0,
                  onClick: toggleOpen,
                  onKeydown: onInputKeyDown,
                }),
                h(
                  "button",
                  {
                    type: "button",
                    class: "st-timepicker__trigger",
                    "aria-label": "Ouvrir la liste des horaires",
                    "aria-haspopup": "listbox",
                    "aria-expanded": open.value ? "true" : "false",
                    tabindex: -1,
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
                  ref: listEl,
                  id: listId,
                  class: "st-timepicker__list",
                  role: "listbox",
                  "aria-label": props.label ?? "Horaires",
                  tabindex: -1,
                  onKeydown: onListKeyDown,
                },
                slots.map((slot, i) =>
                  h("li", { key: slot, role: "presentation" }, [
                    h("div", {
                      id: `${listId}-opt-${i}`,
                      class: classNames(
                        "st-timepicker__option",
                        slot === current && "st-timepicker__option--selected",
                        i === activeIndex.value && "st-timepicker__option--active",
                      ),
                      role: "option",
                      "aria-selected": slot === current ? "true" : "false",
                      tabindex: -1,
                      onMousedown: (e: MouseEvent) => e.preventDefault(),
                      onClick: () => pick(slot),
                      onMouseenter: () => { activeIndex.value = i; },
                    }, display(slot)),
                  ]),
                ),
              )
            : null,
        ],
      );
    };
  },
});
