import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type ToggleSize = "sm" | "md";

export type ToggleProps = {
  label: unknown;
  helperText?: unknown;
  size?: ToggleSize;
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

export const Toggle = defineComponent({
  name: "Toggle",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, required: true },
    helperText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    size: { type: String as () => ToggleSize, default: "md" },
    modelValue: { type: Boolean, default: undefined },
    checked: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: false },
    name: { type: String, default: undefined },
    value: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit, attrs }) {
    return () =>
      h(
        "label",
        {
          class: classNames(
            "st-toggle",
            `st-toggle--${props.size}`,
            props.class,
          ),
        },
        [
          h("span", { class: "st-toggle__row" }, [
            h(
              "span",
              { class: "st-toggle__label" },
              props.label as string,
            ),
            h("input", {
              ...attrs,
              class: "st-toggle__input",
              type: "checkbox",
              role: "switch",
              "aria-checked":
                props.modelValue ?? props.checked ?? undefined,
              checked: props.modelValue ?? props.checked,
              disabled: props.disabled,
              name: props.name,
              value: props.value,
              onChange: (event: Event) => {
                const checked = (event.target as HTMLInputElement).checked;
                emit("update:modelValue", checked);
                emit("change", event);
              },
            }),
            h("span", { class: "st-toggle__track" }, [
              h("span", { class: "st-toggle__thumb" }),
            ]),
          ]),
          props.helperText
            ? h(
                "span",
                { class: "st-toggle__help" },
                props.helperText as string,
              )
            : null,
        ],
      );
  },
});
