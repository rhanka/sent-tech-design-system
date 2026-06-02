import { defineComponent, h, ref, computed } from "vue";
import { classNames } from "./classNames.js";

export type MultiSelectOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type MultiSelectSize = "sm" | "md" | "lg";

export type MultiSelectProps = {
  label?: unknown;
  options: MultiSelectOption[];
  value?: string[];
  values?: string[];
  size?: MultiSelectSize;
  open?: boolean;
  class?: string;
};

let _msCounter = 0;
function nextMsId(): string {
  return `st-multiSelect-${++_msCounter}`;
}

export const MultiSelect = defineComponent({
  name: "MultiSelect",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
    options: { type: Array as () => MultiSelectOption[], required: true },
    value: { type: Array as () => string[], default: undefined },
    values: { type: Array as () => string[], default: undefined },
    size: { type: String as () => MultiSelectSize, default: "md" },
    open: { type: Boolean, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["change", "update:open", "update:modelValue"],
  setup(props, { emit, attrs }) {
    const instanceId = ref(nextMsId());
    const listId = computed(() => `${instanceId.value}-list`);
    const localOpen = ref(false);
    const localSelected = ref<string[]>(props.value ?? props.values ?? []);

    const isOpen = () => (props.open !== undefined ? props.open : localOpen.value);

    const setOpen = (val: boolean) => {
      if (props.open === undefined) localOpen.value = val;
      emit("update:open", val);
    };

    const getSelected = () => props.value ?? props.values ?? localSelected.value;

    const toggleOption = (option: MultiSelectOption) => {
      if (option.disabled) return;
      const current = getSelected();
      const next = current.includes(option.value)
        ? current.filter((v) => v !== option.value)
        : [...current, option.value];
      if (props.value === undefined && props.values === undefined) {
        localSelected.value = next;
      }
      emit("change", next);
      emit("update:modelValue", next);
      setOpen(false);
    };

    return () => {
      const open = isOpen();
      const selected = new Set(getSelected());
      const selectedOptions = props.options.filter((opt) => selected.has(opt.value));

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-multiSelect", `st-multiSelect--${props.size}`, props.class),
        },
        [
          props.label
            ? h("span", { class: "st-field__label" }, props.label as string)
            : null,
          h(
            "button",
            {
              type: "button",
              class: "st-multiSelect__trigger",
              "aria-label": String(props.label) || "Select options",
              "aria-haspopup": "listbox",
              "aria-expanded": open,
              "aria-controls": listId.value,
              onClick: () => setOpen(!open),
            },
            [
              props.label
                ? h("span", { class: "st-multiSelect__triggerLabel" }, props.label as string)
                : null,
              h(
                "span",
                { class: "st-multiSelect__tags" },
                selectedOptions.length
                  ? selectedOptions.map((opt) =>
                      h("span", { key: opt.value, class: "st-multiSelect__tag" }, [
                        h("span", { class: "st-multiSelect__tagLabel" }, String(opt.label)),
                      ]),
                    )
                  : [h("span", { class: "st-multiSelect__placeholder" }, "Select")],
              ),
            ],
          ),
          open
            ? h(
                "ul",
                {
                  id: listId.value,
                  class: "st-multiSelect__list",
                  role: "listbox",
                  "aria-label": String(props.label) || "Options",
                  "aria-multiselectable": "true",
                },
                props.options.map((option) =>
                  h(
                    "li",
                    {
                      key: option.value,
                      class: classNames(
                        "st-multiSelect__option",
                        selected.has(option.value) && "st-multiSelect__option--selected",
                      ),
                      role: "option",
                      "aria-selected": selected.has(option.value),
                      "aria-disabled": option.disabled ? "true" : undefined,
                      tabindex: option.disabled ? undefined : 0,
                      onClick: () => toggleOption(option),
                      onKeydown: (event: KeyboardEvent) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleOption(option);
                        }
                      },
                    },
                    String(option.label),
                  ),
                ),
              )
            : null,
        ],
      );
    };
  },
});
