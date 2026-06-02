import { defineComponent, h, ref, watch, onUnmounted } from "vue";
import { classNames } from "./classNames.js";

export type DropdownOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

export type DropdownProps = {
  label?: string;
  options: DropdownOption[];
  value?: string;
  open?: boolean;
  placeholder?: string;
  class?: string;
};

export const Dropdown = defineComponent({
  name: "Dropdown",
  props: {
    label: { type: String, default: "Select" },
    options: { type: Array as () => DropdownOption[], required: true },
    value: { type: String, default: undefined },
    open: { type: Boolean, default: undefined },
    placeholder: { type: String, default: "Select" },
    class: { type: String, default: undefined },
  },
  emits: ["select", "update:open"],
  setup(props, { emit, attrs }) {
    const localOpen = ref(false);
    const localValue = ref(props.value ?? "");

    const isOpen = () => props.open !== undefined ? props.open : localOpen.value;
    const selected = () => props.options.find((opt) => opt.value === (props.value ?? localValue.value));

    const setOpen = (val: boolean) => {
      if (props.open === undefined) localOpen.value = val;
      emit("update:open", val);
    };

    const selectOption = (option: DropdownOption) => {
      if (option.disabled) return;
      localValue.value = option.value;
      setOpen(false);
      emit("select", option.value);
    };

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      const host = (attrs as { _hostEl?: HTMLElement })._hostEl;
      if (target && host && !host.contains(target)) setOpen(false);
    };

    watch(
      () => isOpen(),
      (open) => {
        if (open) document.addEventListener("mousedown", onMouseDown);
        else document.removeEventListener("mousedown", onMouseDown);
      },
    );

    onUnmounted(() => document.removeEventListener("mousedown", onMouseDown));

    return () => {
      const open = isOpen();
      const sel = selected();

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-dropdown", props.class),
        },
        [
          h(
            "button",
            {
              type: "button",
              class: "st-dropdown__button",
              "aria-haspopup": "listbox",
              "aria-expanded": open,
              onClick: () => setOpen(!open),
            },
            [
              h("span", { class: "st-dropdown__label" }, props.label ?? "Select"),
              ": ",
              h("span", { class: "st-dropdown__value" }, sel ? (sel.label as string) : (props.placeholder ?? "Select")),
            ],
          ),
          open
            ? h(
                "div",
                {
                  class: "st-dropdown__list",
                  role: "listbox",
                  "aria-label": props.label || "Options",
                },
                props.options.map((option) =>
                  h(
                    "button",
                    {
                      key: option.value,
                      type: "button",
                      role: "option",
                      class: "st-dropdown__option",
                      disabled: option.disabled,
                      "aria-selected": option.value === (props.value ?? localValue.value),
                      onClick: () => selectOption(option),
                    },
                    option.label as string,
                  ),
                ),
              )
            : null,
        ],
      );
    };
  },
});
