import { defineComponent, h, ref, computed } from "vue";
import { ChevronDown, X } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type ComboboxOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type ComboboxSize = "sm" | "md" | "lg";

export type ComboboxProps = {
  label?: unknown;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  options: ComboboxOption[];
  value?: string;
  size?: ComboboxSize;
  placeholder?: string;
  disabled?: boolean;
  open?: boolean;
  allowCustomValue?: boolean;
  noResultsLabel?: unknown;
  listLabel?: string;
  clearLabel?: string;
  toggleLabel?: string;
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
    helperText: { type: String, default: undefined },
    errorText: { type: String, default: undefined },
    invalid: { type: Boolean, default: false },
    options: { type: Array as () => ComboboxOption[], required: true },
    value: { type: String, default: undefined },
    size: { type: String as () => ComboboxSize, default: "md" },
    placeholder: { type: String, default: "Select or type" },
    disabled: { type: Boolean, default: false },
    open: { type: Boolean, default: undefined },
    allowCustomValue: { type: Boolean, default: true },
    noResultsLabel: { type: [String, Object] as unknown as () => unknown, default: "No results" },
    listLabel: { type: String, default: undefined },
    clearLabel: { type: String, default: "Clear selection" },
    toggleLabel: { type: String, default: "Toggle options" },
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
      const isInvalid = props.invalid || Boolean(props.errorText);
      const activeDescendant =
        activeIndex.value >= 0 && filtered.value[activeIndex.value]
          ? `${listId.value}-${filtered.value[activeIndex.value].value}`
          : undefined;

      // Structure mirrors the Svelte reference: a `st-field` grid wrapping a
      // `st-field__control` label that stacks the field label above the bordered
      // `st-combobox` box (input + clear/toggle). List + help/error are siblings.
      const controlBox = h(
        "span",
        { class: classNames("st-combobox", `st-combobox--${props.size}`) },
        [
          h("input", {
            id: inputId.value,
            class: "st-combobox__control",
            role: "combobox",
            "aria-expanded": open,
            "aria-autocomplete": "list",
            "aria-controls": listId.value,
            "aria-invalid": isInvalid ? "true" : undefined,
            "aria-activedescendant": activeDescendant,
            placeholder: props.placeholder,
            disabled: props.disabled,
            value: displayValue,
            onFocus: () => {
              if (!props.disabled) setOpen(true);
            },
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
          displayValue
            ? h(
                "button",
                {
                  type: "button",
                  class: "st-combobox__clear",
                  "aria-label": props.clearLabel,
                  disabled: props.disabled,
                  onClick: () => {
                    inputValue.value = "";
                    activeIndex.value = -1;
                    emit("change", "");
                    emit("update:modelValue", "");
                  },
                },
                [h(X, { size: 16, strokeWidth: 2.25, "aria-hidden": "true" })],
              )
            : null,
          h(
            "button",
            {
              type: "button",
              class: "st-combobox__toggle",
              "aria-label": props.toggleLabel,
              "aria-expanded": open,
              disabled: props.disabled,
              onClick: () => setOpen(!open),
            },
            [
              h(ChevronDown, {
                class: classNames("st-combobox__toggleIcon", open && "st-combobox__toggleIcon--open"),
                size: 18,
                strokeWidth: 2.25,
                "aria-hidden": "true",
              }),
            ],
          ),
        ],
      );

      const list = open
        ? h(
            "div",
            {
              id: listId.value,
              class: "st-combobox__list",
              role: "listbox",
              "aria-label": props.listLabel ?? (props.label ? String(props.label) : "Options"),
            },
            filtered.value.length
              ? filtered.value.map((option, index) =>
                  h(
                    "button",
                    {
                      key: option.value,
                      id: `${listId.value}-${option.value}`,
                      type: "button",
                      class: classNames(
                        "st-combobox__option",
                        index === activeIndex.value && "st-combobox__option--active",
                      ),
                      role: "option",
                      "aria-selected": displayValue === String(option.label) ? "true" : "false",
                      "aria-disabled": option.disabled ? "true" : undefined,
                      disabled: option.disabled,
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
                    "div",
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
        : null;

      const feedback = props.errorText
        ? h("span", { class: "st-field__error" }, props.errorText)
        : props.helperText
          ? h("span", { class: "st-field__help" }, props.helperText)
          : null;

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-field", props.class),
        },
        [
          h("label", { class: "st-field__control", for: inputId.value }, [
            props.label
              ? h("span", { class: "st-field__label" }, props.label as string)
              : null,
            controlBox,
          ]),
          list,
          feedback,
        ],
      );
    };
  },
});
