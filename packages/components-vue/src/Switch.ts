import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type SwitchProps = {
  label: unknown;
  helperText?: unknown;
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

export const Switch = defineComponent({
  name: "Switch",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, required: true },
    helperText: { type: [String, Object] as unknown as () => unknown, default: undefined },
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
          class: classNames("st-switch", props.class),
        },
        [
          h("input", {
            ...attrs,
            class: "st-switch__input",
            type: "checkbox",
            role: "switch",
            "aria-checked": props.modelValue ?? props.checked ?? undefined,
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
          h("span", { class: "st-switch__track" }, [
            h("span", { class: "st-switch__thumb" }),
          ]),
          h("span", { class: "st-switch__content" }, [
            h("span", { class: "st-switch__label" }, props.label as string),
            props.helperText
              ? h(
                  "span",
                  { class: "st-switch__help" },
                  props.helperText as string,
                )
              : null,
          ]),
        ],
      );
  },
});
