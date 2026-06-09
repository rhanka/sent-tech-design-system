import { defineComponent, h, ref, computed } from "vue";
import { ChevronDown, X } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type MultiSelectOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type MultiSelectSize = "sm" | "md" | "lg";

export type MultiSelectProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  options: MultiSelectOption[];
  value?: string[];
  values?: string[];
  /** Svelte-canonical alias for the selected values. */
  selected?: string[];
  size?: MultiSelectSize;
  open?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  toggleLabel?: string;
  removeLabel?: string;
  listLabel?: string;
  disabled?: boolean;
  class?: string;
};

export const MultiSelect = defineComponent({
  name: "MultiSelect",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
    helperText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    errorText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    invalid: { type: Boolean, default: false },
    options: { type: Array as () => MultiSelectOption[], required: true },
    value: { type: Array as () => string[], default: undefined },
    values: { type: Array as () => string[], default: undefined },
    selected: { type: Array as () => string[], default: undefined },
    size: { type: String as () => MultiSelectSize, default: "md" },
    open: { type: Boolean, default: undefined },
    placeholder: { type: String, default: "Select items" },
    searchPlaceholder: { type: String, default: "Filter" },
    noResultsLabel: { type: String, default: "No results" },
    toggleLabel: { type: String, default: "Toggle options" },
    removeLabel: { type: String, default: "Remove" },
    listLabel: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  emits: ["change", "update:open", "update:modelValue"],
  setup(props, { emit, attrs }) {
    const localOpen = ref(false);
    const localSelected = ref<string[]>(props.value ?? props.values ?? props.selected ?? []);
    const query = ref("");

    const isOpen = () => (props.open !== undefined ? props.open : localOpen.value);

    const setOpen = (val: boolean) => {
      if (props.open === undefined) localOpen.value = val;
      emit("update:open", val);
    };

    const getSelected = (): string[] =>
      props.value ?? props.values ?? props.selected ?? localSelected.value;

    const isControlled = () =>
      props.value !== undefined || props.values !== undefined || props.selected !== undefined;

    const commit = (next: string[]) => {
      if (!isControlled()) localSelected.value = next;
      emit("change", next);
      emit("update:modelValue", next);
    };

    const toggleOption = (option: MultiSelectOption) => {
      if (option.disabled) return;
      const current = getSelected();
      const next = current.includes(option.value)
        ? current.filter((v) => v !== option.value)
        : [...current, option.value];
      commit(next);
    };

    const removeOption = (value: string) => {
      commit(getSelected().filter((v) => v !== value));
    };

    const filtered = computed(() => {
      const q = query.value.trim().toLowerCase();
      if (!q) return props.options;
      return props.options.filter((opt) => String(opt.label).toLowerCase().includes(q));
    });

    return () => {
      const open = isOpen();
      const selectedSet = new Set(getSelected());
      const selectedOptions = getSelected()
        .map((value) => props.options.find((opt) => opt.value === value))
        .filter((opt): opt is MultiSelectOption => Boolean(opt));
      const isInvalid = props.invalid || Boolean(props.errorText);

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-field", props.class),
          role: "group",
          "aria-label": props.label ? String(props.label) : undefined,
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === "Escape" && open) {
              event.preventDefault();
              setOpen(false);
            }
          },
        },
        [
          props.label
            ? h("span", { class: "st-field__label" }, props.label as string)
            : null,
          selectedOptions.length > 0
            ? h(
                "span",
                { class: "st-multiSelect__tags" },
                selectedOptions.map((option) =>
                  h("span", { key: option.value, class: "st-multiSelect__tag" }, [
                    h("span", { class: "st-multiSelect__tagLabel" }, String(option.label)),
                    h(
                      "button",
                      {
                        type: "button",
                        class: "st-multiSelect__tagRemove",
                        "aria-label": `${props.removeLabel} ${String(option.label)}`,
                        disabled: props.disabled,
                        onClick: () => removeOption(option.value),
                      },
                      [h(X, { size: 14, strokeWidth: 2.25, "aria-hidden": "true" })],
                    ),
                  ]),
                ),
              )
            : null,
          h(
            "span",
            {
              class: classNames("st-multiSelect", `st-multiSelect--${props.size}`),
              "data-invalid": isInvalid ? "true" : undefined,
            },
            [
              h(
                "button",
                {
                  type: "button",
                  class: "st-multiSelect__trigger",
                  "aria-haspopup": "listbox",
                  "aria-expanded": open,
                  disabled: props.disabled,
                  onClick: () => setOpen(!open),
                },
                [
                  selectedOptions.length === 0
                    ? h("span", { class: "st-multiSelect__placeholder" }, props.placeholder)
                    : h("span", { class: "st-multiSelect__count" }, `${selectedOptions.length} selected`),
                  h("span", { class: "st-multiSelect__caret", "aria-hidden": "true" }, [
                    h(ChevronDown, {
                      class: classNames("st-multiSelect__caretIcon", open && "st-multiSelect__caretIcon--open"),
                      size: 18,
                      strokeWidth: 2.25,
                      "aria-hidden": "true",
                    }),
                  ]),
                  h("span", { class: "st-visually-hidden" }, props.toggleLabel),
                ],
              ),
            ],
          ),
          open
            ? h("div", { class: "st-multiSelect__panel" }, [
                h("input", {
                  type: "search",
                  class: "st-multiSelect__search",
                  placeholder: props.searchPlaceholder,
                  value: query.value,
                  "aria-label": props.searchPlaceholder,
                  onInput: (event: Event) => {
                    query.value = (event.currentTarget as HTMLInputElement).value;
                  },
                }),
                h(
                  "div",
                  {
                    class: "st-multiSelect__list",
                    role: "listbox",
                    "aria-label": props.listLabel ?? (props.label ? String(props.label) : "Options"),
                    "aria-multiselectable": "true",
                  },
                  filtered.value.length === 0
                    ? [h("div", { class: "st-multiSelect__empty" }, props.noResultsLabel)]
                    : filtered.value.map((option) => {
                        const isSelected = selectedSet.has(option.value);
                        return h(
                          "button",
                          {
                            key: option.value,
                            class: "st-multiSelect__option",
                            type: "button",
                            role: "option",
                            "aria-selected": isSelected ? "true" : "false",
                            "aria-disabled": option.disabled ? "true" : undefined,
                            disabled: option.disabled,
                            onClick: () => toggleOption(option),
                          },
                          [
                            h(
                              "span",
                              { class: "st-multiSelect__check", "aria-hidden": "true" },
                              isSelected ? "✓" : "",
                            ),
                            h("span", String(option.label)),
                          ],
                        );
                      }),
                ),
              ])
            : null,
          props.errorText
            ? h("span", { class: "st-field__error" }, props.errorText as string)
            : props.helperText
              ? h("span", { class: "st-field__help" }, props.helperText as string)
              : null,
        ],
      );
    };
  },
});
