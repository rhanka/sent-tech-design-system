import { defineComponent, h, ref, computed } from "vue";
import { classNames } from "./classNames.js";

export type ComboboxOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type ComboboxSize = "sm" | "md" | "lg";

export type ComboboxProps = {
  label?: unknown;
  options: ComboboxOption[];
  value?: string;
  size?: ComboboxSize;
  placeholder?: string;
  open?: boolean;
  allowCustomValue?: boolean;
  noResultsLabel?: unknown;
  class?: string;
};

let _comboCounter = 0;
function nextComboId(): string {
  return `st-combobox-${++_comboCounter}`;
}

function moveIndex(index: number, max: number, delta: number): number {
  if (max <= 0) return -1;
  return (index + delta + max) % max;
}

export const Combobox = defineComponent({
  name: "Combobox",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
    options: { type: Array as () => ComboboxOption[], required: true },
    value: { type: String, default: undefined },
    size: { type: String as () => ComboboxSize, default: "md" },
    placeholder: { type: String, default: "Select or type" },
    open: { type: Boolean, default: undefined },
    allowCustomValue: { type: Boolean, default: true },
    noResultsLabel: { type: [String, Object] as unknown as () => unknown, default: "No results" },
    class: { type: String, default: undefined },
  },
  emits: ["change", "select", "update:open", "update:modelValue"],
  setup(props, { emit, attrs }) {
    const instanceId = ref(nextComboId());
    const inputId = computed(() => `${instanceId.value}-input`);
    const listId = computed(() => `${instanceId.value}-list`);

    const getInitialInput = () => {
      const found = props.options.find((opt) => opt.value === props.value);
      return found ? String(found.label) : (props.value ?? "");
    };

    const inputValue = ref(getInitialInput());
    const localOpen = ref(false);
    const activeIndex = ref(-1);

    const isOpen = () => (props.open !== undefined ? props.open : localOpen.value);

    const setOpen = (val: boolean) => {
      if (props.open === undefined) localOpen.value = val;
      emit("update:open", val);
    };

    const filtered = computed(() => {
      const query = inputValue.value.trim().toLowerCase();
      if (!query) return props.options;
      return props.options.filter((opt) =>
        String(opt.label).toLowerCase().includes(query),
      );
    });

    const selectOption = (option: ComboboxOption) => {
      if (option.disabled) return;
      inputValue.value = String(option.label);
      setOpen(false);
      activeIndex.value = -1;
      emit("select", option.value);
      emit("change", option.value);
      emit("update:modelValue", option.value);
    };

    return () => {
      const open = isOpen();
      const selected = props.options.find((opt) => opt.value === props.value);
      const displayValue = selected ? String(selected.label) : inputValue.value;
      const activeDescendant =
        activeIndex.value >= 0 && filtered.value[activeIndex.value]
          ? `${listId.value}-${filtered.value[activeIndex.value].value}`
          : undefined;

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-combobox", `st-combobox--${props.size}`, props.class),
        },
        [
          props.label
            ? h("label", { class: "st-field__label", for: inputId.value }, props.label as string)
            : null,
          h("input", {
            id: inputId.value,
            class: "st-combobox__control",
            role: "combobox",
            "aria-expanded": open,
            "aria-autocomplete": "list",
            "aria-controls": listId.value,
            "aria-activedescendant": activeDescendant,
            placeholder: props.placeholder,
            value: displayValue,
            onFocus: () => setOpen(true),
            onInput: (event: Event) => {
              const val = (event.target as HTMLInputElement).value;
              inputValue.value = val;
              setOpen(true);
              activeIndex.value = -1;
              if (props.allowCustomValue) {
                emit("change", val);
                emit("update:modelValue", val);
              }
            },
            onKeydown: (event: KeyboardEvent) => {
              const f = filtered.value;
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setOpen(true);
                activeIndex.value = moveIndex(activeIndex.value, f.length, 1);
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setOpen(true);
                activeIndex.value = moveIndex(
                  activeIndex.value < 0 ? f.length : activeIndex.value,
                  f.length,
                  -1,
                );
              } else if (event.key === "Enter" && open && activeIndex.value >= 0 && f[activeIndex.value]) {
                event.preventDefault();
                selectOption(f[activeIndex.value]);
              } else if (event.key === "Escape" && open) {
                event.preventDefault();
                setOpen(false);
                activeIndex.value = -1;
              }
            },
          }),
          selected
            ? h("span", { class: "st-combobox__value st-visually-hidden" }, String(selected.label))
            : null,
          open
            ? h(
                "ul",
                {
                  id: listId.value,
                  class: "st-combobox__list",
                  role: "listbox",
                  "aria-label": String(props.label) || "Options",
                },
                filtered.value.length
                  ? filtered.value.map((option, index) =>
                      h(
                        "li",
                        {
                          key: option.value,
                          id: `${listId.value}-${option.value}`,
                          class: classNames(
                            "st-combobox__option",
                            index === activeIndex.value && "st-combobox__option--active",
                            option.value === props.value && "st-combobox__option--selected",
                          ),
                          role: "option",
                          "aria-selected": option.value === props.value,
                          "aria-disabled": option.disabled ? "true" : undefined,
                          onMousedown: (event: MouseEvent) => {
                            event.preventDefault();
                            selectOption(option);
                          },
                        },
                        String(option.label),
                      ),
                    )
                  : [
                      h(
                        "li",
                        {
                          class: "st-combobox__empty",
                          role: "option",
                          "aria-disabled": "true",
                          "aria-selected": "false",
                        },
                        String(props.noResultsLabel),
                      ),
                    ],
              )
            : null,
        ],
      );
    };
  },
});
